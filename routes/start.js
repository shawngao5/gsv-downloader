var express = require('express');
var router = express.Router();
var Downloader = require('../downloader/downloader')
var downloader = new Downloader();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(downloader)
  downloader.start();
  res.send('');
});

module.exports = router;
