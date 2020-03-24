var timeMap = L.map('timeMap', {
    center: [42.877742, -97.380979],
    zoom: 2.5,
    minZoom: 2.5,
    maxBounds: L.latLngBounds([90, -180], [-90, 180]),
    maxBoundsViscosity: 1,
    scrollWheelZoom: false

});

var satelliteMap1 = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoicmFjcXVlc3RhIiwiYSI6ImNqYWs5emMwYjJpM2EyenBsaWRjZ21ud2gifQ.af0ky4cpslCbwe--lCrjZA'
}).addTo(timeMap);

var quakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var faultLinesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

d3.json(quakeLink, function (data) {
    var quakeData = data.features;

    console.log(quakeData);
    // Determines the color of the marker based on the magnitude of the earthquake.
    function getColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return "#ea2c2c";
            case magnitude > 4:
                return "#ea822c";
            case magnitude > 3:
                return "#ee9c00";
            case magnitude > 2:
                return "#eecc00";
            case magnitude > 1:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
    function getRadius(value) {
        return value * 50000
    }
    

    var timelineLayer = L.timeline(data, {
        getInterval: function (feature) {
            return {
                start: feature.properties.time,
                end: feature.properties.time + (feature.properties.mag * 18000000)
            };
        },
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

    })

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
        }).addTo(timeMap)

        var timelineControl = L.timelineSliderControl({
            formatOutput: function (date) {
                return new Date(date).toString();
            },
            duration: 60000,
            showTicks: false
        });

        timelineControl.addTo(timeMap).addTimelines(timelineLayer);

        timelineLayer.addTo(timeMap);

    })


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

legend.addTo(timeMap);