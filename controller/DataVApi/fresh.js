/**
 * Created by Administrator on 2018-04-09.
 * 生鲜大屏接口
 */
let app = require("express")();
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;
let freshService = new devops.FreshService();

let before = function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next(req.session.user.is_product ? "" : "非生产环境用户，不具有此模块功能");
};
// 今日销售额
app.get("/today/saleAmount", function (req, res, next) {
    freshService.todaySaleAmount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
// 今日销售笔数
app.get("/today/saleCount", function (req, res, next) {
    freshService.todaySaleCount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
// 今日平均客单价
app.get("/today/saleAmountPer", function (req, res, next) {
    freshService.todaySaleAmountPer(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/yestoday/saleAmount", function (req, res, next) {
    freshService.yestodaySaleAmount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/yestoday/saleCount", function (req, res, next) {
    freshService.yestodaySaleCount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/yestoday/saleAmountPer", function (req, res, next) {
    freshService.yestodaySaleAmountPer(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/today/branchTop", function (req, res, next) {
    let form_fields = req.form_fields;
    if (_.has(form_fields, "displayCount") && !/^\d+$/.test(form_fields["displayCount"])) {
        next("displayCount参数不正确displayCount=\\d+")
    } else {
        freshService.todayBranchTop(req).then(data => {
            res.send(data);
        }).catch(err => {
            next(err);
        });
    }
});
app.get("/today/goodsTop", function (req, res, next) {
    let form_fields = req.form_fields;
    if (_.has(form_fields, "displayCount") && !/^\d+$/.test(form_fields["displayCount"])) {
        next("displayCount参数不正确displayCount=\\d+")
    } else {
        freshService.todayGoodsTop(req).then(data => {
            res.send(data);
        }).catch(err => {
            next(err);
        });
    }
});
//今日收款方式占比
app.get("/today/paymentAmount", function (req, res, next) {
    freshService.todayPaymentAmount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/nearday/saleAmount", function (req, res, next) {
    let form_fields = req.form_fields;
    if (_.has(form_fields, "displayCount") && !/^\d+$/.test(form_fields["displayCount"])) {
        next("displayCount参数不正确displayCount=\\d+")
    } else {
        freshService.nearDaysSaleAmount(req).then(data => {
            res.send(data);
        }).catch(err => {
            next(err);
        });
    }
});
app.get("/today/hourSaleAmount", function (req, res, next) {
    freshService.todayHourSaleAmount(req).then(data => {
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/today/categoryTop", function (req, res, next) {
    let form_fields = req.form_fields;
    if (_.has(form_fields, "displayCount") && !/^\d+$/.test(form_fields["displayCount"])) {
        next("displayCount参数不正确displayCount=\\d+")
    } else {
        freshService.todayCategoryTop(req).then(data => {
            res.send(data);
        }).catch(err => {
            next(err);
        });
    }
});

exports.app = app;
exports.before = before;
exports.controller_name = "fresh";