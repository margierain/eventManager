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

  }
})();