const express = require("express");
const viewController = require("./../Controller/viewsController");
const authController = require("./../Controller/authController");

const Router = express.Router();
Router.get("/", authController.isLoggedIn, viewController.getOverview);
Router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);

// login route
Router.get("/login", authController.isLoggedIn, viewController.loginUser);
Router.get("/me", authController.protectRoutes, viewController.myAccount);
// Router.post(
//   "/submit-user-data",
//   authController.protectRoutes,
//   viewController.getUserData
// );

module.exports = Router;
