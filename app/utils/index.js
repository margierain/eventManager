/* eslint-disable no-param-reassign, no-shadow */

const Role = require('../models').Role;
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Give users helpful error messages.
 *
 * @param {Object} err - Error thrown
 * @param {Object} res - The response object to return
 * @param {Number} [status] - Status to return to the API user.
 */
function resolveError(err, res, status) {
  if (status) {
    if (['testing', 'production'].indexOf(process.env.NODE_ENV !== -1)) {
      return res.status(status).send({
        message: err.message,
        error: err
      });
    }
    return res.status(status).send({
      message: 'Server encountered an error.'
    });
  }
  // MongoError
  if (err.name === 'BulkWriteError') {
    const errmsg = err.errmsg;

    // Handle unique constraint violation.
    if (err.code === 11000) {
      if (/email/.test(errmsg)) {
        return res.status(400).send({
          message: 'A user with this email already exists'
        });
      } else if (/name/.test(errmsg)) {
        return res.status(400).send({
          message: 'A user with this name already exists'
        });
      }
    }

    return res.status(400).send({
      message: errmsg
    });
  }
  // Check for validation errors from Mongoose.
  const validationErrors = ['ValidationError'];
  if (validationErrors.indexOf(err.name) !== -1) {
    const messages = {};
    Object.keys(err.errors).forEach((key) => {
      messages.message = err.errors[key].message;
    });
    return res.status(400).send(messages);
  }
  if (['testing', 'dev'].indexOf(process.env.NODE_ENV !== -1)) {
    return res.status(500).send({
      message: 'Server encountered an error.',
      error: err
    });
  }
  return res.status(500).send({
    message: 'Server encountered an error.'
  });
}

/**
 * Cast some string value to MongoDB ObjectId
 *
 * The `123456789012` ensures MongoDB won't error out as it tries to cast
 * `value` into an ObjectId while the value is less than 12 characters.
 */
function castToObjectID(value) {
  let _id;
  try {
    _id = new ObjectId(value);
  } catch (error) {
    _id = new ObjectId('123456789012');
  }
  return _id;
}

module.exports = { resolveError, castToObjectID };