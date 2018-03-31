/**
 * Generate a json token for each user
 */
const jwt = require('jsonwebtoken');

require('dotenv').config();

const generateJwt = function (id, username) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: id,
    name: username,
    exp: parseInt(expiry.getTime() / 1000, 10)
  }, process.env.secret);
}

module.exports = generateJwt;