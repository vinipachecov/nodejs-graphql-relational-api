"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
exports.commentResolvers = {
    Comment: {
        // non trivial resolvers
        user: (comment, { args }, { db }, info) => {
            return db.User
                .findById(comment.get('user'))
                .catch(utils_1.handleError);
        },
        post: (comment, { args }, { db }, info) => {
            return db.Post
                .findById(comment.get('user'))
                .catch(utils_1.handleError);
        },
    },
    Query: {
        commentsByPost: (parent, { postId, first = 10, offset = 0 }, { db }, info) => {
            postId = parseInt(postId);
            return db.Comment
                .findAll({
                where: { post: postId },
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        // createComment(input: CommentInput!): Comment
        // updateComment(id: ID!, input: CommentInput!): Comment
        // deleteComment(id: ID!): Boolean
        createComment: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(utils_1.handleError);
        },
        deleteComment: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment.findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`COmment with id ${id} not found!`);
                    // do the actual update
                    return comment.update(input, { transaction: t });
                });
            }).catch(utils_1.handleError);
            ;
        },
        updateComment: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment.findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`COmment with id ${id} not found!`);
                    // do the actual update
                    return comment.destroy({ transaction: t })
                        .then((comment) => !!comment);
                });
            }).catch(utils_1.handleError);
            ;
        },
    }
};
