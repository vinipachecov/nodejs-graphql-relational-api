"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = require("./resources/user/user.schema");
const post_schema_1 = require("./resources/post/post.schema");
const comment_schema_1 = require("./resources/comment/comment.schema");
const Mutation = `
  type Mutation {
    ${user_schema_1.userMutations}
    ${post_schema_1.postMutations}
    ${comment_schema_1.commentMutations}
  }
`;
exports.Mutation = Mutation;
