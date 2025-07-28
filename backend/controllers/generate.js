const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecret(){
    const secret = crypto.randomBytes(32).toString('hex');
    
    const hash = crypto.createHash('sha256').update(secret).digest('hex');
    const secretPath = path.join(__dirname, '../nbr.json' );
    fs.writeFileSync(secretPath, JSON.stringify({secret}, null, 2));
    //on;y backend can write and read
    fs.chmodSync(secretPath,0o600);
    console.log('Hash to give to contract', hash);
    return { hash };
}

module.exports = {generateSecret};