const Validators = require('../helpers/core/mongoValidators');

class User {
    constructor(connection) {
        this.connection = connection;
    }

    get collection() {
        return 'users';
    }

    get rules() {
        return new this.connection.Schema({
            email: {
                type: String,
                required: '{PATH} is required!',
                unique: true,
                trim: true,
                // validate: Validators.email
            },
            username:{
                type: String,
                unique: true
            },
            password: {
                type: String,
                required: '{PATH} is required!',
                trim: true
            }
        });
    }

    get name() {
        return 'ModelUsers';
    }

    get model() {
        return this.connection.model(
            this.name,
            this.rules,
            this.collection
        );
    }
}

module.exports = User;