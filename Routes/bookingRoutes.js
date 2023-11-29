const express = require('express');
const bookingController = require('./../Controller/bookingController');
const authController = require('./../Controller/authController');

const Router = express.Router();

Router.use(authController.protectRoutes);
Router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

Router.use(authController.restrictRoutes('admin', 'lead-guide'));

Router.route('/')
  .get(bookingController.getAllDoc)
  .post(bookingController.createBooking);

Router.route('/:id')
  .get(bookingController.getBookingById)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = Router;
