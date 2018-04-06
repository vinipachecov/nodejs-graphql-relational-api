import { GraphQLResolveInfo } from 'graphql';
import { DbConnection } from '../../../interfaces/DbConnectionIterface';
import { Transaction } from 'sequelize';
import { CommentInstance } from '../../../models/CommentModel';
import { handleError, throwError } from '../../../utils/utils';
import { compose } from '../../../graphql/composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';
import { DataLoaders } from '../../../interfaces/DataLoadersInterface';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';


export const commentResolvers = {

  Comment: {
    // non trivial resolvers
    user: (comment, {args}, {db, dataloaders: { userLoader }}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
      return userLoader.load(comment.get('user'));            
    },
    post: (comment, {args}, {db, dataloaders: { postLoader }}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
      postLoader
      .load({key: comment.get('post'), info})
        .catch(handleError);
    },

  },

  Query: {
    commentsByPost: (parent, {postId, first = 10, offset = 0}, context: ResolverContext, info: GraphQLResolveInfo) => {
      postId = parseInt(postId);
      return context.db.Comment
      .findAll({
        where: {post: postId},
        limit: first,
        offset: offset,
        attributes: context.requestedFields.getFields(info)
      })
      .catch(handleError);
    }
  },

  Mutation: {
    // createComment(input: CommentInput!): Comment
    // updateComment(id: ID!, input: CommentInput!): Comment
    // deleteComment(id: ID!): Boolean

    createComment: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
      input.user = authUser.id;
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment
          .create(input, {transaction: t});
      }).catch(handleError);
    }),

    updateComment: compose(...authResolvers)((parent, {id, input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {      
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {
          throwError(!comment, `comment with id ${id} not found!`);
          throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);                    
          // do the actual update
          
          return comment.update(input, {transaction: t});
        });
      }).catch(handleError);;
    }),

    deleteComment: compose(...authResolvers)((parent, {id,}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
        .then((comment: CommentInstance) => {                    
          throwError(!comment, `comment with id ${id} not found!`);
          throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit posts you created.`);                    
          // do the actual update
          return comment.destroy({transaction: t})
            .then((comment) => !!comment);
        });
      }).catch(handleError);;
    })
  }
}