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