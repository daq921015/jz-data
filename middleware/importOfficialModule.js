module.exports = function () {
    /*
     * 加载第三方模块到全局变量
     * */
    devops.express = require('express');
    devops.path = require('path');
    devops.fs = require('fs');
    devops.cookieParser = require('cookie-parser');
    devops.crypto = require("crypto");//签名模块
    devops.https = require("https");//https请求
    devops.ejs = require("ejs");//ejs
    devops.querystring = require("querystring");//请求参数序列化和反序列化模块
    devops.http = require("http");//http请求模块
    devops.url = require("url");//ali-oss对象存储sdk
    devops.underscore = require('underscore');
    devops.formidable = require('formidable');
    devops.favicon = require('serve-favicon');
    devops.ssh2 = require("ssh2");//ssh连接远程linux服务器模块
    devops.Sequelize = require('sequelize');
    devops.bodyParser = require('body-parser');
    devops.schedule = require("node-schedule");//定时执行模块
    devops.moment = require("moment");
    devops.session = require("express-session");//用来处理session
    devops.RedisStrore = require("connect-redis")(devops.session);//用来处理session
};
