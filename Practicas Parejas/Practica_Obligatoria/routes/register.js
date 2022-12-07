var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/registerView.html', function(req, res) {
  res.render('registerView');
});

module.exports = router;
