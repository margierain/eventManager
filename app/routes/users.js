const usersController = require('../controllers').usersController;
const customMiddleware = require('../middleware');

module.exports = (app) => {
  /**
   * Get all users in the system. Admin access only.
   */
  app.get('/api/v.1/users',
    customMiddleware.isAdminOrOwnProfile, usersController.list);

  /**
   * Get a logged in user's profile.
   */
  app.get('/api/v.1/users/:nameOrId', usersController.retrieve);

  /**
   * Update a user's profile.
   */
  app.put('/api/v.1/users/:nameOrId',
    customMiddleware.isAdminOrOwnProfile, usersController.update);

  /**
   * Delete a user account.
   */
  app.delete('/api/v.1/users/:nameOrId',
    customMiddleware.isAdminOrOwnProfile, usersController.deleteUser);
};
