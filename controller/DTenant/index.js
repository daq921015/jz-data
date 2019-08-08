let app = require("express")();
let _ = devops.underscore._;
let fs = devops.fs;
app.post("/index", function (req, res, next) {
    if (!req.session.user.is_product) {
        res.render("forbid", {});
    } else {
        res.render("index", {
            tenantId: req.session.user.tenant_id
        });
    }
});
exports.app = app;
exports.controller_name = "DTenant";