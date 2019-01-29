/**
 * Created by Administrator on 2017-11-26.
 */
let app = require("express")();
let _ = devops.underscore._;
let pUserService = new devops.PUserService();
app.post("/index", function (req, res, next) {
    pUserService.indexPost().then(data => {
        res.render("subpage", {
            title: "用户",
            department: data
        })
    }).catch(err => {
        next(err);
    });
});
app.get("/user/list", function (req, res, next) {
    pUserService.list(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/user/add", function (req, res, next) {
    pUserService.addPost(req).then(function (user) {
        res.send({"status": "success", "msg": "", "data": "用户添加成功。"});
    }).catch(function (err) {
        next(err);
    });
});
app.post("/user/edit", function (req, res, next) {
    pUserService.editPost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/user/del", function (req, res, next) {
    pUserService.delPost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": "删除用户成功。"
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/user/pwd", function (req, res, next) {
    pUserService.pwdPost(req).then(function (user) {
        res.end(JSON.stringify({"status": "success", "msg": "", "data": "密码修改成功."}));
    }).catch(function (err) {
        next(err);
    });
});
app.post("/user/authority", function (req, res, next) {
    if (!_.has(req.form_fields, "active_tab")) {
        req.form_fields["active_tab"] = 0;
    }
    res.render("mainpage", {
        authorityUser: req.form_fields
    });
});
//-------------------角色----------------------
app.get("/role", function (req, res) {
    res.render("role");
});
app.get("/role/list", function (req, res, next) {
    /*
     * 显示部门已有角色
     * */
    pUserService.roleListGet(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
app.get("/role/addlist", function (req, res) {
    /*
     * 员工添加角色列表
     * */
    pUserService.addRoleListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/role/add", function (req, res, next) {
    /*
     * 员工添加角色
     * */
    pUserService.addRolePost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/role/del", function (req, res, next) {
    /*
     * 员工移出角色
     * */
    pUserService.delRolePost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
//---设置下属
//查询未添加组员和已添加组员
app.post("/user/employeeList", function (req, res, next) {
    let form_fields = req.form_fields;
    if (!_.has(form_fields, "leader_id")) {
        next("请先选择组长");
        return;
    }
    let user_id = req.session.user["id"];
    pUserService.employeeList(form_fields["leader_id"], user_id).then(data => {
        res.send({
            status: "success",
            msg: "",
            data: data
        });
    }).catch(err => {
        next(err);
    });
});
//添加组员
app.post("/user/employeeSave", function (req, res, next) {
    let form_fields = req.form_fields;
    if (!_.has(form_fields, "leader_id")) {
        next("参数缺失");
        return;
    }
    if (!_.has(form_fields, "save_info")) {
        form_fields["save_info"] = [];
    } else {
        if (!(form_fields["save_info"] instanceof Array)) {
            form_fields["save_info"] = [form_fields["save_info"]];
        }
    }
    pUserService.employeeSave(form_fields["leader_id"], form_fields["save_info"]).then(data => {
        res.send({
            status: "success",
            msg: "",
            data: data
        });
    }).catch(err => {
        next(err);
    });
});
exports.app = app;
exports.controller_name = "PUser";