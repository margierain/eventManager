const usersController = require('../controllers').usersController;
const customMiddleware = require('../middleware');

module.exports = (router) => {
  // Return a default response for the root url.
  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Event Management API' });
  });

  // Create a user
  router.post('/users', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['name', 'email', 'password']
    }
    ), usersController.create);

  // Login a user
  router.post('/users/login', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['name', 'password']
    }
    ), usersController.login);

  router.use('/', customMiddleware.authenticate);

  // Users Routes.
  require('./users')(router);

  require('./roles')(router);

  require('./events')(router);
};