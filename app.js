// default express
var express = require('express'),
	compression = require('compression'),
	path = require('path'),
	favicon = require('serve-favicon'),
	url  = require('url'),
	bodyParser = require('body-parser'),
	config = require('./config'),
	edit = require('./components/edit'),
	auth = require('./components/auth'),
	pages = require('./components/pages'),
	users = require('./components/users'),
	forms = require('./components/forms'),
    images = require('./components/images'),
    settings = require('./components/settings');

// setup express
var app = express();

// setup body parser
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup static directory
app.use(express.static(path.join(__dirname, 'public')));

// setup admin
app.use('/admin/pages',  express.static(__dirname + '/components/pages/client'));
app.use('/admin/users',  express.static(__dirname + '/components/users/client'));
app.use('/admin/forms',  express.static(__dirname + '/components/forms/client'));

// setup site
app.use('/hashedit/forms',  express.static(__dirname + '/components/forms/site'));

// setup hashedit
app.use('/node_modules/hashedit',  express.static(__dirname + '/node_modules/hashedit'));

// set configuration
app.set('config', config);

// setup edit
edit.setup(app, config);

// setup auth
auth.setup(app, config);

// setup routes
app.use('/api/pages', pages);
app.use('/api/users', users);
app.use('/api/images', images);
app.use('/api/settings', settings);
app.use('/api/forms', forms);

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