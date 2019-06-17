var Buffer = require('safe-buffer').Buffer;
var secp256k1 = require('secp256k1');
var CoinKey = require('coinkey');
var BigInt = require('bn.js');

var encoders = require('./lib/encoders.js');
var hashing = require('./lib/hashing.js');
var primitives = require('./lib/primitives.js');
var txParse = require('./lib/tx_parse.js');
var txUtils = require('./lib/tx_utils.js');
var keyUtils = require('./lib/key_utils.js');

module.exports = {

	// encoders
	numToBytes: encoders.numToBytes,
	numToVarInt: encoders.numToVarInt,
	bytesToStr: encoders.bytesToStr,
	strToBytes: encoders.strToBytes,
	base64_encode: encoders.base64_encode,
	hex_encode: encoders.hex_encode,
	lEndian_encode: encoders.lEndian_encode,
	base64_decode: encoders.base64_decode,
	hex_decode: encoders.hex_decode,
	lEndian_decode: encoders.lEndian_decode,
	
	// primitives
	ArraySource: primitives.ArraySource,
	ArraySink: primitives.ArraySink,
	
	// hashing
	RIPEMD160: hashing.RIPEMD160,
	SHA256: hashing.SHA256,
	SHA256x2: hashing.SHA256x2,
	reverseHash: hashing.reverseHash,
	
	// txn parsing
	Transaction: txParse.Transaction,
	parseTransaction: txParse.parseTransaction,
	
	// txn utilities
	compactTx: txUtils.compactTx,
	hashCompactTx: txUtils.hashCompactTx,
	hashCompleteTx: txUtils.hashCompleteTx,
	finalizeSig: txUtils.finalizeSig,
	importSig: txUtils.importSig,
	exportSig: txUtils.exportSig,
	pubKeyFromSig: txUtils.pubKeyFromSig,
	signTransaction: txUtils.signTransaction,
	checkSignature: txUtils.checkSignature,
	amountToCoinInt: txUtils.amountToCoinInt,
	
	// key utilities
	genNewPrivateKey: keyUtils.genNewPrivateKey,
	privKeyFromPhrase: keyUtils.privKeyFromPhrase,
	addressToHash160: keyUtils.addressToHash160,
	pubKeyToHash160: keyUtils.pubKeyToHash160,
	pubKeyToAddress: keyUtils.pubKeyToAddress,
	coinVersions: keyUtils.coinVersions
};

module.exports.secp256k1 = secp256k1;
module.exports.CoinKey = CoinKey;
module.exports.Buffer = Buffer;
module.exports.BigInt = BigInt;