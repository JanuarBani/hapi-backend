const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

const generateToken = (userId) => {
  const secret = 'secret-key'; // Ganti dengan env variable di produksi
  return jwt.sign({ userId }, secret);
};

module.exports = { hashPassword, comparePassword, generateToken };
