/**
 * Created by Administrator on 2018-02-01.
 */
let app = require("express")();
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let ElasticsearchUtils = devops.ElasticsearchUtils;
let models = devopsdb.models;
let moment = devops.moment;
let ElasticSearchUtils = devops.ElasticsearchUtils;
let fs = devops.fs;

app.get("/vipStoreAndConsumeByDay", async function (req, res, next) {
    let form_fields = req.form_fields, days = 7, today = 1;
    if (!_.has(form_fields, "tenant_id") || !/\d+/.test(form_fields["tenant_id"])) {
        return next("参数缺失：tenant_id,或格式不正确(纯数字)")
    }
    if (_.has(form_fields, "days") && /\d{1,2}/.test(form_fields["days"])) {
        days = form_fields["days"];
    }
    devops.JzApiService.vipStoreAndConsumeByDay(form_fields["tenant_id"], days, form_fields["today"]).then(data => {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
        res.setHeader("Access-Control-Allow-Credentials", true);
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
app.get("/test", async function (req, res, next) {
    let form_fields = req.form_fields;
    // http://192.168.51.55/DataVApi/test?maxId=1000000&limit=5000&lastId=0&tableName=goods&partitionCode=za1
    if (!/\d+/.test(form_fields["lastId"]) || !/\d+/.test(form_fields["maxId"]) || !/\d+/.test(form_fields["limit"]) || !_.has(form_fields, "partitionCode") || !_.has(form_fields, "tableName")) {
        res.send("参数异常");
    } else {
        res.send("已添加完成");
        let lastId = form_fields["lastId"];
        let maxId = form_fields["maxId"];
        let limit = form_fields["limit"];
        let partitionCode = form_fields["partitionCode"];
        let tableName = form_fields["tableName"];
        while (true) {
            try {
                lastId = await ElasticsearchUtils.mysqlToElasticsearch(partitionCode, tableName, lastId + 1, limit);
            } catch (err) {
                console.log(err);
                break;
            }
            if (lastId > maxId) {
                console.log("转换完成，最后id:" + lastId);
                break;
            }
        }
    }
});
app.get("/data", function (req, res, next) {
    ElasticSearchUtils.search_hits({
        index: 'za1_sale',
        body: {
            // "_source": ["id", "name", "code"],
            "size": 10000,
            "query": {
                "bool": {
                    "must": {
                        "term": {"tenant_id": 17996}
                    }
                }
            },
            "sort": {
                id: "asc"
            }
        }
    }).then(data => {
        let hits = data["hits"];
        let values = [];
        let date_fields = ["last_update_at", "create_at", "checkout_at"];
        let sale_fields = [
            "id", "client_id", "tenant_id", "branch_id", "sale_code",
            "pos_id", "sale_mode", "pos_code", "table_id", "total_amount",
            "discount_amount", "give_amount", "trunc_amount", "is_free_of_charge",
            "service_fee", "received_amount", "order_attendant", "service_attendant",
            "table_open_at", "open_attendant", "cashier", "checkout_at",
            "promotion_id", "is_refund", "order_status", "delivery_status",
            "sale_order_code", "create_by", "create_at", "last_update_by",
            "last_update_at", "is_deleted", "sale_type", "long_amount",
            "login_time", "local_id", "change_amount", "local_sign", "vip_id",
            "trans_terminal", "pay_type", "guide_id", "box_price",
            "income"];
        hits.forEach(function (item, index) {
            let row = item["_source"];
            delete  row["@timestamp"];
            delete  row["@version"];
            delete  row["type"];
            let value = "";
            sale_fields.forEach(function (field) {
                let _val = row[field];
                if (_.contains(date_fields, field)) {
                    _val = moment(row[field]).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
                }
                if (typeof _val == "string") {
                    _val = "'" + _val + "'";
                }
                value = value + "," + _val;
            });
            values.push("(" + value.substr(1, value.length - 1) + ")");
        });
        fs.writeFileSync("e:/1.txt", "insert into sale(" + sale_fields.join(",") + ") values" + values.join(","));
        res.send("over");
    })
});
app.get("/data2", function (req, res, next) {
    ElasticSearchUtils.search_hits({
        index: 'za1_sale_detail',
        body: {
            // "_source": ["id", "name", "code"],
            "size": 10000,
            "query": {
                "bool": {
                    "must": {
                        "term": {"tenant_id": 17996}
                    }
                }
            },
            "sort": {
                id: "asc"
            }
        }
    }).then(data => {
        let hits = data["hits"];
        let values = [];
        let date_fields = ["last_update_at", "create_at"];
        let fields = [
            "id",
            "sale_code",
            "package_id",
            "goods_id",
            "is_package",
            "promotion_id",
            "quantity",
            "sale_price",
            "sale_price_actual",
            "total_amount",
            "is_free_of_charge",
            "received_amount",
            "is_refund",
            "is_printed",
            "create_by",
            "create_at",
            "last_update_by",
            "last_update_at",
            "is_deleted",
            "tenant_id",
            "branch_id",
            "discount_amount",
            "discount_amount1",
            "local_id",
            "pay_at",
            "remark",
            "changed_price",
            "saleTable_id",
            "memo",
            "goods_spec_id",
            "local_sign",
            "spec_amount",
            "is_produced",
            "is_served",
            "parent_packag_id",
            "sale_type",
            "vip_id",
            "cashier",
            "guide_id",
            "trans_terminal",
            "pay_type",
            "income",
            "batch_id",
            "batch_goods_code"];
        hits.forEach(function (item, index) {
            let row = item["_source"];
            delete  row["@timestamp"];
            delete  row["@version"];
            delete  row["type"];
            let value = "";
            fields.forEach(function (field) {
                let _val = row[field];
                if (_.contains(date_fields, field)) {
                    _val = moment(row[field]).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
                }
                if (typeof _val == "string") {
                    _val = "'" + _val + "'";
                }
                value = value + "," + _val;
            });
            values.push("(" + value.substr(1, value.length - 1) + ")");
        });
        fs.writeFileSync("e:/1.txt", "insert into sale_detail(" + fields.join(",") + ") values" + values.join(","));
        res.send("over");
    })
});
app.get("/data3", function (req, res, next) {
    ElasticSearchUtils.search_hits({
        index: 'za1_sale_payment',
        body: {
            // "_source": ["id", "name", "code"],
            "size": 10000,
            "query": {
                "bool": {
                    "must": {
                        "term": {"tenant_id": 17996}
                    }
                }
            },
            "sort": {
                id: "asc"
            }
        }
    }).then(data => {
        let hits = data["hits"];
        let values = [];
        let date_fields = ["last_update_at", "create_at", "payment_at"];
        let fields = [
            "id",
            "sale_payment_code",
            "sale_code",
            "payment_id",
            "payment_code",
            "pay_total",
            "amount",
            "pos_id",
            "change_amount",
            "memo",
            "cashier",
            "payment_at",
            "create_by",
            "create_at",
            "last_update_by",
            "last_update_at",
            "is_deleted",
            "tenant_id",
            "branch_id",
            "is_refund",
            "local_id",
            "local_sign",
            "is_long_amount",
            "other_code",
            "vip_id",
            "trans_terminal",
            "pay_type",
            "guide_id",
            "sale_type",
            "income",
            "is_manual_mark"
        ];
        hits.forEach(function (item, index) {
            let row = item["_source"];
            delete  row["@timestamp"];
            delete  row["@version"];
            delete  row["type"];
            let value = "";
            fields.forEach(function (field) {
                let _val = row[field];
                if (_.contains(date_fields, field)) {
                    _val = moment(row[field]).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
                }
                if (typeof _val == "string") {
                    _val = "'" + _val + "'";
                }
                value = value + "," + _val;
            });
            values.push("(" + value.substr(1, value.length - 1) + ")");
        });
        fs.writeFileSync("e:/1.txt", "insert into sale_payment(" + fields.join(",") + ") values" + values.join(","));
        res.send("over");
    })
});

exports.app = app;
exports.controller_name = "DataVApi";