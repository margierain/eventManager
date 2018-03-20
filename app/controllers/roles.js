const Role = require('../models').Role;

function list(req, res) {
  Role.all((err, roles) => {
    if (err) {
      return res.send(err);
    }
    return res.status(200).send(roles);
  });
}

module.exports = list;