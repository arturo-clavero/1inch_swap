const { ethHTLC, scrollHTLC } = require('./relayer');
const { Contract, ethers } = require('ethers');

//track
const pendingSwaps = new Map();
const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS;

const startEventListeners = () => {
        console.log("Relayer is listening...");
        //user locks on eth -> relayer locks on scroll

    ethHTLC.on("SwapCreated", async (swapId, sender, receiver, amount, hashlock, timelock) => {
            console.log("SwapCreated:", swapId);
            //relaier is receiver
            if (receiver.toLowerCase() != RELAYER_ADDRESS.toLowerCase()){
                console.log("Not for relayer");
                return;
            }
            console.log("User ${sender} locked ${ether.formatEther(amount)} ETH. Lockin on tje scroll...");
            try{
                const scrollTime = Math.max(60, timelock - 300);
                const txn = await scrollHTLC.createSwap(
                        sender,
                        hashlock,
                        scrollTime,
                        {value: amount}
                );
                const proof = await txn.wait();
                console.log("[SCROLL] relayer locked ${ether.formatEther(amount)} ETH for ${sender}");
                console.log("Txn: ${proof.hash}");
                
                //to map to track
                pendingSwaps.set(hashlock.toString(), {
                        path: "eth->scroll",
                        userAddress: sender,
                        amount: amount.toString(),
                        ethSwapId: swapId,
                        scrollTime: timelock
                })
            } catch(err){
                console.error("Failed to lock on scroll",err.message );
            }
        });
                //eth on scroll-> eth
        scrollHTLC.on("SwapCreated", async (swapId, sender, receiver, amount, hashlock, timelock) => {
            console.log("SwapCreated:", swapId);
            //relaier is receiver
            if (receiver.toLowerCase() != RELAYER_ADDRESS.toLowerCase()){
                console.log("Not for relayer");
                return;
            }
            console.log("User ${sender} locked ${ether.formatEther(amount)} ETH on the scroll. Lockin on the ethereum...");
            try{
                const ethTime = Math.max(60, timelock - 300);
                const txn = await scrollHTLC.createSwap(
                        sender,
                        hashlock,
                        ethTime,
                        {value: amount}
                );
                const proof = await txn.wait();
                console.log("[ETH] relayer locked ${ether.formatEther(amount)} SCROLL for ${sender}");
                console.log("Txn: ${proof.hash}");
                
                //to map to track
                pendingSwaps.set(hashlock.toString(), {
                        path: "scroll->eth",
                        userAddress: sender,
                        amount: amount.toString(),
                        scrollSwapId: swapId,
                        ethTime: timelock
                })
            } catch(err){
                console.error("Failed to lock on ethereum",err.message );
            }
        });
}
module.exports = { startEventListeners, pendingSwaps};