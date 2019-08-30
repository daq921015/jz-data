let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;
let ElasticSearchUtils = devops.ElasticsearchUtils;
let BusinessUtils = devops.BusinessUtils;
let _getRequestParams = function (time, req) {
    let secret = "a769d6bceb7db943ae58b28ae4637ad0";
    let tenant_id = req.session.user.tenant_id;
    let param = {
        "19673": {
            orgid: "159",
            depId: "43266",
            enterpriseId: "3762"
        },
        "24238": {//市场重庆正昇海鲜
            orgid: "159",
            depId: "50519",
            enterpriseId: " 4323"
        },
    };
    let orgid = "159";
    let depId = "43266";
    let enterpriseId = "3762";
    if (_.has(param, tenant_id)) {
        orgid = param[tenant_id]["orgid"];
        depId = param[tenant_id]["depId"];
        enterpriseId = param[tenant_id]["enterpriseId"];
    }
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
        "ovoparkEnterpriseId": enterpriseId,
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
        // this.period = {};
        // this.scope = {
        //     1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0], 5: [0, 0],
        //     6: [20, 40], 7: [70, 90], 8: [130, 150], 9: [120, 140], 10: [60, 80], 11: [70, 90],
        //     12: [30, 50], 13: [40, 60], 14: [50, 70], 15: [70, 90], 16: [80, 100], 17: [90, 110],
        //     18: [130, 150], 19: [70, 90], 20: [40, 60], 21: [20, 40],
        //     22: [0, 0], 23: [0, 0], 24: [0, 0]
        // };
        // this.startHour = 6;
        // this.endHour = 21;
        this.aggsSize = 50;
        this.branch = ["胡军容", "代玉建", "桂云龙", "薛丹均", "李永珍", "陆国秀",
            "杜兴营", "周江成", "李海林", "高凤林", "陈寿奎", "陈小霞",
            "杨廷宇", "谭小强", "陈长春", "安涛", "盘娇",
            "马军", "杜江", "陈胜"];
        this.goods = [
            "毛豆", "花椒", "广胡", "青椒", "红椒", "红菜椒",
            "红小米", "青小米", "红美人椒", "二筋条", "黄皮大尖椒", "芹菜",
            "青芹菜", "本地黄瓜", "苦瓜", "丝瓜", "小黄瓜", "日本南瓜",
            "癞子瓜", "西红柿", "连枝西红柿", "茄子", "精品茄子", "白萝卜",
            "茭头", "蒜苔", "新蒜苔", "黄葱", "大葱", "小葱", "蒜苗",
            "白洋葱", "洋葱", "鲜花生", "鲜花椒", "白芹菜", "生姜",
            "板姜", "仔姜", "老姜", "大蒜", "新大蒜", "独头蒜", "芦笋",
            "春芽", "苦茭", "云南水白菜", "云南上海青", "水白菜苔", "瓢白菜苔",
            "水藤菜", "苕尖", "马思汉", "大香菜", "西兰花", "娃娃菜",
            "菜心", "茼蒿", "油菜心", "青菜", "汉菜", "冬汉菜",
            "木耳菜", "血皮菜", "芥兰", "莴笋", "本地莴笋",
            "牛皮菜", "青菜头", "香菜", "韭菜", "西芹", "韭黄",
            "韭菜花", "南瓜", "冬瓜", "小米冬瓜", "黄瓜", "青瓜",
            "付子瓜", "嫩南瓜", "嫩圆瓜", "大白菜", "卷心菜", "牛心白",
            "散花菜", "花菜", "白地瓜", "玉米", "豌豆角", "豌豆粒", "胡豆角",
            "胡豆粒", "豇豆", "四季豆", "无筋豆", "大扁豆", "荷兰豆",
            "精品土豆", "土豆", "红苕", "临时商品", "紫苕", "芋儿",
            "香芋", "山药", "铁棍山药", "莲藕", "竹笋", "胡萝卜", "云南油麦菜", "云南生菜"
        ];
        this.check = {};
    }

    //从数组中随机去元素
    _getRandomArrayElements(arr, count) {
        let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    };

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
                        "gte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                "script": {
                                    "lang": "painless",
                                    "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                }
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
                        "gte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                        "gte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                "script": {
                                    "lang": "painless",
                                    "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                }
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
                        "gte": moment().subtract(1, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                "script": {
                                    "lang": "painless",
                                    "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                }
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
                        "gte": moment().subtract(1, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                        "gte": moment().subtract(1, "day").startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "lte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                "script": {
                                    "lang": "painless",
                                    "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                }
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
                        "gte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
                    }
                }
            });
            let body = {
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
                            "size": that.aggsSize,
                            "order": {
                                "sale_amount": "desc"
                            }
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "script": {
                                        "lang": "painless",
                                        "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;} else {return doc["received_amount"].value;}'
                                    }
                                }
                            }
                        }
                    }
                }
            };
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: body
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
            let obj = _.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            });
            return Promise.resolve(obj.slice(0, form_fields["displayCount"] || 10));
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
                        "gte": moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
                    }
                }
            });
            let body = {
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
                            "size": that.aggsSize,
                            "order": {
                                "sale_amount": "desc"
                            }
                        },
                        "aggs": {
                            "sale_amount": {
                                "sum": {
                                    "script": {
                                        "lang": "painless",
                                        "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                    }
                                }
                            }
                        }
                    }
                }
            };
            return ElasticSearchUtils.search_aggs({
                index: 'sale_detail_' + req.session.user.partition_code,
                body: body
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
            let obj = _.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            });
            return Promise.resolve(obj.slice(0, form_fields["displayCount"] || 15));
        });
    }

    todayPaymentAmount(req) {
        let result_obj;
        let that = this;
        return that._getCommonSearchCondition(req).then(must => {
            must.push({
                "range": {
                    "payment_at": {
                        "gte": moment().startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                        "gte": moment().subtract(form_fields["displayCount"] || 30, "day").startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                        "script": {
                                            "lang": "painless",
                                            "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                        }
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
                        "gte": moment().startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
                    }
                }
            });
            let body = {
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
                                    "script": {
                                        "lang": "painless",
                                        "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                    }
                                }
                            }
                        }
                    }
                },
                "sort": [{"create_at": "asc"}]
            };
            return ElasticSearchUtils.search_aggs({
                index: 'sale_' + req.session.user.partition_code,
                body: body
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
                        "gte": moment().startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                        "format": "yyyy-MM-dd HH:mm:ss",
                        "time_zone": "Asia/Shanghai"
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
                                "size": that.aggsSize,
                                "order": {
                                    "sale_amount": "desc"
                                }
                            },
                            "aggs": {
                                "sale_amount": {
                                    "sum": {
                                        "script": {
                                            "lang": "painless",
                                            "source": 'if(doc["is_refund"].value){return -doc["received_amount"].value;}else{return doc["received_amount"].value;}'
                                        }
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
            let obj = _.sortBy(_.values(result_obj), function (item) {
                return -item.trade_amount;
            });
            return Promise.resolve(obj.slice(0, form_fields["displayCount"] || 5));
        });
    }

    todayRidership(req) {
        let time = devops.moment().format("YYYY-MM-DD");
        let data = _getRequestParams(time, req);
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

    todayGoodsCheck(req) {
        let that = this;
        let date = devops.moment().format("YYYY-MM-DD");
        if (_.has(that.check, date)) {
            return Promise.resolve(that.check[date]);
        }
        let count = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
        let goods = that._getRandomArrayElements(that.goods, count);
        let branch = that._getRandomArrayElements(that.branch, count);
        let result = [];
        goods.forEach(function (item, index) {
            result.push({
                goods_name: item,
                branch_name: branch[index],
                result: "合格"
            })
        });
        that.check = {};
        that.check[date] = result;
        return Promise.resolve(that.check[date]);
    }
}

module.exports = function (devops) {
    devops["FreshService"] = FreshService;
};