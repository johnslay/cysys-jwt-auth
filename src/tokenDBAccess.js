

module.exports  = (databases, logger) => {
    "use strict";

    const tokens = databases.accessTokenDB;
    //const tokens = tdb.sublevel('tokens');
    const tokenDBAccess = {};


    tokenDBAccess.create_record = (token, user, expires) => {
        return new Promise((resolve, reject) => {

            let tokenObj = {};
            tokenObj.token = token;
            tokenObj.created = new Date().getTime();
            tokenObj.user = user;
            tokenObj.expires = expires;

            tokens.put(token, tokenObj, function(err){
                if (err){
                    reject(new Error(err));
                } else {
                    resolve();
                }
            })
        });
    };

    tokenDBAccess.token_exists = (token) => {
        return new Promise((resolve, reject) => {
            tokens.get(token, function(err,data) {
                if (err) {
                    if (err.notFound){
                        resolve(false);
                    } else {
                        logger.applog.error('Unknown Error getting token: ' + err);
                        reject(new Error('Error - ' + err));
                    }
                } else {
                    resolve(true);
                }
            });
        });
    };

    tokenDBAccess.retrieve_record = (token) => {
        return new Promise((resolve, reject) => {
            tokens.get(token, function(err,data) {
                if (err) {
                    if (err.notFound){
                        logger.applog.debug('Token not found.');
                        reject(new Error('Token not found.'));
                    } else {
                        logger.applog.error('Unknown Error getting token: ' + err);
                        reject(new Error('Error - ' + err));
                    }
                } else {
                    resolve(data);
                }
            });
        });
    };

    tokenDBAccess.delete_record = (token) => {
        return new Promise((resolve, reject) => {
            tokens.del(token, function(err) {
                if (err){
                    reject(new Error(err));
                }
                else {
                    resolve();
                }
            })
        })
    };

    tokenDBAccess.get_all_records = () => {
        return new Promise((resolve, reject) => {
            const token_list = [];
            tokens.createValueStream()
                .on('data', (data) => {
                    token_list.push(data);
                })
                .on('error', (err) => {
                    reject(new Error('Error getting token list - ' + err));
                })
                .on('end', () => {
                    resolve(token_list);
                });
        })
    };


    return tokenDBAccess;
};