const crypto = require('crypto');
const algorithm = "bf-ecb";

function pad(text) {
    pad_bytes = 8 - (text.length % 8);
    for (let x = 1; x <= pad_bytes; x++) {
        text = text + String.fromCharCode(0);
    }
    return text;
}

module.exports.encrypt = function (data, key) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), '');
    cipher.setAutoPadding(false);
    try {
        return Buffer.from(cipher.update(pad(data), 'utf8', 'binary') + cipher.final('binary'), 'binary').toString('base64');
    } catch (e) {
        return null;
    }
}

module.exports.decrypt = function (data, key) {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), '');
    decipher.setAutoPadding(false);
    try {
        return (decipher.update(Buffer.from(data, 'base64').toString('binary'), 'binary', 'utf8') + decipher.final('utf8')).replace(/\x00+$/g, '');
    } catch (e) {
        return null;
    }
}
