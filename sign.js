// Importing Required Modules
const crypto = require('crypto'),
      buffer = require('buffer'),
      fs     = require('fs');
// Loading public and private keys
const publicKeyString  = fs.readFileSync("pubkey.pem"),
      privateKeyString = process.env.PRIVKEY;

const SIGNING_ALGORITHM = "SHA256";

//Use the function to create and export the public key object
const PUBLICKEY = crypto.createPublicKey(publicKeyString),
      PRIVATEKEY = crypto.createPrivateKey(privateKeyString);
PUBLICKEY.export({ format: 'pem', type: 'pkcs1' });
PRIVATEKEY.export({ format: 'pem', type: 'pkcs1' });


function getSignature(rawdata){
  // Converting string to buffer
  let data = Buffer.from(rawdata);
  // Sign the data and returned signature in buffer
  let signature = crypto.sign(SIGNING_ALGORITHM, data, PRIVATEKEY);
  
  return signature;
}

function verifySignature(rawdata, signature){
  // Verifying signature using crypto.verify() function
  let isVerified = crypto.verify(SIGNING_ALGORITHM, rawdata, PUBLICKEY, signature);
  return isVerified;
}

let rawdata = "test";
const signature = btoa(String.fromCharCode(...new Uint8Array(getSignature(rawdata))));
console.log(rawdata, signature)

module.exports = { getSignature, verifySignature };