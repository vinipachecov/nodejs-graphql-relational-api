import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';

import { Query } from './query';
import { Mutation } from './mutation'
import { userTypes } from './resources/user/user.schema';
import { postTypes } from './resources/post/post.schema';
import { commentTypes } from './resources/comment/comment.schema';

//Resolvers
import { commentResolvers } from './resources/comment/comment.resolvers';
import { postResolvers } from './resources/post/post.resolvers';
import { userResolvers } from './resources/user/user.resolvers';

// need to have all the queries we've done (posts, comments, users)
// Merge all of them based on their common properties of each object (mutations, queries..)    
const resolvers = merge(
  commentResolvers,
  postResolvers,
  userResolvers
);

const SchemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;

//combina os tipos definidos e os resolvers que tratam tipos
export default makeExecutableSchema({ 
  typeDefs: [
    SchemaDefinition,
    Query,
    Mutation,
    postTypes,
    userTypes,
    commentTypes,
  ],  
  resolvers
});