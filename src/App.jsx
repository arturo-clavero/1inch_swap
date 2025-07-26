import { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import SwapForm from './components/SwapForm';

import './App.css';

function App() {
  const [oldCurrency] = useState('ETH');
  const [newCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <div className="app">
      <div className="card">
        <h1>{oldCurrency} ➝ {newCurrency} Swap</h1>

        <WalletConnector
          connected={connected}
          setConnected={setConnected}
          setWalletAddress={setWalletAddress}
        />

        {connected && (
          <SwapForm
            connected={connected}
            walletAddress={walletAddress}
            oldCurrency={oldCurrency}
            newCurrency={newCurrency}
            amount={amount}
            setAmount={setAmount}
            convertedPrice={convertedPrice}
            setConvertedPrice={setConvertedPrice}
          />
        )}
      </div>
    </div>
  );
}

export default App;
