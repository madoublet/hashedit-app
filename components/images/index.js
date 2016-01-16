var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var mkdirp = require('mkdirp');
var multiparty = require('multiparty');

/**
  * Lists images
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {

    var files = fs.readdirSync('public/images');
    var arr = [];

    for(x=0; x<files.length; x++){
      arr.push('/images/' + files[x]);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(arr));

});

/**
  * Adds an image
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/add', function(req, res, next) {

  if(req.user){

    var form = new multiparty.Form();
    var size = 0;
    var filename = null;

    form.on('file', function(name, file){

        var target = 'public/images/' + file.originalFilename;
        var url = 'images/' + file.originalFilename;

        // rename file
        fs.renameSync(file.path, target, function(err) {

            if(err){
                res.sendStatus(401);
            }

        });

        // send JSON response
        var response = {
            image:url
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));

    });

    // parse form
    form.parse(req);
  }
  else{
    res.sendStatus(401);
  }

});

module.exports = router;
