require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing'); // Make sure this path matches your project
const MaptilerGeocoding = require('./utils/geocodingClient'); // Make sure this path matches your project

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = new MaptilerGeocoding(mapToken);

// Connect to MongoDB
mongoose.connect(process.env.ATLASDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

async function updateCoordinates() {
    try {
        // Find all listings with coordinates [0, 0]
        const listings = await Listing.find({ "geometry.coordinates": [0, 0] });
        console.log(`Found ${listings.length} listings to update`);

        for (let listing of listings) {
            const location = listing.location;
            // Call Maptiler Geocoding API
            const geoData = await geocodingClient.forwardGeocode({ query: location, limit: 1 }).send();

            if (geoData.body.features && geoData.body.features.length > 0) {
                const coords = geoData.body.features[0].geometry.coordinates;
                listing.geometry.coordinates = coords;
                await listing.save();
                console.log(`Updated: ${listing.title} → [${coords}]`);
            } else {
                console.log(`Geocoding failed for: ${listing.title}`);
            }
        }

        console.log('All listings updated!');
        mongoose.connection.close();
    } catch (err) {
        console.log('Error:', err);
        mongoose.connection.close();
    }
}

updateCoordinates();