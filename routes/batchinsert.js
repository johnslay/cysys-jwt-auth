const express = require('express');
const router = express.Router();



module.exports = (user_db_access, trusted_db_access, logger, hash_pass, pass_complexity, trust, utils) => {
    "use strict";

    const process_user = (userObj, pass) => {
        return new Promise((resolve, reject) => {
            if(!pass){
                reject(new Error('User default password required for non-admin users'))
            } else {
                pass_complexity.checkUserPassword(pass,userObj.username)
                    .then(() => {
                        hash_pass.hashPassword(pass)
                            .then(result => {
                                user_db_access.create_user(userObj.title, userObj.alias, userObj.firstName, userObj.lastName, userObj.emailAddress, true, result, true, false, userObj.uid)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch(perr => {
                                        logger.applog.error('Error adding user account from batch: ' + perr.message);
                                        reject(perr);
                                    });
                            })
                            .catch(perr => {
                                logger.applog.error('Error adding user account from batch: ' + perr.message);
                                reject(perr);
                            });
                    })
                    .catch(perr => {
                        logger.applog.error('Error checking default user password from batch: ' + perr.message);
                        reject(perr);
                    })
            }
        });
    };

    const process_admin = (userObj, pass) => {
        return new Promise((resolve, reject) => {
            if(!pass){
                reject(new Error('Admin default password required if users include administrators'))
            } else {
                pass_complexity.checkAdminPassword(pass,userObj.username)
                    .then(() => {
                        hash_pass.hashPassword(pass)
                            .then(result => {
                                user_db_access.create_user(userObj.title, userObj.alias, userObj.firstName, userObj.lastName, userObj.emailAddress, true, result, true, true, userObj.uid)
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch(perr => {
                                        logger.applog.error('Error adding admin account from batch: ' + perr.message);
                                        reject(perr);
                                    });
                            })
                            .catch(perr => {
                                logger.applog.error('Error adding admin account from batch: ' + perr.message);
                                reject(perr);
                            });
                    })
                    .catch(perr => {
                        logger.applog.error('Error checking default admin password from batch: ' + perr.message);
                        reject(perr);
                    })
            }
        });
    };

    const process_trusts = (trustObj) => {
        return new Promise((resolve, reject) => {
            let tPromiseAll = [];
            trustObj.forEach((trustItem) =>{
               tPromiseAll.push(trusted_db_access.create_trust(trustItem.appname, trustItem.poc, trustItem.pocemail, trustItem.lifetime ? trustItem.lifetime : trust.lifetime, trustItem.uid));
            });
            Promise.all(tPromiseAll.map(pr => pr.then(res => ({message: res, resolved: true})).catch(err => ({error: err, resolved: false}))))
                .then(result => {
                    if (result.filter(result => result.resolved === false).length > 0) {
                        reject(new Error(JSON.stringify(result.filter(result => result.resolved === false).error)));
                    } else {
                        resolve(tPromiseAll.length + ' trust API Key records added');
                    }
                })
                .catch(perr => {
                    logger.applog.error('Error adding trust from batch: ' + perr.message);
                    reject(new Error(perr.message));
                })
        })
    };

    const process_accounts = (accounts, defAdminP, defUserP) => {
      return new Promise((resolve, reject) => {
          let promAll = [];
          accounts.forEach((user) => {
              if (user.isAdmin) {
                  promAll.push(process_admin(user, defAdminP));
              } else {
                  promAll.push(process_user(user, defUserP));
              }
          });

          Promise.all(promAll.map(pr => pr.then(res => ({message: res, resolved: true})).catch(err => ({error: err, resolved: false}))))
              .then(result => {
                  if (result.filter(result => result.resolved === false).length > 0) {
                      reject(new Error(JSON.stringify(result.filter(result => result.resolved === false).error)));
                  } else {
                      resolve(promAll.length + ' user records added');
                  }
              })
              .catch(perr => {
                  reject(new Error(perr.message));
              });
      });
    };

    const process_batch = (batch) => {
        return new Promise((resolve, reject) => {

            let batchPAll = [];

            if (batch.accounts) {
                batchPAll.push(process_accounts(batch.accounts, batch.defaultAdminPassword, batch.defaultUserPassword));
            }

            if (batch.trusts) {
                batchPAll.push(process_trusts(batch.trusts));
            }

            if(batchPAll.length > 0){
                Promise.all(batchPAll.map(pr => pr.then(res => ({message: res, resolved: true})).catch(err => ({error: err, resolved: false}))))
                    .then(result => {
                        if (result.filter(result => result.resolved === false).length > 0){
                            Promise.all([user_db_access.clear_all_users(), trusted_db_access.clear_all_trusts()].map(pr => pr.then(res => ({message: res, resolved: true})).catch(err => ({error: err, resolved: false}))))
                                .then((result) => {
                                    if (result.filter(result => result.resolved === false).length > 0) {

                                        logger.applog.error('Error cleaning up batch failure');
                                    }

                                    let err = new Error;
                                    err.type = 'batcherror';
                                    err.message = 'Batch Import Failed.  Check for malformed records or duplicate accounts/trusts';
                                    reject(err);
                                })
                                .catch(pperr =>{
                                    logger.applog.error('Error cleaning up batch failure: ' + pperr);
                                    let err = new Error;
                                    err.type = 'batcherror';
                                    err.message = pperr.message;
                                    reject(err);
                                });
                        } else {
                            resolve(result.map(result => result.message));
                        }
                    })
                    .catch(perr => {
                        // Batch is atomic.  All accounts and trusts cleared on failure
                        let err = new Error;
                        err.type = 'batcherror';
                        err.message = perr.message;
                        reject(err);
                    });
            } else {
                let err = new Error;
                err.type = 'batcherror';
                err.message = "Malformed Batch Request - cannot find accounts or trusts element";
                reject(err);
            }
        });

    };

    router.post('/', function(req, res) {
        user_db_access.admin_exists().then(result => {
            if (result) {
                if (req.user.cysys_admin){
                    if (req.body.batch){
                        process_batch(req.body.batch)
                            .then(result => {
                                res.status(200);
                                res.json({message: result});
                            })
                            .catch(perr => {
                                if (perr.type === 'batcherror'){
                                    res.status(400);
                                    res.json(utils.formatError(400, 'Batch', 'Batch failed. Last error: ' + perr.message));
                                } else {
                                    console.log(perr);
                                    logger.applog.error('General Error in batch:  ' + perr);
                                    res.status(500);
                                    res.json(utils.formatError(500, 'Batch', 'Internal Server Error Occurred'));
                                }
                            })

                    } else {
                        res.status(400);
                        res.json(utils.formatError(400, 'Batch', 'Nothing to process - cannot find \'batch\' element'));
                    }

                } else {
                    res.status(403);
                    res.json(utils.formatError(403, 'Batch', 'Only JWT Admin can perform batch inserts'));
                }

            } else {
                res.status(503);
                res.json(utils.formatError(503, 'Batch', 'JWT Authentication Service Not Initialized'));

            }
        })
            .catch(perr => {
                console.log(perr);
                logger.applog.error('General Error in batch:  ' + perr);
                res.status(500);
                res.json(utils.formatError(500, 'Batch', 'Internal Server Error Occurred'));
            });
    });

    return router;
};