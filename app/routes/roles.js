const rolesController = require('../controllers').rolesController;
const Role = require('../models').Role;

module.exports = (router) => {
  /**
   * List all roles in the system..
   */
  router.get('/roles', (req, res) => {
    Role.all((err, roles) => {
      if (err) {
        return res.send(err);
      }
      return res.status(200).send(roles);
    });
  })
};