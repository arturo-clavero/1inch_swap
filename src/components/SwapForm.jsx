import { useEffect, useState } from 'react';
import { fetchQuote } from '../hooks/useQuoteFetcher';
import axios from "axios";
import { getContract } from '../utils/contract';

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

	const initiateTrade = async () => {
		try {
			const contract = await getContract(oldCurrency);
			const tx = await contract.createOrder(args);//TODO
			await tx.wait();
			console.log("Success!");
			
		  } catch (err) {
			console.error("Tx failed:", err);
		  }
	};

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


      <button onClick={initiateTrade} disabled={!amount || Number(amount) <= 0}>
        Swap
      </button>

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
