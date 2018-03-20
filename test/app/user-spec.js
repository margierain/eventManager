(function name(params) {

  'use strict';
  const app = require('../../server');
  const request = require('supertest')(app);
  const expect = require('chai').expect;
  const testUtils = require('../helpers/utils');


  describe('User Test Suite', () => {
    describe('Test create user functionality', function () {
      afterEach(function (done) {
        testUtils.destroyTestUsers()
          .then(function () {
            done();
          })
          .catch(done);
      });

      it('should create a user', function (done) {
        testUtils.createUser(testUtils.testUserDetails)
          .then(function (res) {
            expect(res.status).to.equal(201);
            expect(res.body).to.exist;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('name', testUtils.testUserDetails.name);
            expect(res.body).to.have.property('email', testUtils.testUserDetails.email);
            done();
          })
          .catch(done);
      });

      it('should return an auth token when it creates a user', function (done) {
        testUtils.createUser()
          .then(function (res) {
            expect(res.status).to.equal(201);
            expect(res.body.token).to.exist;;
            done();
          })
          .catch(done);
      });

      it('should require a password, name and email to create a user',
        (done) => {
          testUtils.createUser({})
            .then(function (res) {
              expect(res.status).to.equal(400);
              expect(res.body).to.be.instanceOf(Object);

              Object.keys(res.body).map((errorObj) => {
                const key = errorObj;
                const msg = res.body[key];
                expect(key).to.match(/name|email|password/);
                expect(msg).to.eql('This field is required.');
              });
              done();
            })
            .catch(done);
        });

      it('should create a user with a role defined', (done) => {
        testUtils.createUser()
          .then(function (res) {
            expect(res.status).to.equal(201);
            expect(res.body.role).to.exist;
            expect(res.body.role).to.have.all.keys([
              '_id', 'title', 'accessLevel']);
            done();
          })
          .catch(done);
      });
    });

    describe('Test only unique users are created', () => {
      before((done) => {
        testUtils.createUser(testUtils.testUserDetails)
          .then(() => {
            done();
          })
          .catch(done);
      });

      after((done) => {
        testUtils.destroyTestUsers()
          .then(function () {
            done();
          })
          .catch(done);
      });

      it('should create unique users', (done) => {
        testUtils.createUser(testUtils.testUserDetails)
          .then((res) => {
            expect(res.status).to.equal(400);
            expect(res.body.message)
              .to.match(/A user with this email already exists/);
            done();
          })
          .catch(done);
      });
    });

    describe('Test user authentication functionality', function () {
      let token;
      before(function (done) {
        testUtils.createUser(testUtils.testUserDetails)
          .then(function (res) {
            token = res.body.token;
            done();
          })
          .catch(done);
      });

      after(function (done) {
        testUtils.destroyTestUsers()
          .then(function () {
            done();
          })
          .catch(done);
      });

      it('should login a user with a name/password and return a token',
        function (done) {
          testUtils.login(testUtils.testUserDetails)
            .then(function (res) {
              expect(res.status).to.equal(200);
              expect(res.body.message).to.match(
                /Authentication successful/);
              expect(res.body.token).to.exist;
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });

      it('should require a password and name to login', function (done) {
        testUtils.login({})
          .then(function (res) {
            expect(res.status).to.equal(400);
            expect(res.body).to.be.instanceOf(Object);

            Object.keys(res.body).map(function (errorObj) {
              const key = errorObj;
              const msg = res.body[key];
              expect(key).to.match(/name|password/);
              expect(msg).to.eql('This field is required.');
            });
            done();
          })
          .catch(done);
      });

      it('should not allow logins with wrong name', function (done) {
        testUtils.login({
          name: 'somerandomthing',
          password: testUtils.testUserDetails.password
        }).then(function (res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.eql({
            message: 'Authentication failed. User not found.'
          });
          done();
        }).catch(done);
      });

      it('should not allow logins with wrong password', function (done) {
        testUtils.login({
          name: testUtils.testUserDetails.name,
          password: 'somerandomthing'
        }).then(function (res) {
          expect(res.status).to.equal(401);
          expect(res.body).to.eql({
            message: 'Incorrect name/password combination'
          });
          done();
        }).catch(done);
      });

      it('should restrict access to the API if a token is not provided',
        function (done) {
          request
            .get('/api/v.1/users/some/non-existent/route')
            .accept('application/json')
            .end(function (err, res) {
              expect(err).to.be.null;
              expect(res.status).to.equal(403);
              expect(res.body.message).to.eql('No access token provided.');
              done();
            });
        });

      it('should not allow requests with invalid tokens', function (done) {
        request
          .get('/api/v.1/users/some/non-existent/route')
          .accept('application/json')
          .set('x-access-token', 'somerandomthing')
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.status).to.equal(401);
            expect(res.body.message).to.eql('Failed to authenticate token.');
            done();
          });
      });
    });

  });
})();