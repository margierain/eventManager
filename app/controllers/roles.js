const Role = require('../models').Role;
const resolveError = require('../utils').resolveError;

function list(req, res) {
  return Role
    .all((err, roles) => {
      if (err) {
        return resolveError(err);
      }
      return res.status(200).send(roles);
    });
}

module.exports = { list };