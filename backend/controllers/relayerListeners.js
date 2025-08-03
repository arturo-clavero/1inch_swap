const { ethers, Contract, keccak256 } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const HTLC_ABI = require(path.resolve(__dirname, '../../abi/HTLC.json'));
const { ethProvider, scrollProvider, ethWallet, scrollWallet } = require('./relayer'); // provide your setup here

const ethHTLC = new Contract(process.env.VITE_ETH_CONTRACT_ADDRESS, HTLC_ABI, ethWallet);
const scrollHTLC = new Contract(process.env.VITE_SCROLL_CONTRACT_ADDRESS, HTLC_ABI, scrollWallet);
const RELAYER_ADDRESS = ethWallet.address;

const pendingSwaps = new Map(); // hashlock -> { ...swapInfo }
const secretsPerSwap = new Map(); // swapId -> [secrets]

function startEventListeners() {
  console.log("Relayer is listening for HTLC events...");

  const handleSwapCreated = async (sourceHTLC, targetHTLC, sourceName, targetName, event) => {
    const { swapId, sender, receiver, amount, hashlock, timelock } = event.args;
    if (pendingSwaps.has(hashlock)) return;

    const newTime = timelock > 360n ? timelock - 300n : 60n;
    try {
      const tx = await targetHTLC.createSwap(sender, hashlock, newTime, { value: amount });
      const receipt = await tx.wait();
      const createdSwapId = receipt.logs.find(log => log.fragment?.name === "SwapCreated")?.args?.swapId;

      console.log(`[${targetName}] Created mirrored swap for ${sender} amount: ${ethers.formatEther(amount)}`);
      pendingSwaps.set(hashlock.toString(), {
        path: `${sourceName}->${targetName}`,
        userAddress: sender,
        receiver,
        amount: amount.toString(),
        [`${sourceName}SwapId`]: swapId,
        [`${targetName}SwapId`]: createdSwapId,
      });
    } catch (err) {
      console.error(`[${targetName}] Failed to lock swap:`, err.message);
    }
  };

  const handleFullWithdraw = async (sourceHTLC, targetHTLC, sourceName, targetName, event) => {
    const { swapId, secret } = event.args;
    const hashlock = keccak256(secret);
    const pending = pendingSwaps.get(hashlock.toString());
    if (!pending || pending.receiver.toLowerCase() !== RELAYER_ADDRESS.toLowerCase()) return;

    const targetSwapId = pending[`${targetName}SwapId`];
    try {
      const tx = await targetHTLC.withdraw(targetSwapId, secret);
      await tx.wait();
      console.log(`[${targetName}] Relayed full withdraw using secret ${secret}`);
      pendingSwaps.delete(hashlock.toString());
    } catch (err) {
      console.error(`[${targetName}] Full withdraw failed:`, err.message);
    }
  };

  const handlePartialWithdraw = async (sourceHTLC, targetHTLC, sourceName, targetName, event) => {
    const { swapId, amount, index } = event.args;
    const hashlock = await sourceHTLC.hashlocks(swapId); // assume getter or store yourself
    const secrets = secretsPerSwap.get(swapId.toString());
    if (!secrets || !secrets[index]) {
      console.warn(`[${sourceName}] Missing secret for partial withdraw index ${index}`);
      return;
    }

    const secret = secrets[index];
    const leaf = keccak256(secret);
    const leaves = secrets.map(s => keccak256(s));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const proof = tree.getHexProof(leaf);
    const pending = pendingSwaps.get(hashlock.toString());
    if (!pending || pending.receiver.toLowerCase() !== RELAYER_ADDRESS.toLowerCase()) return;

    const targetSwapId = pending[`${targetName}SwapId`];
    try {
      const tx = await targetHTLC.withdrawParts(
        targetSwapId,
        index,
        secret,
        amount,
        proof
      );
      await tx.wait();
      console.log(`[${targetName}] Relayed partial withdraw index ${index}`);
    } catch (err) {
      console.error(`[${targetName}] Partial withdraw failed:`, err.message);
    }
  };

  // === Attach Listeners === //

  ethHTLC.on("SwapCreated", e => handleSwapCreated(ethHTLC, scrollHTLC, 'eth', 'scroll', e));
  scrollHTLC.on("SwapCreated", e => handleSwapCreated(scrollHTLC, ethHTLC, 'scroll', 'eth', e));

  ethHTLC.on("SwapWithdrawn", e => handleFullWithdraw(ethHTLC, scrollHTLC, 'eth', 'scroll', e));
  scrollHTLC.on("SwapWithdrawn", e => handleFullWithdraw(scrollHTLC, ethHTLC, 'scroll', 'eth', e));

  ethHTLC.on("SwapPartlyWithdrawn", e => handlePartialWithdraw(ethHTLC, scrollHTLC, 'eth', 'scroll', e));
  scrollHTLC.on("SwapPartlyWithdrawn", e => handlePartialWithdraw(scrollHTLC, ethHTLC, 'scroll', 'eth', e));
}

// === API endpoint ===
// Call this from frontend with secrets after initial swap
function registerSecretsForSwap(swapId, secrets) {
  if (!swapId || !Array.isArray(secrets)) return false;
  secretsPerSwap.set(swapId.toString(), secrets);
  return true;
}

module.exports = {
  startEventListeners,
  registerSecretsForSwap,
};
