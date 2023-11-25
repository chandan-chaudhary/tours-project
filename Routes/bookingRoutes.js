const express = require('express');
const bookingController = require('./../Controller/bookingController');
const authController = require('./../Controller/authController');

const Router = express.Router();

Router.get(
  '/checkout-booking/:tourId',
  authController.protectRoutes,
  bookingController.getTourBooking,
);

module.exports = Router;
