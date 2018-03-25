"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = require("./resources/user/user.schema");
const post_schema_1 = require("./resources/post/post.schema");
const comment_schema_1 = require("./resources/comment/comment.schema");
const Query = `
  type Query {
    ${user_schema_1.userQueries}
    ${post_schema_1.postQueries}
    ${comment_schema_1.commentQueries}
  }
`;
exports.Query = Query;
