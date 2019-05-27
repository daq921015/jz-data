let express = require("express");
let app = express();
let logError = devops.publicmethod.logError;
let _ = devops.underscore._;
let publicService = new devops.PublicService();
app.get("/login", function (req, res) {
    if (req.session.islogin) {
        res.redirect("/home/index");
    } else {
        res.render("login", {title: "登录页"});
    }
});
//大屏get登录，并跳转
app.get("/loginFresh", function (req, res, next) {
    publicService.login(req).then(user => {
        res.cookie("isLogin", 'true');
        res.redirect("https://datav.aliyuncs.com/share/c3bbb331b60434df4f7f7dbad8e2415e");
    }).catch(err => {
        next(err);
    });
});
app.post("/login", function (req, res, next) {
    publicService.login(req).then(user => {
        res.cookie("isLogin", 'true');
        res.redirect("/home/index");
    }).catch(err => {
        res.render("login", {
            "status": "error",
            "msg": logError(err),
            "title": "登录页",
            "login_name": req.form_fields["login_name"]
        });
    });
});
app.get("/logout", function (req, res) {
    req.session.destroy();
    req.session = null;
    res.cookie("isLogin", 'false');
    res.redirect("/public/login");
});
exports.controller_name = "public";
exports.app = app;