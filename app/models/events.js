const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  phoneNo: {
    type: Number,
  },
  eventType: {
    type: String,
    require: true
  },
  guestNo: {
    type: Number,
  },
  ownServiceProvider: [
    {
      serviceType: String,
      location: String,
      contactNo: Number,
      serviceRate: Number
    }
  ],
  needServiceProvide: [
    {
      description: String
    }
  ],
  budgetEstimate: {
    type: Number, required: true
  },
  eventDate: {
    type: Date, required: true
  },
  eventMaker: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Update updatedAt everytime the document is saved.
 */
eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Autopopulate role and owner when calling the hooked method.
 */
const autopopulateFields = function (next) {
  this.populate('role', '-__v');
  this.populate('eventMaker', '-__v');
  this.populate('eventMaker.role', '-__v');
  next();
};

eventSchema
  .pre('find', autopopulateFields)
  .pre('findOne', autopopulateFields);


module.exports = mongoose.model('Event', eventSchema);