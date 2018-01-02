/**
 * Created by michael on 2/12/17.
 */
const fnArgs = require('fn-args');

module.exports = function() {
    const dependencies = {};
    const factories = {};
    const diContainer = {};

    diContainer.factory = (name, factory) => {
        factories[name] = factory;
    };

    diContainer.register = (name, dep) => {
        dependencies[name] = dep;
    };

    diContainer.get = (name) => {
        if (!dependencies[name]) {
            const factory = factories[name];
            dependencies[name] = factory &&
                diContainer.inject(factory);
            if(!dependencies[name]) {
                throw new Error('Cannot find module: ' + name);
            }
        }
        return dependencies[name];
    };

    diContainer.inject = (factory) => {
        "use strict";
        const args = fnArgs(factory).map(dependency => diContainer.get(dependency));
        return factory.apply(null, args);
    };

    return diContainer;
};