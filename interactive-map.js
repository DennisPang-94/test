//Test
function ZoomControl(controlDiv, map) {
  // Creating divs & styles for custom zoom control
  controlDiv.style.padding = '10px';
  // Set CSS for the control wrapper
  var controlWrapper = document.createElement('div');
  controlWrapper.style.backgroundColor = 'transparent';
  controlWrapper.style.borderStyle = 'solid';
  controlWrapper.style.borderWidth = '0';
  controlWrapper.style.cursor = 'pointer';
  controlWrapper.style.textAlign = 'center';
  controlWrapper.style.width = '34px';
  controlWrapper.style.height = '75px';
  controlDiv.appendChild(controlWrapper);

  // Set CSS for the zoomIn
  var zoomInButton = document.createElement('div');
  zoomInButton.style.width = '34px';
  zoomInButton.style.height = '39px';
  zoomInButton.style.backgroundImage = 'url("/themes/custom/dnb/img/icon/controlzoomin.svg")';
  controlWrapper.appendChild(zoomInButton);

  // Set CSS for the zoomOut
  var zoomOutButton = document.createElement('div');
  zoomOutButton.style.width = '34px';
  zoomOutButton.style.height = '36px';
  zoomOutButton.style.backgroundImage = 'url("/themes/custom/dnb/img/icon/controlzoomout.svg")';
  controlWrapper.appendChild(zoomOutButton);

  google.maps.event.addDomListener(zoomInButton, 'click', function() {
    map.setZoom(map.getZoom() + 1);
  });

  google.maps.event.addDomListener(zoomOutButton, 'click', function() {
    map.setZoom(map.getZoom() - 1);
  });

}

var map;
var markers = [];
var layers;
var inProgressLayers;
var circles = [];
var kmzLayers = [];
const googleMpasLatLng = new google.maps.LatLng(2.93527, 101.69112);
const newIconPins = {
  url: "/themes/custom/dnb/img/icon/pin-google-map.svg", // url
  scaledSize: new google.maps.Size(30, 30), // scaled size
  origin: new google.maps.Point(0, 0), // origin
  anchor: new google.maps.Point(15, 15) // anchor //modifed the staging for preview only
};
const orrangeIconPins = {
  url: "/themes/custom/dnb/img/icon/pin-google-map-orange.svg", // url
  scaledSize: new google.maps.Size(30, 30), // scaled size
  origin: new google.maps.Point(0, 0), // origin
  anchor: new google.maps.Point(15, 15) // anchor //modifed the staging for preview only
};
function init() {
  map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 12,
    center: googleMpasLatLng,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  layers = [];
  drupalSettings.sites_on_air_files.forEach(function callback(value, index) {
    layers.push(createDataLayer(value,"add"));
  });
  blockSection("unblock");
  var myMarker = new google.maps.Marker({
    position: googleMpasLatLng,
    draggable: true,
    icon: newIconPins,
  });
  map.setCenter(myMarker.position);
  myMarker.setMap(map);

  var zoomControlDiv = document.createElement('div');
  var zoomControl = new ZoomControl(zoomControlDiv, map);

  zoomControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

  var searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'));

  google.maps.event.addListener(searchBox, 'places_changed', function () {
    searchBox.set('map', null);
    var places = searchBox.getPlaces();
    var bounds = new google.maps.LatLngBounds();
    var i, place;
    for (i = 0; place = places[i]; i++) {
      (function (place) {
        var marker = new google.maps.Marker({
          position: place.geometry.location,
          icon: newIconPins
        });
        myMarker.setMap(null);
        marker.bindTo('map', searchBox, 'map');
        google.maps.event.addListener(marker, 'map_changed', function () {
          if (!this.getMap()) {
            this.unbindAll();
          }
        });
        bounds.extend(place.geometry.location);


      }(place));

    }
    map.fitBounds(bounds);
    searchBox.set('map', map);
    map.setZoom(Math.min(map.getZoom(), 12));

  });

}
function loadMapLayer(type){
  var check = document.getElementById("live5g");
  var check1 = document.getElementById("inprogress5g");
  if(type == 'live'){
    if (check.checked) {
      layers = [];
      drupalSettings.sites_on_air_files.forEach(function callback(value, index) {
        layers.push(createDataLayer(value,"add"));
      });
      blockSection("unblock");
    } else {
      createDataLayer(null,"delete");
    }
  }else if(type == 'progress'){
    if (check1.checked) {
      creaSitesInProgressteDataLayer(drupalSettings.sites_in_progress,"add");
    } else {
      creaSitesInProgressteDataLayer(null,'delete');
    }
  }



}
function bindInfoWindow(marker, map, infowindow, strDescription) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(strDescription);
    infowindow.open(map, marker);
  });
}
function createDataLayerOld(url,type) {
  blockSection("block");
  //console.log("url=="+url);
  var Layer = new google.maps.Data();
  //console.log("import start");
  if(type == 'delete'){
    //console.log(layers);
    layers.forEach(function callback(value, index) {
      layers[index].setMap(layers[index].getMap() == null ? map : null);
    });
    layers = [];
    /*drupalSettings.sites_on_air_files.forEach(function callback(value, index) {
      //loadGeoJsonLayer(value);
      //layers.push(createDataLayer(value,"delete"));
      layers[index - 1].setMap(layers[index - 1].getMap() == null ? map : null);
    });*/
    blockSection("unblock");
    return false;
  }
  $.getJSON(url, function(json) {
    //console.log("json");
    //console.log(json);
    Layer.addGeoJson(json);
    Layer.setStyle(function(feature) {
      var color = "#139604";
      return {
        fillColor: color,
        fillOpacity : 0.4980392156862745,
        strokeColor: color,
        strokeWeight: 0.4980392156862745
      }
    });
    /*Layer.addListener('mouseover', function(event) {
      var feat = event.feature;
      var myHTMLss = "<b>Name: </b>" + feat.getProperty('NAME');
      infowindow.setContent(myHTMLss);
      infowindow.setPosition(event.latLng);
      infowindow.open(map);
    });*/

    Layer.setMap(map);

    return Layer;
  });
  //console.log("import end");
  return Layer;
}
function createDataLayer(url,type){
  if(type == 'add'){
    var Layer = new google.maps.KmlLayer("https://www.digital-nasional.com.my"+url, {
      suppressInfoWindows: true,
      preserveViewport: true,
      map: map
    });
    Layer.setMap(map);
    return Layer;
  }else if(type == 'delete'){
    layers.forEach(function callback(value, index) {
      value.setMap(null);
    });
  }
 }
function creaSitesInProgressteDataLayer(url,type) {
  //blockSection("block");
  //console.log("url=="+url);
  var Layer = new google.maps.Data();
  //console.log("import start");
  if(type == 'delete'){
    if(drupalSettings.sites_in_progress_mode == 'markers'){
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
      markers = [];
    }else if(drupalSettings.sites_in_progress_mode == 'radius'){
      for(var i in circles) {
        circles[i].setMap(null);
      }
      circles = [];
    }
    //blockSection("unblock");
    return false;
  }else{
    $.getJSON(url, function(json) {
      //console.log("json");
      //console.log(json);
      $.each(json, function(key, data) {
        if(drupalSettings.sites_in_progress_mode == 'markers'){
          var latLng = new google.maps.LatLng(data.Latitude, data.Longitude);
          var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: orrangeIconPins,
            //title: data.Site_Name
          });
          markers.push(marker);
        }else if(drupalSettings.sites_in_progress_mode == 'radius'){
          var circle = new google.maps.Circle({
              strokeColor: '#F98936',
              strokeOpacity: 0.35,
              strokeWeight: 0.35,
              fillColor: '#F98936',
              fillOpacity: 0.35,
              map: map,
              center: new google.maps.LatLng(data.Latitude,
                data.Longitude),
              radius: 1000
          });
          circles.push(circle);
        }
        //var details = data.Site_Name + ", " + data.Site_Owner + ".";
        //bindInfoWindow(marker, map, infowindow, details);
      });
    });
    //blockSection("unblock");
  }
  //console.log("import end");
  return Layer;
}
function blockSection(type){
  if(type == "block"){

        $('#map').block({
            message: 'Please wait...',
            css: {
              border: 'none',
              padding: '10px',
              fontSize: '18px',
              backgroundColor: '#000',
              '-webkit-border-radius': '10px',
              '-moz-border-radius': '10px',
              opacity: .5,
              color: '#fff'
          }
        });

  }else if(type == 'unblock'){
    setTimeout(unblockSection, 5000);
  }
}
function unblockSection(){
  $('#map').unblock();
}

google.maps.event.addDomListener(window, 'load', init);
let elmnt = document.querySelector('.containerfaqshowend');
let elmntWidth = elmnt.clientWidth * 2;
//console.log(elmntWidth);
elmnt.scrollLeft = elmntWidth;

