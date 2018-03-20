const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  title: {
    type: String,
    default: 'user',
    unique: true,
    enum: ['user', 'service_provider', 'admin']
  },
  accessLevel: {
    type: Number,
    default: 0
  }
});

roleSchema.pre('save', next => {
  const accessLevelMap = {
    admin: 3,
    service_provider: 2,
    user: 1
  };

  this.accessLevel = accessLevelMap[this.title];
  next();
});

/**
 * Create the 3 roles when the model is initialize
 */

roleSchema.statics.initialize = function () {
  const role = this;
  return new Promise((resolve, reject) => {
    let defaults = role.schema.paths.title.enumValues;
    defaults = defaults.map((value) => {
      return { title: value }
    });

    role.create(defaults, (err, values) => {
      if (err) {
        reject(err);
      }
      resolve(values);
    });
  });
};

roleSchema.statics.all = (cb) => {
  this.find({}, cb)
};

module.exports = mongoose.model('Role', roleSchema);
