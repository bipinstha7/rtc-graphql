const { ApolloServer } = require("apollo-server");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const { sequelize } = require("./models");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ctx => ctx,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);

  sequelize
    .authenticate()
    .then(() => console.log("DATABASE is ready"))
    .catch(err => console.log({ DATABASE_Error: err }));
});
