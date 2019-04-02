var Buffer = require('safe-buffer').Buffer;
var BigInt = require('bn.js');
//var BinStr = require('binstring');

function CreateBuffer (arg1) {
  return new Buffer(arg1);
}

function CreateBigInt (num, base=10, end='be') {
  return new BigInt(num, base, end);
}

module.exports = {
  CreateBuffer: CreateBuffer,
  CreateBigInt: CreateBigInt
}