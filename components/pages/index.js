var express = require('express');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var router = express.Router();
var mkdirp = require('mkdirp');
var url  = require('url');
var readdirp = require('readdirp');
var NodeCache = require('node-cache');

// init cache
cache = new NodeCache();

/**
  * Lists pages
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {

    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) {
          // do something with file entry here
        }
        , function (err, result) {

          // clean up list
          var list = [];

          for(x=0; x<result.files.length; x++){
            list.push('/' + result.files[x].path);
          }

          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(list));
        });

});

/**
  * Lists pages
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list/details', function(req, res, next) {

    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) {
          // do something with file entry here
        }
        , function (err, result) {

            // clean up list
            var list = cache.get('list-details');

            if(list == undefined){

                list = [];
                var domain = '';

                var config = req.app.get('config');

                if(config){
                    domain = config.app.url;
                }

                for(x=0; x<result.files.length; x++){

                    var pathToFile = 'public/' + result.files[x].path;
                    var title = '';
                    var desc = '';
                    var image = '';

                    var html = fs.readFileSync(pathToFile, 'utf8');

                    $ = cheerio.load(html);

                    title = $('title').html() || 'No title';
                    desc = $('meta[name=description]').attr('content') || '';

                    var images = $('img');

                    if(images.length > 0){
                        image = $(images[0]).attr('src') || '';
                    }

                    if(image != ''){

                        if(image.indexOf('://') == -1){

                            if(image.indexOf('../') == -1){

                                if(image.charAt(0) == '/'){
                                    image = domain + image;
                                }
                                else{
                                    image = domain + '/' + image;
                                }


                            }

                        }

                    }

                    // get modified and created date
                    stat = fs.statSync(pathToFile);

                    // page
                    var page = {
                        title: title,
                        description: desc,
                        image: image,
                        url: '/' + result.files[x].path,
                        fullUrl: domain + '/' + result.files[x].path,
                        editUrl: domain + '/edit?url=' + '/' + result.files[x].path,
                        lastModified: stat.mtime,
                        created: stat.ctime,
                    }

                    list.push(page);
                }

                // create a cache to make this run faster
                cache.set('list-details', list);

            }

            // push list
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(list));

        });

});

/**
  * Lists path
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/path/list', function(req, res, next) {

    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) {
          // do something with file entry here
        }
        , function (err, result) {

          // clean up list
          var list = [];

          for(x=0; x<result.files.length; x++){
            var str = path.dirname('/' + result.files[x].path);

            if(list.indexOf(str) == -1){
              list.push(str);
            }

          }

          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(list));
        });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(list));

});

/**
  * Adds a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/add', function(req, res, next) {

    if(req.user){

        var params = req.body;
        var url = params.url;
        var title = params.title;
        var description = params.description;


        if (url && url.charAt(0)==='/') {
            url = url.slice(1);
        }

        var file = 'public/' + url;
        var defaultFile = 'public/.default.html';

        // get directory from path
        var dir = path.dirname(file);

        // check if a default file exists in that directory, #ref: http://bit.ly/1IFovfs
        try {
            // query the entry
            stats = fs.lstatSync(dir + '/.default.html');

            // is it a file?
            if (stats.isFile()) {
                defaultFile = dir + '/.default.html';
            }
        }
        catch (e) {

            // log exception
            console.error(e);
        }

        // make directory if it does not exist
        mkdirp(dir, function (err) {
            if (err) {
              console.error(err)
            }
            else{

                // read file
                fs.readFile(defaultFile, function (err, html) {

                    if (err) {
                      throw err;
                    }
                    else{

                      $ = cheerio.load(html);

                      $('title').html(title);
                      $('meta[name=description]').attr('content', description);

                      // write file
                      fs.writeFile(file, $.html(), function (err) {
                        if (err) {
                          throw err;
                        }

                        console.log('[Hashedit] File created at: ' + file);

                        // clear cache
                        cache.del('list-details');

                      });

                    }
                });

            }

        });

        // send success
        res.sendStatus(200);
    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Edits a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/save', function(req, res, next) {

    // get parts
    var parts = url.parse(req.headers.referer);

    // get pathname
    var pathToFile = req.body.url;

    // handle index files (e.g. http://hashedit.io/contact)
    if(pathToFile.indexOf('.html') == -1){

        // get the last character of the string
        if(pathToFile.slice(-1) == '/'){
            pathToFile += 'index.html';
        }
        else{
            pathToFile += '/index.html';
        }

    }

    if(req.user && pathToFile){

        pathToFile = 'public' + pathToFile;

        if(req.body){

            // read file
            fs.readFile(pathToFile, function (err, html) {

                if (err) {
                    throw err;
                }
                else{

                    // load html
                    $ = cheerio.load(html);

                    // walk through changes
                    var changes = req.body.changes;

                    for(var x=0; x<changes.length; x++){

                        var selector = changes[x].selector;
                        var html = changes[x].html;

                        // set html to new html
                        $(selector).html(html);

                    }

                    // write changes
                    fs.writeFile(pathToFile, $.html(), function (err) {
                        if (err) {
                          throw err;
                        }

                        console.log('[Hashedit] Content Saved!');
                    });

                }

            });

        }
        else{
            res.sendStatus(400);
        }

        // send success
        res.sendStatus(200);
    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Removes a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/remove', function(req, res, next) {

    // get parts
    var parts = url.parse(req.headers.referer);

    var params = req.body;

    // set pathToFile
    var pathToFile = params.url;

    if(req.user && pathToFile){

        pathToFile = 'public' + pathToFile;

        // read file
        fs.unlink(pathToFile, function (err) {

            if (err) {
                throw err;
            }
            else{

                // clear cache
                cache.del('list-details');

                // log
                console.log('[Hashedit] Page removed at: ' + pathToFile);

                // send success
                res.sendStatus(200);
            }

        });

    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Apply page settings
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/settings', function(req, res, next) {

    // get parts
    var parts = url.parse(req.headers.referer);

    var params = req.body;
    var title = params.title;
    var description = params.description;

    // get pathname
    var pathToFile = parts.pathname;

    if(params.url){
        pathToFile = params.url;
    }

    if(req.user && pathToFile){

        pathToFile = 'public' + pathToFile;

        if(req.body){

            // read file
            fs.readFile(pathToFile, function (err, html) {

                if (err) {
                  throw err;
                }
                else{

                  // load html
                  $ = cheerio.load(html);

                  $('title').html(title);
                  $('meta[name=description]').attr('content', description);

                  // write changes
                  fs.writeFile(pathToFile, $.html(), function (err) {
                    if (err) {
                      throw err;
                    }

                    // clear cache
                    cache.del('list-details');

                    // log
                    console.log('[Hashedit] Settings Saved!');
                  });

                }

            });

        }
        else{
            res.sendStatus(400);
        }

        // send success
        res.sendStatus(200);
    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Retrieves a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/retrieve', function(req, res, next) {

    // get parts
    var parts = url.parse(req.headers.referer);

    // get pathname
    var pathToFile = parts.pathname;

    // handle index files (e.g. http://hashedit.io/contact)
    if(pathToFile.indexOf('.html') == -1){

        // get the last character of the string
        if(pathToFile.slice(-1) == '/'){
            pathToFile += 'index.html';
        }
        else{
            pathToFile += '/index.html';
        }

    }

    if(pathToFile){

        pathToFile = 'public' + pathToFile;

        // read file
        fs.readFile(pathToFile, function (err, html) {

            if (err) {
                throw err;
            }
            else{
                res.send(html);
            }

        });

    }
    else{
        res.sendStatus(401);
    }

});

module.exports = router;