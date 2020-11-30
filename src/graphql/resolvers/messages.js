const {
  UserInputError,
  AuthenticationError,
  withFilter,
} = require("apollo-server");
const { Op } = require("sequelize");

const { User, Message } = require("../../models");

module.exports = {
  Query: {
    getMessages: async (_, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const fromUser = await User.findOne({ where: { username: from } });

        if (!fromUser) {
          throw new UserInputError("User not found");
        }

        const messages = await Message.findAll({
          where: {
            [Op.or]: [
              { from, to: user.username },
              { from: user.username, to: from },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (error) {
        console.log({ getMessagesError: error });

        throw error;
      }
    },
  },
  Mutation: {
    sendMessage: async (_, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        if (!content.trim()) {
          throw new UserInputError("Message is empty");
        }

        /* Sending message to ourself is functionality these days */
        // if (to === user.username) {
        //   throw new UserInputError("You can't send message to yourself");
        // }

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError("User not found");
        }

        const payload = {
          from: user.username,
          to,
          content,
        };
        const message = await Message.create(payload);

        pubsub.publish("NEW_MESSAGE_ADDED", { newMessage: message });

        return message;
      } catch (error) {
        console.log({ sendMessageError: error });
        throw error;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { user, pubsub }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");

          return pubsub.asyncIterator(["NEW_MESSAGE_ADDED"]);
        },
        ({ newMessage }, _, { user }) => {
          if (
            newMessage.from === user.username ||
            newMessage.to === user.username
          ) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
