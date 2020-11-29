const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const { User, Message } = require("../../models");
const env = require("../../config/env.json");
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        let users = await User.findAll({
          attributes: ["username", "image_url", "createdAt"],
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map(u => {
          const latestMessage = allUserMessages.find(
            m => m.from === u.username || m.to === u.username
          );

          u.latestMessage = latestMessage;
          return u;
        });

        /**
         * Respective sql query for above calculation
         * 
         * SELECT DISTINCT ON(M.FROM, M.TO) 
            U.USERNAME, 
            M.FROM,
            M.TO,
            M.CONTENT
            FROM USERS U
            INNER JOIN MESSAGES M ON U.USERNAME = M.FROM
            OR U.USERNAME = M.TO
            WHERE U.USERNAME = 'bipin3'
            ORDER BY M.FROM, M.TO, M."createdAt" DESC; // order by should have distinct columns
         */

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

        const token = jwt.sign(
          { username, createdAt: user.createdAt },
          env.jwtSecretKey,
          {
            expiresIn: 60 * 60,
          }
        );

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
