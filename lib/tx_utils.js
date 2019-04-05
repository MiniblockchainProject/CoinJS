var Buffer = require('safe-buffer').Buffer;
var secp256k1 = require('secp256k1');
var encoders = require('./encoders.js');
var hashing = require('./hashing.js');
var primitives = require('./primitives.js');
var txParse = require('./tx_parse.js');

function sortInsOuts(tx) {
	//TODO: sort inputs and outputs of tx
}

function compactTx(tx) {
	var transaction = tx.clone();
	var inputCount = transaction.inputs.length;
	var outputCount = transaction.outputs.length;
	for (var i = 0; i < inputCount; i++) {
		delete transaction.inputs[i].sig;
	}
	
	return transaction;
}

function hashCompactTx(tx) {

	var transaction = compactTx(tx);

	var bytes = [];
	transaction.serializeCompact(bytes);

	return hashing.SHA256x2(Buffer.from(bytes));
}

function hashCompleteTx(tx) {

	var bytes = [];
	tx.serializeInto(bytes);

	return hashing.SHA256x2(Buffer.from(bytes)).reverse();
}

function finalizeSig(sigHex, sigCount) {
	return encoders.hex_decode(encoders.hex_encode([sigCount])+sigHex);
}

function importSig(sigBytes) {
	if (sigBytes.length !== 65) throw new Error('Invalid signature length');

	var flagByte = sigBytes[0];
	if (flagByte !== (flagByte & 7)) throw new Error('Invalid signature parameter');

	var compressed = !!(flagByte & 4);
	var recoveryParam = flagByte & 3;

	return {
		signature: Buffer.from(sigBytes.slice(1, 65)),
		recovery: recoveryParam,
		compressed: compressed
	}
}

function exportSig(sigObj, compressed=true) {
	var i = sigObj.recovery;
	if (compressed) { i += 4 }

	var buffer = Buffer.alloc(65);
	buffer.writeUInt8(i, 0);

	for (var b=0; b<64; ++b) {
		buffer.writeUInt8(sigObj.signature[b], b+1);
	}

	return buffer;
}

function pubKeyFromSig(hash, sigObj) {

	try {
		return secp256k1.recover(hash, sigObj.signature, sigObj.recovery, sigObj.compressed);
	} catch (e) {
		console.warn('Failed to recover pubkey', e);
		return false;
	}
}

function signTransaction(txBuff, privKey) {

	try {
		return secp256k1.sign(txBuff, privKey);
	} catch (e) {
		console.warn('Failed to sign tx', e);
		return false;
	}
}

function checkSignature(hash, sig, pubKey) {

	try {
		return secp256k1.verify(hash, sig, pubKey);
	} catch (e) {
		console.warn('Signature verification failed', e);
		return false;
	}
}

module.exports = {
	compactTx: compactTx,
	hashCompactTx: hashCompactTx,
	hashCompleteTx: hashCompleteTx,
	finalizeSig: finalizeSig,
	importSig: importSig,
	exportSig: exportSig,
	pubKeyFromSig: pubKeyFromSig,
	signTransaction: signTransaction,
	checkSignature: checkSignature
};