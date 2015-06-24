var express = require('express');
var router = express.Router();

var fs = require("fs");
var file = __dirname + "/../database/panoinfo.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

/* GET users listing. */
router.get('/', function(req, res, next) {
  var stmt = db.prepare("update panoinfo set take = 0 where download = 0 and take = 1");
  stmt.run();
  stmt.finalize();
  res.send('');
});

module.exports = router;
