const express = require('express');
const router = express.Router();



module.exports = () => {
    "use strict";

    router.get('/', function(req, res, next) {
        console.log('success');
        res.status(200);
        res.json(req.user);
    });

    return router;
};