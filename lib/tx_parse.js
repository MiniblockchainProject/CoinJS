var primitives = require('./primitives.js');

function Transaction(version, inputs, outputs, lockHeight, msg, limitValue, setLimit) {
	this.version = version || 1;
	this.inputs = inputs || [];
	this.outputs = outputs || [];
	this.lockHeight = lockHeight || 0;
	this.msg = msg || '';
	this.limitValue = limitValue || 0;
	this.setLimit = setLimit || false;
}

function parseTransaction(bytes) {
	var stream = new primitives.ArraySource(bytes);
	var transaction = new Transaction();
	
	transaction.version = stream.readInt(4);

	var txInNum = stream.readVarInt();
	for (var i = 0; i < txInNum; i++) {
		transaction.inputs.push({
			pubkey: stream.readHex(20),
			value: stream.readBigInt(8),
			sig: stream.readBytes(stream.readVarInt())
		});
	}

	var txOutNum = stream.readVarInt();
	for (var i = 0; i < txOutNum; i++) {
		transaction.outputs.push({
			value: stream.readBigInt(8),
			pubkey: stream.readHex(20)
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

Transaction.prototype.serializeInto = function(bytes) {
	var stream = new primitives.ArraySink(bytes);
	
	stream.writeInt(this.version, 4);

	if (this.setLimit) {
		this.inputs[0].value+=this.limitValue;
		this.outputs[0].value+=this.limitValue;
	}
	
	stream.writeVarInt(this.inputs.length);
	for (var i = 0, input; input = this.inputs[i]; i++) {
		stream.writeHex(input.pubkey);
		stream.writeBigInt(input.value, 8);
		stream.writeVarInt(input.sig.length);
		stream.writeBytes(input.sig);
	}

	stream.writeVarInt(this.outputs.length);
	for (var i = 0, output; output = this.outputs[i]; i++) {
		stream.writeBigInt(output.value, 8);
		stream.writeHex(output.pubkey);
	}

	stream.writeString(this.msg);
	stream.writeBigInt(this.lockHeight, 8);
};

Transaction.prototype.serializeCompact = function(bytes) {
	var stream = new primitives.ArraySink(bytes);
	
	stream.writeInt(this.version, 4);

	stream.writeVarInt(this.inputs.length);
	for (var i = 0, input; input = this.inputs[i]; i++) {
		stream.writeHex(input.pubkey);
		stream.writeBigInt(input.value, 8);
	}

	stream.writeVarInt(this.outputs.length);
	for (var i = 0, output; output = this.outputs[i]; i++) {
		stream.writeBigInt(output.value, 8);
		stream.writeHex(output.pubkey);
	}

	// seems to be an issue with Cryptonite
	// serializing the msg length twice
	stream.writeVarInt(this.msg.length);
	stream.writeString(this.msg);
	
	stream.writeBigInt(this.lockHeight, 8);
};

Transaction.prototype.clone = function() {
	var bytes = [];
	this.serializeInto(bytes);
	return parseTransaction(bytes);
};

module.exports = {
	Transaction: Transaction,
	parseTransaction: parseTransaction
};