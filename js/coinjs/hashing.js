function RIPEMD160(src, in_type='words', out_type='words') {
	var result;
	
	switch (in_type) {	
		case 'hex': result = CryptoJS.RIPEMD160(bytesToWords(hex.decode(src)));break;
		case 'bytes': result = CryptoJS.RIPEMD160(bytesToWords(src));break;
		default: result = CryptoJS.RIPEMD160(src);break;
	}
	
	switch (out_type) {
		case 'hex': return result.toString(CryptoJS.enc.Hex);break;
		case 'bytes': return wordsToBytes(result);break;
		default: return result;break;
	}
}

function SHA256(src, in_type='words', out_type='words') {
	var result;
	
	switch (in_type) {	
		case 'hex': result = CryptoJS.SHA256(bytesToWords(hex.decode(src)));break;
		case 'bytes': result = CryptoJS.SHA256(bytesToWords(src));break;
		default: result = CryptoJS.SHA256(src);break;
	}
	
	switch (out_type) {
		case 'hex': return result.toString(CryptoJS.enc.Hex);break;
		case 'bytes': return wordsToBytes(result);break;
		default: return result;break;
	}
}

function SHA256x2(src, in_type='words', out_type='words') {
	var result;
	
	switch (in_type) {	
		case 'hex': result = CryptoJS.SHA256(CryptoJS.SHA256(bytesToWords(hex.decode(src))));break;
		case 'bytes': result = CryptoJS.SHA256(CryptoJS.SHA256(bytesToWords(src)));break;
		default: result = CryptoJS.SHA256(CryptoJS.SHA256(src));break;
	}
	
	switch (out_type) {
		case 'hex': return result.toString(CryptoJS.enc.Hex);break;
		case 'bytes': return wordsToBytes(result);break;
		default: return result;break;
	}
}