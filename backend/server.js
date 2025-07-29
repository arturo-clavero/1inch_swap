const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app  = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Server is still running!</h1>');
});

const htlsRoutes = require('./routes/htlcRoute');
app.use('/api', htlsRoutes);

const port = process.env.PORT;

const totalRelayers = 1;

app.listen(port, () => {
    console.log(`Node.js HTTP server is running on port ${port}`);
    console.log(`http://localhost:${port}`);

	// start relayers
	require('./blockchain/relayers/relayerManager');
	const { startRelayers } = require('./blockchain/relayers/relayerManager');
	startRelayers(totalRelayers)
	.then(() => console.log('Relayers started and waiting for orders'))
	.catch(console.error);

    // Start listening for orders
    require('./blockchain/verifiedOrder')();

});