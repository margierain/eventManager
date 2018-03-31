const Validator = require('validator');
const models = require('../models');
const utils = require('../utils');
const generateJwt = require('../services').generateJwt;

const User = models.User;
const Role = models.Role;
const Event = models.Event;

const resolveError = utils.resolveError;
const castToObjectID = utils.castToObjectID;

/**
 * Create a user and authenticate them
 */

function create(req, res) {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || 'user',
  };

  const createUser = (data) => {
    User.create(data, (err, user) => {
      if (err) {
        return resolveError(err, res);
      }

      return User
        .findOne({ _id: user._id }, '-__v')
        .exec((err, user) => {
          if (err) {
            return resolveError(err, res);
          }
          return res.status(201).send({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateJwt(user.id, user.name)
          });
        });
    });
  };

  Role
    .findOne({ title: data.role })
    .exec((err, role) => {
      if (err) {
        console.log('errs');
        return resolveError(err, res);
      }

      data.role = role._id;
      return createUser(data);
    });
};

/**
 * List all Users.
 * This is an admin only functionality.
 */
function list(req, res) {
  return User
    .find({}, '-__v')
    .exec((err, users) => {
      if (err) {
        return resolveError(err, res);
      }
      return res.status(200).send(users);
    });
};

/**
 * Get the logged in user's profile.
 */
function retrieve(req, res) {
  return User
    .findOne({
      $or: [
        { name: req.params.nameOrId },
        { _id: castToObjectID(req.params.nameOrId) }
      ]
    }, '-__v')
    .exec((err, user) => {
      if (err) {
        return resolveError(err, res);
      }

      if (!user) {
        return res.status(404).send({
          message: 'User Not Found'
        });
      }
      return res.status(200).send(user);
    });
};

/**
 * Update the logged in user's details.
 */
function update(req, res) {
  const saveUser = (user) => {
    user.save((err, user) => {
      if (err) {
        if (err.code === 11000) {
          if (/email/.test(err.errmsg)) {
            return resolveError({
              message: 'A user with this email already exists'
            }, res, 409);
          } else if (/name/.test(err.errmsg)) {
            return resolveError({
              message: 'A user with this name already exists'
            }, res, 409);
          }
        }
        return resolveError(err, res, 409);
      }

      return User
        .findOne({ _id: user._id }, '-__v')
        .exec((err, user) => {
          if (err) {
            return resolveError(err, res);
          }
          return res.status(200).send(user);
        });
    });
  };

  return User
    .findOne({
      $or: [
        { name: req.params.nameOrId },
        { _id: castToObjectID(req.params.nameOrId) }
      ]
    })
    .exec((err, user) => {
      if (err) {
        return resolveError(err, res);
      }
      if (!user) {
        // If using a saved token while it's associated user has been
        // deleted.
        return res.status(404).send({
          message: 'User not found.'
        });
      }

      if (req.body.name) user.name = req.body.name;
      if (req.body.password) user.password = req.body.password;
      if (req.body.email) user.email = req.body.email;

      if (req.body.role && typeof req.body.role === 'string') {
        return Role
          .findOne({ title: req.body.role })
          .exec((err, role) => {
            if (err) {
              return resolveError(err, res);
            }
            user.role = role._id;
            return saveUser(user);
          });
      }
      return saveUser(user);
    });
}

/**
 * Delete a user's account.
 */
function deleteUser(req, res) {
  return User.findOneAndRemove({
    $or: [
      { name: req.params.nameOrId },
      { _id: castToObjectID(req.params.nameOrId) }
    ]
  }, (err) => {
    if (err) {
      return resolveError(err, res);
    }
    return res.status(204).send();
  });
}


/**
 * Login a user with name and a password.
 */
function login(req, res) {
  return User
    .findOne({
      name: req.body.name
    })
    .select('_id email name password')
    .exec((err, user) => {
      if (err) {
        return res.send(err);
      }

      if (!user) {
        return res.status(401).send({
          message: 'Authentication failed. User not found.'
        });
      } else if (!user.validatePassword(req.body.password)) {
        return res.status(401).send({
          message: 'Incorrect name/password combination'
        });
      }

      return res.status(200).send({
        message: 'Authentication successful',
        token: generateJwt(user.id, user.name)
      });
    });
};

module.exports = { create, list, login, retrieve, deleteUser, update };