// default express
var express = require('express'),
	session = require('express-session'),
	path = require('path'),
	favicon = require('serve-favicon'),
	url  = require('url'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	config = require('./config'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// setup client IDs	
var GOOGLE_CLIENT_ID = config.google.clientId;
var GOOGLE_CLIENT_SECRET = config.google.clientSecret;

// setup passport session  
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// routes
var pages = require('./routes/pages');
var auth = require('./routes/auth');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// setup static directory
app.use(express.static(path.join(__dirname, 'public')));

// setup session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'hashedit is cool'
}));

// setup google auth
app.use(passport.initialize());
app.use(passport.session());

// setup google strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: config.app.url + "/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
	
    // set email and provider
    var emails = profile.emails;
    var provider = profile.provider;
    var isAuthorized = false;
    
    // check email/provider against authorized list
    for(x=0; x<emails.length; x++){
    	var email = emails[x].value;
    	
    	for(y=0; y<config.authorized.length; y++){
      	
      	    // check authorization
      	    if(config.authorized[y].email == email && config.authorized[y].provider == provider){
          	    isAuthorized = true;
      	    }
      		
    	}
    	
    }
    
    if(isAuthorized){
      	console.log('Authorized!!!');
      	return done(null, profile);
    }
    else{
      	console.log('Not Authorized!!!');
      	return done(null, false, {message: 'Not authorized'});
    }
    
  }
));

// setup routes
app.use('/api/pages', pages);
app.use('/api/auth', auth);

/**
  * Route for Google Auth
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  */
app.get('/auth/google', 
  function(req, res, next){ // middleware to save off where the auth request came from
	  
	  // get parts
	  var parts = url.parse(req.headers.referer);
	  
	  // get pathname
	  req.session.pathToFile = parts.pathname;
	  
	  // set lastUrl to request url, then authenticate
	  req.session.lastUrl = req.headers.referer;
	  
	  next();
	  
  },
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }),
  function(req, res) {
	
  });

/**
  * Callback from Google authentication
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  */
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
	
    if(req.session.lastUrl) {
    	res.redirect(req.session.lastUrl + '#edit');
    }
    else{
    	res.redirect('/');
    }
	
  });

/**
  * Logs the user out
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  */
app.get('/logout', function(req, res){
  
  req.logout();
  
  if(req.session.lastUrl) {
  	res.redirect(req.session.lastUrl);
  }
  else{
  	res.redirect('/');
  }
  
});

/**
  * 404'd
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
});

module.exports = app;