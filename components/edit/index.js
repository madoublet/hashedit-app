var express = require('express');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var router = express.Router();
var url  = require('url');


 /**
  * Setup authorization for the app
  * @param {Object} app
  */
exports.setup = function(app, config){

    /**
      * Logs the user out
      * @param {Object} req - http://expressjs.com/api.html#req
      * @param {Object} res - http://expressjs.com/api.html#res
      */
    app.get('/edit', function(req, res){

        // get parts
        var parts = url.parse(req.url, true);

        // get pathname
        var pathToFile = parts.query.url;

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
                    $ = cheerio.load(html);

                    // remove [hashedit-exclude] elements
                    $('[hashedit-exclude]').remove();

                    // set data attribute
                    var els = $('*');

                    for (x = 0; x < els.length; x += 1) {
                        $(els[x]).attr('data-ref', x);
                    }

                    // test for dev environment
                    var devAttr = $('body').attr('hashedit-dev');

                    // check dev environment
                    if (typeof devAttr !== typeof undefined && devAttr !== false) { // load dev stack

                        var stack = '<script src="/hashedit/bower_components/fetch/fetch.js"></script>' +
                                    '<script src="/hashedit/bower_components/dropzone/dist/min/dropzone.min.js"></script>' +
                                    '<link type="text/css" href="/hashedit/bower_components/dropzone/dist/min/dropzone.min.css" rel="stylesheet">' +
                                    '<script src="/hashedit/bower_components/Sortable/Sortable.js"></script>' +
                                    '<script src="/hashedit/js/hashedit.js"></script>' +
                                    '<script src="/hashedit/js/hashedit.app.js"></script>' +
                                    '<script src="/api/settings/menu"></script>' +
                                    '<script>hashedit.setup();</script>';

                        $('body').append(stack);

                    } else { // load prod stack

                        var stack = '<script src="/node_modules/hashedit/dist/hashedit-min.js"></script>' +
                                    '<script src="/api/settings/menu"></script>' +
                                    '<script>hashedit.setup();</script>';

                        $('body').append(stack);

                    }

                    $('body').attr('hashedit-url', parts.query.url);

                    // send html
                    res.send($.html());
                }

            });

        }
        else{
            res.sendStatus(401);
        }


    });

}