const express = require('express');
const router  = express.Router();

router.get('/', (req, res) =>{
    res.send('this is bacjend');
});
router.post('/generate', (req, res) =>{
    res.send('here we will generate the secret')
    //frontend need the hash of the secret
});
router.post('/lock', (req, res) =>{
    res.send('Lock the token here')
    //use the secret and private wallet to lock tokens in the htlc
});
router.post('/withdraw', (req, res) =>{
    res.send('Called when its time to redeem')
});
router.post('/refund', (req, res) =>{
    res.send('timelock expired')
});

module.exports = router;