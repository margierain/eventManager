const User = require('./users');
const Role = require('./roles');
const Event = require('./events');

Role.initialize() // Create default roles.
  .catch(() => { });

module.exports = { User, Role, Event };