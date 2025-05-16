const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
   
    rating: Number,
    comment: String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model('Review', reviewSchema);
