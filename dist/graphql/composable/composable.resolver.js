"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compose(...funcs) {
    if (funcs.length === 0) {
        // if no functions return the identity
        return o => {
            return o;
        };
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    const last = funcs[funcs.length - 1];
    return (f) => {
        let result = last(f);
        for (let index = funcs.length - 2; index >= 0; index--) {
            const fn = funcs[index];
            result = fn(result);
        }
        return result;
    };
}
exports.compose = compose;
