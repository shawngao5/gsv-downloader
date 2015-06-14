var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req)
  res.send('get');
});

router.post('/', function(req, res, next) {
  console.log(req.body)
  res.send('post');
});

module.exports = router;
