import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from "axios";

import './App.css';

function App() {
  const [oldCurrency, setOldCurrency] = useState('ETH');
  const [newCurrency, setNewCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(()=>{
	if (connected && amount)
		setConvertedPrice(fetchQuote(oldCurrency, amount, newCurrency));
  }, [connected, amount])

  const chainMap = {
    ETH: {
      chainId: 1,
      tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    USDC: {
      chainId: 137,
      tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
    },
  };

  const fetchQuote = async (oldCurrency, amount, newCurrency) => {
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
      console.log("Quote :", data);
	  console.log("Quote :", data.dstTokenAmount);
	  return (Number(data.dstTokenAmount) / Math.pow(10, dst.decimals)).toFixed(dst.decimals);

      return data?.toTokenAmount || "N/A";
    } catch (err) {
      console.error("Fetch quote failed:", err);
      return null;
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setWalletAddress(accounts[0]);
      setConnected(true);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleSwap = () => {
    alert(`Pretending to swap ${amount} ETH for USDC!`);
  };

  return (
    <div className="app">
      <div className="card">
        <h1>ETH ➝ USDC Swap</h1>

        {!connected ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <>
            <label>Amount in ETH</label>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p>You will receive ~ {convertedPrice? convertedPrice : '...'} USDC</p>
            {/* <small>(Rate simulated at 1 ETH = 3000 USDC)</small> */}
            <button onClick={handleSwap}>Swap</button>
            <p className="connected">Connected as {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;