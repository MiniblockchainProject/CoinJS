var BigInt = require('bn.js');
var encoders = require('./encoders.js');

function ArraySource(rawBytes, index) {
	this.rawBytes = rawBytes;
	this.index = index || 0;
}

function ArraySink(rawBytes) {
	this.rawBytes = rawBytes;
}

ArraySource.prototype = {
	readByte: function() {
		if (!this.hasMoreBytes()) {
			throw new Error('Cannot read past the end of the array.');
		}
		return this.rawBytes[this.index++];
	},
	readBytes: function(num) {
		var bytes = [];
		for (var i = 0; i < num; i++) {
			bytes.push(this.readByte());
		}
		return bytes;
	},
	readHex: function(num) {
		var bytes = this.readBytes(num);
		return encoders.hex_encode(bytes);
	},
	readInt: function(num) {
		var bytes = this.readBytes(num);
		return encoders.lEndian_decode(bytes);
	},
	readBigInt: function(num) {
		var bytes = this.readBytes(num);
		return new BigInt(encoders.hex_encode(bytes), 16);
	},
	readVarInt: function() {
		var num = this.readByte();
		if (num < 0xfd) {
			return num;
		} else if (num === 0xfd) {
			return this.readInt(2);
		} else if (num === 0xfe) {
			return this.readInt(4);
		} else {
			return this.readInt(8);
		}
	},
	readString: function() {
		var length = this.readVarInt();
		return encoders.bytesToStr(this.readBytes(length));
	},
	hasMoreBytes: function() {
		return this.index < this.rawBytes.length;
	},
	getPosition: function() {
		return this.index;
	}
};

ArraySink.prototype = {
	writeByte: function(byte) {
		this.rawBytes.push(byte);
	},
	writeBytes: function(bytes) {
		var c = bytes.length;
		for (var i = 0; i < c; i++) {
		  this.writeByte(bytes[i]);
		}
	},
	writeHex: function(str) {
		this.writeBytes(encoders.hex_decode(str));
	},
	writeInt: function(number, count) {
		this.writeBytes(encoders.lEndian_encode(number, count));
	},
	writeBigInt: function(number, count) {
		var bytes = encoders.hex_decode(number.toString(16));
		while (bytes.length < count) bytes.unshift(0);
		this.writeBytes(bytes);
	},
	writeVarInt: function(num) {
		if (num < 253) {
			this.writeByte(num);
		} else if (num <= 0xffff) {
			this.writeByte(253);
			this.writeBytes(encoders.lEndian_encode(num, 2));
		} else if (num <= 0xffffffff) {
			this.writeByte(254);
			this.writeBytes(encoders.lEndian_encode(num, 4));
		} else {
			this.writeByte(255);
			this.writeBytes(encoders.lEndian_encode(num, 8));
		}
	},
	writeString: function(str) {
		this.writeVarInt(str.length);
		this.writeBytes(encoders.strToBytes(str));
	}
};

module.exports = {
	ArraySource: ArraySource,
	ArraySink: ArraySink
};