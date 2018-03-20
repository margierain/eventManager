const rolesController = require('../controllers').rolesController;
const Role = require('../models').Role;

module.exports = (app) => {
  /**
   * List all roles in the system..
   */
  app.get('/api/v.1/roles', (req, res) => {
    Role.all((err, roles) => {
      if (err) {
        return res.send(err);
      }
      return res.status(200).send(roles);
    });
  })
};