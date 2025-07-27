require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app  = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Server is still running!</h1>');
});

const htlsRoutes = require('./routes/htlcSwap');
app.use('/api', htlsRoutes);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Node.js HTTP server is running on port ${port}`);
    console.log(`http://localhost:3000`)
});