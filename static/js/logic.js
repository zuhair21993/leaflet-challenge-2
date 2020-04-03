var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(url, response => {
    //console.log(response.features)
    createFeatures(response.features)
})
function createFeatures(earthquakeData) {  
      // Adding tile layer
      function markerColor(magnitude) {
        if (magnitude < 1) {
          return "#ccff33"
        }
        else if (magnitude < 2) {
          return "#ffff33"
        }
        else if (magnitude < 3) {
          return "#ffcc33"
        }
        else if (magnitude < 4) {
          return "#ff9933"
        }
        else if (magnitude < 5) {
          return "#ff6633"
        }
        else {
          return "#ff3333"
        }
      }   
      function markerRadius(magnitude) {
          return magnitude * 3
      } 
    // (reference)  https://leafletjs.com/examples/geojson/
        function onEachFeature(feature, layer) {
            // does this feature have a property named popupContent?
            if (feature.properties && feature.properties.place && feature.properties.time) {
                layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
            }
        }
      var earthquakes = []
      var faultlines = []
      
      earthquakes.push(L.geoJson(earthquakeData, {
          pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, earthquakeData);
          },
          style: function(feature) {
              return {
                  radius: markerRadius(feature.properties.mag),
                  color: "black",
                  fillColor: markerColor(feature.properties.mag),
                  fillOpacity: 0.8,
                  weight: 1.5
              }
          },
          onEachFeature: onEachFeature
      }))
      

      var earthquakeLayer = L.layerGroup(earthquakes)
      var faultLineLayer = new L.LayerGroup(); 
      
      var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
      });
      var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
      });
      var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      });
      
      var baseMaps = {
        "Outdoors": outdoorsMap,
        "Satellite": satelliteMap,
        "GrayScale": grayscale
      }
      var overlayMaps = {
        "EarthQuake": earthquakeLayer,
        "FaultLines": faultLineLayer
      }
      
      var map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [outdoorsMap, earthquakeLayer, faultLineLayer]
      });
      
      L.control.layers(baseMaps, overlayMaps, {
        collapsed:false
      }).addTo(map)
      
      var faultLineUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
      d3.json(faultLineUrl, data => {
        // console.log(data)
        L.geoJson(data, {
          style: function() {
            return {color: "orange",
                    fillOpacity: 0.3,
          }}
        }).addTo(faultLineLayer)
      })
// https://leafletjs.com/examples/choropleth/
    function getColor(d) {
      return d > 5 ? '#ff3333' :
             d > 4  ? '#ff6633' :
             d > 3  ? '#ff9933' :
             d > 2  ? '#ffcc33' :
             d > 1   ? '#ffff33' :
                        'ccff33';
  }
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {

      var div = L.DomUtil.create('div', 'info legend'),
          bins = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < bins.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(bins[i] + 1) + '"></i> ' +
              bins[i] + (bins[i + 1] ? '&ndash;' + bins[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(map);  
}
 