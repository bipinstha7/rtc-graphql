const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const env = require("../config/env.json");
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getUsers: async (_, __, { req }) => {
      try {
        const token = req.headers.authorization;
        if (!token) {
          throw new AuthenticationError("Unauthenticated");
        }

        let decodedToken;
        try {
          decodedToken = jwt.verify(token, env.jwtSecretKey);
        } catch (error) {
          throw new AuthenticationError("Unauthenticated");
        }

        const users = await User.findAll({
          where: { username: { [Op.ne]: decodedToken.username } },
        });
        return users;
      } catch (error) {
        console.log({ getUsersError: error });
        throw error;
      }
    },
    login: async (_, args, __, info) => {
      const { username, password } = args;

      if (username.trim() === "" || password === "") {
        throw "username and password required";
      }

      try {
        /**
         * Dynamic attributes
         *
         * This is not the best approach for this kind of api
         * but it shows the way it can also be done! :)
         */

        const fields = info.fieldNodes[0].selectionSet.selections;
        let attributes = fields
          .map(field => field.name.value)
          .filter(attr => attr !== "token" && attr !== "__typename"); // apollo client auto adds __typename
        attributes = [...attributes, "password"];

        const user = await User.findOne({
          where: { username },
          attributes,
        });

        if (!user) {
          throw "invalid username/password.";
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          throw "invalid username/password.";
        }

        const token = jwt.sign({ username }, env.jwtSecretKey, {
          expiresIn: 60 * 60,
        });

        /*  {...user, token} doesn't work as user has prototypes or is prototype
         */

        /**
         * {...user, token} doesn't work as user has prototypes or is prototype
         *
         * but can do as {...user.toJSON(), token}
         */

        user.token = token;
        return user;
      } catch (error) {
        console.log({ loginError: error });
        throw new UserInputError("invalid input", { error });
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirm_password } = args;
      let errors = {};

      try {
        if (!username.trim()) {
          errors.username = "Username is required";
        }
        if (!email.trim()) {
          errors.email = "Email is required";
        }
        if (!password.trim()) {
          errors.password = "Password is required";
        }
        if (!confirm_password.trim()) {
          errors.confirm_password = "Confirm password is required";
        }

        if (password !== confirm_password) {
          errors.confirm_password = "Confirm password not matched";
        }

        /* Instead get error from database  */

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
