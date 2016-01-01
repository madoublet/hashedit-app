#!/usr/bin/env node

/**
 * Hashedit CLI
 * Usage:
 *      node hashedit -s http://mysite.com -e matt@matthewsmith.com -p mypassword
 */

 var program = require('commander');
 var fs = require('fs');
 var child_process = require('child_process');
 var bcrypt = require('bcrypt-nodejs');

 program
    .version('0.0.1')
    .option('-s, --setup [value]', 'Hashedit setup')
    .option('-u, --user [value]', 'A type of user')
    .option('-e, --email [value]', 'Email')
    .option('-p, --password [value]', 'Password')
    .parse(process.argv);

console.log('[hashedit] welcome to #edit!');

var path, stats, config, url, json, user, users, hash, output;

// run setup
if(program.setup){

    url = program.setup;

    // copy config.js
    path = './config.js';

    try {
        // query the entry
        stats = fs.lstatSync(path);

        // is it a file
        if (stats.isFile()) {
            console.log('[hashedit] config.js exists');
        }
        else{
            console.log('[hashedit] creating config.js');

            config = fs.readFileSync('./config.sample.js', 'utf8');
            config = config.replace('https://my-hashedit-site.io', url);

            // save config file
            fs.writeFile(path, config, function (err) {
                if (err) {
                  console.log('[hashedit] error >>> ' + error);
                }
            });
        }

    }
    catch (e) {
        console.log('[hashedit.error]');
        console.log(e);
    }

    // copy data/users.json
    path = './data/users.json';

    try {
        // query the entry
        stats = fs.lstatSync(path);

        // is it a file
        if (stats.isFile()) {
            console.log('[hashedit] data/users.json exists');
        }
        else{
            console.log('[hashedit] creating data/users.json');

            // copy users.json
            output = child_process.execSync('cp data/users.sample.json data/users.json');

            if(output){
                console.log('[hashedit] console output >>> ' + output);
            }

        }
    }
    catch (e) {
        console.log('[hashedit.error]');
        console.log(e);
    }

    // run npm install
    console.log('[hashedit] running npm install');

    // copy users.json
    output = child_process.execSync('npm install');

    if(output){
        console.log('[hashedit] console output >>> ' + output);
    }

}

// add users
if(program.email){

    if(program.password){

        // create a user
        json = fs.readFileSync('./data/users.json', 'utf8');

        // parse json
        users = JSON.parse(json);

        // create hashed password
        hash = bcrypt.hashSync(program.password);

        // create user
        user = {
        	"email": program.email,
        	"password": hash,
        	"provider": "local"
        }

        // push user
        users.push(user);

        // save file
        fs.writeFileSync('./data/users.json', JSON.stringify(users), 'utf8');

        // user added
        console.log('[hashedit] user added');

    }
    else{
        console.log('[hashedit] error >>> need email and password');
    }


}