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

// Globals
// ----------------------------------------------
var WIDTH, HEIGHT;
var currHeading = 0;
var centerHeading = 0;
var navList = [];


var currentLocation = null;

function initialize() {
  currentLocation = new google.maps.LatLng( DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng );

  var mapOptions = {
    zoom: 14,
    center: currentLocation,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    streetViewControl: false
  };
  var gmap = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var marker = new google.maps.Marker({ position: currentLocation, map: gmap });
  marker.setMap( gmap );

  google.maps.event.addListener(gmap, 'click', function(event) {
    currentLocation = event.latLng;
    $('#maplocation').val(currentLocation.toString())
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

  $('#maplocation').val(currentLocation.toString())

}

function startDownload() {
  
}

google.maps.event.addDomListener(window, 'load', initialize);