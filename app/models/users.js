const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const config = require('../../config/dev');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: '{VALUE} is not a valid email address'
    }
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  serviceProvider: [
    {
      location: String,
      contactInfo: Number,
      termsOfTheAgreement: String,
      serviceOffered: String,
      Rates: String
    }
  ]
});

/**
 * Autopopulate role
 */

const autopopulateFields = function (next) {
  this.populate('role', '-__v');
  next();
};

userSchema
  .pre('find', autopopulateFields)
  .pre('findOne', autopopulateFields)
  .pre('findById', autopopulateFields);

/**
 * Hash user password before saving it to the db
 */

userSchema.pre('save', function (next) {
  // don't rehash an already has password
  if (!this.isModified('password')) {
    return next();
  }
  // replace password with hash
  this.password = bcrypt.hashSync(this.password);
  next();
});

/**
 * Ensure a given password matches the hash.
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);