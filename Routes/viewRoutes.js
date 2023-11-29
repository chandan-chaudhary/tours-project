const express = require('express');
const viewController = require('../Controller/viewsController');
const authController = require('../Controller/authController');
const bookingController = require('../Controller/bookingController');

const Router = express.Router();
Router.get(
  '/',
  bookingController.createBookingTour,
  authController.isLoggedIn,
  viewController.getOverview,
);
Router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// login route
Router.get('/login', authController.isLoggedIn, viewController.loginUser);
Router.get(
  '/myProfile',
  authController.protectRoutes,
  viewController.myAccount,
);
Router.get('/my-tours', authController.protectRoutes, viewController.getMyTour);
Router.post(
  '/submit-user-data',
  authController.protectRoutes,
  viewController.getUserData,
);

module.exports = Router;
