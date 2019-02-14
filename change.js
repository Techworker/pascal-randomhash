var bignum = require("bignum");
var fs = require('fs');

function targetFromCompact(compact) {
    var encoded = bignum(compact);

    var nbits = encoded.shiftRight(24);

    var i = 0x08000000 >> 24;
    if(nbits < i)
        nbits = i; // min nbits
    if(nbits > 231)
        nbits = 231; // max nbits

    var offset = encoded.and(0x00FFFFFF).xor(0x00FFFFFF).or(0x01000000);

    var bn = bignum(offset).shiftLeft(256 - nbits - 25);

    return bn;

    // remove above return if you want to get with correct leading zeros
    var raw = bn.toBuffer();

    var buf = Buffer.alloc(32);

    for(var i = 0; i < raw.length; i++) {
        buf[i+32-raw.length] = raw[i];
    }

    return bignum.fromBuffer(buf);
}


var obj = JSON.parse(fs.readFileSync('target.json', 'utf8'));
var n = [];
for(var i = 0; i < obj.length; i++) {
    var diff1 = 0x00000000ffff0000000000000000000000000000000000000000000000000000;
    var target = targetFromCompact(obj[i].y);
    var diff = diff1 / target;
    obj[i].y = diff;
}

fs.writeFileSync('out.json', JSON.stringify(obj));
