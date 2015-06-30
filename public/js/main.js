// Parameters
// ----------------------------------------------
var QUALITY = 3;
var DEFAULT_LOCATION = { lat:44.301945982379095,  lng:9.211585521697998 };
var USE_TRACKER = false;
var GAMEPAD_SPEED = 0.04;
var DEADZONE = 0.2;
var SHOW_SETTINGS = true;
var NAV_DELTA = 45;
var FAR = 1000;
var USE_DEPTH = true;
var WORLD_FACTOR = 1.0;
var MAX_STEPS = 10;

// Globals
// ----------------------------------------------
var WIDTH, HEIGHT;
var currHeading = 0;
var centerHeading = 0;
var navList = [];
var stepCount = 0;

var downloadedPanoIdList = [];
var panoidWaitingList = [];
var gmap = null;
var marker = null;



var currentLocation = null;

var collectTimer = null;

function initPano() {
  panoLoader = new GSVPANO.PanoLoader();
  panoDepthLoader = new GSVPANO.PanoDepthLoader();
  panoLoader.setZoom(QUALITY);

  // panoLoader.onProgress = function( progress ) {

  // };
  // panoLoader.onPanoramaData = function( result ) {

  // };

  // panoLoader.onNoPanoramaData = function( status ) {
  //   //alert('no data!');
  // };

  // panoLoader.onPanoramaLoad = function() {

  // };

  // panoDepthLoader.onDepthLoad = function() {

  // };
}

function initGoogleMap() {

  currentLocation = new google.maps.LatLng( DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng );

  var mapOptions = {
    zoom: 14,
    center: currentLocation,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    streetViewControl: false
  };
  gmap = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  marker = new google.maps.Marker({ position: currentLocation, map: gmap });
  marker.setMap( gmap );

  google.maps.event.addListener(gmap, 'click', function(event) {
    currentLocation = event.latLng;
    $('#maplocation').val(currentLocation.A + ',' +currentLocation.F)
    marker.setMap( null );
    marker = new google.maps.Marker({ position: event.latLng, map: gmap });
    marker.setMap( gmap );
  });

  google.maps.event.addListener(gmap, 'center_changed', function(event) {
  });
  google.maps.event.addListener(gmap, 'zoom_changed', function(event) {
  });
  google.maps.event.addListener(gmap, 'maptypeid_changed', function(event) {
  });

  svCoverage= new google.maps.StreetViewCoverageLayer();
  svCoverage.setMap(gmap);

  geocoder = new google.maps.Geocoder();

  $('#maplocation').change(function() {
      geocoder.geocode( { 'address': $('#maplocation').val()}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        gmap.setCenter(results[0].geometry.location);
      }
    });
  }).on('keydown', function (e) {
    e.stopPropagation();
  });

  $('#maplocation').val(currentLocation.A + ',' + currentLocation.F)

  $("#steps").val(""+MAX_STEPS)
}

function downloadPanoInfo(result, status) {
  // console.log(JSON.stringify(result));
  // console.log(result);
  // console.log(status);
  var panoinfo = {
    links: result.links,
    tiles: result.tiles,
    location: {
      description: result.location.description,
      lat: result.location.latLng.A,
      lng: result.location.latLng.F,
      pano: result.location.pano
    }
  }
  // console.log(JSON.stringify(panoinfo));
  // $.post("http://127.0.0.1:3000/panoinfo", "fsdfsdfsd");
  $.post("panoinfo", {'text': JSON.stringify(panoinfo)});

  stepCount++;

  for (var i = 0; i < result.links.length; i++) {
    $.get("panoinfo/" + result.links[i].pano, function(ret) {
      // console.log(ret);
      var data = JSON.parse(ret);
      if (data.id) {
        // console.log("download " + data.id)
        panoidWaitingList.push(data.id);
        console.log(panoidWaitingList)
        if (!collectTimer) {
          collectTimer = setTimeout(timeOutRoutine, 0);
        };
      } else {
        // console.log(data.location.pano + "  already download");
      }
    })
    
  };
}

function timeOutRoutine() {
  if (stepCount >= MAX_STEPS) {
    console.log("aaaaaaaaaaaaaaaaaaaaaa")
    collectTimer = null;
    return;
  }
  var panoid = panoidWaitingList.shift();
  if (panoid) {
    panoLoader.loadWithoutImage(panoid, downloadPanoInfo);
  } else {
    // console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
    // collectTimer = null;
    // return;
  }

  setTimeout(timeOutRoutine, 0);
}

function locat() {
  var latLngStr = $("#maplocation").val();
  var latLngArray = latLngStr.split(',')
  currentLocation = new google.maps.LatLng(parseFloat(latLngArray[0]), parseFloat(latLngArray[1]) );
  marker.setMap( null );
  marker = new google.maps.Marker({ position: currentLocation, map: gmap });
  marker.setMap( gmap );
}

function startCollect() {
  var downloadedPanoIdList = [];
  var panoidWaitingList = [];
  stepCount = 0;
  MAX_STEPS = parseInt($("#steps").val());
  console.log("MAX_STEPS: " + MAX_STEPS)
  
  panoLoader.loadWithoutImage( currentLocation, downloadPanoInfo);
  
}

function startDownload() {
  $.get("/start")
}

function getPanoId() {
  panoLoader.loadWithoutImage( currentLocation, function(result, status) {
    $("#panoid").val(result.location.pano);
  });
}

function cleanDownloadStatus() {
  $.get("/clean");
}

function initialize() {
  initGoogleMap();
  initPano();
}

google.maps.event.addDomListener(window, 'load', initialize);