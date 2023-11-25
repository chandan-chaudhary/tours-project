const express = require('express');
const bookingController = require('./../Controller/bookingController');
const authController = require('./../Controller/authController');

const Router = express.Router();

Router.get(
  '/checkout-session/:tourId',
  authController.protectRoutes,
  bookingController.getCheckoutSession,
);

module.exports = Router;
