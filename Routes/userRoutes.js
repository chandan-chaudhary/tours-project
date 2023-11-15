const express = require('express');
const Router = express.Router();
const userHandler = require('./../Controller/userController');
const authController = require('./../Controller/authController');
//Auth controller routes
Router.post('/signup', authController.signUp);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgotpassword', authController.forgotPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);

// this will protect all routes after this middleware
Router.use(authController.protectRoutes);

Router.get(
  '/current-logged-user',
  userHandler.getLoggedUser,
  userHandler.getUserbyId,
);

Router.patch('/update-logged-user', userHandler.updateLoggedUser);
Router.patch('/updatepassword', authController.updatePassword);
Router.delete('/delete-logged-user', userHandler.DeleteLoggedUser);

// RESTRICTING ROUTES.. only admin can make change
Router.use(authController.restrictRoutes('admin'));

// routing to fetch users data.. and manupulate Users.
Router.route('/').get(userHandler.getAllUser).post(userHandler.createUser);
Router.route('/:id')
  .get(userHandler.getUserbyId)
  .patch(userHandler.updateUser)
  .delete(userHandler.deleteUser);
module.exports = Router;
