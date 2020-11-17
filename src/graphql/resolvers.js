const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");
const { User } = require("../models");

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        console.log({ getUsersError: error });
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};

      try {
        if (!username.trim()) {
          errors.username = "Username is required";
        }
        if (!email.trim()) {
          errors.email = "Email is required";
        }
        if (!password.trim()) {
          errors.paassword = "Password is required";
        }
        if (!confirmPassword.trim()) {
          errors.confirmPassword = "Confirm password is required";
        }

        if (password !== confirmPassword) {
          errors.confirmPassword = "Confirm password not matched";
        }

        /* Get error from database  */

        // const isUserExists = await User.findOne({ where: { username } });

        // if (isUserExists) {
        //   errors.username = "Username is taken";
        // }

        // const isEmailExists = await User.findOne({ where: { email } });

        // if (isEmailExists) {
        //   errors.email = "Email is taken";
        // }

        if (Object.keys(errors).length) {
          throw errors;
        }

        password = await bcrypt.hash(password, 10);

        const payload = {
          username,
          email,
          password,
        };
        const user = await User.create(payload);

        return user;
      } catch (error) {
        console.log({ registerError: error.errors || error });

        if (error.name === "SequelizeUniqueConstraintError") {
          error.errors.forEach(
            err => (errors[err.path] = `${err.path} is already taken.`)
          );
        }

        if (error.name === "SequelizeValidationError") {
          error.errors.forEach(err => (errors[err.path] = err.message));
        }

        throw new UserInputError("invalid input", { errors });
      }
    },
  },
};
