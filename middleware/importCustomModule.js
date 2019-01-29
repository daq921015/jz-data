module.exports = function () {
    /*
     * 加载自定义模块到全局变量
     * 注意加载顺序不能乱
     * */
    devops.myssh = require('../customUtils/MySsh');
    devops.myconfig = require("../config/config");
    //加载日志模块
    devops.log4js = require("../customUtils/logConfig");
    //全局日志输出对象
    devops.logger = devops.log4js.logger("production");//日志处理模块
    //初始化日志配置
    devops.log4js.configure();
    //公共函数
    devops.publicmethod = require("../customUtils/publicmethod");
    //加载underscore扩展方法,自定义其它扩展方法
    require("./expandUnderscore")();
    //初始化本程序运行依赖数据库(以及其它数据库)
    require("../models/loadModel")();
    //递归加载所有service到全局变量(必须同步加载，否则初始化路由时service会报错未加载)
    let service_root = devops.path.join(__dirname, "..", "services");
    (function (dir_root) {
        try {
            let files = devops.myssh.getLocalReadDirSync(dir_root);
            for (let i = 0, j = files.length; i < j; i++) {
                let sub_path = devops.path.join(dir_root, files[i]);
                let isFile = devops.myssh.getLocalIsFileSync(sub_path);
                if (isFile) {
                    let module = require(sub_path);
                    if (typeof module === "function") {
                        require(sub_path)(devops);
                    }
                } else {
                    arguments.callee(sub_path);
                }
            }
        } catch (err) {
            devops.publicmethod.logError(err);
        }
    })(service_root);
};
