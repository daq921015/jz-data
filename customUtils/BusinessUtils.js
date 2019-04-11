let logger = devops.logger;
let myssh = devops.myssh;
let _ = devops.underscore._;
let myconfig = devops.myconfig;
let ElasticSearchUtils = devops.ElasticsearchUtils;
let Sequelize = devops.Sequelize;
let BusinessUtils = {};
BusinessUtils.getBranchInfo = function (param) {
    if (!_.has(param, "tenant_id") || !_.has(param, "branch_ids") || !_.has(param, "partition_code")) {
        return Promise.reject("商户id、门店id或分区参数缺失")
    }
    if (param["is_elastic"]) {
        let must = [
            {"term": {"tenant_id": param["tenant_id"] || 0}}
        ];
        if (param["branch_ids"].length > 0) {
            must.push({"terms": {"id": param["branch_ids"]}})
        }
        return ElasticSearchUtils.search_hits({
            index: 'branch_' + param["partition_code"],
            body: {
                "_source": ["id", "name", "code"],
                "query": {
                    "bool": {
                        "must": must
                    }
                }
            }
        }).then(data => {
            return _.pluck(data["hits"], "_source");
        })
    } else {
        if (!_.has(param, "env_id")) {
            return Promise.reject("环境参数缺失")
        }
        return Sequelize.getBusinessTableModel(1, param["partition_code"], "branch").then(Branch => {
            return Branch.findAllCustom({
                tenant_id: param["tenant_id"] || 0,
                branch_id: param["branch_ids"],
                custom_options: {attributes: ["id", "code", "name"]}
            })
        }).then(data => {
            return Promise.resolve(data)
        })
    }
};
BusinessUtils.getGoodsInfo = function (param) {
    if (!_.has(param, "tenant_id") || !_.has(param, "goods_ids") || !_.has(param, "partition_code")) {
        return Promise.reject("商户id、商品id或分区参数缺失")
    }
    if (param["is_elastic"]) {
        let must = [
            {"term": {"tenant_id": param["tenant_id"] || 0}}
        ];
        if (param["goods_ids"].length > 0) {
            must.push({"terms": {"id": param["goods_ids"]}})
        }
        return ElasticSearchUtils.search_hits({
            index: 'goods_' + param["partition_code"],
            body: {
                "_source": ["id", "goods_code", "goods_name"],
                "query": {
                    "bool": {
                        "must": must
                    }
                },
                size: 10000
            }
        }).then(data => {
            return _.pluck(data["hits"], "_source");
        })
    } else {
        if (!_.has(param, "env_id")) {
            return Promise.reject("环境参数缺失")
        }
        return Sequelize.getBusinessTableModel(1, param["partition_code"], "goods").then(Goods => {
            return Goods.findAllCustom({
                tenant_id: param["tenant_id"] || 0,
                goods_id: param["goods_ids"],
                custom_options: {attributes: ["id", "goods_code", "goods_name"]}
            })
        }).then(data => {
            return Promise.resolve(data)
        })
    }
};
BusinessUtils.getPaymentInfo = function (param) {
    if (!_.has(param, "tenant_id") || !_.has(param, "payment_ids") || !_.has(param, "partition_code")) {
        return Promise.reject("商户id、支付方式id或分区参数缺失")
    }
    if (param["is_elastic"]) {
        let must = [
            {"term": {"tenant_id": param["tenant_id"] || 0}}
        ];
        if (param["payment_ids"].length > 0) {
            must.push({"terms": {"id": param["payment_ids"]}})
        }
        return ElasticSearchUtils.search_hits({
            index: 'payment_' + param["partition_code"],
            body: {
                "_source": ["id", "payment_code", "payment_name"],
                "query": {
                    "bool": {
                        "must": must
                    }
                },
                size: 10000
            }
        }).then(data => {
            return _.pluck(data["hits"], "_source");
        })
    } else {
        if (!_.has(param, "env_id")) {
            return Promise.reject("环境参数缺失")
        }
        return Sequelize.getBusinessTableModel(1, param["partition_code"], "payment").then(Payment => {
            return Payment.findAllCustom({
                tenant_id: param["tenant_id"] || 0,
                payment_id: param["payment_ids"],
                custom_options: {attributes: ["id", "payment_code", "payment_name"]}
            })
        }).then(data => {
            return Promise.resolve(data)
        })
    }
};
BusinessUtils.getCategoryInfo = function (param) {
    if (!_.has(param, "tenant_id") || !_.has(param, "category_ids") || !_.has(param, "partition_code")) {
        return Promise.reject("商户id、分类id或分区参数缺失")
    }
    if (param["is_elastic"]) {
        let must = [
            {"term": {"tenant_id": param["tenant_id"] || 0}}
        ];
        if (param["category_ids"].length > 0) {
            must.push({"terms": {"id": param["category_ids"]}})
        }
        return ElasticSearchUtils.search_hits({
            index: 'category_' + param["partition_code"],
            body: {
                "_source": ["id", "cat_code", "cat_name"],
                "query": {
                    "bool": {
                        "must": must
                    }
                },
                size: 10000
            }
        }).then(data => {
            return _.pluck(data["hits"], "_source");
        })
    } else {
        if (!_.has(param, "env_id")) {
            return Promise.reject("环境参数缺失")
        }
        return Sequelize.getBusinessTableModel(1, param["partition_code"], "category").then(Category => {
            return Category.findAllCustom({
                tenant_id: param["tenant_id"] || 0,
                category_id: param["category_ids"],
                custom_options: {attributes: ["id", "cat_code", "cat_name"]}
            })
        }).then(data => {
            return Promise.resolve(data)
        })
    }
};
module.exports = BusinessUtils;