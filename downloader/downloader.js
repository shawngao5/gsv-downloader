var http = require('http');
var fs = require('fs');
var Agent = require('agentkeepalive');
var _url = require('url')

var fs = require("fs");
var file = __dirname + "/../database/panoinfo.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

var keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
});


var _panoidList = [];
var _zoom = 3;
var _connectionLimit = 3;
var _currentConnection = 0;
var _idListLimit = 10;

var panoDownloader = function () {
  this.urlList = [];

  this.get = function(url) {
    this.urlList.push(url);
  }

  this.run = function(callback) {
    if (this.urlList.length <= 0) return;
    var url = this.urlList.shift();
    var res = _url.parse(url);
    var options = {
      host: res.host,
      port: 80,
      path: res.path,
      method: 'GET',
      agent: keepaliveAgent
    };
    var dest = url.replace(/.*panoid\=/g,"").replace("&zoom=", "_").replace("&x=", "_").replace("&y=", "_");
    var dest = __dirname + "/../public/gsv/" + dest + ".jpeg";
    if (fs.existsSync(dest)) return;
    var file = fs.createWriteStream(dest);
    var that = this;
    var req = http.request(options, function (res) {
      res.pipe(file);
      file.on('finish', function() {
        file.close(function() {});
        setTimeout(function() {
          that.run()
        }, 0);
      });
    });

    req.on('error', function (e) {
      callback(e);
    });
    req.end();
  }
}

var HttpConnection = function () {

  'use strict';

  var self = this;
  self.panoid = "";
  self.urlList = [];
  self.fileList = [];
  self.count = 0;
  self.tileCount = 0;

  self.createDownloadList = function () {
    self.urlList = [];
    self.fileList = [];
    self.count = 0;
    self.tileCount = 0;
    var w = Math.pow(2, _zoom ),
      h = Math.pow(2, _zoom - 1),
      url,
      x, y;
    if (_zoom == 3) w-=1;
    if (_zoom == 4) { w -= 3; h-=1;}

    for( y = 0; y < h; y++) {
      for( x = 0; x < w; x++) {
        var url = 'http://maps.google.cn/cbk?output=tile&panoid=' + self.panoid + '&zoom=' + _zoom + '&x=' + x + '&y=' + y;
        var file = __dirname + "/../public/gsv/" + self.panoid + '_' + _zoom + '_' + x + '_' + y + ".jpeg";
        self.urlList.push(url);
        self.fileList.push(file);
        self.tileCount++;
      }
    }
  }

  self.downloadCB = function() {
    self.count++;
    if (self.count < self.tileCount) return;

    console.log("download finished! " + self.panoid)
    var stmt = db.prepare("update panoinfo set download = 1 where panoid = ?");
    stmt.run(self.panoid);
    stmt.finalize();
    setTimeout(self.run, 0);
  }

  self.download = function(url, filePath) {
    var res = _url.parse(url);
    var options = {
      host: res.host,
      port: 80,
      path: res.path,
      method: 'GET',
      agent: keepaliveAgent
    };
    var file = fs.createWriteStream(filePath);
    var req = http.request(options, function (ret) {
      ret.pipe(file);
      file.on('finish', function() {
        file.close(function() {});
        self.downloadCB();
      });
    });

    req.on('error', function (e) {
      console.log(e);
    });
    req.end();
  }

  self.run = function() {
    db.all("select * from panoinfo where download = 0 and take = 0 limit 1", function(err, rows) {
      if (rows.length > 0) {
        self.panoid = rows[0].panoid;
        var stmt = db.prepare("update panoinfo set take = 1 where panoid = ?");
        stmt.run(self.panoid);
        stmt.finalize();
        self.createDownloadList();
        for (var i = 0; i < self.urlList.length; i++) {
          self.download(self.urlList[i], self.fileList[i]);
        };
      } else {
        setTimeout(self.run, 0);
      }
    });
  }

}


var downloader = function () {

  'use strict';

  var self = this;

  this.addPanoId = function(panoid) {
    _panoidList.push(panoid);
  }

  this.downloadPano = function(panoid, dl) {
    var w = Math.pow(2, _zoom ),
      h = Math.pow(2, _zoom - 1),
      url,
      x, y;
    if (_zoom == 3) w-=1;
    if (_zoom == 4) { w -= 3; h-=1;}

    console.log("Downloading " + panoid);

    for( y = 0; y < h; y++) {
      for( x = 0; x < w; x++) {
        url = 'http://maps.google.cn/cbk?output=tile&panoid=' + panoid + '&zoom=' + _zoom + '&x=' + x + '&y=' + y;
          dl.get(url);
      }
    }

    dl.run(function(err) {});
  }

  this.start = function() {
    // console.log("start");

    var connection = new HttpConnection();
    connection.run();
    // db.all("select * from panoinfo where download = 0 limit 1", function(err, rows) {
    //   // console.log("rows.length: " + rows.length)
    //   if (rows.length > 0) {
    //     console.log("rows[0].panoid: " + rows[0].panoid);
    //     var dl = new panoDownloader();
    //     self.downloadPano(rows[0].panoid, dl);
    //     setTimeout(self.start, 0);

    //     var stmt = db.prepare("update panoinfo set download = 1 where panoid = ?");
    //     stmt.run(rows[0].panoid);
    //     stmt.finalize();
    //   } else {
    //     setTimeout(self.start, 1000);
    //   }
    // });







    // if (_currentConnection >= _connectionLimit || _panoidList.length <=0 ) {
    //   setTimeout(this.start, 1000);
    //   return;
    // }

    // var dl = new panoDownloader();

    // for (var i = 0; i < _idListLimit; i++) {
    //   var panoid = _panoidList.shift();
    //   if (typeof panoid == "undefined") break;
    //   downloadPano(panoid, dl);
    // };

    // dl.dest('/home/xgao/dev/VR/gsv-downloader/public/gsv/')

    // _currentConnection++;

    // dl.run(function(err, files) {
    //   // console.log(err)
    //    // console.log("Downloading " + files);
    //   _currentConnection--;
    // })

    
  }
}


module.exports = downloader;