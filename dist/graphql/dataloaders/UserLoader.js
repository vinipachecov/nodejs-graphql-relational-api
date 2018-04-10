"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserLoader {
    static batchUsers(User, params, requestedFields) {
        let ids = params.map(param => param.key);
        return Promise.resolve(User.findAll({
            where: { id: { $in: ids } },
            attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['posts'] })
        }));
    }
}
exports.UserLoader = UserLoader;
