const userResolvers = require("./users");
const messageResolvers = require("./messages");
const { User, Message } = require("../../models");

module.exports = {
  Message: {
    createdAt: parent => parent.createdAt.toISOString(),
  },
  User: {
    createdAt: parent => parent.createdAt.toISOString(),
  },
  Reaction: {
    createdAt: parent => parent.createdAt.toISOString(),
    message: async parent => await Message.findByPk(parent.message_id),
    user: async parent =>
      await User.findByPk(parent.user_id, {
        attributes: ["username", "image_url", "createdAt"],
      }),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
