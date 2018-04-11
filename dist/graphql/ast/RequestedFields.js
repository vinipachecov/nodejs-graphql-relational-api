"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlFields = require("graphql-fields");
const lodash_1 = require("lodash");
class RequestedFields {
    /**
     * Help us to fetch only what the client requests
     * @param info
     * @param options
     */
    getFields(info, options) {
        // return an array with the keys of the upper level of the object;
        let fields = Object.keys(graphqlFields(info));
        if (!options) {
            return fields;
        }
        //join the arrays if the keep attributes has something
        fields = (options.keep) ? lodash_1.union(fields, options.keep) : fields;
        return (options.exclude)
            ? lodash_1.difference(fields, options.exclude)
            : fields;
    }
}
exports.RequestedFields = RequestedFields;
