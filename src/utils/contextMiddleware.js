const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const env = require("../config/env.json");

module.exports = context => {
  const token = context.req.headers.authorization;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, env.jwtSecretKey);

      context.user = decodedToken;
    } catch (error) {
      return null;
    }
  }

  return context;
};
