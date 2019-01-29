let express = require("express");
let app = express();
let homeService = new devops.HomeService();
app.get("/index", function (req, res, next) {
    homeService.getSiderBar(req).then(data => {
        res.render('index', {
            title: '首页',
            menu: data[0],
            sub_menu: data[1]
        });
    }).catch(err => {
        next(err);
    });
});
app.post("/index", function (req, res, next) {
    res.render('index', {title: '首页'});
});
exports.controller_name = "home";
exports.app = app;