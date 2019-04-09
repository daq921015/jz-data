/*
 * 初始化程序业务controller路由
 * 注：.js的ejs渲染文件默认路径为当前目录views文件夹
 * time:2017-11-22
 * */
module.exports = function (app) {
    let path = devops.path;
    let myssh = devops.myssh;
    let _ = devops.underscore._;
    let route_root = path.join(__dirname, "..", "controller");
    (function (dir_root) {
        let files = myssh.getLocalReadDirSync(dir_root);
        for (let i = 0, j = files.length; i < j; i++) {
            if (files[i] === "views") {
                return false;
            }
            let sub_path = path.join(dir_root, files[i]);
            let isFile = myssh.getLocalIsFileSync(sub_path);
            if (isFile) {
                if (/\.js$/.test(files[i])) {
                    let controller = require(sub_path);
                    //路由表要返回对象
                    if (!_.isObject(controller)) return false;
                    //路由表必须要设置controller_name名称
                    if (!_.has(controller, "controller_name")) return false;
                    //路由表中必须要有子路由app
                    if (!_.has(controller, "app")) return false;
                    let controller_name = controller["controller_name"];
                    //设置子路由模板与引擎
                    let sub_app = controller["app"];
                    let engine = controller["engine"] || "ejs";
                    sub_app.set('views', path.join(dir_root, 'views'));
                    sub_app.set('view engine', engine);
                    //加载整个模块路由到顶层
                    if (_.has(controller, "before")) {
                        app.use('/' + controller_name, controller["before"], sub_app);
                    } else {
                        app.use('/' + controller_name, sub_app);
                    }
                } else {
                    return false;
                }
            } else {
                arguments.callee(sub_path);
            }
        }
    })(route_root);
};

