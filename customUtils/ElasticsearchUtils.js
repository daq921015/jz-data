let logger = devops.logger;
let myssh = devops.myssh;
let node_xlsx = devops.node_xlsx;
let _ = devops.underscore._;
let myconfig = devops.myconfig;
let elasticsearch = devops.elasticsearch;
let ElasticsearchUtils = {};
ElasticsearchUtils.getClient = function () {
    let elasticsearch = require('elasticsearch');
    let client = new elasticsearch.Client({
        host: myconfig.elasticsearch.host
    });
    //连接池待做   client:时间  120s没有使用的close,初始化10个,最多200个
    return client;
};
ElasticsearchUtils.search = function (param) {
    let that = this;
    return that.getClient().search(param);
};
ElasticsearchUtils.search_hits = function (param) {
    let that = this;
    return that.getClient().search(param).then(data => {
        if (data["timed_out"]) {
            return Promise.reject("访问引擎超时");
        }
        return Promise.resolve(data["hits"]);
    });
};
ElasticsearchUtils.search_aggs = function (param) {
    let that = this;
    return that.getClient().search(param).then(data => {
        if (data["timed_out"]) {
            return Promise.reject("访问引擎超时");
        }
        return Promise.resolve(data["aggregations"]);
    });
};
ElasticsearchUtils.count = function (param) {
    let that = this;
    return that.getClient().count(param);
};
module.exports = ElasticsearchUtils;