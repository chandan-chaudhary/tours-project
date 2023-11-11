const Tour = require('../models/tourModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyncErr');

// // RENDER OVERVIEW
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  if (!tours) {
    next(new appError('Cant Find doc'));
  }
  res.status(200).render('overview', {
    tours,
  });
});

// // RENDER TOUR
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'user review rating',
  });

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
