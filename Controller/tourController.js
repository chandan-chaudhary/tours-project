const appError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsyncErr');
const factoryFun = require('./controllerFactory');
const reviewController = require('./reviewController');

exports.aliasTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, difficulty, maxGroupSize, summary, duration';
  next();
};

// FIND ALL  TOUR
exports.getAllTour = async (req, res) => {
  const tour = await Tour.find();
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  // const doc = await features.query.explain();
  // .explain() -> gives all info about how database scan into document to fetch data
  const doc = await features.query;

  //SENDING RRESPONSE
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: {
      data: doc,
    },
  });
};

// GET TOUR BY ID
exports.getTourById = factoryFun.getDocbyID(Tour, { path: 'reviews' });

// CREATE TOUR
exports.createTour = factoryFun.createDoc(Tour);

// UPDATE TOUR
exports.updateTour = factoryFun.updateDoc(Tour);

// DELETE TOUR
exports.deleteTour = factoryFun.deleteDoc(Tour);

// AGGREGATION PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
  const tourStats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        noOfTour: { $sum: 1 },
        totalRating: { $sum: '$ratingsAverage' },
        ratingAverage: { $avg: '$ratingsAverage' },
        priceAverage: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        priceAverage: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tourStats,
    },
  });
});

//aggregation monthly-paln
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const monthlyPlan = await Tour.aggregate([
    {
      // unwind basically extract array to complete other object and render them
      $unwind: {
        path: '$startDates',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $sort: { numTourStats: -1 }, // -1 means in decending order
    },
    {
      // will automatically add fileds into docs
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // will hide _id
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      monthlyPlan,
    },
  });
});

// tour-nearby/245/center/45,-46/unit/mile
exports.getNearbyTour = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radianEarthinMiles = 3963.2;
  const radianEarthinKm = 6378.1;

  const radius = unit === 'mile' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new appError('cannot get latitude and longitude', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(radius);
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: tours,
  });
});

exports.getTourDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new appError('cannot get latitude and longitude', 400));
  }
  const multiplier = unit === 'mile' ? 0.000621371 : 0.001;
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance', //assign filed name
        distanceMultiplier: multiplier, // divide by 1000
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: distance,
  });
});
