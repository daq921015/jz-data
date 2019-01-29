/*
 * 加载自定义插件（初始化自定义路由）
 * time:2017-11-23
 * */
module.exports = function (app) {
    //初始化访问路径日志
    app.use(devops.log4js.useLog());
    //后端访问权限过滤中间件
    app.use(require("./appFilterAuth"));
    //初始化表单
    app.use(require("./appInitForm"));
};