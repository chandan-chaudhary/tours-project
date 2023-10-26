const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// creating Schema to create docs, validate and manymore
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, ' a name must have 10 letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, ' A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, ' A tour must have difficulty rating'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: ' difficulty can be either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, ' a minimum tour rating should be 1.0'],
      max: [5, ' a maximum tour rating should be 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 *10  -> 46 (round)-> 47 /10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, ' A tour must have summary'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price tag'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'DiscountPrice:{VALUE} must be less than price',
      },
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have image cover'],
    },
    images: [String],
    description: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      // default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        day: Number,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, //this line duplicate _id to id with same id-string
    toObject: { virtuals: true },
  },
);

// COMPOUND indexing on schema
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// defining VIrutals property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // field from review model
  localField: '_id',
});

// Document Middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// TO EMBED DOCUMENTS
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//POPULATING TOUR GUIDES IN TOURS DOC
tourSchema.pre(/^find/, function (next) {
  // gets duration week in null.
  FIXME: this.populate({
    path: 'guides',
    select: '-__v -passwordUpdatedAt',
  });
  next();
});

// Aggregate Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
// creating tour model out of tourSchema.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
