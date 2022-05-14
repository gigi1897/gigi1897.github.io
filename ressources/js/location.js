if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(showPosition, showError);
else
    alert("Geolocalisation not disponible");

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var mymap = L.map('mapid').setView([lat, lon], 13);

    var greenIcon = L.icon({
    iconUrl: 'ressources/images/bombMapIco.png',
    iconSize: [35, 35]
});




    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

    L.marker([lat, lon], {icon: greenIcon}).addTo(mymap)
        .bindPopup("<b>You play the game here!</b>").openPopup();
}

function showError(error) {}
