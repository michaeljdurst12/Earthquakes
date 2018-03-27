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

d3.json(quakeLink, function (data) {
    var quakeData = data.features;

    console.log(quakeData);

    var timelineLayer = L.timeline(data, {
        getInterval: function (feature) {
            return {
                start: feature.properties.time,
                end: feature.properties.time + (feature.properties.mag * 1800000)
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