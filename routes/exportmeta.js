var express = require('express');
var router = express.Router();

var mkdirp = require('mkdirp');
var fs = require("fs");
var file = __dirname + "/../database/panoinfo.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

/* GET users listing. */
router.get('/', function(req, res, next) {
	var panoinfoPath = __dirname + "/../public/panoinfo";
	mkdirp(panoinfoPath);
	db.all("SELECT info FROM panoinfo", function(err, rows) {
		for (var i = 0; i < rows.length; i++) {
			var data = JSON.parse(rows[i].info);
			console.log(data.location.pano)
			var filePath = panoinfoPath + '/' + data.location.pano;
			fs.writeFile(filePath, rows[i].info)
		};
	});
  res.send('');
});

module.exports = router;
