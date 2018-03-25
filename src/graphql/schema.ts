import { makeExecutableSchema } from 'graphql-tools';

import { Query } from './query';
import { Mutation } from './mutation'
import { userTypes } from './resources/user/user.schema';
import { postTypes } from './resources/post/post.schema';
import { commentTypes } from './resources/comment/comment.schema';
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
    commentTypes
  ],  
});