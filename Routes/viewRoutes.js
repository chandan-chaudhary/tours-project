const express = require('express');
const viewController = require('./../Controller/viewsController');
const authController = require('./../Controller/authController');

const Router = express.Router();

Router.get('/', viewController.getOverview);
Router.get('/tour/:slug', viewController.getTour);

// login route
Router.get('/login', viewController.loginUser);

module.exports = Router;
