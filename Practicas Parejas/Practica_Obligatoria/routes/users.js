var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/errores', function(req, res, next) {
  res.send('respond with a EDU');
});

module.exports = router;
