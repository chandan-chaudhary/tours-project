const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    /// gets error yet it dont have unique property
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide correct Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must have atleast 8 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'confirm Password is required'],
    validate: {
      //only works with save
      validator: function (el) {
        return el === this.password;
      },
      message: 'password do not match',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordUpdatedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// DOCUMENT MIDDLEWARE
// update passwordupdatedAt fileds in database
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // 1 sec before the operation bcoz passwordUpdatedAt should be less then token timestamp
  this.passwordUpdatedAt = Date.now() - 1000;
  next();
});

// //Encrypt password
userSchema.pre('save', async function (next) {
  // check if current password was modified/updated
  if (!this.isModified('password')) return next();

  // encrypting password
  this.password = await bcrypt.hash(this.password, 12);

  //Deleting confirmPassword fields
  // confirmPassword field we do not need in databse, its only for confirmation purpose only user need to provide to match with current password
  this.confirmPassword = undefined;
  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  //points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Attaching METHODS properties to schema
// checking password user entered is valid or not
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userpassword,
) {
  return bcrypt.compare(candidatePassword, userpassword);
};
// if password has bee updated after token is sent
userSchema.methods.updatedPassword = function (JWTTimestamp) {
  // converted date into time stamp of milisecond then /1000 to make it into seconds
  // as we recieve JWT timestamp in seconds
  if (this.passwordUpdatedAt) {
    const changedTimestamp = this.passwordUpdatedAt.getTime() / 1000;
    // console.log(changedTimestamp > JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

//createing reset token and hasing it. save hashed token to document
userSchema.methods.passwordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // into miliseconds
  // console.log({ resetToken }, this.resetPasswordToken);
  return resetToken;
};
// CREATE MODEL out of Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
