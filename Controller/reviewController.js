const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsyncErr');
const factoryFun = require('./controllerFactory');

// GET ALL REVIEWS
exports.getAllReview = catchAsync(async (req, res, next) => {
  let filterQuery = {};
  if (req.params.tourId) filterQuery = { tour: req.params.tourId };
  const reviews = await Review.find(filterQuery);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReviewbyID = factoryFun.getDocbyID(Review);

// ASSIGN TOUR AND USER
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// CREATE NEW REVIEW
exports.createNewReview = factoryFun.createDoc(Review);

// UPDATE REVIEW
exports.updateReview = factoryFun.updateDoc(Review);
// DELETE REVIEW
exports.deleteReview = factoryFun.deleteDoc(Review);
