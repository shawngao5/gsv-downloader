var http = require('http');
var fs = require('fs');
var Agent = require('agentkeepalive');
var _url = require('url')

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

  this.dest = function(path) {
    this.destPath = path;
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

var downloader = function () {

  'use strict';

  this.addPanoId = function(panoid) {
    _panoidList.push(panoid);
  }

  var downloadPano = function(panoid, dl) {
    var w = Math.pow(2, _zoom ),
      h = Math.pow(2, _zoom - 1),
      self = this,
      url,
      x, y;
    if (_zoom == 3) w-=1;
    if (_zoom == 4) { w -= 3; h-=1;}

    for( y = 0; y < h; y++) {
      for( x = 0; x < w; x++) {
        url = 'http://maps.google.cn/cbk?output=tile&panoid=' + panoid + '&zoom=' + _zoom + '&x=' + x + '&y=' + y;
        dl.get(url);
      }
    }
  }

  this.start = function() {
    if (_currentConnection >= _connectionLimit || _panoidList.length <=0 ) {
      setTimeout(this.start, 1000);
      return;
    }

    var dl = new panoDownloader();

    for (var i = 0; i < _idListLimit; i++) {
      var panoid = _panoidList.shift();
      if (typeof panoid == "undefined") break;
      downloadPano(panoid, dl);
    };

    dl.dest('/home/xgao/dev/VR/gsv-downloader/public/gsv/')

    _currentConnection++;

    dl.run(function(err, files) {
      console.log(err)
      console.log(files)
      _currentConnection--;
    })

    setTimeout(this.start, 0);
  }
}

module.exports = downloader;