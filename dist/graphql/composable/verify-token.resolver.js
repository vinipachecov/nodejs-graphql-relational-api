"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const utils_1 = require("../../utils/utils");
exports.verifyTokenResolver = (resolver) => {
    return (parent, args, context, info) => {
        // const token: string = context.authorization ? context.authorization.split(' ')[1] : undefined;
        const token = context.authorization.split(' ')[1];
        return jwt.verify(token, utils_1.JWT_SECRET, (err, decoded) => {
            if (!err) {
                return resolver(parent, args, context, info);
            }
            throw new Error(`${err.name}: ${err.message}`);
        });
    };
};
