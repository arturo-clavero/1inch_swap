import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const WalletConnector = ({ connected, setConnected, setWalletAddress }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // 🔁 Auto-connect on reload if MetaMask already has an address selected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address || accounts[0]);
          setConnected(true);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;

    try {
      setError('');
      setIsConnecting(true);

      if (!window.ethereum) {
		throw new Error('NO_METAMASK');
	}

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send('eth_requestAccounts', []);
      setWalletAddress(accounts[0]);
      setConnected(true);
    } catch (err) {
      console.error('Wallet connection failed:', err);
	  if (err.code === 4001) {
		setError('Connection request rejected by user.');
	  } else if (err.code === -32002) {
		setError('Connection request already pending. Please check MetaMask.');
	  } else if (err.message === 'NO_METAMASK') {
		setError('MetaMask not detected.');
	  } else {
		setError(err.message || 'Wallet connection failed.');
	  }
	  
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      {!connected && (
       <button
	   onClick={connectWallet}
	   disabled={isConnecting}
	   style={{
		 opacity: isConnecting ? 0.6 : 1,
		 cursor: isConnecting ? 'not-allowed' : 'pointer'
	   }}
	 >
	   {isConnecting ? 'Connecting...' : 'Connect Wallet'}
	 </button>
      )}
     {error && (
  <div style={{
    background: '#fff4f4',
    border: '1px solid #ffa8a8',
    color: '#a00000',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '8px',
    fontSize: '0.9em'
  }}>
    {error === 'MetaMask not detected.' ? (
      <span>
        MetaMask not detected.{' '}
        <a
          href="https://metamask.io/download.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#a00000', textDecoration: 'underline' }}
        >
          Install MetaMask
        </a>
        .
      </span>
    ) : (
      error
    )}
  </div>
)}

    </>
  );
};

export default WalletConnector;

