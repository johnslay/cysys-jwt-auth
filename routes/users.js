const express = require('express');
const router = express.Router();



module.exports = (user_db_access, logger, pass_complexity, hash_pass) => {
    "use strict";

    const updatePassword = (uid, password, mstReset) => {
        return new Promise((resolve, reject) => {
            let mustReset = true;
            if (typeof mstReset=== 'boolean'){
                mustReset = mstReset;
            }
            user_db_access.retrieve_user_admin(uid)
                .then(result => {
                    let passCheck = {};
                    if (result.is_admin) {
                        passCheck = pass_complexity.checkAdminPassword(password);
                    } else {
                        passCheck = pass_complexity.checkUserPassword(password);
                    }

                    passCheck
                        .then(() => {
                            hash_pass.hashPassword(password)
                                .then(result => {
                                    user_db_access.reset_password(uid, result, mustReset)
                                        .then(() => {
                                            resolve();
                                        })
                                })
                        })
                        .catch(perr => {
                            reject(perr);
                        })
                })
                .catch(perr => {
                    if (perr.type !== 'passcomplex') {
                        logger.applog.error("Error updating user password: " + perr.message);
                    }
                    reject(perr);
                })

        });
    };

    router.get('/', function(req, res) {
        if (req.user.cysys_admin){
            user_db_access.retrieve_all_users_admin()
                .then(result => {
                    let reply = {};
                    reply.message = 'Success';
                    reply.count = result.length;
                    reply.records = result;

                    res.status(200);
                    res.json(reply);
                })
                .catch(err =>{
                    logger.applog.error('Error getting user list: ' + err.message);
                    res.status(500);
                    res.json({message: 'Error Retrieving User List'});
                });
        } else {
            user_db_access.retrieve_all_users_user()
                .then(result => {
                    let reply = {};
                    reply.message = 'Success';
                    reply.count = result.length;
                    reply.records = result;

                    res.status(200);
                    res.json(reply);
                })
                .catch(err =>{
                    logger.applog.error('Error getting user list: ' + err.message);
                    res.status(500);
                    res.json({message: 'Error Retrieving User List'});
                });
        }
    });

    router.get('/:user_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res) {
        let query = {};

        if (req.user.cysys_admin){
            query = user_db_access.retrieve_user_admin(req.params.user_id);
        } else {
            query = user_db_access.retrieve_user_user(req.params.user_id);
        }

        query
            .then(result => {

                let reply = {};
                reply.message = 'Success';
                reply.count = result.length;
                reply.user = result;

                res.status(200);
                res.json(reply);
            })
            .catch(err =>{
                if (!err.message.includes('not found')){
                    logger.applog.error('Error getting user \'' + req.params.user_id + '\'' + err.message);
                    res.status(500);
                    res.json({message: 'Error Retrieving User'});
                } else {
                    res.status(404);
                    res.json({message: 'User not found'});
                }
            });
    });

    router.delete('/', function(req, res) {
        if (req.user.cysys_admin){
            user_db_access.clear_all_users()
                .then(result => {
                    if(result) {
                        res.status(200);
                        res.json({ message: 'Users Deleted'});
                    } else {
                        res.status(500);
                        res.json({ message: 'Unknown Error'});
                    }
                })
                .catch(err =>{
                    logger.applog.error('Error deleting all users ' + err.message);
                    res.status(500);
                    res.json({message: 'Error Deleting All Users'});
                });
        } else {
            res.status(403);
            res.json({message: 'Only an administrator can delete accounts'});
        }
    });

    router.delete('/:user_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res) {
        if (req.user.cysys_admin){
            user_db_access.delete_user(req.params.user_id)
                .then(result => {
                    if(result) {
                        res.status(200);
                        res.json({ message: 'User Deleted'});
                    } else {
                        res.status(500);
                        res.json({ message: 'Unknown Error'});
                    }
                })
                .catch(err =>{
                    logger.applog.error('Error deleting user: ' + err.message);
                    res.status(500);
                    res.json({message: 'Error deleting user'});
                });
        } else {
            res.status(403);
            res.json({message: 'Only an administrator can delete accounts'});
        }
    });

    router.post('/', function(req, res){
       if(req.user.cysys_admin){
           if(req.body.user){
               let resmessage = '';
               let vFlag = true;
               let cuser = req.body.user;

               if (!(cuser.hasOwnProperty('title')  && cuser.title.length)) { vFlag = false; resmessage = 'Title Required'}
               if (!(cuser.hasOwnProperty('alias') && cuser.alias.length)) { vFlag = false; resmessage = 'Alias Required'}
               if (!(cuser.hasOwnProperty('firstName') && cuser.firstName.length)) { vFlag = false; resmessage = 'First Name Required'}
               if (!(cuser.hasOwnProperty('lastName') && cuser.lastName.length)) { vFlag = false; resmessage = 'Last Name Required'}
               if (!(cuser.hasOwnProperty('emailAddress') && cuser.emailAddress.length)) { vFlag = false; resmessage = 'Email Address Required'}
               if (!(cuser.hasOwnProperty('password') && cuser.password.length)) { vFlag = false; resmessage = 'Password Required'}
               if (!(cuser.hasOwnProperty('mustReset'))) { vFlag = false; resmessage = 'mustReset true-false Required'}
               if (!(cuser.hasOwnProperty('passwordExpires'))) { vFlag = false; resmessage = 'passwordExpires true-false Required'}
               if (!(cuser.hasOwnProperty('isAdmin'))) { vFlag = false; resmessage = 'isAdmin true-false Required'}

               if (!vFlag){
                   res.status(400);
                   res.json({message: resmessage});
               } else {
                   let passCheck = {};
                   if (cuser.isAdmin){
                       passCheck = pass_complexity.checkAdminPassword(cuser.password);
                   } else {
                       passCheck = pass_complexity.checkUserPassword(cuser.password);
                   }

                   passCheck
                       .then(() => {
                         hash_pass.hashPassword(cuser.password)
                             .then(result => {
                                 user_db_access.create_user(cuser.title, cuser.alias, cuser.firstName, cuser.lastName, cuser.emailAddress, cuser.mustReset, result, cuser.passwordExpires, cuser.isAdmin, cuser.uid)
                                     .then((result) => {
                                         res.status(200);
                                         res.json({message: 'User \'' + cuser.emailAddress + '\' created', uid:result});
                                     })
                                     .catch(perr => {
                                         logger.applog.error("Error creating user: " +  perr.message);
                                         res.status(500);
                                         res.json({message: 'Error creating user'});
                                     })
                             })
                             .catch(perr => {
                                 logger.applog.error("Error creating user: " +  perr.message);
                                 res.status(500);
                                 res.json({message: 'Error creating user'});
                             })
                       })
                       .catch(perr => {
                           if (perr.type === 'passcomplex'){
                               res.status(400);
                               res.json({message: perr.message});
                           } else {
                               res.status(500);
                               logger.applog.error("Error checking user password complexity: " +  perr.message);
                               res.status(500);
                               res.json({message: 'Error creating user'});
                           }
                       })
               }

           } else {
               res.status(400);
               res.json({message: 'No user to add'});
           }
       } else {
           res.status(403);
           res.json({message: 'Only an administrator can add accounts'});
       }
    });

    router.patch('/:user_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res){
        //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
        if(req.user.cysys_admin){
            if (req.body.user){
                let cuser = req.body.user;
                let uid = req.params.user_id;

                if (cuser.userName || cuser.title || cuser.alias || cuser.firstName || cuser.lastName || cuser.emailAddress || cuser.mustReset || cuser.passwordExpires || cuser.isAdmin) {
                    user_db_access.update_user(uid, cuser.userName, cuser.title, cuser.alias, cuser.firstName, cuser.lastName, cuser.emailAddress, cuser.mustReset, cuser.passwordExpires, cuser.isAdmin)
                        .then(() => {
                            res.status(200);
                            res.json({message: 'User \'' + uid + '\' updated'});
                        })
                        .catch(perr => {
                            logger.applog.error("Error updating user: " + perr.message);
                            res.status(500);
                            res.json({message: 'Error updating user'});
                        })
                } else if (typeof cuser.isLocked === 'boolean') {
                    if (upatch.isLocked === true){
                        user_db_access.lock_account(uid)
                            .then(() =>{
                                res.status(200);
                                res.json({message: 'User \'' + uid + '\' locked'});
                            })
                            .catch(perr => {
                                logger.applog.error("Error locking user: " + perr.message);
                                res.status(500);
                                res.json({message: 'Error locking user'});
                            })
                    } else {
                        user_db_access.unlock_account(uid)
                            .then(() =>{
                                res.status(200);
                                res.json({message: 'User \'' + uid + '\' unlocked'});
                            })
                            .catch(perr => {
                                logger.applog.error("Error unlocking user: " + perr.message);
                                res.status(500);
                                res.json({message: 'Error unlocking user'});
                            })
                    }
                } else if (cuser.password) {
                    updatePassword(uid, cuser.password, cuser.mustReset)
                        .then(() => {
                            res.status(200);
                            res.json({message: 'User \'' + uid + '\' password updated'});
                        })
                        .catch(perr => {
                            if (perr.type === 'passcomplex'){
                                res.status(400);
                                res.json({message: perr.message});
                            } else {
                                res.status(500);
                                logger.applog.error("Error checking user password complexity: " +  perr.message);
                                res.status(500);
                                res.json({message: 'Error updating user password'});
                            }
                        })
                } else {
                    res.status(400);
                    res.json({message: 'No user values to update'});
                }


            } else {
                res.status(400);
                res.json({message: 'No user values to update'});
            }


        } else {
            res.status(403);
            res.json({message: 'Only an administrator can modify accounts'});
        }
    });

    return router;
};