const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//Handling Uncaught exception
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception');
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

// requiring and replacing database string with real password
const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connecting database with our express app
mongoose.connect(database).then(() => {
  console.log('databse connection successfull');
});

// server port and listening
//   console.log(process.env);
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server ${port}`);
});

//handling unHandledRejected Promise
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
