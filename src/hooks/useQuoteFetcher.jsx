import { ethers } from 'ethers';
import { chainMap } from '../utils/chainMap';

export const fetchQuote = async (oldCurrency, amount, newCurrency, walletAddress) => {
  const src = chainMap[oldCurrency];
  const dst = chainMap[newCurrency];

  if (!src || !dst) {
    console.error("Invalid currencies provided");
    return null;
  }

  let normalizedAmount;
  try {
    normalizedAmount = ethers.parseUnits(amount.toString(), src.decimals).toString();
  } catch (err) {
    console.error("Failed to parse amount:", err);
    return null;
  }

  const query = new URLSearchParams({
    srcChain: src.chainId.toString(),
    dstChain: dst.chainId.toString(),
    srcTokenAddress: src.tokenAddress,
    dstTokenAddress: dst.tokenAddress,
    amount: normalizedAmount,
    walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
    enableEstimate: "true",
  });

  try {
    const res = await fetch(`http://localhost:3001/api/price?${query}`);
    const data = await res.json();
    return (Number(data.dstTokenAmount) / Math.pow(10, dst.decimals)).toFixed(dst.decimals);
  } catch (err) {
    console.error("Fetch quote failed:", err);
    return null;
  }
};
