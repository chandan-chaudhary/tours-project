const express = require('express');
const Router = express.Router();

const tourHandler = require('./../Controller/tourController');
const authController = require('./../Controller/authController');
const reviewRoute = require('./../Routes/reviewRoutes');
// Router.param('id', tourHandler.checkId);

Router.use('/:tourId/reviews', reviewRoute);

//Alias Router
Router.route('/top-5-cheap-tour').get(
  tourHandler.aliasTour,
  tourHandler.getAllTour,
);

Router.route('/tour-stats').get(tourHandler.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.protectRoutes,
  authController.restrictRoutes('admin', 'lead-guide', 'guide'),
  tourHandler.getMonthlyPlan,
);
//
Router.route('/tour-nearby/:distance/center/:latlng/unit/:unit').get(
  tourHandler.getNearbyTour,
);
Router.route('/distance/:latlng/unit/:unit').get(tourHandler.getTourDistance);
// routing to fetch Tours data.. and manupulate Tours.
Router.route('/')
  .get(tourHandler.getAllTour)
  .post(
    authController.protectRoutes,
    authController.restrictRoutes('admin', 'lead-guide'),
    tourHandler.createTour,
  );
Router.route('/:id')
  .get(tourHandler.getTourById)
  .patch(
    authController.protectRoutes,
    authController.restrictRoutes('admin', 'lead-guide'),
    tourHandler.updateTour,
  )
  .delete(
    authController.protectRoutes,
    authController.restrictRoutes('admin', 'lead-guide'),
    tourHandler.deleteTour,
  );
// Router.route('/:tourId/reviews').post(
//   authController.protectRoutes,
//   authController.restrictRoutes('user'),
//   reviewController.createNewReview,
// );
module.exports = Router;
