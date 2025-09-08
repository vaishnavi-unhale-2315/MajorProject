maptilersdk.config.apiKey = mapToken;

// ✅ Helper function to normalize coordinates
function normalizeCoordinates(coords) {
  if (!Array.isArray(coords) || coords.length < 2) {
    console.error("Invalid coordinates:", coords);
    return [0, 0]; // fallback
  }

  let [a, b] = coords;

  // Case 1: already [lng, lat]
  if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
    return [a, b];
  }

  // Case 2: stored as [lat, lng] → swap
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    console.warn("Swapping lat/lng because they were reversed:", coords);
    return [b, a];
  }

  console.warn("Coordinates out of range, defaulting:", coords);
  return [0, 0];
}

// ✅ Always get clean coords
const [lng, lat] = normalizeCoordinates(listing.geometry.coordinates);

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,
  center: [lng, lat], 
  zoom: 2 // start zoomed out
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

// ✅ Auto-center & zoom to marker
map.on("load", () => {
  map.flyTo({
    center: [lng, lat],
    zoom: 12, // zoom closer to marker
    speed: 1.2 // smooth animation
  });
});