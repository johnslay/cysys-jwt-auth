
const dayMS = 86400000;


module.exports = (user_db_access, trusted_db_access, token_db_access, trust, logger) => {
    "use strict";

    const accessUtils = {};



    accessUtils.check_access_db = (tokenObj) => {
        return new Promise(function(resolve, reject){
            token_db_access.token_exists(tokenObj)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                })
        })
    };

    accessUtils.create_token_record = (tokenObj, user, expires) => {
        return new Promise(function(resolve, reject){
            token_db_access.create_record(tokenObj, user, expires)
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        })
    };

    accessUtils.remove_expired_token = (tokenObj) => {
        return new Promise(function(resolve, reject){
            token_db_access.delete_record(tokenObj)
                .then(resolve())
                .catch(err => {
                    reject(err);
                })
        })
    };

    accessUtils.check_apiKey = (apiKeyObj) => {
        return new Promise(function(resolve, reject){
            trusted_db_access.retrieve_trust(apiKeyObj)
                .then(result => {
                    let tdif = new Date().getTime();
                    tdif = tdif - result.starttime;
                    let tspan = tdif / dayMS;
                    if (tspan > trust.lifetime){
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                })
                .catch(perror => {
                    resolve(false);
                })
        })
    };

    return accessUtils;
}
