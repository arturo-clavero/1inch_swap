import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from "axios";
// import Secret from "./tests";
import './App.css';

function getPrice(currency, amount){
	console.log("called ", amount, " ", currency);
	// const axios = require("axios");
	let convertedPrice;
	async function httpCall() {
		const url = "https://api.1inch.dev/price/v1.1/137/{addresses}";

		const config = {
			headers: undefined,
			params: {},
			paramsSerializer: {
			indexes: null,
			},
		};

		try {
		const response = await axios.get(url, config);
		console.log(response.data);
		convertedPrice = response.data;
		} catch (error) {
		console.error(error);
		}
	}
}

function App() {
  const [oldCurrency, setOldCurrency] = useState('ETH');
  const [newCurrency, setNewCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(()=>{
	if (connected && amount)
		setConvertedPrice(fetchPrice(newCurrency, amount));
  }, [connected, amount])

  const fetchPrice = async (currency, amount) => {
    console.log('called', amount, currency);
    try {
      const response = await axios.get(
        'https://api.1inch.dev/price/v1.1/534351/0x5300000000000000000000000000000000000004', // NOTE: Replace {addresses}
        {
          headers: {
            Authorization: 'Bearer ${import.meta.env.1INCH_API_KEY}', // required for 1inch
          },
        }
      );
      console.log(response.data);
      setUsdcPrice(response.data);
    } catch (error) {
      console.error('Error fetching price:', error.message);
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

  const handleSwap = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/generate')
      console.log("the response is ", response);
      const hash = response.data.hash;
      console.log("from backend hash is", hash);
      //contract htlc
    } catch (error) {
      console.error("error generating secret", error);
      alert('failed to start swap');
    }
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
