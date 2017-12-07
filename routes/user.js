module.exports = (app,passport) => {
    app.get('/', (req, res, next) => {
        res.render('index',{title: 'Index || Rate me'});
    });

    app.get('/signup', (req,res,next)=> {
        res.render('user/signup',{title: 'Sign up || Rate me'});
    });

    app.post('/signup',passport.authenticate('local.signup',{
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/login',(req, res ,next) => {
        res.render('user/login',{title: "Login || Rate me"});
    });
}