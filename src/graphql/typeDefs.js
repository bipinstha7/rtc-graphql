const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: Int!
    username: String!
    email: String
    createdAt: String!
    token: String
    image_url: String
    latestMessage: Message
  }

  type Message {
    uuid: String!
    id: Int!
    content: String!
    from: String!
    to: String!
    createdAt: String!
    reactions: [Reaction]
  }

  type Reaction {
    id: Int!
    content: String!
    createdAt: String!
    message: Message!
    user: User!
  }

  type Query {
    getUsers: [User]
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirm_password: String!
    ): User!

    sendMessage(to: String!, content: String!): Message!

    reactToMessage(id: Int!, content: String!): Reaction!
  }

  type Subscription {
    newMessage: Message!
    newReaction: Message!
  }
`;
