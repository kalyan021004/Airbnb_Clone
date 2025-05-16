const express = require("express");
const router = express.Router();
const { validateListing } = require("../Schema");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner } = require("../middleware");

// Middleware to check listing ownership (optional, recommended)


// Show all listings (public)
router.get(
    "/listings",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);

// Form to create a new listing (protected)
router.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// Create new listing (protected)
router.post(
    "/listings",
    isLoggedIn,
    
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id; // assign owner
        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    })
);

// Show a single listing (public)
router.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id).populate({path:"reviews",
            populate:{
                path:"author"
            }
        }).populate("owner");
        if (!listing) {
            req.flash("error", "Listing Does Not Exist");
            return res.redirect("/listings");
        }
        res.render("listings/show", { listing });
    })
);

// Edit form (protected + owner only)
router.get(
    "/listings/:id/edit",
    isLoggedIn,
    isOwner,
    
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing Does Not Exist");
            return res.redirect("/listings");
        }
        res.render("listings/edit", { listing });
    })
);

// Update listing (protected + owner only)
router.put(
    "/listings/:id",
    isLoggedIn,
    isOwner,
    
    
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing= await Listing.findById(id);
        if(!listing.owner.equals(res.locals.currentUser._id)){
            req.flash("error","You Don't have Permisssion To edit");
            return res.redirect(`/listings/${id}`);
        }
        const updatedData = req.body.listing;
        await Listing.findByIdAndUpdate(id, updatedData);
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    })
);

// Delete listing (protected + owner only)
router.delete(
    "/listings/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        await Listing.findByIdAndDelete(req.params.id);
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    })
);

module.exports = router;
