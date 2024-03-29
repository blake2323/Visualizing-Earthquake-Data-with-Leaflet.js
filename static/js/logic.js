// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    
  // print GeoJson data to console for examination  
  console.log(data);

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Check that an integer value is given for each earthquake's magnitude
// If magnitude exists as an integer, then scale magnitude by a factor of 5
// Undefined magnitudes will be assigned a value of 0
function setMag(magnitude) {
    if (magnitude) {
        return magnitude*5;
    }
    else { 
        return 0;
    }
} 


// Color of marker based on magnitude
function chooseColor(Rating) {
    if (Rating>4) {
        return "red";
    } 
    else if (Rating>3) {
        return "orange";
    }
    else if (Rating>2) {
        return "yellow";
    }
    else if (Rating>1) {
        return "green";
    }
    else {
        return "blue";
    }    
  }



function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + "Location: " + feature.properties.place + "</h3>" 
    + "<h3>" + "Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: setMag(feature.properties.mag),
            fill: true,
            fillOpacity: 0.5,
            color: chooseColor(feature.properties.mag)
        }); 
        }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
  //Add legend with appropriate characteristics
  var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {



	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 1, 2, 3, 4],
		labels = [];

	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
};

legend.addTo(myMap);

}
function getColor(d) {
	return d > 4 ? 'red' :
	       d > 3  ? 'orange' :
	       d > 2  ? 'yellow' :
	       d > 1  ? 'green' :
	                  'blue';



}
