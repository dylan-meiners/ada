var map = L.map("map").setView([39.008, -104.889], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmp.org/copyright">OpenStreetMap</a>',
}).addTo(map);
