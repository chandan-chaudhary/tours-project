const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyncErr');
const User = require('./../models/userModel');
const factoryFun = require('./controllerFactory');

// TO filter fileds while updating logged user
const filterdObj = (obj, ...allowedFields) => {
  const updatedObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) updatedObj[el] = obj[el];
  });
  return updatedObj;
};

// GET CURRENT USER
exports.getLoggedUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// UPDATE LOGGED IN USER
exports.updateLoggedUser = catchAsync(async (req, res, next) => {
  // Error if user provide any password field
  if (req.body.password || req.body.confirmPasword) {
    return next(
      new appError(
        'Password cannot be updated here, goto /updatepasword to update password',
      ),
    );
  }
  const filterdUserData = filterdObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filterdUserData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE LOGGED IN USER
exports.DeleteLoggedUser = catchAsync(async (req, res, next) => {
  //  set  user's active fields to false
  const currentUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  // send response
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//GET ALL USER
exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// GET USER BY ID
exports.getUserbyId = factoryFun.getDocbyID(User);

// CREATE USER
exports.createUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Route not yet defined, please user /signup ',
  });
};

// UPDATE USER
exports.updateUser = factoryFun.updateDoc(User);
// DELETE USER
exports.deleteUser = factoryFun.deleteDoc(User);
