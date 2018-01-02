const express = require('express');
const router = express.Router();



module.exports = (trusted_db_access, logger, utils) => {
    "use strict";

    router.get('/', function(req, res) {
        if (req.user.cysys_admin){
            trusted_db_access.retrieve_all_trusts()
                .then(result => {
                    let reply = {};
                    reply.message = 'Success';
                    reply.count = result.length;
                    reply.records = result;

                    res.status(200);
                    res.json(reply);
                })
                .catch(err =>{
                    logger.applog.error('Error getting trust list: ' + err.message);
                    res.status(500);
                    res.json(utils.formatError(500, 'Trusts', 'Error Retrieving Trust List'));
                });
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));

        }
    });

    router.get('/:trust_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res) {
        let query = {};

        if (req.user.cysys_admin){
            trusted_db_access.retrieve_trust(req.params.trust_id)
            .then(result => {
                let reply = {};
                reply.message = 'Success';
                reply.trust = result;

                res.status(200);
                res.json(reply);
            })
            .catch(err =>{
                if (!err.message.includes('not found')){
                    logger.applog.error('Error getting trust \'' + req.params.trust_id + '\'' + err.message);
                    res.status(500);
                    res.json(utils.formatError(500, 'Trusts', 'Error Retrieving Trust'));
                } else {
                    res.status(404);
                    res.json(utils.formatError(404, 'Trusts', 'Trust not found'));
                }
            });
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));
        }
    });

    router.delete('/', function(req, res) {
        if (req.user.cysys_admin){
            trusted_db_access.clear_all_trusts()
                .then(result => {
                    if(result) {
                        res.status(200);
                        res.json({ message: 'Trusts Deleted'});
                    } else {
                        res.status(500);
                        res.json(utils.formatError(500, 'Trusts', 'Error Deleting All Trust'));
                    }
                })
                .catch(err =>{
                    logger.applog.error('Error deleting all trusts: ' + err.message);
                    res.status(500);
                    res.json(utils.formatError(500, 'Trusts', 'Error Deleting All Trust'));
                });
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));
        }
    });

    router.delete('/:trusts_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res) {
        if (req.user.cysys_admin){
            trusted_db_access.delete_trust(req.params.trusts_id)
                .then(result => {
                    if(result) {
                        res.status(200);
                        res.json({ message: 'Trust \'' + req.params.trusts_id + '\' Deleted'});
                    } else {
                        res.status(500);
                        res.json(utils.formatError(500, 'Trusts', 'Error Deleting Trust'));
                    }
                })
                .catch(err =>{
                    logger.applog.error('Error deleting trust: ' + err.message);
                    res.status(500);
                    res.json(utils.formatError(500, 'Trusts', 'Error Deleting Trust'));
                });
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));
        }
    });

    router.post('/', function(req, res){
        if(req.user.cysys_admin){
            if(req.body.trust){
                let resmessage = '';
                let vFlag = true;
                let ctrust = req.body.trust;

                if (!(ctrust.hasOwnProperty('appname')  && ctrust.appname.length)) { vFlag = false; resmessage = 'App Name Required'}
                if (!(ctrust.hasOwnProperty('poc') && ctrust.poc.length)) { vFlag = false; resmessage = 'POC Required'}
                if (!(ctrust.hasOwnProperty('pocemail') && ctrust.pocemail.length)) { vFlag = false; resmessage = 'POC Email Required'}

                if (!vFlag){
                    res.status(400);
                    res.json(utils.formatError(400, 'Trusts', resmessage));
                } else {

                    trusted_db_access.create_trust(ctrust.appname, ctrust.poc, ctrust.pocemail, ctrust.lifetime ? ctrust.lifetime : null, ctrust.uid)
                        .then((result) => {
                            res.status(200);
                            res.json({message: 'Trust \'' + ctrust.appname + '\' created', uid: result});
                        })
                        .catch(perr => {
                            logger.applog.error("Error creating trust: " +  perr.message);
                            res.status(500);
                            res.json(utils.formatError(500, 'Trusts', 'Error Creating Trust'));
                        });
                }

            } else {
                res.status(400);
                res.json(utils.formatError(400, 'Trusts', 'No trust to add'));
            }
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));
        }
    });

    router.patch('/:trust_id([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})', function(req, res){
        if(req.user.cysys_admin){

            let reset = req.query.reset;

            if (!reset){
                if(req.body.trust){
                    let vFlag = false;
                    let eFlag = false;
                    let ctrust = req.body.trust;
                    let uid = req.params.trust_id;

                    if ((ctrust.hasOwnProperty('appname')  && ctrust.appname.length)) { vFlag = true;}
                    if ((ctrust.hasOwnProperty('poc') && ctrust.poc.length)) { vFlag = true;}
                    if ((ctrust.hasOwnProperty('pocemail') && ctrust.pocemail.length)) { vFlag = true;}
                    if ((ctrust.hasOwnProperty('lifetime') && ctrust.lifetime > 0)) { vFlag = true;}

                    for(let name in ctrust){
                        if(ctrust.hasOwnProperty(name)){
                            if(!(name === 'appname' || name === 'poc' || name === 'pocemail' || name === 'lifetime')){
                                eFlag = true;
                            }
                        }
                    }

                    if (eFlag){
                        res.status(400);
                        res.json(utils.formatError(400, 'Trusts', 'Trust contains invalid field'));
                    } else if (!vFlag){
                        res.status(400);
                        res.json(utils.formatError(400, 'Trusts', 'Nothing to update'));
                    } else {
                        trusted_db_access.update_trust(uid, ctrust.appname, ctrust.poc, ctrust.pocemail, ctrust.lifetime)
                            .then(() => {
                                res.status(200);
                                res.json({message: 'Trust \'' + ctrust.appname + '\' updated'});
                            })
                            .catch(perr => {
                                logger.applog.error("Error updating trust: " +  perr.message);
                                res.status(500);
                                res.json(utils.formatError(500, 'Trusts', 'Error Updating Trust'));
                            });
                    }
                } else {
                    res.status(400);
                    res.json(utils.formatError(400, 'Trusts', 'No trust to add'));
                }
            } else {
                trusted_db_access.update_trust_lifetime(req.params.trust_id)
                    .then(() => {
                        res.status(200);
                        res.json({message: 'Trust \'' + req.params.trust_id + '\' reset'});
                    })
                    .catch(perr => {
                        logger.applog.error("Error resetting trust: " +  perr.message);
                        res.status(500);
                        res.json(utils.formatError(500, 'Trusts', 'Error Resetting Trust'));
                    });
            }
        } else {
            res.status(403);
            res.json(utils.formatError(403, 'Trusts', 'Admin permissions required'));
        }
    });



    return router;
};