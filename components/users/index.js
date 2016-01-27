var express = require('express');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var router = express.Router();
var mkdirp = require('mkdirp');
var url  = require('url');
var readdirp = require('readdirp');
var bcrypt = require('bcrypt-nodejs');
var NodeCache = require('node-cache');

// init cache
cache = new NodeCache();

/**
  * Lists users
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {

    var fields, dir, file, params, field;

    // contacts file
    dir = 'data/';
    file = 'users.json';

    fields = [];

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
  * Adds a user
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/add', function(req, res, next) {

    var json, params, users, hash, user, id;

    // get json
    params = req.body;
    
    console.log('[hashedit-user] add');
    
    if(req.user){

        // create a user
        json = fs.readFileSync('./data/users.json', 'utf8');

        // parse json
        users = JSON.parse(json);
        
        // create a guid
        function guid () {
        
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        
        // create a guid for new user
        id = guid();
        
        if(params.provider == 'local') {
            
            // create hashed password
            hash = bcrypt.hashSync(params.password);

            // create user
            user = {
                "id": id,
            	"email": params.email,
            	"password": hash,
            	"provider": "local",
            	"date": new Date()
            }
        }
        else{
            // create user
            user = {
                "id": id,
            	"email": params.email,
            	"provider": params.provider,
            	"date": new Date()
            }

        }

        // push user
        users.push(user);

        // save file
        fs.writeFileSync('./data/users.json', JSON.stringify(users), 'utf8');

        // user added
        console.log('[hashedit-user] user added');

        // send success
        res.sendStatus(200);


    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Edits a user
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/edit', function(req, res, next) {

    var x, parts, params, json, users, hash;

    // get parts
    parts = url.parse(req.headers.referer);

    params = req.body;
    

    if(req.user && params.id){
    

        // create a user
        json = fs.readFileSync('./data/users.json', 'utf8');

        // parse json
        users = JSON.parse(json);
        
        // walk through users
        for (x = 0; x < users.length; x++) {
        
            console.log(users[x]);
            
            // remove user from array
            if(users[x].id == params.id) {
            
                console.log('match');
                
                users[x].email = params.email;
                
                console.log('match2');
                
                if(params.password != 'temppassword'){
                
                    console.log('change');
                    
                    // create hashed password
                    hash = bcrypt.hashSync(params.password);
                    
                    console.log('after bcrypt');
                    
                    // set hashed password
                    users[x].password = hash;
                }
                
                console.log('done');
                
                
            }
            
        } 
        
        console.log('pre-write');
        
        // save file
        fs.writeFileSync('./data/users.json', JSON.stringify(users), 'utf8');

        // user added
        console.log('[hashedit-user] user updated');

        // send success
        res.sendStatus(200);


    }
    else{
        res.sendStatus(401);
    }

});

/**
  * Removes a user
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/remove', function(req, res, next) {

    var x, parts, params, id;

    // get parts
    parts = url.parse(req.headers.referer);

    params = req.body;
    
    console.log('[hashedit-user] remove id=' + params.id);

    if(req.user && params.id){

        // create a user
        json = fs.readFileSync('./data/users.json', 'utf8');

        // parse json
        users = JSON.parse(json);
        
        // walk through users
        for (x = 0; x < users.length; x++) {
            
            // remove user from array
            if(users[x].id == params.id){
                users.splice(x, 1);
            }
            
        } 
        
        // save file
        fs.writeFileSync('./data/users.json', JSON.stringify(users), 'utf8');

        // user added
        console.log('[hashedit-user] user removed');

        // send success
        res.sendStatus(200);


    }
    else{
        res.sendStatus(401);
    }

});

module.exports = router;