const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsyncErr');
const appError = require('./../utils/appError');

exports.getTourBooking = catchAsync(async (req, res, next) => {
  // Get tour which is to be booked
  const tour = await Tour.findById(req.params.tourId);

  //  create a payment session
});
