import { GraphQLResolveInfo } from 'graphql';
import { DbConnection } from '../../../interfaces/DbConnectionIterface';
import { Transaction } from 'sequelize';
import { CommentInstance } from '../../../models/CommentModel';
import { handleError } from '../../../utils/utils';
export const commentResolvers = {

  Comment: {
    // non trivial resolvers
    user: (comment, {args}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      return db.User
      .findById(comment.get('user'))
      .catch(handleError);
    },
    post: (comment, {args}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      return db.Post
      .findById(comment.get('user'))
      .catch(handleError);
    },

  },

  Query: {
    commentsByPost: (parent, {postId, first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      postId = parseInt(postId);
      return db.Comment
      .findAll({
        where: {post: postId},
        limit: first,
        offset: offset
      })
      .catch(handleError);
    }
  },

  Mutation: {
    // createComment(input: CommentInput!): Comment
    // updateComment(id: ID!, input: CommentInput!): Comment
    // deleteComment(id: ID!): Boolean

    createComment: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment
          .create(input, {transaction: t});
      }).catch(handleError);
    },

    deleteComment: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {
          if (!comment) throw new Error(`COmment with id ${id} not found!`);
          // do the actual update
          return comment.update(input, {transaction: t});
        });
      }).catch(handleError);;
    },

    updateComment: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {
          if (!comment) throw new Error(`COmment with id ${id} not found!`);
          // do the actual update
          return comment.destroy({transaction: t})
            .then((comment) => !!comment);
        });
      }).catch(handleError);;
    },

  }
}