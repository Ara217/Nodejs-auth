const _ = require('lodash');
const fs = require('fs');

class Env
{
    constructor (path) {
        if (Env._instance) {
            return Env._instance;
        }

        this.root = path;
        this.readConfig();

        Env._instance = this;
    }

    readConfig () {
        let path = this.root + '/.env';

        if (!fs.existsSync(path)) {
            new Error('Env is missing');
        }

        _.each(fs.readFileSync(path, {encoding: 'utf8'}).split(/[\s]+/g), function (config) {
            let parts = config.split('=');

            Env.data[parts[0]] = parts[1]
        });
    }

    get (key, defaultValue = null) {
        return Env.data[key] || Env.data[key] === '' ?
            Env.data[key] :
            (
                defaultValue.indexOf('false') > -1 || defaultValue.indexOf('null') > -1 ?
                    eval(defaultValue) :
                    defaultValue
            );
    }
}

Env.data = {};

Env.instance = function(path) {
    return new Env(path);
};

module.exports = Env;