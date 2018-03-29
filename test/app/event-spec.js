(function () {
  'use strict';

  const app = require('../../server');
  const request = require('supertest')(app);
  const expect = require('chai').expect;
  const testUtils = require('../helpers/utils');

  describe.only('Event Test Suite', function () {
    describe('Test event listing functionality', function () {
      let token;
      before(function (done) {
        testUtils.createUser()
          .then(function (res) {
            token = res.body.token;
            testUtils.seedTestEvents(res.body._id);
            done();
          })
          .catch(done);
      });

      after(function (done) {
        testUtils.destroyTestUsers()
          .then(function () {
            testUtils.destroyTestEvents();
            done();
          })
          .catch(done);
      });

      it('should fetch all events if the current user is an admin',
        function (done) {
          testUtils.makeAdmin()
            .then(function () {
              request
                .get('/api/v.1/events')
                .set('x-access-token', token)
                .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res.status).to.equal(200);
                  expect(res.body).to.exist;
                  expect(res.body).to.be.instanceOf(Array)
                    .and.to.have.lengthOf(2);
                  done();
                });
            })
            .catch(done);
        });

      it('should only fetch user s own events for non-admins',
        function (done) {
          testUtils
            .createUser({
              name: 'some-user',
              password: 'test',
              email: 'test@test.com'
            })
            .then(function (res) {
              request
                .get('/api/v.1/events')
                .set('x-access-token', res.body.token)
                .accept('application/json')
                .end(function (err, res) {
                  expect(err).to.be.null;
                  expect(res.status).to.equal(200);
                  expect(res.body).to.exist;
                  expect(res.body).to.be.instanceOf(Array)
                    .and.to.have.lengthOf(0);
                  done();
                });
            })
            .catch(done);
        });

      it('should list events sorted by the date created', function (done) {
        request
          .get('/api/v.1/events')
          .set('x-access-token', token)
          .accept('application/json')
          .end(function (err, res) {
            expect(err).to.be.null;

            var sorted = Object.assign([], res.body);
            sorted = sorted.sort(function (a, b) {
              return a.createdAt < b.createdAt;
            });
            expect(res.body).to.eql(sorted);
            done();
          });
      });
    });
  });
})();