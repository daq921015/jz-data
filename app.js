//自定义一个全局变量对象
global["devops"] = {};
//初始化项目根路径（保存）
devops.root_dir = process.cwd();
//引入程序依赖官方模块
require("./middleware/importOfficialModule")();
//引入程序依赖自定义模块
require("./middleware/importCustomModule")();
//定义顶层app
let app = devops.express();
app.set('env', "development");
// app.set('env',"products");
//加载官方中间件
require("./middleware/initOfficialMiddleware")(app);
//加载自定义中间件
require("./middleware/initCustomMiddleware")(app);
//初始化业务路由
require("./middleware/routes")(app);
//根目录访问，重定向到首页（首页路径与所在目录有关）
app.use("^/$", function (req, res) {
    res.redirect("/home/index" + "?_=" + Date.now());
});
//初始化错误路由(500，404)
require("./middleware/appExceptionRoutes")(app);
process.env.PORT = 80;
module.exports = app;
