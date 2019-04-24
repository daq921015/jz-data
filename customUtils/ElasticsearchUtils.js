let myssh = devops.myssh;
let _ = devops.underscore._;
let myconfig = devops.myconfig;
let elasticsearch = devops.elasticsearch;
let Sequelize = devops.Sequelize;
let logger = devops.log4js.logger("transfer");
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
ElasticsearchUtils.bulk = function (data, index_name) {
    let that = this;
    let _body = [];
    let sTime = Date.now();
    data.forEach(function (item) {
        _body.push({index: {_id: item["id"]}});
        _body.push(item);
    });
    let dateTime = Date.now() - sTime;
    logger.info("处理数据耗时:" + dateTime + "ms");
    return Promise.resolve("ok");
    // return that.getClient().bulk({
    //     index: index_name, type: "_doc", wait_for_active_shards: "1", timeout: "20s",
    //     body: _body
    // });
};
ElasticsearchUtils.bulkToJsonFile = function (data, index_name) {
    let that = this;
    let _body = "";
    let sTime = Date.now();

    data.forEach(function (item) {
        _body = _body + '{"_index":"' + index_name + '","_type":"_doc","_id":"' + item["id"] + '","_score":1,"_source":'
            + JSON.stringify(item) + "}\r\n";
    });
    devops.fs.appendFileSync(devops.path.join(devops.root_dir, "upload", "test.json"), _body);
    let dateTime = Date.now() - sTime;
    logger.info("处理数据耗时:" + dateTime + "ms");
    return Promise.resolve("ok")
};
ElasticsearchUtils.mysqlToElasticsearch = function (partitionCode, tableName, offsetId, limit) {
    if (!/\d+/.test(offsetId) || !/\d+/.test(limit)) {
        return Promise.reject("mysqlToElasticsearch转换参数错误");
    }
    let that = this;
    let index_name = partitionCode + "_" + tableName;
    let last_id = null;
    let dataSql = "select * from " + tableName + " where id >= " + offsetId + " order by id asc" + " limit " + limit;
    let startTimeStamp = Date.now();
    let sqlTime, esTime;
    logger.info("开始转换数据Mysql=>elasticsearch: 分区=" + partitionCode + ",表名=" + tableName + ",当前主键id开始值=" + offsetId + ",分页大小=" + limit);
    logger.info("转换执行sql:" + dataSql);
    return Sequelize.getBusinessSchema(1, partitionCode).then(schema => {
        return schema.query(dataSql, {
            type: Sequelize.QueryTypes.SELECT,
            // replacements: dataOptions,
            raw: true
        })
    }).then(data => {
        sqlTime = Date.now() - startTimeStamp;
        if (data.length == 0) {
            return Promise.reject("elasticsearch批量插入数据为空")
        }
        last_id = data[data.length - 1]["id"];
        return that.bulk(data, index_name).then(data => {
            return Promise.resolve(data);
        });
    }).then(data => {
        esTime = Date.now() - startTimeStamp - sqlTime;
        logger.info("本次数据转换完成,总耗时:" + (Date.now() - startTimeStamp) + "ms" + ",sql耗时:" + sqlTime + "ms,ES耗时:" + esTime + "ms");
        return Promise.resolve(last_id);
    });
};
module.exports = ElasticsearchUtils;