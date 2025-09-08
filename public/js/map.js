maptilersdk.config.apiKey = mapToken;

// Extract coordinates safely
let [lng, lat] = listing.geometry.coordinates;

// In case coords are stored in reverse ([lat, lng]), swap them
if (Math.abs(lng) <= 90 && Math.abs(lat) >= 90) {
  [lat, lng] = [lng, lat];
}

const map = new maptilersdk.Map({
  container: "map", // container id
  style: maptilersdk.MapStyle.STREETS,
  center: [lng, lat], // Always [lng, lat]
  zoom: 9 // starting zoom
});

const marker = new maptilersdk.Marker({ color: "red" })
  .setLngLat([lng, lat])
  .setPopup(
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.title}</h4>
       <p>Exact Location will be provided after booking</p>`
    )
  )
  .addTo(map);