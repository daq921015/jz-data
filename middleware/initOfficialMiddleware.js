/*
 * 加载官方插件
 * */
module.exports = app => {
    /*
     * 初始化第三方路由
     * */
    app.set('views', devops.path.join(__dirname, "..", 'views'));
    app.set('view engine', 'ejs');
    app.enable("trust proxy");
    app.use(devops.favicon(devops.path.join(__dirname, "..", 'public', "img", 'favicon.ico')));
    app.use(devops.bodyParser.json());
    app.use(devops.bodyParser.urlencoded({extended: false}));
    app.use(devops.cookieParser());
    app.use("/public", devops.express.static(devops.path.join(__dirname, "..", 'public')));
    app.use("/tarticleimg", devops.express.static(devops.path.join(__dirname, "..", 'tarticleimg')));
    app.use("/upload", devops.express.static(devops.path.join(__dirname, "..", 'upload')));
    // session设置，一个浏览器只能登录一个用户，登录多个待研究。
    app.use(devops.session({
        name: "sid",
        secret: 'Asecret123-',
        resave: false,
        rolling: true,
        saveUninitialized: false,
        cookie: devops.myconfig.cookie,
        store: new devops.RedisStrore(devops.myconfig.redis_session)
    }));
};