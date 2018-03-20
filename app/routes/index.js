const usersController = require('../controllers').usersController;
const customMiddleware = require('../middleware');

module.exports = (app) => {
  // Return a default response for the root url.
  app.get('/api/v.1/', (req, res) => {
    res.json({ message: 'Welcome to Event Management API' });
  });

  // Create a user
  app.post('/api/v.1/users', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['name', 'email', 'password']
    }
    ), usersController.create);

  // Login a user
  app.post('/api/v.1/users/login', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['name', 'password']
    }
    ), usersController.login);

  app.use('/api/v.1/', customMiddleware.authenticate);

  // Users Routes.
  require('./users')(app);

  require('./roles')(app);
};