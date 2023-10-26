const fs = require('fs');
const mongoose = require('mongoose');
//requirirng and configring enviroment variables..
require('dotenv').config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

/**
 * DATABASE is required and password is manupulated
 */
const Database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
// mongoose connections is a async function...
mongoose.connect(Database).then((connection) => {
  // console.log(connection.connections);
  console.log('DB connections Successfull');
});

// File to be Exported..
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
// );

// importing Data into Database
const importData = async () => {
  try {
    // await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);

    console.log('data imported successful !!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// deleting Data from Database
const deleteData = async () => {
  try {
    // await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();

    console.log('Data deleted !!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//  verifing conditions and basic to therse action is perform over and file system is being changed
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// looking into argument Array
console.log(process.argv);
