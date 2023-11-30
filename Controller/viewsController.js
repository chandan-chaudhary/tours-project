const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyncErr');

// OVERVIEW PAGE
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  if (!tours) {
    next(new appError('Cant Find doc', 500));
  }
  res.status(200).render('overview', {
    tours,
  });
});

// TOUR PAGE
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'user review rating',
  });

  if (!tour) {
    next(new appError('no tour found', 500));
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

// LOGIN USER PAGE
exports.loginUser = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

// PERSONAL DETAIL PAGE
exports.myAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('personalDetail', {
    title: 'My Account',
  });
});

// UPDATE USER DATA PAGE
exports.getUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true },
  );
  res.status(200).render('personalDetail', {
    title: 'My Account',
    // assign user to updatedUser , if we leave as it is thenit will take user from protected routes
    user: updatedUser,
  });
});

// BOOKING TOUR PAGE
exports.getMyTour = catchAsync(async (req, res, next) => {
  // get all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // get all booked tour
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});
