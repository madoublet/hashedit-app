// default express
var express = require('express'),
	compression = require('compression'),
	path = require('path'),
	favicon = require('serve-favicon'),
	url  = require('url'),
	bodyParser = require('body-parser'),
	staticKit = require('static-kit'),
	config = require('./config');

// setup express
var app = express();

// setup body parser
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup static directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules/hashedit',  express.static(__dirname + '/node_modules/hashedit'));

// setup the auth
staticKit.setup(app, config);

// handle 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('[Hashedit] error. STATUS: ' + err.status + ' URL: ' + req.url);
  });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log('[Hashedit] error. STATUS: ' + err.status + ' URL: ' + req.url);
});

var server = app.listen(config.app.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('[Hashedit] started. URL: %s, PORT: %s', config.app.url, config.app.port);
});