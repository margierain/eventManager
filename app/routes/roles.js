const rolesController = require('../controllers').rolesController;

module.exports = (app) => {
  /**
   * List all roles in the system..
   */
  app.get('/api/v.1/roles', rolesController.list);
};