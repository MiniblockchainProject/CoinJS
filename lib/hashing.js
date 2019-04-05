var Buffer = require('safe-buffer').Buffer;
var crypto = require('crypto');

function RIPEMD160(src, in_type='hex', out_type='') {
	if (out_type == '') {
		return crypto.createHash('rmd160').update(src, in_type).digest();
	} else {
		return crypto.createHash('rmd160').update(src, in_type).digest(out_type);
	}
}

function SHA256(src, in_type='hex', out_type='') {
	if (out_type == '') {
		return crypto.createHash('sha256').update(src, in_type).digest();
	} else {
		return crypto.createHash('sha256').update(src, in_type).digest(out_type);
	}
}

function SHA256x2(src, in_type='hex', out_type='') {
	return SHA256(SHA256(src, in_type, 'binary'), 'binary', out_type);
}

function reverseHash(hash, in_type='hex') {
	if (Buffer.isBuffer(hash)) {
		return hash.toString('hex').match(/../g).reverse().join("");
	} else if (in_type === 'hex') {
		return hash.match(/../g).reverse().join("");
	} else {
		throw new Error('Unsupported hash format: '+in_type);
	}
}

module.exports = {
	RIPEMD160: RIPEMD160,
	SHA256: SHA256,
	SHA256x2: SHA256x2,
	reverseHash: reverseHash
};