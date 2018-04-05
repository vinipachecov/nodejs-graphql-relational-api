"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
const auth_resolver_1 = require("../../composable/auth.resolver");
exports.postResolvers = {
    Post: {
        author: (post, { id }, { db }, info) => {
            return db.Post
                .findById(post.get('author'))
                .catch(utils_1.handleError);
        },
        comments: (post, { first = 10, offset = 0 }, { db }, info) => {
            return db.Comment
                .findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset
            }).catch(utils_1.handleError);
        },
    },
    Query: {
        posts: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                limit: first,
                offset: offset
            }).catch(utils_1.handleError);
        },
        post: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.Post
                .findById(id)
                .then((post) => {
                utils_1.throwError(!post, `POst with id ${id} not found!`);
                return post;
            }).catch(utils_1.handleError);
            ;
        }
    },
    Mutation: {
        createPost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t) => {
                return db.Post
                    .create(input, { transaction: t });
            }).catch(utils_1.handleError);
        }),
        updatePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { id, input }, { db, authUser }, info) => {
            //id do post
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post.findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post with id ${id} not found!`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts you created.`);
                    input.author = authUser.id;
                    return post.update(input, { transaction: t });
                });
            }).catch(utils_1.handleError);
        }),
        deletePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { id }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post.findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `POst with id ${id} not found!`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts you created.`);
                    return post.destroy({ transaction: t })
                        .then(post => !!post);
                });
            }).catch(utils_1.handleError);
        })
    }
};
