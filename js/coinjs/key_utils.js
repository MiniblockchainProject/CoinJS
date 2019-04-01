var coin_versions = {
  public: 0x1C,
  private: 0xEF
}

function randomPrivateKey(format='buffer') {
	var privateKey = new Uint8Array(32);

	if (typeof window.crypto.getRandomValues === "function") {
		window.crypto.getRandomValues(privateKey);
	} else {
		throw new Error('getRandomValues() not found, update web browser');
	}

	if (format == 'buffer') {
		return Utils.CreateBuffer(privateKey);
	} else {
		return privateKey;
	}
}

function genNewPrivateKey(max_try=10) {
	var privKey;
	for (var i=0; i < max_try; i++) {
		privKey = randomPrivateKey();
		if (secp256k1.privateKeyVerify(privKey)) return privKey;
	}
	return false;
}

function privKeyFromPhrase(pass_phrase, rounds=10) {
	var pbytes = strToBytes(pass_phrase);
	var result = SHA256(pbytes, 'bytes', 'words');
	
	for (var i=1; i<rounds; i++) {
		result = SHA256(result, 'words', 'words');
	}
	
	return new Uint8Array(wordsToBytes(result));
}

function addressToHash160(addr) {
	var hash = hex.encode(base58.decode(addr));
	return hash.substr(2, hash.length - 10);
}

function pubKeyToHash160(publicKey, in_format='hex', out_format='bytes') {
    return RIPEMD160(SHA256(publicKey, in_format), 'words', out_format);
}

function pubKeyToAddress(publicKey, verByte=coin_versions.public) {
    var hash = pubKeyToHash160(publicKey);
	hash.unshift(verByte);
	
    var checksum = SHA256x2(hash, 'bytes', 'bytes').slice(0, 4);

    return base58.encode(hash.concat(checksum));
}