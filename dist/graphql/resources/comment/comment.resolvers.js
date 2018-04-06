"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
const composable_resolver_1 = require("../../../graphql/composable/composable.resolver");
const auth_resolver_1 = require("../../composable/auth.resolver");
exports.commentResolvers = {
    Comment: {
        // non trivial resolvers
        user: (comment, { args }, { db, dataloaders: { userLoader } }, info) => {
            return userLoader.load(comment.get('user'));
        },
        post: (comment, { args }, { db, dataloaders: { postLoader } }, info) => {
            postLoader
                .load({ key: comment.get('post'), info })
                .catch(utils_1.handleError);
        },
    },
    Query: {
        commentsByPost: (parent, { postId, first = 10, offset = 0 }, context, info) => {
            postId = parseInt(postId);
            return context.db.Comment
                .findAll({
                where: { post: postId },
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        // createComment(input: CommentInput!): Comment
        // updateComment(id: ID!, input: CommentInput!): Comment
        // deleteComment(id: ID!): Boolean
        createComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(utils_1.handleError);
        }),
        updateComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { id, input }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment.findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `comment with id ${id} not found!`);
                    utils_1.throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);
                    // do the actual update
                    return comment.update(input, { transaction: t });
                });
            }).catch(utils_1.handleError);
            ;
        }),
        deleteComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((parent, { id, }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment.findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `comment with id ${id} not found!`);
                    utils_1.throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);
                    // do the actual update
                    return comment.destroy({ transaction: t })
                        .then((comment) => !!comment);
                });
            }).catch(utils_1.handleError);
            ;
        })
    }
};
