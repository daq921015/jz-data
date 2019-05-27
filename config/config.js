/**
 * Created by Administrator on 2017-11-24.
 */
let config = {};
let _ = devops.underscore._;
//本程序运行依赖db
config.mynodeSource = {
    "host": "127.0.0.1",
    "username": "root",
    "password": "root",
    "database": "olapdb-1"
};

//本程序运行依赖redis
config.myredis = {
    "host": "127.0.0.1",
    "port": "6379",
    "password": "ftrend",
    "db": 0
};
//本程序运行依赖elasticsearch
config.elasticsearch = {
    "host": "47.104.158.68:9200"
    // "host": "192.168.51.159:9200"
};
//本程序运行依赖redis(会话信息)
config.redis_session = _.extend({
    "ttl": 3600 * 12,
    "logErrors": true
}, config.myredis);
//cookie保存时间
config.cookie = {
    "maxAge": 7 * 24 * 60 * 60 * 1000
};
module.exports = config;