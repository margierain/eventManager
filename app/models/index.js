const User = require('./users');
const Role = require('./roles');

Role.initialize() // Create default roles.
  .catch(() => { });

module.exports = { User, Role };