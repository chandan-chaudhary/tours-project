const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, ' A review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating munst be greater or equal to 1'],
      max: [5, 'Rating must be less or equal to 5'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belongs have a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongs to tour'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true }, //this line duplicate _id to id with same id-string
    toObject: { virtuals: true },
  },
);
// COMPUND indexing to get for exact options we pass
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// static method to calculate Average
reviewSchema.statics.calcAvgRating = async function (tourId) {
  const avgRatingStats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(avgRatingStats);
  if (avgRatingStats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: avgRatingStats[0].nRating,
      ratingsAverage: avgRatingStats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// call statics methods after docment save
reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // const query = this.getQuery();
  this.rev = await this.findOne().clone(); //without clone findOne() says query is already excuted.
  // console.log(this.rev.tour);
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // console.log('hello', this.rev.tour, doc);
  this.constructor.calcAvgRating(this.rev.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
