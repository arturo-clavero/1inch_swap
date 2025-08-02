import { useEffect, useState, useRef } from 'react';
import { fetchQuote } from '../hooks/useQuoteFetcher';


import HTLC_abi from "../../abi/HTLC.json";
import { ethers, Contract } from "ethers";
import axios from "axios";
import { generateSecret } from './Handling';

const ethHtlc = import.meta.env.VITE_ETH_CONTRACT_ADDRESS;
const scrollHtlc = import.meta.env.VITE_SCROLL_CONTRACT_ADDRESS;
const relayer_address = import.meta.env.VITE_RELAYER_ADDRESS;
console.log("relayer", relayer_address);

const SwapForm = ({
  connected, walletAddress, oldCurrency, newCurrency,
  amount, setAmount, convertedPrice, setConvertedPrice
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (connected && amount && Number(amount) > 0) {
      setIsLoading(true);
      fetchQuote(oldCurrency, amount, newCurrency, walletAddress)
      .then((price) => {
        setConvertedPrice(price);
      })
      .catch(() => {
        setConvertedPrice(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setConvertedPrice(null);
      setIsLoading(false);
    }
    
  }, [connected, amount, oldCurrency, newCurrency, walletAddress]);
  
  const [isSwapping, setIsSwapping] = useState(false); 
  const [isRefundable, setIsRefundable] = useState(false);
  const [timeLeft, setTimeLeft] = useState(false);
  const htlcRef = useRef(null);
  
  
  //the lock triggers next event - relayer listens for the event - get swapId hashlock->
  //-> triggers the event for relayer/resolver "lock the same amount on the scroll"
  
  
  const handleSwap = async () => {
    if (isSwapping) return ;
    try {
      setIsSwapping(true);
      const {hash, secret } = generateSecret();
      const bytesHashlock = hash.startsWith("0x") ? hash : "0x" + hash;
      
      //user should sign the swap -> create instance with user signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      let contract;
        if (oldCurrency.toLowerCase() === "eth") {
            contract = ethHtlc;
        } else if ( oldCurrency.toLowerCase() === "scroll"){
            contract = scrollHtlc;
        } else {
            alert('unsupported chain');
        }
      htlcRef.current = new ethers.Contract(contract, HTLC_abi, signer);
      const htlcContract = htlcRef.current;
      console.log("htlc contract via ref", htlcContract);
      const amount = ethers.parseEther("0.00000001");
      const timelock =  Math.floor(Date.now() / 1000) + 60 * 5;
      const txn = await htlcContract.createSwap(
          walletAddress,
          bytesHashlock, 
          timelock,
          { value: amount }
      );
      console.log("Tx sent:", txn.hash);
      await txn.wait();
      const response = await axios.get(`http://localhost:3000/api/swap/${hash}`);
      const swapId = response.data.swapId;
      localStorage.setItem("swapId", swapId);
      console.log("swapId is and now in the storage ✝️", swapId);
      let tryes = 0;
      const maxTryes = 10;
      while (tryes < maxTryes){
        const response = await axios.get(`http://localhost:3000/api/ready/${hash}`);
        console.log("response is:", response);
        if (response.data.ready){
          await withdraw();
          break;
        }
        else{
          console.log("Relayer still locking, try in the moment");
          await new Promise(r => setTimeout(r, 2000));
          tryes++;
        }

      }
      alert("Swap was simulated successfully");
    } catch (error) {
        console.error("error generating secret", error);
        alert('failed to start swap');
        alert(`Pretending to swap ${amount} ETH for USDC!`);
    }
    finally{
      setIsSwapping(false);
    }
  }
  const withdraw = async () => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        //define htlc
        const  contract = oldCurrency.toLowerCase() === "eth" ? ethHtlc : scrollHtlc;
          const htlcContract = new ethers.Contract(contract, HTLC_abi, signer);
          console.log("htlc contract normal", htlcContract);
          //hetting secret hash swapid
          const hash = localStorage.getItem('hash') || '';
          const swapId = localStorage.getItem('swapId');
          console.log("from the local✝️✝️", swapId);
          const secret = localStorage.getItem('secret') || '';
          console.log("the secret is", secret);
          const txn = await htlcContract.withdraw(swapId, secret);
          await txn.wait();
          alert ("Withdraw successful");
        } catch (err){
          console.error("Withdraw unseccessfull", err);
          alert ("Withdraw failed: " + err.message);
        }
  };
  useEffect(() => {
    const preRefundCheck = async () => {
      const swapId = localStorage.getItem('swapId');
      console.log("in the use effect usong teh local storage", swapId);
      if (!walletAddress || !swapId)
          return;
      //in case refresh page happened
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const  contract = oldCurrency.toLowerCase() === "eth" ? ethHtlc : scrollHtlc;
      const htlcContract = new ethers.Contract(contract, HTLC_abi, signer);

      htlcRef.current = htlcContract;
      const swapInfo = await htlcContract.getSwap(swapId);
      const curTime = Math.floor(Date.now() / 1000);
  
      const isSender = swapInfo.sender.toLowerCase() === walletAddress.toLowerCase();
      const refundable = isSender && !swapInfo.withdrawn && !swapInfo.refunded && curTime > Number(swapInfo.timelock);
      const timeL = Number(swapInfo.timelock)- curTime;
      setTimeLeft(timeL > 0 ? timeL : 0);
      setIsRefundable(refundable);

      if (swapInfo.withdrawn || swapInfo.refunded){
        cleanStorage();
      }
      function cleanStorage() {
        const secret = localStorage.getItem('secret');
        const hash = localStorage.getItem('hash');
        const swapId = localStorage.getItem('swapId');
        if (swapId || hash || secret){
          console.log("program end, cleaning the data");
          localStorage.removeItem('secret', secret);
          localStorage.removeItem('hash', hash);
          localStorage.removeItem('swapId', swapId);

        }
      }

    };  
    preRefundCheck();
    const interval = setInterval(preRefundCheck, 10000);
    return () => clearInterval(interval);
  }, [walletAddress, oldCurrency]);

  async function refund() {
    try {
        const swapId = localStorage.getItem('swapId');
        console.log("swapId✝️ in loc", swapId);
        const htlcContract = htlcRef.current;
        const txn = await htlcContract.refund(swapId);
        await txn.wait();
        alert ("refund successfully");
        
    } catch (error){
      console.error("failed can not refund", error.message);
      alert ("failed to refund");
    }
  }

  return (
    <>
      <label>Amount in {oldCurrency}</label>
      <input
        type="number"
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
      />

		{amount && Number(amount) > 0 && (
		isLoading ? (
			<p>
			<span className="spinner" /> Getting quote...
			</p>
		) : (
			<p>
			You will receive ~ {convertedPrice || '...'} {newCurrency}
			</p>
		)
		)}


      <button onClick={handleSwap} disabled={!amount || Number(amount) <= 0}>
        Swap
      </button>

      {isRefundable && (
        <button onClick={refund}>
           Refund swap
        </button>
      )}

      {timeLeft !== null && !isRefundable && (
        <p>You can refund money in: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
      )}

	  <p className="connected">
  Connected as{' '}
  <a
    href={`https://etherscan.io/address/${walletAddress}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{color: 'white', textDecoration: 'underline' }}
  >
    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
  </a>
</p>
    </>
  );
};

export default SwapForm;
