module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("users", [
      {
        username: "John",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Bob",
        email: "bob@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Alice",
        email: "alice@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
