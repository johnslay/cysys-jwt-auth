const bcrypt = require('bcrypt');

module.exports  = (logger) => {
    "use strict";


    const hashpass = {};

    hashpass.hashPassword = (passwd) => {
        return new Promise((resolve, reject) => {
            if (passwd.length < 7) {
                reject(new Error('Password must be greater than six characters.'))
            } else {
                resolve(bcrypt.hash(passwd, 10));
            }
        })
    };

    hashpass.comparePassword = (passwd, hash) => {
        return new Promise((resolve) => {
                bcrypt.compare(passwd, hash, function (err, res) {
                    if(res){
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        })
    };


    return hashpass;

};