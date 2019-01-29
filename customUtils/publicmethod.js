let logger = devops.logger;
let _ = devops.underscore._;
let publicmethod = {};
publicmethod.logError = function (err, otherInfo) {
    let err_msg = "";
    if (typeof err === "string") {
        err_msg = err;
    } else if (err instanceof Error && err.errors) {
        let errors_message = [];
        err.errors.forEach(function (item) {
            errors_message.push(item.message);
        });
        err_msg = errors_message.join("||")
    } else if (err instanceof Error && err.message) {
        err_msg = err.message;
    } else {
        err_msg = err.stack.split("\n")[0];
    }
    if (typeof otherInfo !== "undefined") {
        logger.error(otherInfo + "|分界|" + err_msg);
    } else {
        // logger.error(err_msg);
        logger.error(err);
    }
    return err_msg;
};
publicmethod.logInfo = function (info) {
    logger.info(info);
};
module.exports = publicmethod;