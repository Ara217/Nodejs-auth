const _ = require('lodash');
const path = require('path');
const fs = require('fs');

class Config
{
    constructor(app) {
        let that = this;

        if(Config._instance) {
            return Config._instance;
        }

        that.data = {};
        that.app = app;
        let basePath = path.join(app.basePath, 'config');

        _.each(fs.readdirSync(basePath), function (file) {
            if (file != '.gitkeep') {
                let key = path.parse(file).name;
                that.data[key] = that.readConfig(JSON.parse(fs.readFileSync(path.join(basePath, file), {encoding: 'utf8'})))
            }
        });

        Config._instance = that;
    }

    get(key) {
        let result = this.data;

        _.each(key.split('.'), function (part) {
            if (result[part] === undefined) {
                new Error('undefined config path');
            }

            result = result[part];
        });

        return result;
    }

    set(key, value) {
        let result = this.data;

        _.each(key.split('.'), function (part) {
            if (result[part] === undefined) {
                new Error('undefined config path');
            }

            result = result[part];
        });

        result = value;
    }

    readConfig(data) {
        var tmp = {};

        for(var key in data) {
            if (typeof data[key] == 'object') {
                tmp[key] = this.readConfig(data[key]);
            } else {
                tmp[key] = this.parseValue(data[key]);
            }
        }

        return tmp;
    }

    parseValue(value) {
        var attributes = value.toString().match(/^([a-zA-Z]+)\('(.+)',[\s]+(.+)\)$|^([a-zA-Z]+)\('(.+)'\)$/);

        if (attributes && attributes.length > 0) {
            let command = attributes[1] || attributes[4];
            let args = attributes[2] && attributes[3] ?
                [attributes[2], _.trimStart(_.trimEnd(attributes[3], "'"), "'")] :
                [attributes[5]];

            if (!this.app[command]) {
                return undefined;
            }

            if (command == 'env') {
                return this.app.env.get.apply(null, args);
            } else {
                return this.app[command].apply(null, args);
            }
        } else {
            return value;
        }
    }
}

Config.instance = function (app) {//singleton
    return new Config(app);
};

module.exports = Config;