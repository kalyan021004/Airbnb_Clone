
const express=require("express");
const router=express.Router({mergeParams:true});
const { validateListing, validateReview } = require("../Schema");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isReviewAuthor } = require("../middleware");




router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
        req.flash("success","New Review Created")

    res.redirect(`/listings/${id}`);
}));

router.delete('/:reviewId', isLoggedIn,
    isReviewAuthor,
    wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review deleted ")

    res.redirect(`/listings/${id}`);
}));



module.exports=router;