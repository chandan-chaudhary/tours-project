const Tour = require('./../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsyncErr');
const appError = require('./../utils/appError');
const Booking = require('../models/bookingModel');
const factoryFun = require('./controllerFactory');
// PAYMENT CHECKOUT
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get tour which is to be booked
  const tour = await Tour.findById(req.params.tourId);
  if (!tour)
    return next(
      new appError('No tour match, payment cannot be processed', 400),
    );

  //  create a payment session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'INR',
          product_data: {
            name: `${tour.name} tour`,
            images: [
              `https://www.natours.dev/img/tours/${tour.imageCover}.jpg`,
            ],
          },
        },
        // description: tour.summary,
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// CHECKOUT BOOKING
exports.createBookingTour = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });
  // `${req.protocol}://${req.get('host')}/`
  // console.log('url', req.originalUrl.split('?')[0]);
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllDoc = catchAsync(async (req, res, next) => {
  const docs = await Booking.find();
  if (!docs) return next(new appError('No booking are curently avilable', 400));

  res.status(200).json({
    status: 'success',
    total: docs.length,
    Docs: docs,
  });
});
// exports.getAllBooking = factoryFun.getAllDoc(Booking);
exports.getBookingById = factoryFun.getDocbyID(Booking);
exports.createBooking = factoryFun.createDoc(Booking);
exports.updateBooking = factoryFun.updateDoc(Booking);
exports.deleteBooking = factoryFun.deleteDoc(Booking);
