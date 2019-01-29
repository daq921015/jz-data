module.exports = app => {
// catch 404 and forward to error handler
    let _ = devops.underscore._;
    app.use(function (req, res, next) {
        devops.publicmethod.logError("请求页面未找到:" + req.url);
        if (_.has(req.form_fields, "isJson") && req.form_fields["isJson"]) {
            res.send({"status": "error", "msg": "请求页面未找到:" + req.url, "data": ""});
        } else {
            res.status(404);
            res.render("4xx");
        }
    });

// error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        // devops.publicmethod.logError(err, req.originalUrl);
        if (res.isSessionTimeOut) {//如果是session超时
            if ((_.has(req.form_fields, "isJson") && req.form_fields["isJson"]) || res.locals.isJson) {//ajax请求或手动设置请求参数
                res.send({"status": "sessionTimeOut", "msg": "当前回话超时，请重新登录", "data": ""});
            } else {
                res.render('sessionTimeOut');
            }
        } else {
            let err_msg = devops.publicmethod.logError(err);
            if (_.has(req.form_fields, "isJson") && req.form_fields["isJson"]) {
                if (app.get("env") === "development") {
                    res.send({"status": "error", "msg": "" + err, "data": ""});
                } else {
                    res.send({"status": "error", "msg": "" + err_msg, "data": ""});
                }
            } else {
                res.status(500);
                res.locals.err_msg = err_msg;
                // res.locals.error = req.app.get('env') === 'development' ? err : {};
                // render the error page
                // res.status(err.status || 500);
                res.render('error');
            }
        }
    });
};