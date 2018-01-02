
const jwt = require('jsonwebtoken');

module.exports = ((options, accessUtils, logger) => {
    "use strict";

    return function(req, res, next){

        let secret = '';
        let excludePaths = [];
        let apiKeyRequired = true;

        let bearerToken = req.headers['authorization'];

        if (options){
            secret = options.secret ? options.secret : '';
            excludePaths = options.exclude ? options.exclude : [];
            apiKeyRequired = options.apiKeyReq ? options.apiKeyReq : false;
        }

        let origURLArray = req.originalUrl.split('?');
        let origURL = origURLArray[0];

        //check path and bypass token validation if excluded
        if (!excludePaths.includes(origURL) || excludePaths === []){
            if (typeof bearerToken !== 'undefined'){
                let token = '';
                let apiKey = '';
                let bearer = bearerToken.split(' ');

                if (bearer[0] === 'Bearer'){
                    token = bearer[1];
                }

                if (bearer[0] === 'APIKey'){
                    apiKey = bearer[1];
                }

                if (bearer.length = 4){
                    if (bearer[2] === 'APIKey'){
                        apiKey = bearer[3];
                    }
                }

                jwt.verify(token, secret, function(err,data){
                    if (err){
                        if (err.message.toLowerCase() === 'expired'){
                            accessUtils.remove_expired_token(token)
                                .then(() => {
                                    res.status(403);
                                    res.json({message: err.message});
                                })
                                .catch(perr => {
                                    logger.applog.error('Error removing expired token: ' + perr.message);
                                    res.status(500);
                                    res.json({message: 'Internal Server Error'});
                                })
                        } else {
                            res.status(403);
                            res.json({message: err.message});
                        }
                    } else {
                        accessUtils.check_access_db(token)
                            .then(result => {
                                if(result){
                                    if(apiKeyRequired){
                                    accessUtils.check_apiKey(apiKey)
                                        .then(result => {
                                            if (result){
                                                req.user = data;
                                                req.apiKey = apiKey;
                                                next();
                                            } else {
                                                res.status(403);
                                                res.json({message: 'Unauthorized: Untrusted Source'});
                                            }
                                        })
                                        .catch(perr => {
                                            logger.applog.error('Error removing expired token: ' + perr.message);
                                            res.status(500);
                                            res.json({message: 'Internal Server Error'});
                                        })
                                    } else {
                                        req.user = data;
                                        if (apiKey !== '') {
                                            req.apiKey = apiKey;
                                        }
                                        next();
                                    }
                                } else {
                                    res.status(403);
                                    res.json({message: 'Unauthorized: Revoked'});
                                }
                            })
                            .catch(perr => {
                                logger.applog.error('Error removing expired token: ' + perr.message);
                                res.status(500);
                                res.json({message: 'Internal Server Error'});
                            })
                    }
                })
            } else {
                res.status(400);
                res.json({message: 'Unauthorized'});
            }
        } else {
            next();
        }
    };

});