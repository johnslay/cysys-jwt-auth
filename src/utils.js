

module.exports = (logger) => {
    "use strict";
    const utils = {};

    utils.formatError = (code, type, message) => {
        let result = {};
        result.code = code;
        result.type = type;
        result.message = message;

        return result;
    };

    return utils;
};