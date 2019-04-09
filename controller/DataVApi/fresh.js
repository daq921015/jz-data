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
let ElasticSearchUtils = devops.ElasticsearchUtils;
// 今日销售额
let before = function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next(req.session.user.is_product ? "" : "非生产环境用户，不具有此模块功能");
};
app.get("/today/saleAmount", function (req, res, next) {
    ElasticSearchUtils.search_aggs({
        index: 'sale_za1',
        body: {
            "query": {
                "bool": {
                    "must": [{
                        "term": {
                            "tenant_id": req.session.user.tenant_id
                        }
                    }, {
                        "range": {
                            "create_at": {
                                "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                "format": "yyyy-MM-dd HH:mm:ss"
                            }
                        }
                    }]
                }
            },
            "aggs": {
                "sale_amount": {
                    "sum": {
                        "field": "total_amount"
                    }
                }
            },
            "size": 0
        }
    }).then(data => {
        res.send([{
            name: "",
            value: data["sale_amount"]["value"].toFixed(0)
        }]);
    }).catch(err => {
        next(err);
    });
});
// 今日销售笔数
app.get("/today/saleCount", async function (req, res, next) {
    // devops.JzApiService.vipStoreAndConsumeByDay(form_fields["tenant_id"], days, form_fields["today"]).then(data => {
    //     console.log(req.cookies);
    //     console.log(req.headers.origin);
    //     console.log(req.session.user);
    //     res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    //     res.setHeader("Access-Control-Allow-Credentials", true);
    //     console.log(data);
    //     res.send(data);
    // }).catch(err => {
    //     next(err);
    // });
});
// 今日平均客单价
app.get("/today/saleAmountPer", async function (req, res, next) {
});


exports.app = app;
exports.before = before;
exports.controller_name = "fresh";