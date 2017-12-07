var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

let app = express();
const port = 3000;
const stringConnection = 'mongodb://localhost/rateme';

//Connect to MongoDB
mongoose.connect(stringConnection,{useMongoClient: true});

//Require passport config
require('./config/passport');

app.use(express.static('public'));
app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//session
 app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({mongooseConnection: mongoose.connection})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Routes
require('./routes/user')(app,passport);

app.listen(port,() => {
    console.log('listening on port' + port);
});