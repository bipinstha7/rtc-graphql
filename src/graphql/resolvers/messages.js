const {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
  withFilter,
} = require("apollo-server");
const { Op } = require("sequelize");

const { User, Message, Reaction } = require("../../models");

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
          include: [{ model: Reaction, as: "reactions" }],
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
    reactToMessage: async (_, { id, content }, { user, pubsub }) => {
      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      const reactions = ["👍", "😆", "❤️", "😢", "😡"];

      try {
        if (!reactions.includes(content)) {
          throw new UserInputError("Invalid Reaction");
        }

        const username = user.username;

        const hasUser = await User.findOne({ where: { username } });

        if (!hasUser) {
          throw new AuthenticationError("Unauthenticated");
        }

        const message = await Message.findOne({ where: { id } });

        if (!message) {
          throw new UserInputError("Message not found");
        }

        if (message.from !== user.username && message.to !== user.username) {
          throw new ForbiddenError("Unauthorized");
        }

        let reaction = await Reaction.findOne({
          where: { message_id: message.id, user_id: hasUser.id },
          attributes: ["id", "content", "createdAt", "message_id", "user_id"],
        });

        if (reaction) {
          reaction.content = content;
          await reaction.save();
        } else {
          const payload = {
            message_id: message.id,
            user_id: hasUser.id,
            content,
          };
          reaction = await Reaction.create(payload);
        }

        pubsub.publish("NEW_REACTION_ADDED", { newReaction: reaction });

        return reaction;
      } catch (error) {
        console.log({ reactToMessageError: error });
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
    newReaction: {
      subscribe: withFilter(
        (_, __, { user, pubsub }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");

          return pubsub.asyncIterator(["NEW_REACTION_ADDED"]);
        },
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage();

          if (message.from === user.username || message.to === user.username) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
