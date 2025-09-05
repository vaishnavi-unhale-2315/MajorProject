const { Query } = require("mongoose");
const Listing = require("../models/listing");
const MaptilerGeocoding = require("../utils/geocodingClient");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = new MaptilerGeocoding(mapToken);

module.exports.index = async(req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews", 
      populate: {
      path: "author",
      },
    })
    .populate("owner");
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    let geometry = null;

    // Attempt geocoding
    if (req.body.listing.location) {
      try {
        const response = await geocodingClient
          .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
          .send();

        if (response.body.features && response.body.features.length > 0) {
          const coords = response.body.features[0].geometry.coordinates; // [lng, lat]
          geometry = { type: "Point", coordinates: coords };
        } else {
          console.warn("No geocoding results found for:", req.body.listing.location);
        }
      } catch (geoErr) {
        console.error("Geocoding failed:", geoErr);
      }
    }

    // Create new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Assign geometry if available, else default to [0,0]
    newListing.geometry = geometry || { type: "Point", coordinates: [0, 0] };

    // Handle image upload
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).send("Error creating listing");
  }
};

module.exports.renderEditForm = async(req, res) =>{
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
  let {id} = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(
    id, 
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename};
    await updatedListing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${updatedListing._id}`);
}

module.exports.destroyListing = async(req, res) => {
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}