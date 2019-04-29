/**
 * Created by Administrator on 2017-11-24.
 */
module.exports = function (req, res, next) {
    //所有请求都加入状态变量，确保每次渲染时都有此变量
    res.locals.status = "success";
    res.locals.msg = "";
    res.locals.user = req.session.user;
    //ejs模板据此判断是否返回完整页面
    res.locals.isJson = req.xhr;
    //如果不为ajax请求（获取用户的菜单权限）
    if (!req.xhr) {
    }
    let _ = devops.underscore._;
    //允许通过 一级URL
    let public_controller = ["public", "DataVApi"];
    let req_url = _.chain(req.path.split("/")).compact().first().value();
    if (_.contains(public_controller, req_url)) {//特殊路径放行
        next();
    } else if (req.session.islogin) {//登录之后放行
        next();
    } else if (req_url == "fresh") { //生鲜大屏请求(没有登录特殊处理)
        let form_fields = req.query;
        let partitions = ["za1", "zd1"];
        if (/\d+/.test(form_fields["tenantId"]) && _.contains(partitions, form_fields["partitionCode"])) {
            req.query["isJson"] = true;
            req.session.user = {
                partition_code: form_fields["partitionCode"],
                tenant_id: form_fields["tenantId"],
                is_product: true
            };
            next();
        } else {
            res.send({
                "status": "error",
                "msg": "请求参数不正确(tenantId=\\d+&partitionCode=[za1|zd1])",
                "data": ""
            });
        }
    } else {//重定向到登陆页
        if (_.has(req.cookies, "isLogin") && req.cookies["isLogin"] === 'true') {
            res.isSessionTimeOut = true;
            next("回话超时，请重新登录");
        } else {
            res.redirect("/public/login?_=" + Date.now());
        }
    }
};