let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;
let ElasticSearchUtils = devops.ElasticsearchUtils;
let BusinessUtils = devops.BusinessUtils;

class FreshService {
    constructor() {
    }

    todaySaleAmount(req) {
        return ElasticSearchUtils.search_aggs({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
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
                            "field": "received_amount"
                        }
                    }
                },
                "size": 0
            }
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["sale_amount"]["value"].toFixed(0)
            }]);
        });
    }

    todaySaleCount(req) {
        return ElasticSearchUtils.count({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }]
                    }
                }
            }
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["count"]
            }]);
        })
    }

    todaySaleAmountPer(req) {
        return ElasticSearchUtils.search({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
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
                            "field": "received_amount"
                        }
                    }
                },
                "size": 0
            }
        }).then(data => {
            let total = data["hits"]["total"];
            let sale_amount = data["aggregations"]["sale_amount"]["value"];
            let result = 0;
            if (total != 0 && sale_amount != 0) {
                result = (sale_amount / total).toFixed(0);
            }
            return Promise.resolve([{
                name: "",
                value: result
            }]);
        });
    }

    yestodaySaleAmount(req) {
        return ElasticSearchUtils.search_aggs({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }]
                    }
                },
                "aggs": {
                    "sale_amount": {
                        "sum": {
                            "field": "received_amount"
                        }
                    }
                },
                "size": 0
            }
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["sale_amount"]["value"].toFixed(0)
            }]);
        });
    }

    yestodaySaleCount(req) {
        return ElasticSearchUtils.count({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }]
                    }
                }
            }
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["count"]
            }]);
        })
    }

    yestodaySaleAmountPer(req) {
        return ElasticSearchUtils.search({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }]
                    }
                },
                "aggs": {
                    "sale_amount": {
                        "sum": {
                            "field": "received_amount"
                        }
                    }
                },
                "size": 0
            }
        }).then(data => {
            let total = data["hits"]["total"];
            let sale_amount = data["aggregations"]["sale_amount"]["value"];
            let result = 0;
            if (total != 0 && sale_amount != 0) {
                result = (sale_amount / total).toFixed(0);
            }
            return Promise.resolve([{
                name: "",
                value: result
            }]);
        });
    }

    todayBranchTop(req) {
        let result_obj;
        let form_fields = req.form_fields;
        return ElasticSearchUtils.search_aggs({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "branch_group": {
                        "terms": {
                            "field": "branch_id",
                            "size": form_fields["displayCount"] || 10,
                            "order": {
                                "_count": "desc"
                            }
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "received_amount"
                                }
                            }
                        }
                    }
                }
            }
        }).then(data => {
            let buckets = data["branch_group"]["buckets"];
            let branch_ids = [];
            result_obj = {};
            buckets.forEach(function (item) {
                branch_ids.push(item["key"]);
                result_obj[item["key"]] = {
                    branch_id: item["key"],
                    trade_count: item["doc_count"],
                    trade_amount: item["sale_amount"]["value"].toFixed(0),
                    persale: (item["sale_amount"]["value"] / item["doc_count"]).toFixed(0)
                }
            });
            return BusinessUtils.getBranchInfo({
                tenant_id: req.session.user.tenant_id,
                partition_code: req.session.user.partition_code,
                branch_ids: branch_ids,
                is_elastic: false,
                env_id: 1
            });
        }).then(data => {
            data.forEach(function (item) {//添加门店信息
                if (_.has(result_obj, item["id"])) result_obj[item["id"]]["branch_name"] = item["name"];
            });
            return Promise.resolve(_.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            }));
        });
    }

    todayGoodsTop(req) {
        let result_obj;
        let form_fields = req.form_fields;
        return ElasticSearchUtils.search_aggs({
            index: 'sale_detail_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "goods_group": {
                        "terms": {
                            "field": "goods_id",
                            "size": form_fields["displayCount"] || 15,
                            "order": {
                                "_count": "desc"
                            }
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "received_amount"
                                }
                            }
                        }
                    }
                }
            }
        }).then(data => {
            let buckets = data["goods_group"]["buckets"];
            let goods_ids = [];
            result_obj = {};
            buckets.forEach(function (item) {
                goods_ids.push(item["key"]);
                result_obj[item["key"]] = {
                    goods_id: item["key"],
                    trade_count: item["doc_count"],
                    trade_amount: item["sale_amount"]["value"].toFixed(0)
                }
            });
            return BusinessUtils.getGoodsInfo({
                tenant_id: req.session.user.tenant_id,
                partition_code: req.session.user.partition_code,
                goods_ids: goods_ids,
                is_elastic: false,
                env_id: 1
            });
        }).then(data => {
            data.forEach(function (item) {//添加商品信息
                if (_.has(result_obj, item["id"])) result_obj[item["id"]]["goods_name"] = item["goods_name"];
            });
            return Promise.resolve(_.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            }));
        });
    }

    todayPaymentAmount(req) {
        let result_obj;
        return ElasticSearchUtils.search_aggs({
            index: 'sale_payment_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": {"value": false}}},
                            {
                                "range": {
                                    "payment_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "payment_group": {
                        "terms": {
                            "field": "payment_id",
                            "size": 1000
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "amount"
                                }
                            }
                        }
                    }
                }
            }
        }).then(data => {
            let buckets = data["payment_group"]["buckets"];
            let payment_ids = [];
            result_obj = {};
            buckets.forEach(function (item) {
                payment_ids.push(item["key"]);
                result_obj[item["key"]] = {
                    payment_id: item["key"],
                    trade_count: item["doc_count"],
                    trade_amount: item["sale_amount"]["value"].toFixed(0),
                }
            });
            return BusinessUtils.getPaymentInfo({
                tenant_id: req.session.user.tenant_id,
                partition_code: req.session.user.partition_code,
                payment_ids: payment_ids,
                is_elastic: false,
                env_id: 1
            });
        }).then(data => {
            data.forEach(function (item) {//添加付款名称
                if (_.has(result_obj, item["id"])) result_obj[item["id"]]["payment_name"] = item["payment_name"];
            });
            return Promise.resolve(_.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            }));
        });
    }

    nearDaysSaleAmount(req) {
        let form_fields = req.form_fields;
        return ElasticSearchUtils.search_aggs({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().subtract(form_fields["displayCount"] || 30, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "groupDate": {
                        "date_histogram": {
                            "field": "create_at",
                            "interval": "day",
                            "format": "dd",
                            "time_zone": "Asia/Shanghai"
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "received_amount"
                                }
                            }
                        }
                    }
                },
                "sort": [{"create_at": "asc"}]
            }
        }).then(data => {
            let result = [];
            data["groupDate"]["buckets"].forEach(function (item) {
                result.push({
                    date: item["key_as_string"],
                    sale_count: item["doc_count"],
                    sale_amount: item["sale_amount"]["value"].toFixed(0),
                    x: item["key_as_string"],
                    y: item["sale_amount"]["value"].toFixed(0),
                });
            });
            return Promise.resolve(result)
        });
    }

    todayHourSaleAmount(req) {
        return ElasticSearchUtils.search_aggs({
            index: 'sale_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "groupDate": {
                        "date_histogram": {
                            "field": "create_at",
                            "interval": "hour",
                            "format": "HH",
                            "time_zone": "Asia/Shanghai"
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "received_amount"
                                }
                            }
                        }
                    }
                },
                "sort": [{"create_at": "asc"}]
            }
        }).then(data => {
            let result = [];
            data["groupDate"]["buckets"].forEach(function (item) {
                result.push({
                    hour: item["key_as_string"],
                    sale_count: item["doc_count"],
                    sale_amount: item["sale_amount"]["value"].toFixed(0),
                    x: item["key_as_string"] + "h",
                    y: item["sale_amount"]["value"].toFixed(0),
                });
            });
            return Promise.resolve(result)
        });
    }

    todayCategoryTop(req) {
        let result_obj;
        let form_fields = req.form_fields;
        return ElasticSearchUtils.search_aggs({
            index: 'sale_detail_' + req.session.user.partition_code,
            body: {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"tenant_id": req.session.user.tenant_id}},
                            {"term": {"is_deleted": false}},
                            {
                                "range": {
                                    "create_at": {
                                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                        "format": "yyyy-MM-dd HH:mm:ss"
                                    }
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "category_group": {
                        "terms": {
                            "field": "category_id",
                            "size": form_fields["displayCount"] || 5,
                            "order": {
                                "_count": "desc"
                            }
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "field": "received_amount"
                                }
                            }
                        }
                    }
                }
            }
        }).then(data => {
            let buckets = data["category_group"]["buckets"];
            let category_ids = [];
            result_obj = {};
            buckets.forEach(function (item) {
                category_ids.push(item["key"]);
                result_obj[item["key"]] = {
                    category_id: item["key"],
                    trade_count: item["doc_count"],
                    trade_amount: item["sale_amount"]["value"].toFixed(0)
                }
            });
            return BusinessUtils.getCategoryInfo({
                tenant_id: req.session.user.tenant_id,
                partition_code: req.session.user.partition_code,
                category_ids: category_ids,
                is_elastic: false,
                env_id: 1
            });
        }).then(data => {
            data.forEach(function (item) {//添加分类信息
                if (_.has(result_obj, item["id"])) {
                    result_obj[item["id"]]["cat_name"] = item["cat_name"];
                    result_obj[item["id"]]["cat_code"] = item["cat_code"];
                }
            });
            return Promise.resolve(_.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            }));
        });
    }
}

module.exports = function (devops) {
    devops["FreshService"] = FreshService;
};