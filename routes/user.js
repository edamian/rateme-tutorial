var nodeMailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');

module.exports = (app,passport) => {
    app.get('/', (req, res, next) => {
        res.render('index',{title: 'Index || Rate me'});
    });

    app.get('/signup', (req,res,next)=> {
        var errors = req.flash('error');
        res.render('user/signup',{title: 'Sign up || Rate me', messages: errors, hasErrors: errors.length > 0});
    });

    app.post('/signup',validate, passport.authenticate('local.signup',{
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.post('/login', validateLogin, passport.authenticate('local.login',{
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/login',(req, res ,next) => {
        var errors = req.flash('error');
        res.render('user/login',{title: "Login || Rate me", messages: errors, hasErrors: errors.length > 0});
    });

    app.get('/home', (req,res) => {
        res.render('home',{title: "Home || Rate me"});
    });

    app.get('/forgot',(req,res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot',{title: 'Request password reset || Rate me', messages: errors,
                                    hasErrors: errors.length > 0, info: info, noErrors: info.length > 0});
    });

    app.post('/forgot',(req, res, next) => {
        async.waterfall([
            function(callback) {
                crypto.randomBytes(20, (err, buffer) => {
                    var rand = buffer.toString('hex');
                    callback(err, rand);
                });
            },
            function(rand, callback) {
                User.findOne({'email': req.body.email}, (err, user) => {
                    if(!user){
                        req.flash('error','No account whith that email exists or email is invalid');
                        return res.redirect('/forgot');
                    }

                    user.passwordRestToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;

                    user.save((err) => {
                        callback(err, rand, user);
                    });
                });
            },
            function(rand, user, callback) {
                var smtp_transport = nodeMailer.createTransport(smtpTransport(
                    {
                        service: 'gmail',
                        auth: {
                            user: secret.auth.user,
                            pass: secret.auth.pass
                        }
                    }
                ));

                var mailOptions = {
                    to: user.email,
                    from: 'Rate me ' + '<'+secret.auth.user+'>',
                    subject: 'Password reset token',
                    text: 'You have requested for passwor reset token. \n\n'+
                            'Please click on the link ti complete the process: \n\n'+   
                            'http://localhost/reset/'+rand+'\n\n'
                };

                smtp_transport.sendMail(mailOptions, (err, response) => {
                    req.flash('info','A password reset token has been sent to '+user.email);
                    return callback(err, user);
                });
            }
        ], (err) => {
            if(err) {
                return next('Error');
            }
            res.redirect('/forgot');
        });
    });
}

function validate(req,res, next) {
    req.checkBody('fullname','Fullname is required').notEmpty();
    req.checkBody('fullname','Fullname must not be less than 5').isLength({min: 5});
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('email','Email is invalid').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password','Password must not be less than 5').isLength({min: 5});
    //req.checkBody('password','Password must contain at least 1 number').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
    var errors = req.validationErrors();

    if(errors){
        var messages = [];
        errors.forEach(element => {
            messages.push(element.msg);
        });
        req.flash('error', messages);
        res.redirect('/signup');
    } else {
        return next();
    }
}

function validateLogin(req, res, next) {
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email','Email is invalid').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password','Password must not be less than 5').isLength({min: 5});

    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(element => {
            messages.push(element.msg);
        });
        req.flash('error', messages);
        res.redirect('/login');
    } else {
        return next();
    }
}