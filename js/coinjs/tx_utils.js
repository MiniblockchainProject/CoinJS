function sortInsOuts(tx) {
	//TODO: sort inputs and outputs of tx
}

function compactTx(tx) {
	var transaction = tx.clone();
	var inputCount = transaction.inputs.length;
	var outputCount = transaction.outputs.length;
	for (var i = 0; i < inputCount; i++) {
		delete transaction.inputs[i].scriptSig;
	}
	
	return transaction;
}

function hashCompactTx(tx) {

	var transaction = compactTx(tx);

	var bytes = [], sink = new ArraySink(bytes);
	transaction.serializeCompact(sink);

	return SHA256x2(bytes, 'bytes', 'bytes');
}

function hashCompleteTx(tx) {

	var bytes = [], sink = new ArraySink(bytes);
	tx.serializeInto(sink);

	return SHA256x2(bytes, 'bytes', 'bytes').reverse();
}

function finalizeSig(sigHex, sigCount) {
	return hex.decode(hex.encode([sigCount])+sigHex);
}

function importSig(sigBytes) {
	if (sigBytes.length !== 65) throw new Error('Invalid signature length');

	var flagByte = sigBytes[0];
	if (flagByte !== (flagByte & 7)) throw new Error('Invalid signature parameter');

	var compressed = !!(flagByte & 4);
	var recoveryParam = flagByte & 3;

	return {
		signature: Utils.CreateBuffer(sigBytes.slice(1, 65)),
		recovery: recoveryParam,
		compressed: compressed
	}
}

function exportSig(sigObj, compressed=true) {
	var i = sigObj.recovery;
	if (compressed) { i += 4 }

	var buffer = Utils.CreateBuffer(65);
	buffer.writeUInt8(i, 0);

	for (var b=0; b<64; ++b) {
		buffer.writeUInt8(sigObj.signature[b], b+1);
	}

	return buffer;
}

function pubKeyFromSig(hash, sigObj) {

	try {
		var msg = Utils.CreateBuffer(hash);
		return secp256k1.recover(msg, sigObj.signature, sigObj.recovery, sigObj.compressed);
	} catch (e) {
		console.warn('Failed to recover pubkey', e);
		return false;
	}
}

function signTransaction(txBytes, privKey) {

	try {
		var msg = Utils.CreateBuffer(txBytes);
		return secp256k1.sign(msg, privKey);
	} catch (e) {
		console.warn('Failed to sign tx', e);
		return false;
	}
}

function checkSignature(hash, sig, pubKey) {

	try {
		var msg = Utils.CreateBuffer(hash);
		return secp256k1.verify(msg, sig, pubKey);
	} catch (e) {
		console.warn('Signature verification failed', e);
		return false;
	}
}