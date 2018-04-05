"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verify_token_resolver_1 = require("./verify-token.resolver");
exports.authResolver = (resolver) => {
    return (parent, args, context, info) => {
        if (context.authUser || context.authorization) {
            return resolver(parent, args, context, info);
        }
        throw new Error('Unauthorized! Token not provided!');
    };
};
exports.authResolvers = [exports.authResolver, verify_token_resolver_1.verifyTokenResolver];
