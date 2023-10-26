const express = require('express');
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');

const Router = express.Router({ mergeParams: true }); // this option allows to merge review route with tours routes

Router.use(authController.protectRoutes);
Router.route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictRoutes('user'),
    reviewController.setTourUserIds,
    reviewController.createNewReview,
  );

Router.route('/:id')
  .get(reviewController.getReviewbyID)
  .patch(
    authController.restrictRoutes('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictRoutes('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = Router;
