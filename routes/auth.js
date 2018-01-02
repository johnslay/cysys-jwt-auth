const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/* For authentication we must be careful what we return when it fails
 * So we do not wind up exposing clues about the account or password
 */


module.exports = (user_db_access, access_utils, logger, hash_pass, auth_validation, jwt_config, utils) => {
    "use strict";

    const updateAttempt = (user) => {
        return new Promise((resolve, reject) => {
            user_db_access.update_login_attempt_count(user)
                .then(() => {
                    resolve();
                })
                .catch(perr => {
                    reject(new Error('Error updating login attempt count:  ' + perr));

                });
        })
    };

    const reset_user_info = (uid) => {
        return new Promise((resolve, reject) => {

            user_db_access.reset_login_attempt_count(uid)
                .then(() => {
                    user_db_access.set_last_login(uid)
                        .then(resolve())
                        .catch(perr => {
                            logger.applog.error('Error resetting last login:  ' + perr);
                            reject(perr.message);
                        })
                })
                .catch(perr2 => {
                    logger.applog.error('Error resetting login attempt count:  ' + perr2);
                    reject(perr2.message);
                })

        });
    };

    const handle_authentication = (user, pass, uroles) => {
        return new Promise((resolve, reject) => {
            let uid = '';
            user_db_access.get_user_id(user)
                .then(result => {
                    uid = result;
                    user_db_access.get_password_info(result)
                        .then(result => {
                            let clockout = auth_validation.CheckLockout(result);
                            let creset = auth_validation.CheckReset(result);
                            let cattempt = auth_validation.CheckAttempts(result);
                            let cexpire = auth_validation.CheckExpired(result);
                            let dohash = hash_pass.comparePassword(pass, result.password);

                            Promise.all([clockout, creset, cattempt, cexpire, dohash])
                                .then((results) => {
                                    if (results[4] === true) {

                                        // build JWT token here

                                        user_db_access.retrieve_user_admin(uid)
                                            .then(uresult => {

                                                reset_user_info(uid)
                                                    .catch(perr => {
                                                        logger.applog.error('Error resetting user after authentication:  ' + perr);
                                                    });

                                                let isAdmin = uresult.is_admin;

                                                let tkn = jwt.sign({
                                                    sub: uresult.email_address,
                                                    iss: jwt_config.issuer,
                                                    cysys_roles: uroles,
                                                    cysys_admin: isAdmin
                                                }, jwt_config.secret, {expiresIn: jwt_config.lifetime});

                                                let iat = 0;
                                                jwt.verify(tkn, jwt_config.secret, function(err,data){
                                                   iat = data.exp;
                                                });

                                                access_utils.create_token_record(tkn, uresult.email_address, iat )
                                                    .then(() => {
                                                        logger.log_successful_logins('Logon succeeded for \'' + user + '\'');
                                                        resolve(tkn);
                                                    })
                                                    .catch(perr => {
                                                        logger.applog.error('Error saving token record:  ' + perr);
                                                        let err = new Error();
                                                        err.code = 500;
                                                        err.message = 'Error handling token record';
                                                        reject(err);
                                                    })
                                            })
                                            .catch(cerr => {
                                                updateAttempt(uid);
                                                logger.log_failed_logins('Logon Attempt for \'' + user + '\' failed: ' + cerr);
                                                let err = new Error();
                                                err.code = 500;
                                                err.message = 'Error retrieving user account';
                                                reject(err);
                                            });

                                    } else {
                                        updateAttempt(uid);
                                        logger.log_failed_logins('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
                                        logger.log_failed_logins('Logon Attempt for \'' + user + '\' failed:  bad password');
                                        let err = new Error();
                                        err.code = 400;
                                        err.message = 'Authentication Failed';
                                        reject(err);
                                    }
                                })
                                .catch(paerr => {
                                    let err = new Error();
                                    err.code = 400;
                                    err.message = 'Authentication Failed';
                                    if (paerr.message.toLowerCase().includes('reset')) {
                                        err.message =  'Account password must be reset';
                                    } else if (paerr.message.toLowerCase().includes('locked')) {
                                        err.message =  'Account is locked out';
                                    } else if (paerr.message.toLowerCase().includes('attempts')) {
                                        err.message = 'Account is temporarily locked due to too many authentication attempts';
                                    } else if (paerr.message.toLowerCase().includes('expired')) {
                                        err.message = 'Password is expired and must be reset';
                                    } else {
                                        err.code = 500;
                                        err.message = 'Unknown authentication problem';
                                    }
                                    reject(err);
                                })
                        })
                })
                .catch(perr => {
                    logger.log_failed_logins('Authentication Attempt for \'' + user + '\' failed 1: ' + perr);
                    let err = new Error();
                    err.code = 400;

                    if (perr.message.toUpperCase().includes('NOT FOUND')) {
                        err.message =  'Authentication Failed';
                    } else {
                        updateAttempt(user)
                            .catch(rerr => {
                                logger.applog.debug(rerr.message);
                            });
                        err.message =  'Authentication failed: \'' + perr.message + '\'';
                    }
                    reject(err);
                });
        });

    };

    router.post('/', function(req,res){

        let user = req.body.user;
        let pass = req.body.password;
        let uroles = []; //req.body.roles;

        let source = req.socket._peername.address ? req.socket._peername.address : 'unknown';
        logger.log_account_operations('Attempt was made to authenticate \'' + user + '\' from ' + source);

        if (!user || !pass){
            res.status(400);
            res.json(utils.formatError(400, 'Authentication', 'Unrecognized Authentication Request'));
        } else {
            user_db_access.admin_exists()
                .then(result => {
                    if (result) {
                        access_utils.check_apiKey(req.apiKey) // apiKey required to integrate any role submission
                            .then(result => {
                                if (result) {
                                    uroles = req.body.roles;
                                    if (!uroles || uroles.length === 0) {
                                        uroles = [];
                                    }
                                } else { // Does not have API Key so we do not allow role submission
                                    uroles = [];
                                }

                                handle_authentication(user, pass, uroles)
                                    .then(result => {
                                        res.status(200);
                                        res.json({token: result});
                                    })
                                    .catch(perr => {
                                        res.status(perr.code);
                                        res.json(utils.formatError(perr.code, 'Authentication', perr.message));
                                        console.log('failed');
                                    })
                            })
                            .catch(perr => {
                                logger.applog.error('Error checking API Key:  ' + perr);
                                res.status(500);
                                res.json(utils.formatError(500, 'Authentication', 'Unspecified Server Error'));
                            })

                    } else {
                        res.status(503);
                        res.json(utils.formatError(503, 'Authentication', 'JWT Authentication Service Not Initialized'));
                    }
                })
                .catch(perr => {
                    logger.applog.error('Error resetting login attempt count:  ' + perr);
                    res.status(500);
                    res.json(utils.formatError(500, 'Authentication', 'Unspecified Server Error'));
                });
        }
    });

    return router;
};