import { useEffect } from 'react';
import { fetchQuote } from '../hooks/useQuoteFetcher';

const SwapForm = ({
  connected, walletAddress, oldCurrency, newCurrency,
  amount, setAmount, convertedPrice, setConvertedPrice
}) => {
  useEffect(() => {
    if (connected && amount) {
      fetchQuote(oldCurrency, amount, newCurrency, walletAddress).then(setConvertedPrice);
    }
  }, [connected, amount]);

  const handleSwap = () => {
    alert(`Pretending to swap ${amount} ${oldCurrency} for ${newCurrency}!`);
  };

  return (
    <>
      <label>Amount in {oldCurrency}</label>
      <input
        type="number"
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <p>You will receive ~ {convertedPrice || '...'} {newCurrency}</p>
      <button onClick={handleSwap}>Swap</button>
      <p className="connected">
        Connected as {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </p>
    </>
  );
};

export default SwapForm;
