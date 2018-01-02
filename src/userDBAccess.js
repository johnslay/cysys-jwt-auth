/**
 * Created by michael on 2/14/17.
 */

const uuid = require('uuid/v4');
const admin_uid = '00000000-0000-0000-0000-ab0123456789';
const uid_regex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

module.exports  = (databases, password, logger) =>{
    "use strict";

    const adb = databases.authDB;
    const users = adb.sublevel('users');
    const userDBAccess = {};

    const get_all_users = () => {
        return new Promise((resolve, reject) => {
            const user_list = [];
            users.createValueStream()
                .on('data', (data) => {
                    user_list.push(data);
                })
                .on('error', (err) => {
                    reject(new Error('Error getting user list from database - ' + err));
                })
                .on('end', () => {
                    resolve(user_list);
                });
        });
    };

    const format_all_users_admin = (user_list) => {
        return new Promise((resolve) => {
            const new_user_list = [];
            for (let u of user_list){
                if (u.username !== 'admin') {
                    new_user_list.push(format_user_admin(u));
                }
            }
            resolve(new_user_list);
        })
    };

    const format_all_users_user = (user_list) => {
        return new Promise((resolve) => {
            const new_user_list = [];
            for (let u of user_list){
                if (u.username !== 'admin') {
                    new_user_list.push(format_user_user(u));
                }
            }
            resolve(new_user_list);
        })
    };

    const check_user_exists = (username) => {
        return new Promise((resolve, reject) => {
            get_user_id(username)
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

    const get_user = (uid) => {
        return new Promise((resolve, reject) => {
            users.get(uid, function(err,data) {
                if (err) {
                    if (err.notFound){
                        logger.applog.debug('User ' + uid + ' not found.');
                        reject(new Error('User ' + uid + ' not found.'));
                    } else {
                        logger.applog.error('Unknown Error getting ' + uid + ' Some Other Error.');
                        reject(new Error('Error - ' + err));
                    }
                } else {
                    resolve(data);
                }
            });
        });
    };

    const get_user_id = (username) => {
        return new Promise((resolve, reject) => {
            get_all_users()
                .then(result => {
                    let uid = '';
                    for (let u of result){
                        if (u.username === username) {
                            uid = u.uid;
                            break;
                        }
                    }
                    if(uid){
                        resolve(uid);
                    } else {
                        logger.applog.debug('User ' + username + ' not found.');
                        reject(new Error('User ' + username + ' not found.'));
                    }
                })
                .catch(err =>{
                    logger.applog.error('Unknown Error getting user id for ' + username + ': ' + err.message);
                    reject(new Error('Error - ' + err.message));
                });
        });
    };

    const format_user_admin = (userJ) => {
        const out = {};
        out.uid = userJ.uid;
        out.alias = userJ.alias;
        out.username = userJ.username;
        out.first_name = userJ.first_name;
        out.last_name = userJ.last_name;
        out.title = userJ.title;
        out.email_address = userJ.email_address;
        out.locked = userJ.locked;
        out.can_delete = userJ.can_delete;
        out.must_reset = userJ.must_reset;
        out.is_admin = userJ.is_admin;
        out.last_login = userJ.last_login;
        return out;
    };

    const format_user_user = (userJ) => {
        const out = {};
        out.uid = userJ.uid;
        out.alias = userJ.alias;
        out.username = userJ.username;
        out.first_name = userJ.first_name;
        out.last_name = userJ.last_name;
        out.title = userJ.title;
        out.email_address = userJ.email_address;
        out.last_login = userJ.last_login;

        return out;
    };

    const add_user = (uid, userObject) => {
        return new Promise((resolve, reject) => {
            users.put(uid, userObject, function(err){
                if (err){
                    reject(new Error(err));
                } else {
                    resolve(uid);
                }
            })
        });
    };

    const remove_user = (uid) => {
        return new Promise((resolve, reject) => {
            users.del(uid, function(err) {
                if (err){
                    reject(new Error(err));
                }
                else {
                    resolve();
                }
            })
        })
    };

    const update_user = (userJ) => {
        return new Promise((resolve, reject) => {
            remove_user(userJ.uid)
                .then(() => add_user(userJ.uid, userJ))
                .then(() => resolve())
                .catch(perror => {
                    logger.applog.error('Error updating user ' + userJ.username + ':  ' + perror);
                    reject(perror);
                })
        })
    };

    const create_new_admin = (hash) => {
        return new Promise((resolve) => {
            const adminJ = {};
            adminJ.uid = admin_uid;
            adminJ.alias = 'admin';
            adminJ.username = 'admin';
            adminJ.first_name = 'root';
            adminJ.last_name = 'admin';
            adminJ.title = 'Administrator';
            adminJ.email_address = 'admin@cysysone.narrowgt.com';
            adminJ.locked = false;
            adminJ.locked_date = new Date().getTime();
            adminJ.attempt_count = 0;
            adminJ.last_attempt = new Date().getTime();
            adminJ.can_delete = false;
            adminJ.must_reset = false;
            adminJ.password_expires = false;
            adminJ.password = hash;
            adminJ.password_date = new Date().getTime();
            adminJ.password_history = [];
            adminJ.password_history.push(hash);
            adminJ.is_admin = true;
            adminJ.last_login = new Date().getTime();
            resolve(adminJ);
        });
    };

    const create_new_user = (title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, hash, isAdmin, uid) => {
        return new Promise((resolve, reject) => {

            let eflag = true;
            const userJ = {};
            if (uid){
                if (!uid_regex.test(uid)){
                    reject(new Error('Malformed UID'));
                    eflag = false;
                } else {
                    userJ.uid = uid;
                }
            } else {
                userJ.uid = uuid();
            }

            if (eflag){
                userJ.alias = alias;
                userJ.username = emailAddress;
                userJ.first_name = firstName;
                userJ.last_name = lastName;
                userJ.title = title;
                userJ.email_address = emailAddress;
                userJ.locked = false;
                userJ.locked_date = new Date().getTime();
                userJ.attempt_count = 0;
                userJ.last_attempt = new Date().getTime();
                userJ.can_delete = true;
                userJ.must_reset = mustReset;
                userJ.password_expires = passwordExpires;
                userJ.password = hash;
                userJ.password_date = new Date().getTime();
                userJ.password_history = [];
                userJ.password_history.push(hash);
                userJ.is_admin = isAdmin;
                userJ.last_login = new Date().getTime();

                resolve(userJ);
            }
        });
    };

    userDBAccess.get_user_id = (userName) => {
        return new Promise((resolve, reject) => {
            get_user_id(userName)
                .then(result => {
                    resolve(result);
                })
                .catch(perror => {
                    logger.applog.error('Error getting userID for for ' + userName + ':  ' + perror);
                    reject(perror);
                });
        });
    };

    // Used to check and see if the admin account was already created
    userDBAccess.admin_exists = () => {
        return new Promise((resolve) => {
            get_user(admin_uid)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false)
                })
        })
    };

    // Returns password info required to check against controls and actual password hash
    // Will be used when someone tries to log in
    userDBAccess.get_password_info = (uid) =>{
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    const pwo = {};
                    pwo.password = result.password;
                    pwo.password_date = result.password_date;
                    pwo.password_expires = result.password_expires;
                    pwo.attempt_count = result.attempt_count;
                    pwo.last_attempt = result.last_attempt;
                    pwo.locked = result.locked;
                    pwo.locked_date = result.locked_date;
                    pwo.must_reset = result.must_reset;

                    resolve(pwo);
                })
                .catch((perror) => {
                    logger.applog.error('Error retrieving password for ' + uid + ':  ' + perror);
                    reject(perror);
                })
        })
    };

    // Gets the password history
    // Will be used to determine if the new password matches one in the history
    userDBAccess.get_password_history = (uid) =>{
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    resolve(result.password_history);
                })
                .catch((perror) => {
                    logger.applog.error('Error retrieving password history for ' + userName + ':  ' + perror);
                    reject(perror);
                })
        })
    };

    // Updates Login Attempt count
    // Called when incorrect credentials submitted
    userDBAccess.update_login_attempt_count = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    result.attempt_count++;
                    result.last_attempt = new Date().getTime();
                    return result;
                })
                .then((result) => update_user(result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating login attempt count:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Resets Login attempt count
    // called after successful login
    userDBAccess.reset_login_attempt_count = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    result.attempt_count = 0;
                    return result;
                })
                .then((result) => update_user(result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating login attempt count:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Resets Login attempt count
    // called after successful login
    userDBAccess.set_last_login = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    result.last_login = new Date().getTime();
                    return result;
                })
                .then((result) => update_user(result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating login attempt count:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Unlock locked account
    userDBAccess.unlock_account = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    result.attempt_count = 0;
                    result.locked = false;
                    return result;
                })
                .then((result) => update_user(result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating login attempt count:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // lock account
    userDBAccess.lock_account = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then((result) => {
                    result.locked = true;
                    result.locked_date = new Date().getTime();
                    return result;
                })
                .then((result) => update_user(result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating login attempt count:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Creates administrator account
    // Used during first run when password must be set before application can be used
    userDBAccess.create_admin = (hash) => {
        return new Promise(function(resolve, reject){
            create_new_admin(hash)
                .then((result) => add_user(result.uid, result))
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error creating admin account:  ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Creates a new users
    // Will fail if username already exists
    userDBAccess.create_user = (title, alias, firstName, lastName, emailAddress, mustReset, hash, passwordExpires, isAdmin, uid) => {
        return new Promise(function(resolve, reject){
            if (title && alias && firstName && lastName && emailAddress && hash){
                check_user_exists(emailAddress)
                    .then((result) => {
                        if (!result) {
                            create_new_user(title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, hash, isAdmin, uid)
                                .then((result) => add_user(result.uid, result))
                                .then((result) => {
                                    resolve(result)
                                })
                                .catch((perror) => {
                                    logger.applog.error('Error creating ' + emailAddress + ' account:  ' + perror.message);
                                    reject(perror);
                                })
                        } else {
                            reject(new Error('Account with username \'' + emailAddress + '\' already exists'));
                        }
                    });
            } else {
                reject(new Error('Mandatory Field Missing'));
            }
        })
    };

    // Get user info for non-admin requests
    userDBAccess.retrieve_user_user = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then(format_user_user)
                .then(resolve)
                .catch((perror) => {
                    logger.applog.error('Error getting user with id ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        })
    };

    // Get user info for admin requests
    userDBAccess.retrieve_user_admin = (uid) => {
        return new Promise(function(resolve, reject){
            get_user(uid)
                .then(format_user_admin)
                .then(resolve)
                .catch((perror) => {
                    logger.applog.error('Error getting ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        })
    };

    userDBAccess.retrieve_all_users_user = () =>{
        return new Promise((resolve, reject) => {
            get_all_users()
                .then(format_all_users_user)
                .then(resolve)
                .catch((perror) => {
                    logger.applog.error('Error getting all users ' + perror.message);
                    reject(perror);
                });
        });
    };

    userDBAccess.retrieve_all_users_admin = () =>{
        return new Promise((resolve, reject) => {
            get_all_users()
                .then(format_all_users_admin)
                .then(resolve)
                .catch((perror) => {
                    logger.applog.error('Error getting all users ' + perror.message);
                    reject(perror);
                });
        });
    };

    // Updates an existing user only replacing non-undefined parameters
    // userName should never change even if email does (don't change email either, but for the rebels...)
    userDBAccess.update_user = (uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin) => {
        return new Promise((resolve, reject) => {
            get_user(uid)
                .then(result => {
                    result.title = title ? title : result.title;
                    result.alias = alias ? alias : result.alias;
                    result.first_name = firstName ? firstName : result.first_name;
                    result.last_name = lastName ? lastName : result.last_name;
                    result.email_address = emailAddress ? emailAddress : result.email_address;
                    result.must_reset = typeof mustReset === 'boolean' ? mustReset : result.must_reset;
                    result.password_expires = typeof passwordExpires === 'boolean' ? passwordExpires : result.password_expires;
                    result.is_admin = typeof isAdmin === 'boolean' ? isAdmin : result.is_admin;
                    return result;
                })
                .then(update_user)
                .then(() => {
                    resolve(true)
                })
                .catch((perror) => {
                    logger.applog.error('Error updating ' + userName + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    // Remove user from Database
    userDBAccess.delete_user = (uid) => {
        return new Promise((resolve, reject) => {
            remove_user(uid)
                .then(() => {
                    resolve(true);
                })
                .catch((perror) => {
                    logger.applog.error('Error deleting ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    // Resets user's password
    userDBAccess.reset_password = (uid, newPassword, mustReset) => {
        return new Promise((resolve, reject) => {
            get_user(uid)
                .then((result) => {
                    if(result.password_history.indexOf(newPassword) === -1){
                        if (result.password_history.length >= password.historyLength){
                            result.password_history.shift();
                        }
                        result.password_history.push(newPassword);
                    }

                    result.password = newPassword;
                    result.password_date = new Date().getTime();
                    result.attempt_count = 0;
                    result.locked = false;
                    result.must_reset = typeof mustReset === 'boolean' ? mustReset : result.must_reset;

                    update_user(result)
                        .then(() => {
                            resolve(true)
                        });
                })
                .catch((perror) => {
                    logger.applog.error('Error resetting password for ' + uid + ' ' + perror.message);
                    reject(perror);
                })
        });
    };

    userDBAccess.clear_all_users = () => {
        return new Promise((resolve, reject) => {
            get_all_users()
                .then(result => {
                    let pAll = [];
                    for (let u of result){
                        if (u.username !== 'admin') {
                            pAll.push(remove_user(u.uid));
                        }
                    }
                    Promise.all(pAll)
                        .then(() =>{
                            resolve(true);
                        })
                        .catch(perr => {
                            logger.applog.error('Error Deleting Accounts: ' + perr.message);
                            reject(perr);
                        })
                })
                .catch(err => {
                    logger.applog.error('Error getting users to remove');
                    reject(err);
                });
        });
    };


    return userDBAccess;
};