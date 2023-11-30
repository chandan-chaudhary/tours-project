const appError = require('./../utils/appError');

// Error from Invalid ID
const handleObjectIdErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
};

// Error for Duplicate Fields
const handleDuplicateFeilds = (err) => {
  const message = `Duplicate ${Object.keys(err.keyValue)}: ${Object.values(
    err.keyValue,
  )}`;
  return new appError(message, 400);
};

//Handling validation error
const handleValidationErrorDB = (err) => {
  const error = `Validation fail: ${Object.values(err.errors).join('. ')} `;
  return new appError(error, 400);
};

// check for token to match each other
const handleJWTError = (err) => {
  return new appError('Authentication failed, please login', 401);
};

// Handling expired TOKEN
const handleExpiredJWT = (err) => {
  return new appError('Login Expired! Please login again.', 401);
};

//Development Error structure
const sendErrDevelopment = (err, req, res) => {
  // API...OPERATIONAL ERROR
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      Error: err,
      Stack: err.stack,
    });
  }
  // RENDER WEBSITE..UNKNOWN ERROR
  console.log('ERROR =>', err);
  return res.status(err.statusCode).render('error', {
    title: 'error',
    message: err.message,
  });
};

//PRODUCTION Error structure
const sendErrproduction = (err, req, res) => {
  // isoperational is coming from appError to sent a safe error message to client.
  // API..OPERATIONAL ERROR
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Error from external packages or internal server error.
    // UNKNOWN ERROR
    console.log('ERROR =>', err);
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
  // RENDER WEBSITE...OPERATIONAL ERROR
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      message: err.message,
    });
  }
  // UNKNOWN ERROR
  console.log('ERROR =>', err);
  return res.status(err.statusCode).render('error', {
    title: 'error',
    message: 'please try again later',
  });
};

// Error middleware by express
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log(err.name);
    sendErrDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // copy error and error message to PRODUCTION
    let error = { ...err };
    error.message = err.message;
    // console.log('ERROR‼️‼️', error._message); // err.name is not showing in error object
    if (error.kind === 'ObjectId') {
      error = handleObjectIdErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFeilds(error);
    }
    //need to get corected...
    FIXME: if (error._message === 'Validation failed') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleExpiredJWT(error);
    }
    sendErrproduction(error, req, res);
  }
  next();
};
