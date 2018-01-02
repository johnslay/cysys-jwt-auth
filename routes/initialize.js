const express = require('express');
const router = express.Router();



module.exports = (user_db_access, pass_complexity, logger, hash_pass, utils) => {
    "use strict";

    router.get('/', function(req, res, next) {
        let source = req.socket._peername.address ? req.socket._peername.address : 'unknown';

        logger.log_account_operations('Attempt was made to check admin account status from ' + source);
        user_db_access.admin_exists().then(result => {
            res.status(200);
            if (result) {
                res.json({ message: 'Admin Account Exists'});
            } else {
                res.json({ message: 'Admin Account Does Not Exist'});
            }
        }).catch(err => {
            res.status(500);
            logger.applog.error('Error checking for admin account \'' + err.message + '\'');
            res.json(utils.formatError(500, 'Initialization', 'Error checking for admin account \'' + err.message + '\''));
        });
    });

    /* If the admin account does not exist, then it is created.  This is a one time only
     * affair.  This should be satisfied immediately after install.  The JWT authentication
     * service will not be available until this account is created.  You cannot authenticate
     * to the service until accounts exist and you cannot create any accounts until the admin
     * account is created.
     */

    router.post('/', function(req,res){
        let source = req.socket._peername.address ? req.socket._peername.address : 'unknown';

        logger.log_account_operations('Attempt was made to set initial admin password from ' + source);

        user_db_access.admin_exists()
            .then(result => {
            if (result) {
                res.status(400);
                res.json(utils.formatError(400, 'Initialization', 'Admin Account Already Exists'));
            } else {
                if(req.body.password) {
                    res.status(200);
                    pass_complexity.checkAdminPassword(req.body.password)
                        .then(result => hash_pass.hashPassword(result))
                        .then(result => user_db_access.create_admin(result))
                        .then(() => {
                            res.status(200);
                            res.json({message: 'Admin Account Created'});
                            logger.log_account_operations('Admin Account Created');
                        })
                        .catch(err => {
                            logger.log_account_operations('Admin Account Creation Failed');
                            logger.applog.error('Failed to create administrator account \'' + err.message + '\'');

                            if (err.type === 'passcomplex') {
                                res.status(400);
                                res.json(utils.formatError(400, 'Initialization', 'Error creating admin account \'' + err.message + '\''));
                            } else {
                                res.status(500);
                                res.json(utils.formatError(500, 'Initialization', 'Server Error creating admin account'));
                            }
                        });
                } else {
                    res.status(400);
                    res.json(utils.formatError(400, 'Initialization', 'Request must contain password element with the password to use'));
                }
            }
        });

    });

    return router;
};