var Buffer = require('safe-buffer').Buffer;
var secureRnd = require('secure-random');
var base58 = require('bs58');
var secp256k1 = require('secp256k1');
var encoders = require('./encoders.js');
var hashing = require('./hashing.js');

var coin_versions = {
	public: 0x1C,
	private: 0xEF
}

function genNewPrivateKey(max_try=10) {
	var privKey;
	for (var i=0; i < max_try; i++) {
		privKey = secureRnd.randomBuffer(32);
		if (secp256k1.privateKeyVerify(privKey)) return privKey;
	}
	return false;
}

function privKeyFromPhrase(pass_phrase, rounds=10, str_enc='ascii') {
    var result = hashing.SHA256(pass_phrase, str_enc);

    for (var i=1; i<rounds; i++) {
        result = hashing.SHA256(result);
    }

    return result;
}

function addressToHash160(addr) {
	var hash = encoders.hex_encode(base58.decode(addr));
	return hash.substr(2, hash.length - 10);
}

function pubKeyToHash160(public_key, in_format='hex', out_format='hex') {
	return hashing.RIPEMD160(hashing.SHA256(public_key, in_format), '', out_format);
}

function pubKeyToAddress(public_key, ver_byte=coin_versions.public) {
	var pubHash = encoders.hex_encode([ver_byte])+pubKeyToHash160(public_key);
	var sumHash = hashing.SHA256x2(Buffer.from(pubHash, 'hex'), '', 'hex');
	return base58.encode(Buffer.from(pubHash+sumHash.substr(0, 8), 'hex'));
}

module.exports = {
	genNewPrivateKey: genNewPrivateKey,
	privKeyFromPhrase: privKeyFromPhrase,
	addressToHash160: addressToHash160,
	pubKeyToHash160: pubKeyToHash160,
	pubKeyToAddress: pubKeyToAddress
};

module.exports.coinVersions = coin_versions;
