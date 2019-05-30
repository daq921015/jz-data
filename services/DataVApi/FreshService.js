let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;
let ElasticSearchUtils = devops.ElasticsearchUtils;
let BusinessUtils = devops.BusinessUtils;
let _getRequestParams = function (time) {
    let secret = "a769d6bceb7db943ae58b28ae4637ad0";
    let orgid = "159";
    let depId = "43266";
    let config = {
        "_aid": 'S107',                                // 开放平台系统编号
        "_akey": 'S107-00000095',                      // 万店掌开放平台分配给第三方的开发者key
        "_mt": 'open.face.passengerflow.getShopDailyPassengers',                                  // 接口名称
        "_sm": 'md5',                                  // 签名算法 md5,sha1
        "_requestMode": 'post',                         // 请求方式post,get
        "_version": 'v2',                              // 版本号
        "_timestamp": new Date().format('yyyyMMddhhmmss'),
        "orgid": orgid,
        "depId": depId,
        "time": time
    };
    let signValue = '', keyArr = Object.keys(config).sort();
    keyArr.forEach(item => {
        signValue += item + config[item]
    });
    signValue = secret + signValue + secret;
    config["_sig"] = devops.CryptoJS.MD5(signValue).toString().toUpperCase();
    return config;
};

class FreshService {
    constructor() {
        this.period = {};
        this.scope = {
            1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0], 5: [0, 0],
            6: [20, 40], 7: [70, 90], 8: [130, 150], 9: [120, 140], 10: [60, 80], 11: [70, 90],
            12: [30, 50], 13: [40, 60], 14: [50, 70], 15: [70, 90], 16: [80, 100], 17: [90, 110],
            18: [130, 150], 19: [70, 90], 20: [40, 60], 21: [20, 40],
            22: [0, 0], 23: [0, 0], 24: [0, 0]
        };
        this.startHour = 6;
        this.endHour = 21;
    }

    _getCommonSearchCondition(req) {
        let user = req.session.user;
        let condition = [
            {"term": {"tenant_id": user.tenant_id}},
            {"term": {"is_deleted": false}}
        ];
        let where = {
            tenant_id: user.tenant_id,
            is_deleted: 0
        };

        if (user.commercial_type == 3) {//档口门店
            where["parent_id"] = user.branch_id;
        }
        return Sequelize.getBusinessTableModel(1, user["partition_code"], "branch").then(Branch => {
            return Branch.findAllCustom(where)
        }).then(data => {
            if (!data) {
                return Promise.resolve([]);
            }
            return Promise.resolve(_.pluck(data, "branch_id"));
        }).then(Branchs => {
            Branchs.push(user.branch_id);
            condition.push({"terms": {"branch_id": Branchs}});
            return condition;
        })
    }

    todaySaleAmount(req) {
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
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
            })
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["sale_amount"]["value"].toFixed(0)
            }]);
        });
    }

    todaySaleCount(req) {
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.count({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
                        }
                    }
                }
            })
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["count"]
            }]);
        })
    }

    todaySaleAmountPer(req) {
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
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
            })
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["sale_amount"]["value"].toFixed(0)
            }]);
        });
    }

    yestodaySaleCount(req) {
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.count({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
                        }
                    }
                }
            })
        }).then(data => {
            return Promise.resolve([{
                name: "",
                value: data["count"]
            }]);
        })
    }

    yestodaySaleAmountPer(req) {
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().subtract(1, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "query": {
                        "bool": {
                            "must": must
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
                        }
                    },
                    "aggs": {
                        "branch_group": {
                            "terms": {
                                "field": "branch_id",
                                "size": form_fields["displayCount"] || 10,
                                "order": {
                                    "sale_amount": "desc"
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_detail_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
                        }
                    },
                    "aggs": {
                        "goods_group": {
                            "terms": {
                                "field": "goods_id",
                                "size": form_fields["displayCount"] || 15,
                                "order": {
                                    "sale_amount": "desc"
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "payment_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_payment_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().subtract(form_fields["displayCount"] || 30, "day").startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
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
            })
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
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "create_at": {
                        "gte": moment().startOf('day').subtract(8, "hour").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss"
                    }
                }
            });
            return ElasticSearchUtils.search_aggs({
                index: 'sale_detail_' + req.session.user.partition_code,
                body: {
                    "size": 0,
                    "query": {
                        "bool": {
                            "must": must
                        }
                    },
                    "aggs": {
                        "category_group": {
                            "terms": {
                                "field": "category_id",
                                "size": form_fields["displayCount"] || 5,
                                "order": {
                                    "sale_amount": "desc"
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
            })
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

    todayRidership(req) {
        let time = devops.moment().format("YYYY-MM-DD");
        let data = _getRequestParams(time);
        return devops.request_promise({
            url: "http://openapi.ovopark.com/m.api",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            form: data
        }).then(data => {
            let obj = JSON.parse(data);
            if (obj["result"] == "成功") {
                let list = obj["data"];
                let result = [];
                list.forEach(function (item, index) {
                    result.push({
                        x: index + "h",
                        y: item["regularNum"] + item["suspectNum"] + item["customerNum"] + item["workerNum"] + item["vipNum"]
                    });
                });
                return Promise.resolve(result);
            } else {
                devops.publicmethod.logInfo(data);
                return Promise.reject("请求客流量接口失败")
            }
        });
        // let result = [];
        // let nowHours = moment().utcOffset(8).hours();//当前小时
        // let ratio = 7;//数据，数值倍数
        // if (nowHours >= this.startHour) {//当前时间大于等于开始时间
        //     let endHour = nowHours > this.endHour ? this.endHour : nowHours;//结束小时，不大于最大结束小时
        //     let indexHour = this.startHour;//当前计算中小时
        //     while (indexHour <= endHour) {
        //         let min = this.scope[indexHour][0];//范围最小值
        //         let max = this.scope[indexHour][1];//范围最大值
        //         if (indexHour == endHour && _.has(this.period, indexHour)) {//当前小时，值不能小于上次获取值
        //             min = Math.round(this.period[indexHour] / ratio);
        //             let value = Math.round((Math.random() * (max - min) + min) * ratio);
        //             this.period[indexHour] = value;
        //         }
        //         if (!_.has(this.period, indexHour)) {//没有存储过当前小时数
        //             let value = Math.round((Math.random() * (max - min) + min) * ratio);
        //             this.period[indexHour] = value;
        //         }
        //         result.push({
        //             x: indexHour + "h",
        //             y: this.period[indexHour]
        //         });
        //         indexHour++;
        //     }
        // }
        // return Promise.resolve(result)
    }
}

module.exports = function (devops) {
    devops["FreshService"] = FreshService;
};