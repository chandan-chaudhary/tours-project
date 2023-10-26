const express = require('express');
// const pug = require('pug');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookiesParser = require('cookie-parser');

// requiring own Model
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const appError = require('./utils/appError');
const globalError = require('./Controller/globalErrController');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');

const app = express();

// INJECT PUG VIEW ENGINE

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL Express middleware
//SERVE  static files..
app.use(express.static(path.join(__dirname, 'Public')));
//SECURITY HTTP HEADERS
app.use(helmet({ contentSecurityPolicy: false }));
console.log('from app.js', process.env.NODE_ENV);

// LIMITING request on same API
const limitter = rateLimit({
  max: 50, // no of request
  windowMs: 60 * 60 * 1000, // time 1hr into miliseconds
  message: 'Too many request, please try again after sometime!',
});
app.use('/api', limitter);

// run if process is in development
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// To get access to all req.body
app.use(express.json());
app.use(cookiesParser);

// SANITIZE REQUESTED DATA  ..noSql injection allowed
app.use(mongoSanitize());

// XSS to sanitize from html code
app.use(xss()); //DEPRICATED

// remove DUPLICATE QUERY string
// hpp -> http parameter pollute
// whiteliste will allow duplicate query with same name
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

// TEST middleware
app.use((req, res, next) => {
  // console.log(x);
  console.log('app.js midlleware..', req.cookies);
  next();
});

// ROUTES
// RENDER PUG TEMPLATES
app.use('/', viewRouter);

//Mounting router over routes..
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Using middlware to check for Wrong router fetched
app.all('*', (req, res, next) => {
  next(new appError(`can't fetch ${req.originalUrl}`));
});

// SEND error using own Module error
app.use(globalError);

// EXPORT app module
module.exports = app;
