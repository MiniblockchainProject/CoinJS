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
		  this.rawBytes.push(bytes[i]);
		}
    },
    writeInt: function(number, count) {
        this.writeBytes(littleEndian.encode(number, count));
    },
    writeBigInt: function(number, count) {
		var bytes = hex.decode(number.toString(16));
		while (bytes.length < count) { bytes.unshift(0) }
        this.writeBytes(bytes);
    },
    writeVarInt: function(num) {
        if (num < 253) {
            this.writeByte(num);
        } else if (num <= 0xffff) {
            this.writeByte(253);
            this.writeBytes(littleEndian.encode(num, 2));
        } else if (num <= 0xffffffff) {
            this.writeByte(254);
            this.writeBytes(littleEndian.encode(num, 4));
        } else {
            this.writeByte(255);
            this.writeBytes(littleEndian.encode(num, 8));
        }
    },
    writeString: function(bytes) {
        this.writeVarInt(bytes.length);
        this.writeBytes(bytes);
    },
    writeHexBytes: function(text) {
        this.writeBytes(hex.decode(text).reverse());
    }
};

function Stream(source) {
    this.source = source;
}

Stream.prototype = {
    readByte: function() {
        return this.source.readByte();
    },
    readBytes: function(num) {
        var bytes = [];
        for (var i = 0; i < num; i++) {
            bytes.push(this.readByte());
        }
        return bytes;
    },
    readInt: function(num) {
        var bytes = this.readBytes(num);
        return littleEndian.decode(bytes);
    },
	readBigInt: function(num) {
		var bytes = this.readBytes(num);
		return Utils.CreateBigInt(hex.encode(bytes), 'hex', 'be');
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
        return this.readBytes(length);
    },
    readHexBytes: function(num) {
        var bytes = this.readBytes(num);
        return hex.encode(bytes.reverse());
    },
    hasMoreBytes: function() {
        return this.source.hasMoreBytes();
    },
    getPosition: function() {
        return this.source.getPosition();
    }
};