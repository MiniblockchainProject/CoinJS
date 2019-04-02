var CoinJS = require('xcncoinjs');
var CoinKey = CoinJS.CoinKey;
var BigInt = CoinJS.BigInt;
//var Buffer = CoinJS.Buffer;
//var secp256k1 = CoinJS.secp256k1;

/****** TEST: GENERATE A NEW EC KEY PAIR ******/

// generate a random private key
var privKey = CoinJS.genNewPrivateKey();

// create a CoinKey object using privKey
var ck = new CoinKey(privKey, CoinJS.coinVersions);

// convert the public key to an address
var address = CoinJS.pubKeyToAddress(ck.publicKey.toString('hex'));
console.log('New Address:', address);

//can also get the public key like this
//var pubKey = secp256k1.publicKeyCreate(privKey);
//and to import a WIF private key
//var ck = CoinKey.fromWif('cMtMeuQfsL13rbaUXwUok7DXJf3dNfhFXNHcxY9esVmwBngbnvoy');
// and to get the WIF key use ck.privateWif

/****** TEST: CREATE A NEW TXN AND SIGN IT ******/

// create some output address hashes for our txn
var output_add1 = CoinJS.hex_decode(CoinJS.addressToHash160('cCHgFDKpNFFN8cshnyA9DvL91hkMCTtjXM'));
var output_add2 = CoinJS.hex_decode(CoinJS.addressToHash160('c7f3CGiqQyWnykeTpfMy2YK5E5LQnHhZFX'));

// get the address hash for our input 
var input_add = ck.publicHash.toString('hex');

// create the new txn object
var tx1 = new CoinJS.Transaction();

// create an input for the txn
tx1.inputs.push({
	pubkey: CoinJS.hex_decode(input_add),
	value: new BigInt('4000001002', 10),
	scriptSig: []
});

// the Cryptonite hack used two large outputs 
// like this to exploit an overflow bug 
tx1.outputs.push({
	value: new BigInt('49000000000000000', 10),
	pubkey: output_add1
});

tx1.outputs.push({
	value: new BigInt('18406744063709551615', 10),
	pubkey: output_add2
});

tx1.version = 1;
tx1.msg = CoinJS.strToBytes('test');
tx1.lockHeight = 123;

// get tx id hash
var hash = CoinJS.hashCompactTx(tx1);

// reverse hash for display
console.log('Tx1 Hash:', CoinJS.reverseHash(hash));

// sign the transaction
var sigObj = CoinJS.signTransaction(hash, privKey);

// check the signature is valid
var valid = CoinJS.checkSignature(hash, sigObj.signature, ck.publicKey);
console.log('Tx1 sig valid?', valid);

// convert sigObj to 65 byte format
var sigHex = CoinJS.exportSig(sigObj).toString('hex');

// prepend final byte (number of sigs required to verify)
tx1.inputs[0].scriptSig = CoinJS.finalizeSig(sigHex, 1);

// uncomment to print signed txn hex
//var bytes = [];
//tx1.serializeInto(new CoinJS.ArraySink(bytes));
//console.log('Tx1 Hex', CoinJS.hex_encode(bytes));

/****** TEST: UNSERIALIZE TX & CHECK SIGNATURE ******/

// Real Cryptonite txn from block #2303879
var txHex = "01000000018dc94401168c784a8f140af06208e7e03ea18695e81f5853b1b6e00d4201043935a77da0ea2effaed7af2367ff95e968f1802b04984e115f4a14796cc9fe40c24a3112665fdd520e48ee45af8cc4d95b3c2d2024ddf4358e62ff9a74a24db201001c5853b1b6e00d381e43cdfb67c2435583bbbdb483a1f7378c31fc008527230000000000";
var tx2 = CoinJS.parseTransaction(new CoinJS.Stream(new CoinJS.ArraySource(CoinJS.hex_decode(txHex))));

// get tx id hash
var hash2 = CoinJS.hashCompactTx(tx2);

// reverse hash for display
console.log('Tx2 Hash', CoinJS.reverseHash(hash2));

// get first sig in tx as array of 65 bytes
var sigBytes = tx2.inputs[0].scriptSig.slice(1, 66);
// convert byte array into signature object
var sigObj2 = CoinJS.importSig(sigBytes);
// recover the public key from the sig
var pubKey = CoinJS.pubKeyFromSig(hash2, sigObj2);
// convert pubKey buffer to hex string
var pubHex = pubKey.toString('hex');
// apply hashing to recovered pubkey
var hash160 = CoinJS.pubKeyToHash160(pubKey, '', 'hex');
// reverse pubkey hash for display
console.log('Recovered pubkey hash:', CoinJS.reverseHash(pubHex));

// ensure recovered pubkey matches the one in the txn
if (CoinJS.hex_encode(tx2.inputs[0].pubkey) === hash160) {
	// check the signature is valid
	// NOTE: this will return false due to an issue (bug?) with
	// secp256k1.verify(), it is fixed in the browsified bundle
	valid = CoinJS.checkSignature(hash2, sigObj2.signature, pubKey);
	console.log('Tx2 sig valid?', valid);
} else {
	valid = false;
	console.log('Wrong recovered pubkey!');
}