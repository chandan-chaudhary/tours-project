const multer = require('multer');
const sharp = require('sharp');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyncErr');
const User = require('./../models/userModel');
const factoryFun = require('./controllerFactory');

// multer storage
const multerStorage = multer.memoryStorage();
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'Public/img/users');
//   },
//   filename: (req, file, callback) => {
//     // create filename eg-> user-user_id-date.extension
//     const extension = file.mimetype.split('/')[1];
//     const date = Date.now();
//     callback(null, `user-${req.user._id}-${date}.${extension}`);
//   },
// });

// Multer filter for only image type
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new appError('Not an image! please provide image', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserFile = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`user-${req.user._id}-${date}.${extension}`);
};
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
  console.log(req.file);
  console.log(req.body);
  // Error if user provide any password field
  if (req.body.password || req.body.confirmPasword) {
    return next(
      new appError(
        'Password cannot be updated here, goto /updatepasword to update password',
      ),
    );
  }
  const filterdUserData = filterdObj(req.body, 'name', 'email');
  if (req.file) {
    filterdUserData.photo = req.file.filename;
  }

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
