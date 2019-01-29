let app = require("express")();
let _ = devops.underscore._;
let fs = devops.fs;
app.post("/index", function (req, res, next) {
    res.render("index", {});
});
exports.app = app;
exports.controller_name = "DTenant";