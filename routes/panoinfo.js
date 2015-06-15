var express = require('express');
var router = express.Router();
var Downloader = require('../downloader/downloader')
var downloader = new Downloader();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req)
  res.send('get');
});

router.post('/', function(req, res, next) {
  console.log(req.body['location[pano]'])
  console.log(downloader.addPanoId)

  downloader.addPanoId(req.body['location[pano]']);

  res.send('post');

});

module.exports = router;
