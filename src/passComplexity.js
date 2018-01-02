/** There is way too much private code to ignore for testing
 * so the "__testing__" namespace is used to isolate this private code
 * so it can be tested.  It is not intended for public consumption
 */


const fs = require('fs');
const rl = require('readline');
const dict = [];

module.exports  = (password, logger) =>{
    "use strict";

    const passComplexity = {};
    passComplexity.__testing__ = {};
    const uCase = new RegExp('[A-Z]');
    const lCase = new RegExp('[a-z]');
    const numb = new RegExp('[0-9]');
    const special = new RegExp('[`|~|!|@|#|\\$|%|\\^|&|*|(|)|\\[|\\]|{|}|:|;|<|>|,|.|?|+|=|\\-|_|\\\\|\\/\\s\'\"]');
    const sequence = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const qwerty = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    const pattern1 = '!QAZ@WSX#EDC$RFV%TGB^YHN&UJM*IK<(OL>)P:?1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik,9ol.0p;';
    const pattern2 = '13qeadzc24wrsfxv35etdgcb46ryfhvn57tugjbm68yihkn,79uojlm.80ipk;,!#QEADZC@$WRSFXV#%ETDGCB$^RYFHVN%&TUGJBM^*YIHKN<&(UOJLM>*)IPK:<?';

    const settings = password.PasswordComplexity;

    (function() {
        let rd = rl.createInterface({
            input: fs.createReadStream(settings.dfile)
        });

        rd.on('line', function(line){
            dict.push(line);
        });
    })();


    const check_pass_length = (pass) => {
        return new Promise((resolve, reject) => {
            if (pass.length < password.minimumPasswordLength) {
                reject(new Error('User Password is too short'));
            } else {
                resolve(pass);
            }
        });
    };
    passComplexity.__testing__.check_pass_length = check_pass_length;

    const check_admin_pass_length = (pass) => {
        return new Promise((resolve, reject) => {
            if (pass.length < password.minimumAdminPasswordLength) {
                reject(new Error('Admin Password is too short'));
            } else {
                resolve(pass);
            }
        });
    };
    passComplexity.__testing__.check_admin_pass_length = check_admin_pass_length;

    const check_upper_case = (pass) => {
        return new Promise((resolve, reject) => {
            if (settings.upper === false){
                resolve(pass);
            } else {
                let cnt = 0;
                for (let i = 0; i<pass.length; i++){
                    if (uCase.test(pass[i])){ cnt++; }
                }
                if (cnt < settings.upperCount){
                    reject(new Error('At least ' + settings.upperCount + ' upper case characters required.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_upper_case = check_upper_case;

    const check_lower_case = (pass) => {
        return new Promise((resolve, reject) => {
            if (settings.lower === false){
                resolve(pass);
            } else {
                let cnt = 0;
                for (let i = 0; i<pass.length; i++){
                    if (lCase.test(pass[i])){ cnt++; }
                }
                if (cnt < settings.lowerCount){
                    reject(new Error('At least ' + settings.lowerCount + ' lower case characters required.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_lower_case = check_lower_case;

    const check_number = (pass) => {
        return new Promise((resolve, reject) => {
            if (settings.number === false){
                resolve(pass);
            } else {
                let cnt = 0;
                for (let i = 0; i<pass.length; i++){
                    if (numb.test(pass[i])){ cnt++; }
                }
                if (cnt < settings.numberCount){
                    reject(new Error('At least ' + settings.numberCount + ' numbers required.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_number = check_number;

    const check_special = (pass) => {
        return new Promise((resolve, reject) => {
            if (settings.special === false){
                resolve(pass);
            } else {
                let cnt = 0;
                for (let i = 0; i<pass.length; i++){
                    if (special.test(pass[i])){ cnt++; }
                }
                if (cnt < settings.specialCount){
                    reject(new Error('At least ' + settings.specialCount + ' special characters required.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_special = check_special;

    const check_sequence = (pass) => {
        return new Promise((resolve, reject) => {
            let sc = settings.sequenceCount;
            if (settings.sequence === false){
                resolve(pass);
            } else {
                let match = false;
                for (let i = 0; i<(sequence.length - sc + 1); i++){
                    if (pass.toUpperCase().includes(sequence.substr(i, sc + 1)))
                    {
                        match = true;
                        break;
                    }
                }

                if (match === false){
                    let rsequence = sequence.split('').reverse().join('');
                    for (let i = 0; i<(rsequence.length - sc + 1); i++){
                        if (pass.toUpperCase().includes(rsequence.substr(i, sc + 1)))
                        {
                            match = true;
                            break;
                        }
                    }
                }
                if (match === true){
                    reject(new Error('No More than ' + sc + ' characters in sequence allowed.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_sequence = check_sequence;

    const check_qwerty = (pass) => {
        return new Promise((resolve, reject) => {
            let sc = settings.qwertyCount;
            if (settings.qwerty === false){
                resolve(pass);
            } else {
                let match = false;
                for (let i = 0; i<(qwerty.length - sc + 1); i++){
                    if (pass.toUpperCase().includes(qwerty.substr(i, sc + 1)))
                    {
                        match = true;
                        break;
                    }
                }

                if (match === false){
                    let rqwerty = qwerty.split('').reverse().join('');
                    for (let i = 0; i<(rqwerty.length - sc + 1); i++){
                        if (pass.toUpperCase().includes(rqwerty.substr(i, sc + 1)))
                        {
                            match = true;
                            break;
                        }
                    }
                }
                if (match === true){
                    reject(new Error('No More than ' + sc + ' qwerty characters in sequence allowed.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_qwerty = check_qwerty;

    const check_pattern = (pass) => {
        return new Promise((resolve, reject) => {
            let sc = 4;
            if (settings.pattern === false){
                resolve(pass);
            } else {
                let match = false;
                for (let i = 0; i<(pattern1.length - sc); i++){
                    if (pass.includes(pattern1.substr(i, sc)))
                    {
                        match = true;
                        break;
                    }
                }

                if (match === false){
                    let rpattern1 = pattern1.split('').reverse().join('');
                    for (let i = 0; i<(rpattern1.length - sc); i++){
                        if (pass.includes(rpattern1.substr(i, sc)))
                        {
                            match = true;
                            break;
                        }
                    }
                }

                if (match === false){
                for (let i = 0; i<(pattern2.length - sc); i++){
                    if (pass.includes(pattern2.substr(i, sc)))
                    {
                        match = true;
                        break;
                    }
                }
                }

                if (match === false){
                    let rpattern2 = pattern2.split('').reverse().join('');
                    for (let i = 0; i<(rpattern2.length - sc); i++){
                        if (pass.includes(rpattern2.substr(i, sc)))
                        {
                            match = true;
                            break;
                        }
                    }
                }
                if (match === true){
                    reject(new Error('Cannot use keyboard pattern'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_pattern = check_pattern;

    // Need to optimize this search
    const check_dictionary = (pass) => {
        return new Promise((resolve, reject) => {
            if (settings.dictionary === false){
                resolve(pass);
            } else {
                let match = false;
                for (let s of dict){
                    if (pass.toUpperCase() === s.toUpperCase()){
                        match = true;
                        break;
                    }
                }

                if (match === true){
                    reject(new Error('Password matches dictionary word.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_dictionary = check_dictionary;

    const check_username = (pass, uname) => {
        return new Promise((resolve, reject) => {
            if (settings.username === false){
                resolve(pass);
            } else {
                if (pass === uname){
                    reject(new Error('Password cannot match username.'));
                } else {
                    resolve(pass);
                }
            }
        });
    };
    passComplexity.__testing__.check_username = check_username;

    // Candidate for promise.all
    const check_password = (pass, uname) => {
        return new Promise((resolve, reject) => {
            let cuname = check_username(pass,uname);
            let cucase = check_upper_case(pass);
            let clcase = check_lower_case(pass);
            let cnumber = check_number(pass);
            let cspecial = check_special(pass);
            let csequence = check_sequence(pass);
            let cqwerty = check_qwerty(pass);
            let cpattern = check_pattern(pass);
            let cdictionary = check_dictionary(pass);

            Promise.all([cuname, cucase, clcase, cnumber, cspecial, csequence, cqwerty, cpattern, cdictionary])
                .then((results) => {
                    resolve(results[8]);
                })
                .catch(perr => {
                    reject(perr);
                });
        });
    };


    // Publicly available password check functions

    // Candidate for async/await or promise.all
    passComplexity.checkUserPassword = (pass, uname) => {
        return new Promise((resolve, reject) => {
            check_pass_length(pass)
                .then(result => {
                    check_password(result, uname)
                        .then(result =>  {
                            resolve(result)
                        })
                        .catch(error => {
                            let err = new Error;
                            err.type = 'passcomplex';
                            err.message = error.message;
                            reject(err);
                        })
                })
                .catch(error => {
                    let err = new Error;
                    err.type = 'passcomplex';
                    err.message = error.message;
                    reject(err);
                });
        });
    };

    // We have a separate check for admin passwords because their
    // Length can be set differently than user account passwords
    passComplexity.checkAdminPassword = (pass, uname) => {
        return new Promise((resolve, reject) => {
            check_admin_pass_length(pass)
                .then(result => {
                    check_password(result, uname)
                        .then(result =>  {
                            resolve(result)
                        })
                        .catch(error => {
                            let err = new Error;
                            err.type = 'passcomplex';
                            err.message = error.message;
                            reject(err);
                        })
                })
                .catch(error => {
                    let err = new Error;
                    err.type = 'passcomplex';
                    err.message = error.message;
                    reject(err);
                });
        });
    };

    return passComplexity;
};