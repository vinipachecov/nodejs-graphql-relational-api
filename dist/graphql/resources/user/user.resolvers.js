"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
const composable_resolver_1 = require("../../../graphql/composable/composable.resolver");
const auth_resolver_1 = require("../../../graphql/composable/auth.resolver");
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        },
    },
    Query: {
        users: (parent, { first = 10, offset = 0 }, { db }, info) => {
            //retornar uma lista de usuários
            // fazendo um select
            return db.User
                .findAll({
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        },
        user: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.User.findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found`);
                return user;
            }).catch(utils_1.handleError);
        },
        currentUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, args, { db, authUser }, info) => {
            return db.User.findById(authUser.id)
                .then((user) => {
                utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                return user;
            }).catch(utils_1.handleError);
        })
    },
    Mutation: {
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .create(input, { transaction: t });
            }).catch(utils_1.handleError);
            ;
        },
        updateUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User.findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.update(input, { transaction: t });
                });
            }).catch(utils_1.handleError);
        }),
        updateUserPassword: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User.findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.update(input, { transaction: t })
                        .then((user) => !!user);
                });
            }).catch(utils_1.handleError);
        }),
        deleteUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, args, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found`);
                    return user.destroy({ transaction: t })
                        .then(user => !!user);
                });
            }).catch(utils_1.handleError);
        })
    }
};
