var express = require('express');
var router = express.Router();

/**
  * Returns 200 if the user has been authorized, 403 if not
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/menu', function(req, res, next) {

    var config = req.app.get('config');

    if(config){

        if(config.drawer){

            var js = 'var hashedit = hashedit || {}; hashedit.app = hashedit.app || {}; hashedit.app.drawer = ' + JSON.stringify(config.drawer) + ';';

            res.setHeader('Content-Type', 'text/javascript');
            res.status(200).send(js);


        }

    }

    res.sendStatus(401);

});

module.exports = router;