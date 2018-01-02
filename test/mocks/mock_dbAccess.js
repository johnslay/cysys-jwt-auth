


module.exports = () =>{
    "use strict";

    const dbAccess = {};

    dbAccess.get_password_info = (param) =>{
        return new Promise(function(resolve, reject){
            if (param){
                resolve(param);
            } else {
                reject(new Error('Bad Panda'));
            }
        })
    };

    return dbAccess;

};