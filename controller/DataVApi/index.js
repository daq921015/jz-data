/**
 * Created by Administrator on 2018-02-01.
 */
let app = require("express")();
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;
app.get("/vipStoreAndConsumeByDay", async function (req, res, next) {
    let form_fields = req.form_fields, days = 7, today = 1;
    if (!_.has(form_fields, "tenant_id") || !/\d+/.test(form_fields["tenant_id"])) {
        return next("参数缺失：tenant_id,或格式不正确(纯数字)")
    }
    if (_.has(form_fields, "days") && /\d{1,2}/.test(form_fields["days"])) {
        days = form_fields["days"];
    }
    devops.JzApiService.vipStoreAndConsumeByDay(form_fields["tenant_id"], days, form_fields["today"]).then(data => {
        console.log(req.cookies);
        console.log(req.headers.origin);
        console.log(req.session.user);
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.setHeader("Access-Control-Allow-Credentials", true);
        console.log(data);
        res.send(data);
    }).catch(err => {
        next(err);
    });
});
app.get("/generateDate", async function (req, res, next) {
    let start_date = moment().subtract(360, "d").utcOffset(8).format("YYYY-MM-DD");
    let end_date = moment().add(600, "d").utcOffset(8).format("YYYY-MM-DD");
    while (!moment(start_date).isAfter(end_date)) { // 开始时间不大于结束时间
        try {
            await models.JzResult.bulkCreate([{
                occurred_at: start_date
            }], {
                ignoreDuplicates: true
            })
        } catch (err) {
            console.log(err);
        } finally {
            start_date = moment(start_date).add(1, "d").format("YYYY-MM-DD");
        }
    }
    res.send("over");
});


exports.app = app;
exports.controller_name = "DataVApi";