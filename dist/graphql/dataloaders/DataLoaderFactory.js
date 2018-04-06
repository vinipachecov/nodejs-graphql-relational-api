"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataLoader = require("dataloader");
const UserLoader_1 = require("./UserLoader");
const PostLoader_1 = require("./PostLoader");
class DataLoaderFactory {
    constructor(db, requestedFields) {
        this.db = db;
        this.requestedFields = requestedFields;
    }
    getLoaders() {
        return {
            userLoader: new DataLoader((params) => UserLoader_1.UserLoader.batchUsers(this.db.User, params, this.requestedFields), { cacheKeyFn: (param) => param.key }),
            postLoader: new DataLoader((params) => PostLoader_1.PostLoader.batchPosts(this.db.Post, params, this.requestedFields), { cacheKeyFn: (param) => param.key })
        };
    }
}
exports.DataLoaderFactory = DataLoaderFactory;
