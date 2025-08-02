import { keccak256, toUtf8Bytes } from "ethers";

export function generateSecret() {
  const secret = Math.random().toString(36).substring(2, 15);
  const hash = keccak256(toUtf8Bytes(secret));
  return { hash, secret };
}

export function getContractAddress(chain) {
  const lower = chain.toLowerCase();
  if (lower === 'eth') return import.meta.env.VITE_ETH_CONTRACT_ADDRESS;
  if (lower === 'scroll') return import.meta.env.VITE_SCROLL_CONTRACT_ADDRESS;
  throw new Error('Unsupported chain: ' + chain);
}
