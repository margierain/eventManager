(function () {
  'use strict';
  process.env.NODE_ENV = 'testing'; // Ensures we're using the test db.

  const app = require('../../server');
  // let chatHttp = require('chai-http');
  const request = require('supertest')(app);
  const User = require('../../app/models').User;
  const Role = require('../../app/models').Role;
  const Event = require('../../app/models').Event;

  // chai.use(chatHttp);

  module.exports = {
    /**
     * testUserDetails single user
     * testUsers bulk users
     */
    testUserDetails: require('./testUser.json'),
    testUsers: require('./testUsers.json'),
    testEventDetails: require('./testEvent'),

    /**
     * Create a user using a HTTP POST request.
     */
    createUser: function (data, _log) {
      // If only _log was passed, make data null in order to use the default.
      if (!_log && typeof data !== 'object') {
        _log = data;
        data = null;
      }
      data = data || this.testUserDetails;
      return new Promise((resolve, reject) => {
        return request
          .post('/api/v.1/users')
          .send(data)
          .accept('application/json')
          .end((err, res) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(res);
          });
      });
    },

    /**
     * Login a user.
     */
    login: function (userData, _log) {
      userData = userData || this.testUserDetails;
      return new Promise(function (resolve, reject) {
        return request
          .post('/api/v.1/users/login')
          .send(userData)
          .accept('application/json')
          .end(function (err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
      });
    },

    /**
     * Clean user db.
     * Don't remove users we didn't create.
     */
    destroyTestUsers: function (_log) {
      return new Promise(function (resolve, reject) {
        User.find({}, function (err, users) {
          if (err) {
            reject(err);
            return;
          }
          users.forEach(function (user) {
            User.findOneAndRemove({ name: user.name }, function (err) {
              if (err) {
                reject(err);
                return;
              }
              return;
            });
          });
          resolve(true);
        });
      });
    },

    /**
     * Get the admin role.
     */
    getAdminRole: function () {
      return new Promise(function (resolve, reject) {
        Role.findOne({ title: 'admin' }, function (err, role) {
          if (err) {
            reject(err);
            return;
          }
          resolve(role);
        });
      });
    },


    /**
     * Promote a user to 'admin' status.
     */
    makeAdmin: function (name, _log) {
      const _this = this;
      name = name || this.testUserDetails.name;
      return new Promise(function (resolve, reject) {
        _this.getAdminRole()
          .then(function (role) {
            User.findOneAndUpdate({ name: name }, {
              $set: {
                role: role._id
              }
            }, function (err, user) {
              if (err) {
                reject(err);
                return;
              }

              resolve(user);
            });
          });
      });
    },

    testEvent: require('./testEvent'),
    testEvents: require('./testEvents'),
    createEvent: function (token, data, _log) {
      // If only _log was passed, make data null in order to use the default.
      if (!_log && typeof data !== 'object') {
        _log = data;
        data = null;
      }
      data = data || this.testEvent;
      return new Promise(function (resolve, reject) {
        if (!token) {
          const err = new Error('No access token provided');
          reject(err);
        } else {
          return request
            .post('/api/v.1/events')
            .send(data)
            .set('x-access-token', token)
            .accept('application/json')
            .end(function (err, res) {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
        }
      });
    },

    seedTestEvents: function (owner_id, _log) {

      let _this = this;
      // eslint-disable-next-line
      return new Promise(function (resolve, reject) {
        return User.findOne({ _id: owner_id }).exec(function (err, user) {
          if (err) {
            reject(err);
          }
          _this.testEvents.forEach(function (event) {
            event.eventMaker = owner_id;
            let data = Object.assign({}, event);

            Event.create(data, function (err, event) {
              if (err) reject(err);
            });
          });
          resolve(true);
        });
      });
    },

    destroyTestEvents: function (_log) {
      return Event.remove({}, function (err) { // eslint-disable-line
      });
    }

  }
})();