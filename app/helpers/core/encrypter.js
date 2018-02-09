const crypt = require('crypto');

class Encrypter {
    constructor(key, cipher = 'AES-128-CBC') {
        if (key.indexOf('base64:') > -1) {
            key = (new Buffer(key.substr(7), 'base64')).toString('ascii');
        }

        if (this.supported(key, cipher)) {
            this.key = key;
            this.cipher = cipher;
        } else {
            new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        }
    }

    supported(key, cipher) {
        return (cipher === 'AES-128-CBC' && key.length === 16) ||
            (cipher === 'AES-256-CBC' && key.length === 32);
    }

    hash(value) {
        return crypt.createHmac('sha256', this.key).update(value).digest('hex');
    }

    getJsonPayload(payload) {
        payload = JSON.parse((new Buffer(payload, 'base64')).toString('ascii'));

        if (payload == null || this.invalidPayload(payload)) {
            new Error('The payload is invalid.');
        }

        if (!this.validMac(payload)) {
            new Error('The MAC is invalid.');
        }

        return payload;
    }

    invalidPayload(data) {
        return data['value'] === undefined || data['mac'] === undefined;
    }

    validMac (payload) {
        let bytes = crypt.randomBytes(16);
        let calcMac = crypt.createHmac('sha256', bytes)
            .update(this.hash(payload['value']))
            .digest('hex');

        return crypt.createHmac('sha256', payload['mac'])
                .update(bytes)
                .digest('hex') == calcMac;
    }

    encrypt(value) {
        let cipher = crypt.createCipher(this.cipher, this.key);

        value = cipher.update(JSON.stringify(value), 'utf8', 'hex') + cipher.final('hex');
        let mac = this.hash(value);
        let json = JSON.stringify({
            value: value,
            mac: mac
        });

        return (new Buffer(json)).toString('base64');
    }

    decrypt(payload) {
        payload = this.getJsonPayload(payload);
        let decipher = crypt.createDecipher(this.cipher, this.key);
        let decrypted = decipher.update(payload['value'], 'hex', 'utf8') + decipher.final('utf8');

        if (decrypted === '') {
            new Error('Could not decrypt the data.');
        }

        return JSON.parse(decrypted);
    }
}

module.exports = Encrypter;