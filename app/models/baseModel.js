const mongoose = require('mongoose');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

class Model {
    constructor(application) {
        this.application = application;
        this.application.models = {};
    }

    addModel(connection) {
        let that = this;
        let dir = path.join(that.application.appPath, 'models');

        return new Promise(function(resolve, reject) {
            _.each(fs.readdirSync(dir), function (file) {
                let modelPath = path.join(dir, file);
                let info = path.parse(modelPath);

                if (info.name != 'baseModel') {
                    let model = require(modelPath);

                    that.application.models[info.name] = (new model(connection)).model;
                }
            });

            resolve();
        });
    }

    run() {
        let that = this;
        let config = that.application.config.get('database.connections.mongodb');
        let dsn = _.template('mongodb://<%= host %>:<%= port %>/<%= database %>')({
            host: config.host,
            port: config.port,
            database: config.database
        });

        return that.addModel(
            mongoose.connect(
                dsn,
                {
                    server: {
                        socketOptions: {
                            socketTimeoutMS: 0,
                            connectTimeoutMS: 0
                        }
                    }
                }
            )
        );
    }
}

module.exports = Model;