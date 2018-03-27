//  satelite tile layer
var satelliteMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoibWR1cnN0MTIiLCJhIjoiY2pjc2FrOGFtMGI1MTJ3cXFvdXhzaHBkciJ9.5t4SPDU14v4XuvOilZLo5w'
});

//  light Layer
var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/racquesta/cjbqrgrdv7c8i2sp4n2am3pfk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWR1cnN0MTIiLCJhIjoiY2pjc2FrOGFtMGI1MTJ3cXFvdXhzaHBkciJ9.5t4SPDU14v4XuvOilZLo5w',
    { maxZoom: 18 });

// outdoors layer
var outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/racquesta/cjbqrrjqy83j52snp27di7koj/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWR1cnN0MTIiLCJhIjoiY2pjc2FrOGFtMGI1MTJ3cXFvdXhzaHBkciJ9.5t4SPDU14v4XuvOilZLo5w')


// quake data link
var quakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// fault lines data link
var faultLinesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

//  get request for quake data
d3.json(quakeLink, function (data) {
    var quakeFeatures = data.features

    console.log(quakeFeatures)

    // save quake layer made from geojson, 
    var quakes = L.geoJSON(quakeFeatures, {
        pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
                {
                    radius: getRadius(feature.properties.mag),
                    fillColor: getColor(feature.properties.mag),
                    fillOpacity: .7,
                    stroke: true,
                    color: "black",
                    weight: .5

                })
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.place + "<br> Magnitude: " + feature.properties.mag)
        }
    });



    d3.json(faultLinesLink, function (data) {

        var faultFeatures = data.features

        var styling = {
            "fillOpacity": 0
        }

        console.log(faultFeatures)
        var faults = L.geoJSON(faultFeatures, {
            style: function (feature) {
                return styling
            }
        })


        createMap(quakes, faults)
    })


});

// console.log(quakesLayer)
function getColor(d) {
    return d > 5 ? '#E31A1C' :
        d > 4 ? '#FC4E2A' :
            d > 3 ? '#FD8D3C' :
                d > 2 ? '#FEB24C' :
                    d > 1 ? '#FED976' :
                        '#FFEDA0';
}

function getRadius(value) {
    return value * 50000
}

console.log("made it here")
// var quakeMarkers = L.layerGroup(quakeMarkers);

function createMap(quakeLayer, faultLayer) {
    var baseMaps = {
        "Outdoor Map": outdoorsMap,
        "Grayscale Map": lightMap,
        "Satelite Map": satelliteMap
    };

    var overlayMaps = {
        "Earthquakes": quakeLayer,
        "Fault Lines": faultLayer

    };
    var mymap = L.map('mapid', {
        center: [42.877742, -97.380979],
        zoom: 2.5,
        minZoom: 2.5,
        layers: [lightMap, faultLayer, quakeLayer],
        maxBounds: L.latLngBounds([90, -180], [-90, 180]),
        maxBoundsViscosity: 1,
        scrollWheelZoom: false

    });

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (mymap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += '<p><u>Magnitude</u></p>'

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(mymap);
}


// legend code

// createMap(quakesLayer)
