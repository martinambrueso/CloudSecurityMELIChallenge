var CryptoJS = require("crypto-js");

exports.encryptWithAES = (text) => {
    return CryptoJS.AES.encrypt(text, 'secret key 123').toString();
}

function decryptWithAES(text) {
    var bytes  = CryptoJS.AES.decrypt(text, 'secret key 123');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    return originalText;
}

exports.compare = (pass, dbPass) => {
    if (decryptWithAES(dbPass) == pass) {
        return true;
    } else {
        return false;
    }
}