const { PubSub } = require("apollo-server");
const jwt = require("jsonwebtoken");

const env = require("../config/env.json");

const pubsub = new PubSub();

module.exports = context => {
  let token;

  if (context.req && context.req.headers.authorization) {
    token = context.req.headers.authorization;
  } else if (context.connection && context.connection.context.Authorization) {
    token = context.connection.context.Authorization;
  }

  try {
    const decodedToken = jwt.verify(token, env.jwtSecretKey);

    context.user = decodedToken;
  } catch (error) {
    console.log({ jwtVerifyError: error });
  }

  context.pubsub = pubsub;
  return context;
};
