/**
 * Created by michael on 3/4/17.
 */

module.exports = () =>{
    "use strict";
    const logger = {};

    logger.applog = {};

    logger.applog.debug = (param) => {
        //console.log(param);
    };

    logger.applog.info = (param) => {
        //console.info(param);
    };

    logger.applog.error = (param) => {
        //console.error(param);
    }

    return logger;

};