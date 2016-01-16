var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var email = require('emailjs');

var router = express.Router();

/**
  * Lists contacts
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {

    var fields, dir, file, params, field;

    // contacts file
    dir = 'data/';
    file = 'forms.json';

    fields = [];

    console.log(req.user);

    if(req.user){

        // read the file
        fs.readFile(dir + file, 'utf8', function (err, data) {
          if(err){
            res.sendStatus(401);
          }
          else{
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(data);
          }

        });

    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Save form
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/save', function(req, res, next) {

    var json, obj, dir, file, params, field, forms;

    console.log('[hashedit-form] api/form/save');

    // get json
    json = req.body;

    // contacts file
    dir = 'data/';
    file = 'forms.json';

    // read the file
    fs.readFile(dir + file, 'utf8', function (err, data) {
      if(err){
        forms = [];
      }
      else{
        forms = JSON.parse(data);
      }

      // push form submission
      forms.push(json);

      // save form
      mkdirp(dir, function (err) {
        if (err) {
          console.error(err);
          res.sendStatus(401);
        }
        else{
            // write file
            fs.writeFile(dir+file, JSON.stringify(forms), function (err) {
                if (err) {
                  throw err;
                }

                // log
                console.log('[hashedit-form] form saved at: ' + dir+file);

                // send success
                res.sendStatus(200);
            });
        }

      });

      // email it (if config is setup)
      var config = req.app.get('config');

      if(config){

          if(config.smtp && config.email){

            // log
            console.log('[hashedit-form] sending email to: ' + config.email.to);

            // build html/text
            var html = '';
            var text = '';

            html += 'Form submitted: ' + json.form + '<br><br>';
            text += 'Form submitted: ' + json.form + "\r\n\r\n\r\n\r\n";

            // walk through params
            for(x = 0; x<json.params.length; x++){
                html += json.params[x].label + ": " + json.params[x].value + "</br>";
                text += json.params[x].label + ": " + json.params[x].value + "\r\n\r\n";
            }


            // connect to server
            var server  = email.server.connect(config.smtp);

            var message = {
               text:    text,
               from:    config.email.fromName + ' <' + config.email.from + '>',
               to:      config.email.toName + ' <' + config.email.to + '>',
               subject: json.subject,
               attachment:
               [
                  {data: html, alternative:true}
               ]
            };

            // send the message and get a callback with an error or details of the message that was sent
            server.send(message, function(err, message) { console.log(err || message); });
          }
      }


    });

});

/**
  * Save form
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/read', function(req, res, next) {

    var json, obj, dir, file, params, field, forms;

    console.log('[hashedit-form] api/form/read');

    // get params
    var params = req.body;
    var id = params.id;

    // contacts file
    dir = 'data/';
    file = 'forms.json';

    // read the file
    fs.readFile(dir + file, 'utf8', function (err, data) {
      if(err){
        forms = [];
      }
      else{
        forms = JSON.parse(data);
      }

      // set read
      for(x=0; x<forms.length; x++){
          if(forms[x].id == id){
              forms[x].read = true;
          }
      }

      // save form
      mkdirp(dir, function (err) {
        if (err) {
          console.error(err);
          res.sendStatus(401);
        }
        else{
            // write file
            fs.writeFile(dir+file, JSON.stringify(forms), function (err) {
                if (err) {
                  throw err;
                }

                // log
                console.log('[hashedit-form] read status update, form saved at: ' + dir+file);

                // send success
                res.sendStatus(200);
            });
        }

      });


    });

});

module.exports = router;
