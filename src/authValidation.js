const eType = 'authVal';

module.exports  = (logger,  password) => {
    "use strict";
    const authValidation = {};

    authValidation.CheckLockout = (info) => {
        return new Promise((resolve, reject) => {
            if (info.locked) {
                let err = new Error();
                err.type = eType;
                err.message = 'Account is locked out';
                reject(err);
            } else {
                resolve(info);
            }
        })
    };

    authValidation.CheckReset = (info) => {
        return new Promise((resolve, reject) => {
            if (info.must_reset) {
                let err = new Error();
                err.type = eType;
                err.message = 'Account Password Must Be Reset';
                reject(err);
            } else {
                resolve(info);
            }
        })
    };

    authValidation.CheckAttempts = (info) => {
        return new Promise((resolve, reject) => {

            let tdif = new Date().getTime();
            tdif = tdif - info.last_attempt;
            let tspan = tdif / 60000;

            if (info.attempt_count > password.lockoutThreshold){
                if (tspan > password.lockoutDuration){
                    resolve(info);
                } else {
                    let err = new Error();
                    err.type = eType;
                    err.message = 'Too Many Authentication attempts';
                    reject(err);
                }
            } else {
                resolve(info);
            }
        })
    };

    authValidation.CheckExpired = (info) => {
        return new Promise((resolve, reject) => {
            let ddif = new Date().getTime() - info.password_date;
            let dspan = Math.ceil(ddif / (1000 * 3600 * 24));

            if (dspan > password.maxPasswordAge && info.password_expires === true){
                let err = new Error();
                err.type = eType;
                err.message = 'Password has expired and must be changed';
                reject(err);

            } else {
                resolve(info);
            }
        })
    };

    return authValidation;
};