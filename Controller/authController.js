const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsyncErr');
const appError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

// CREATING WEB_TOKEN
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

//  Create token and send response to client
const createTOKENandSendRESPONSE = (user, statusCode, res) => {
  const token = createToken(user._id);
  // cookie OPtions
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // create and send token via cookie..
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    body: {
      user,
    },
  });
};

//SIGNUP USER
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    profilePic: req.body.profilePic,
    role: req.body.role,
    passwordUpdatedAt: req.body.passwordUpdatedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/myProfile`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createTOKENandSendRESPONSE(newUser, 201, res);
});

//LOGIN USER
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  //in case no email or password
  if (!email || !password) {
    return next(new appError('Missing email or password', 400));
  }

  // check user and verify password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Invalid User or Password'), 401);
  }
  createTOKENandSendRESPONSE(user, 200, res);
  // const token = createToken(user._id);
  // res.status(200).json({
  //   status: 'succcess',
  //   token,
  // });
});

// LOGOUT
exports.logout = async (req, res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000), //10 seconds
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// Give permision to login user to get all routes
exports.protectRoutes = catchAsync(async (req, res, next) => {
  // check if token is avaiable
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //split convert string to array so we need to access token not Bearer i.e, on [1]
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new appError('Please login', 401));
  }

  // //verify Token
  const decodedFields = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // // check if user is there
  const loggedUser = await User.findById(decodedFields.id);
  // console.log(loggedUser);
  if (!loggedUser) {
    return next(new appError('User no longer exist', 401));
  }

  // // check if password was updated after token was created
  //decodedFields.iat means created at
  // const logActivity =  loggedUser.updatedPassword(decodedFields.iat);
  if (loggedUser.updatedPassword(decodedFields.iat)) {
    return next(
      new appError('Password has been updated, please login again', 401),
    );
  }

  //GRANT access to proctected Routes
  req.user = loggedUser;
  res.locals.user = loggedUser;
  next();
});

//
exports.isLoggedIn = async (req, res, next) => {
  // check token in cookies ..if available
  if (req.cookies.jwt) {
    try {
      //verify Token
      const decodedFields = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // check if user Exist
      const loggedUser = await User.findById(decodedFields.id);
      // console.log(loggedUser);
      if (!loggedUser) {
        return next();
      }

      // check if password was updated after token was created
      //decodedFields.iat means created at
      // const logActivity =  loggedUser.updatedPassword(decodedFields.iat);
      if (loggedUser.updatedPassword(decodedFields.iat)) {
        return next();
      }

      //GRANT access to proctected Routes
      res.locals.user = loggedUser;
      // req.user = loggedUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// resctrict users to make changement in tours.
exports.restrictRoutes = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('You do not have permission to perefom this action', 403),
      );
    }
    next();
  };
};

// FORGOT PASSWORD
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user thorugh email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('No user found', 404));
  }

  //create a token and save the modified doc
  const resetToken = user.passwordResetToken();
  await user.save({ validateBeforeSave: false });
  const tokenURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Please reset your password ${tokenURL}, valid for 10 min.\n If please ignore if already done`;
  console.log(tokenURL);
  //  SEND mail options
  try {
    res.status(200).json({
      status: 'success',
      message: 'token sent to gmail',
    });
  } catch (err) {
    // if there error while sending mail then simply set reset Token and expire to undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('cannot send mail', 500));
  }
});

//RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get token from req then hash it
  const hashRecivedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //FIND USER and validate if user can still change their password
  const user = await User.findOne({
    resetPasswordToken: hashRecivedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  //if token expired or invalid token
  if (!user) {
    return next(new appError('Token invalid or expired ', 500));
  }
  //  FETCH NEW PASSWORD
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  //this thime we need to update document
  await user.save();

  // SEND TOKEN & LOGIN USER
  createTOKENandSendRESPONSE(user, 200, res);
});

//UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user bcoz user is already LOGGED in.
  const user = await User.findById(req.user.id).select('+password');
  //  get current password & compar with dbs password using bcrypt
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new appError('Password did not match', 401));
  }
  // update Password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // LOGIN USER
  createTOKENandSendRESPONSE(user, 200, res);
});
