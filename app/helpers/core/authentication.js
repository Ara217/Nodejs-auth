const Encrypter = require('./encrypter');

class Authentication {
    constructor(application, request, response) {
        this.application = application;
        this.request = request;
        this.response = response;
        this.encrypter = new Encrypter(application.env.get('APP_KEY'), 'AES-256-CBC');

        // let password = this.encrypter.encrypt('admin')
        // console.log(password);
    }

    attempt(email, password, rememberMe = false) {
        let that = this;

        return new Promise(function (resolve, reject) {
            that.application.models.user.findOne({email: email}).then(
                user => {
                    if (user && that.encrypter.decrypt(user.password) == password) {
                        that.request.session.set('user', user);

                        resolve();
                    } else {
                        that.request.session.set('errors', 1);
                        that.response.back();
                    }
                },
                error => {
                    console.log('ffffff');
                    reject(error);
                }
            )
        });
    }

    logout() {
        this.request.session.delete('user');
        this.response.redirect('/login');
    }
}

module.exports = Authentication;

