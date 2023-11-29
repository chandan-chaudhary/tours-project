const catchAsync = require('./../utils/catchAsyncErr');
const appError = require('./../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');

// GET ALL DOCUMENTS

// SAME BUG AS PREVIOUS
// exports.getAllDoc = (Model) => {
//   catchAsync(async (req, res, next) => {
//     const docs = await Model.find();
//     // if (!Model)
//     //   return next(new appError('No booking are curently avilable', 400));

//     res.status(200).json({
//       status: 'success',
//       Docs: docs,
//     });
//   });
// };
// says route.get() is call back function but get object
// BUG: exports.getAllDoc = (Model) => {
//   catchAsync(async (req, res, next) => {
//     const features = new APIfeatures(Model.find(), req.query)
//       .filter()
//       .sort()
//       .limit()
//       .paginate();
//     const doc = await features.query;
//     //SENDING RRESPONSE
//     res.status(200).json({
//       status: 'success',
//       result: doc.length,
//       data: {
//         data: doc,
//       },
//     });
//   });
// };

exports.getDocbyID = (Model, populateOptn) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptn) query = query.populate(populateOptn);
    const doc = await query;

    if (!doc) {
      return next(new appError('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        Doc: doc,
      },
    });
  });

// CREATE DOCUMENT
exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body); //bcoz post data is coming through req and dat is in req.body
    res.status(201).json({
      stauts: 'success',
      data: {
        Doc: newDoc,
      },
    });
  });

// DELETE DOCUMENT
exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('No document found with Id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// UPDATE DOCUMENT
exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this will return updated object.
      runValidators: true,
    });
    if (!doc) {
      return next(new appError('No Document found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
