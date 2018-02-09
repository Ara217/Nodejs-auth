const Encrypter = require('../../helpers/core/encrypter');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

class UsersController {
    constructor (app) {
        this.application = app;
        this._router = require('express').Router();
        this.encrypter = new Encrypter('base64:ExCu21Kx2dH6Sss11CdmfAXbl/MQjz12pEchyRVNMQs=', 'AES-256-CBC');
        this.bind();
    }

    bind () {
        let that = this;
        passport.use(new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password'
            },
            function(email, password, done) {
                that.application.models.user.findOne({email: email}, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) {
                        return done(null, false, { message: 'Incorrect email.' });
                    }

                    if (that.encrypter.decrypt(user.password) !== password) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }

                    return done(null, user);
                });
            }
        ));

        this.bindRoute();
    }

    bindRoute () {
        this.application.app.get('/register', this.getRegister.bind(this));
        this.application.app.post('/register', this.postRegister.bind(this));
        this.application.app.get('/', this.getLogin.bind(this));
        this.application.app.post('/login',  this.postLogin.bind(this));
        this.application.app.get('/index', this._ensureAuth.bind(this), this.index.bind(this));
        this.application.app.get('/show', this._ensureAuth.bind(this), this.show.bind(this));
        this.application.app.post('/edit', this._ensureAuth.bind(this), this.edit.bind(this));
        this.application.app.get('/logout', this.logout.bind(this));
    }

    getRegister (req, res, next) {
        res.render('register');
    }

    postRegister (req, res, next) {
        var body = req.body;

        var formData = {
            name: body.name,
            username: body.username,
            email: body.email,
            password: this.encrypter.encrypt(body.password)
        };

       var user = new this.application.models.user(formData);

       user.save();

        res.redirect('/');
    }

    getLogin (req, res, next) {
        res.render('login');
    }

    postLogin (req, res, next) {
        let that = this;

        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            };

            if (!user) {
                return res.redirect('/');
            };

            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/index');
            });

        })(req, res, next);

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            that.application.models.user.findById(id, function(err, user) {
                done(err, user);
            });
        });

    }

    index (req, res, next) {
            res.render('index', {user: req.user._doc.username});
    }

    show(req, res, next) {
        res.render('show', {user: req.user})
    }

    edit(req, res, next) {
        this.application.models.user.update({email: req.user.email},
            {
                email: req.body.data[0].value,
                username: req.body.data[1].value
            }, function(err, raw) {

            let data;

            if (err) {
                res.json(err);
            }

            if (raw.nModified) {
                data = {
                    success: true,
                    message: 'Personal information successfully changed.'
                }
            } else {
                data = {
                    success: false,
                    message: 'Email not found.'
                }
            }

            res.json(data);
        });
    }

    logout (req, res, next) {
        req.logOut();
        res.redirect('/');
    }

    _ensureAuth (req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    }
}

module.exports = UsersController;
