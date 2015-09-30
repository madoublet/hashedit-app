var express = require('express');
var router = express.Router();

/**
  * Returns 200 if the user has been authorized, 403 if not
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/', function(req, res, next) {
    
  if(req.user){
    res.sendStatus(200);
  }
  else{
    res.sendStatus(401);
  }
    
  
});

module.exports = router;