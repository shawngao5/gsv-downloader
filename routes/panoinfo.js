var express = require('express');
var router = express.Router();
var Downloader = require('../downloader/downloader')
var downloader = new Downloader();

var fs = require("fs");
var file = __dirname + "/../database/panoinfo.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

/* GET users listing. */
router.get('/:panoid', function(req, res, next) {
  // console.log(req.params.panoid);
  try {
    db.all("SELECT info FROM panoinfo WHERE panoid = '" + req.params.panoid + "'", function(err, rows) {
      if (rows.length > 0) {
        // console.log(rows[0].info);
        res.send(rows[0].info);
      } else {
        res.send('{"id": "' + req.params.panoid + '"}');
      }
    });
  }
  catch (e) {
    console.log(e);
    res.send('{"id": "' + req.params.panoid + '"}');
  }
  
});

router.post('/', function(req, res, next) {
  // console.log(JSON.parse(req.body.text));
  // console.log(downloader.addPanoId)

  var data = JSON.parse(req.body.text);

  var stmt = db.prepare("INSERT OR IGNORE INTO panoinfo VALUES (?, ?, ?, ?)");

  stmt.run(data.location.lat, data.location.lng, data.location.pano, req.body.text);

  stmt.finalize();

  downloader.addPanoId(data.location.pano);

  res.send('post');

});

module.exports = router;
