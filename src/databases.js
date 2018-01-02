/**
 * Created by michael on 2/12/17.
 */
const levelup = require('levelup');
const sublevel = require('level-sublevel');

module.exports = (authdb_path, trusteddb_path, configdb_path, refresh_tokendb_path, access_tokendb_path, logger) => {
    "use strict";
    logger.applog.debug('Loading databases...');
    const databases = {};

    databases.authDB = sublevel(levelup(authdb_path, {valueEncoding: 'json'}));
    databases.trustedDB = sublevel(levelup(trusteddb_path, {valueEncoding: 'json'}));
    databases.configDB = sublevel(levelup(configdb_path, {valueEncoding: 'json'}));
    databases.refreshTokenDB = levelup(refresh_tokendb_path, {db: require('memdown')});
    databases.accessTokenDB = levelup(access_tokendb_path, {db: require('memdown')});

    logger.applog.debug('Databases loaded');

    return databases;
};