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
 * Filter events by the given date query.
 *
 * @param {Object} [queryParams]
 * @param {Object} [queryParams.created] - Filter events created on
 *                                       this date.
 * @param {Object} [queryParams.created_min] - Filter events created
 *                                           later than this date.
 * @param {Object} [queryParams.created_max] - Filter events created
 *                                           earlier than this date.
 *
 * @returns {Object} - With created_max and created_min date range.
 */
function filterByDate(queryParams) {
  return new Promise((resolve, reject) => {
    const hasDate = queryParams.created || queryParams.created_min || queryParams.created_min;
    if (!hasDate) {
      return resolve({});
    }
    const parseDate = (date) => {
      try {
        date = new Date(date);
        if (date.toString() === 'Invalid Date') {
          throw new Error(date);
        }
        return date.toUTCString();
      } catch (err) {
        throw err;
      }
    };
    try {
      if (queryParams.created) {
        const date = parseDate(queryParams.created);
        let createdMax = new Date(date);
        // Add a day to this day to get everything that was created between
        // this date and the next at 0000hrs.
        createdMax = createdMax.setDate(createdMax.getDate() + 1);
        queryParams.created_min = date;
        queryParams.created_max = createdMax;
      } else {
        if (queryParams.created_max) {
          let maxDate = parseDate(queryParams.created_max);
          maxDate = new Date(maxDate);
          // Include today's records as well.
          maxDate = maxDate.setDate(maxDate.getDate() + 1);
          queryParams.created_max = maxDate;
        } else if (queryParams.created_min) {
          queryParams.created_min = parseDate(queryParams.created_min);
        }
      }
      const param = Object.assign({}, {
        created_min: queryParams.created_min,
        created_max: queryParams.created_max
      });
      return resolve(param);
    } catch (err) {
      const error = new Error(`Error parsing date: ${err.message}`);
      return reject(error);
    }
  });
}

/**
 * Return events obtained by running a query from the user against the
 * events model.
 *
 * @param {Object} req - The request object.
 * @param {Object} query - A Mongoose query object.
 *
 * @returns {Array} - An array of events.
 */
function runQuery(req, query) {
  const queryParams = req.query;
  return new Promise((resolve, reject) => {
    Promise.all([
      filterByDate(queryParams),

    ]).then((queryParams) => {
      const params = queryParams
        .reduce((params, q) => Object.assign(params, q), {});

      if (params.created_max || params.created_min) {
        query.where('updateAt')
          .gte(params.created_min)
          .lte(params.created_max);
      }
      if (params.role) {
        query.where('role').equals(params.role._id);
      }

      query.exec((err, events) => {
        if (err) {
          return reject(err);
        }
        events = events.filter((event) => {
          if (req.decoded._id) {
            // We can access anything we own.
            if (event.eventMaker.name === req.decoded.name) {
              return true;
            } else if (req.decoded.role.title === 'admin') {
              // Admins can access anything.
              return true;
            }
            // If we're authenticated, we can access events reserved for
            // authenticated users.
            return event.eventMaker.title === 'user';
          }
          // Anyone else can only access the public events.
          return event;
        });

        return resolve(events);
      });
    }).catch((err) => {
      reject(err);
    });
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

module.exports = { resolveError, runQuery, castToObjectID };