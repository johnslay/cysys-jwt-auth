

const uid_regex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const uuid = require('uuid/v4');


module.exports  = (databases, logger, trust) => {
    "use strict";

    const trusted = databases.trustedDB;
    //const trusted = tdb.sublevel('trusted');
    const trustedDBAccess = {};


    const get_all_trusts = () => {
        return new Promise((resolve, reject) => {
            const trust_list = [];
            trusted.createValueStream()
                .on('data', (data) => {
                    trust_list.push(data);
                })
                .on('error', (err) => {
                    reject(new Error('Error getting trusted list from database - ' + err));
                })
                .on('end', () => {
                    resolve(trust_list);
                });
        });
    };

    const get_trust = (uid) => {
        return new Promise((resolve, reject) => {
            trusted.get(uid, function(err,data) {
                if (err) {
                    if (err.notFound){
                        logger.applog.debug('Trust ' + uid + ' not found.');
                        reject(new Error('Trust ' + uid + ' not found.'));
                    } else {
                        logger.applog.error('Unknown Error getting ' + uid + ': ' + err.message);
                        reject(new Error('Error - ' + err));
                    }
                } else {
                    resolve(data);
                }
            });
        });
    };

    const add_trust = (uid, trustObject) => {
        return new Promise((resolve, reject) => {
            trusted.put(uid, trustObject, function(err){
                if (err){
                    reject(new Error(err));
                } else {
                    resolve(uid);
                }
            })
        });
    };

    const remove_trust = (uid) => {
        return new Promise((resolve, reject) => {
            trusted.del(uid, function(err) {
                if (err){
                    reject(new Error(err));
                }
                else {
                    resolve();
                }
            })
        })
    };

    const update_trust = (trustObj) => {
        return new Promise((resolve, reject) => {
            remove_trust(trustObj.uid)
                .then(() => add_trust(trustObj.uid, trustObj))
                .then(() => resolve())
                .catch(perror => {
                    logger.applog.error('Error updating trust ' + trustObj.appname + ':  ' + perror);
                    reject(perror);
                })
        })
    };

    const get_trust_id = (appname) => {
        return new Promise((resolve, reject) => {
            get_all_trusts()
                .then(result => {
                    let uid = '';
                    for (let t of result){
                        if (t.appname === appname) {
                            uid = t.uid;
                            break;
                        }
                    }
                    if(uid.length > 1){
                        resolve(uid);
                    } else {
                        logger.applog.debug('Trust for ' + appname + ' not found.');
                        reject(new Error('Trust for ' + appname + ' not found.'));
                    }
                })
                .catch(err =>{
                    logger.applog.error('Unknown Error getting trust id for ' + appname + ': ' + err.message);
                    reject(new Error('Error - ' + err.message));
                });
        });
    };

    const check_trust_exists = (appname) => {
        return new Promise((resolve, reject) => {
            get_trust_id(appname)
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    if (err.message.toLowerCase().includes('not found')){
                        resolve(false);
                    } else {
                        reject(err);
                    }
                });
        });
    };

    const create_new_trust = (appname, poc, pocemail, lifetime, uid) => {
        return new Promise((resolve, reject) => {
            let eflag = true;
            const trustObj = {};
            if (uid){
                if (!uid_regex.test(uid)){
                    reject(new Error('Malformed UID'));
                    eflag = false;
                } else {
                    trustObj.uid = uid;
                }
            } else {
                trustObj.uid = uuid();
            }

            if (eflag){
                trustObj.uid = uid ? uid : uuid();
                trustObj.appname = appname;
                trustObj.poc = poc;
                trustObj.pocemail = pocemail;
                trustObj.lifetime = lifetime;
                trustObj.created = new Date().getTime();
                trustObj.starttime = trustObj.created;

                resolve(trustObj);
            }
        });
    };


    trustedDBAccess.get_trust_id = (appname) => {
        return new Promise((resolve, reject) => {
            get_trust_id(appname)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    logger.applog.error('Error getting trust id for \'' + appname + '\'');
                    reject(err);
                });
        });
    };

    // Creates a new trust
    // Will fail if application already exists
    // Returns UID of new trust
    trustedDBAccess.create_trust = (appname, poc, pocemail, lifetime, uid) => {
        return new Promise(function(resolve, reject){
            if (appname && poc && pocemail) {
                check_trust_exists(appname)
                    .then((result) => {
                        if (!result) {
                            create_new_trust(appname, poc, pocemail, lifetime, uid)
                                .then((result) => add_trust(result.uid, result))
                                .then((result) => {
                                    resolve(result)
                                })
                                .catch((perror) => {
                                    logger.applog.error('Error creating trust for ' + appname + ' account:  ' + perror.message);
                                    reject(perror);
                                })
                        } else {
                            reject(new Error('Trust for \'' + appname + '\' already exists'));
                        }
                    })
                    .catch(perror => {
                        reject(new Error('Trust for \'' + appname + '\' already exists'));
                        reject(perror);
                    });
            } else {
                logger.applog.error('Error creating trust for ' + appname + ' account.  Madatory field missing');
                reject(new Error('Madatory field missing'));
            }

        });
    };

    // Get trust info
    trustedDBAccess.retrieve_trust = (uid) => {
        return new Promise(function(resolve, reject){
            if (!uid || uid === ''){
                logger.applog.error('Missing trust ID');
                reject('Missing trust ID');
            } else {
                get_trust(uid)
                    .then(resolve)
                    .catch((perror) => {
                        logger.applog.error('Error getting trust with id ' + uid ? uid : 'Unknown' + ' ' + perror.message);
                        reject(new Error(perror.message));
                    })
            }
        })
    };

    // Get trust info
    trustedDBAccess.retrieve_all_trusts = (uid) => {
        return new Promise(function(resolve, reject){
            get_all_trusts()
                .then(resolve)
                .catch((perror) => {
                    logger.applog.error('Error getting trust with id ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Updates an existing trust
    trustedDBAccess.update_trust = (uid, appname, poc, pocemail, lifetime) => {
        return new Promise((resolve, reject) => {
            get_trust(uid)
                .then(result => {
                    result.appname = appname ? appname : result.appname;
                    result.poc = poc ? poc : result.poc;
                    result.pocemail = pocemail ? pocemail : result.pocemail;
                    result.lifetime = lifetime ? lifetime : result.lifetime;
                    return result;
                })
                .then(update_trust)
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating trust ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    // Updates an existing trust
    trustedDBAccess.update_trust_lifetime = (uid) => {
        return new Promise((resolve, reject) => {
            get_trust(uid)
                .then(result => {
                    result.starttime = new Date().getTime() + 1;
                    return result;
                })
                .then(result => {
                    update_trust(result)
                        .then(() => {
                            resolve(true)
                        });
                })
                .catch((perror) => {
                    logger.applog.error('Error updating trust ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    // Remove user from Database
    trustedDBAccess.delete_trust = (uid) => {
        return new Promise((resolve, reject) => {
            remove_trust(uid)
                .then(() => {
                    resolve(true);
                })
                .catch((perror) => {
                    logger.applog.error('Error deleting trust ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    trustedDBAccess.clear_all_trusts = () => {
        return new Promise((resolve, reject) => {
            let pq = [];
            get_all_trusts()
                .then(result => {
                    for (let t of result){
                        pq.push(remove_trust(t.uid));
                    }

                    if (pq.length > 0){
                        Promise.all(pq)
                            .then(() => {
                                resolve(true);
                            })
                            .catch(perr => {
                                logger.applog.error('Error Deleting Trusts: ' + perr.message);
                                reject(perr);
                            })
                    } else {
                        resolve(true);
                    }
                })
                .catch(err => {
                    logger.applog.error('Error getting trusts to remove');
                    reject(err);
                });
        });
    };

    return trustedDBAccess;
};

