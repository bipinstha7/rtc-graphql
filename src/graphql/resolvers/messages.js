const { UserInputError, AuthenticationError } = require("apollo-server");
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

        console.log({ aaaaaaaaaaaaaaaaA: from });
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
    sendMessage: async (_, { to, content }, { user }) => {
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

        return message;
      } catch (error) {
        console.log({ sendMessageError: error });
        throw error;
      }
    },
  },
};
