import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors()); // Allow frontend from any origin

// Example proxy route

app.get('/api/price', async (req, res) => {
	const {
	  srcChain,
	  dstChain,
	  srcTokenAddress,
	  dstTokenAddress,
	  amount,
	  walletAddress,
	  enableEstimate
	} = req.query;
  
	try {
		console.error(req.query);

	  const response = await axios.get(
		`https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive`,
		{
		  headers: {
			Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
		  },
		  params: {
			srcChain,
			dstChain,
			srcTokenAddress,
			dstTokenAddress,
			amount,
			walletAddress,
			enableEstimate,
		  }
		}
	  );
  
	  res.json(response.data);
	} catch (error) {
		console.error('1inch API error:', error.response.status, error.response.data);
	  console.error('Error fetching from 1inch:', error.message);
	  res.status(500).json({ error: 'Failed to fetch price' });
	}
  });
  

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
