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