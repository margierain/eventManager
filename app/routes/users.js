const usersController = require('../controllers').usersController;
const customMiddleware = require('../middleware');

module.exports = (router) => {
  /**
   * Get all users in the system. Admin access only.
   */
  router.get('/users',
    customMiddleware.isAdminOrOwnProfile, usersController.list);

  /**
   * Get a logged in user's profile.
   */
  router.get('/users/:nameOrId', usersController.retrieve);

  /**
   * Update a user's profile.
   */
  router.put('/users/:nameOrId',
    customMiddleware.isAdminOrOwnProfile, usersController.update);

  /**
   * Delete a user account.
   */
  router.delete('/users/:nameOrId',
    customMiddleware.isAdminOrOwnProfile, usersController.deleteUser);
};
