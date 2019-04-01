function Transaction(version, inputs, outputs, lockHeight, msg, limitValue, setLimit) {
    this.version = version || 1;
    this.inputs = inputs || [];
    this.outputs = outputs || [];
    this.lockHeight = lockHeight || 0;
	this.msg = msg || '';
	this.limitValue = limitValue || 0;
	this.setLimit = setLimit || false;
}

Transaction.parse = function(stream) {
    var transaction = new Transaction();
    transaction.version = stream.readInt(4);

    var txInNum = stream.readVarInt();
    for (var i = 0; i < txInNum; i++) {
        transaction.inputs.push({
            pubkey: stream.readBytes(20),
            value: stream.readBigInt(8),
            scriptSig: stream.readString()
		});
    }

    var txOutNum = stream.readVarInt();
    for (var i = 0; i < txOutNum; i++) {
        transaction.outputs.push({
            value: stream.readBigInt(8),
            pubkey: stream.readBytes(20)
        });
    }

	transaction.msg = stream.readString();
    transaction.lockHeight = stream.readBigInt(8);

	var vint = transaction.inputs;
	var voutt = transaction.outputs;
	
	if (vint.length==1 && voutt.length==1 && vint[0].pubkey == 
	voutt[0].pubkey && voutt[0].value < vint[0].value) {
		transaction.limitValue = voutt[0].value;
		transaction.setLimit=true;
		voutt[0].value=0;
		vint[0].value -= transaction.limitValue;
	}
	
	transaction.inputs = vint;
	transaction.outputs = voutt;

    return transaction;
};

Transaction.prototype.serializeInto = function(stream) {
    stream.writeInt(this.version, 4);

	if (this.setLimit) {
		this.inputs[0].value+=this.limitValue;
		this.outputs[0].value+=this.limitValue;
	}
	
    stream.writeVarInt(this.inputs.length);
    for (var i = 0, input; input = this.inputs[i]; i++) {
        stream.writeBytes(input.pubkey);
		stream.writeBigInt(input.value, 8);
        stream.writeString(input.scriptSig);
    }

    stream.writeVarInt(this.outputs.length);
    for (var i = 0, output; output = this.outputs[i]; i++) {
		stream.writeBigInt(output.value, 8);
        stream.writeBytes(output.pubkey);
    }

	stream.writeString(this.msg);
    stream.writeBigInt(this.lockHeight, 8);
};

Transaction.prototype.serializeCompact = function(stream) {
    stream.writeInt(this.version, 4);

    stream.writeVarInt(this.inputs.length);
    for (var i = 0, input; input = this.inputs[i]; i++) {
        stream.writeBytes(input.pubkey);
		stream.writeBigInt(input.value, 8);
    }

    stream.writeVarInt(this.outputs.length);
    for (var i = 0, output; output = this.outputs[i]; i++) {
		stream.writeBigInt(output.value, 8);
        stream.writeBytes(output.pubkey);
    }

	// seems to be an issue with Cryptonite
	// serializing the msg length twice
	stream.writeVarInt(this.msg.length);
	stream.writeString(this.msg);
	
    stream.writeBigInt(this.lockHeight, 8);
};

Transaction.prototype.clone = function() {
    var copy = JSON.parse(JSON.stringify(this));
    return new Transaction(copy.version, copy.inputs, copy.outputs, copy.lockHeight, copy.msg);
};
