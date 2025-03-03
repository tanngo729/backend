// backend/helpers/token.service.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn, secret) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, secret, { expiresIn });
};

const generateAuthTokens = async (user) => {
  const accessToken = generateToken(user._id, '15m', process.env.JWT_SECRET);
  const refreshToken = generateToken(user._id, '7d', process.env.JWT_REFRESH_SECRET);
  return { accessToken, refreshToken };
};

module.exports = { generateAuthTokens };
