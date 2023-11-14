// import * as maptilersdk from '@maptiler/sdk';
// /* eslint disable */
// const maptilersdk = require('@maptiler/sdk');
const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.location);
  console.log(locations);

  maptilersdk.config.apiKey = 'Vjp2mA38P9kXjS7WVQTc';
  const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.BRIGHT.PASTEL, //'basic-v2',
    center: [20.296865, 78.788287], // starting position [lng, lat]
    zoom: 1, // starting zoom
    scrollZoom: false,
  });

  // create bounds for latitude and longitude coming to map...
  const bounds = new maptilersdk.LngLatBounds();

  // ADDING MARKER AND POPUPs
  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // add marker
    new maptilersdk.Marker({
      element: el,
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // add popups
    new maptilersdk.Popup({ offset: 10 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);

    // Extend Bound
    bounds.extend(loc.coordinates);
  });

  // fit our loctions to strech over coordinates of map
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      right: 100,
      bottom: 200,
      left: 100,
    },
  });
}
