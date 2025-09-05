// utils/geocodingClient.js
class MaptilerGeocoding {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.maptiler.com/geocoding";
  }

  forwardGeocode({ query, limit = 1 }) {
    this.query = query;
    this.limit = limit;
    return this; // ✅ allow chaining
  }

  async send() {
    const url = `${this.baseUrl}/${encodeURIComponent(this.query)}.json?key=${this.apiKey}&limit=${this.limit}`;
    const response = await fetch(url); // Node 18+ built-in fetch
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }
    const data = await response.json();
    return { body: data }; // ✅ same as Mapbox
  }
}

module.exports = MaptilerGeocoding;
