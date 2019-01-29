/**
 * Created by Administrator on 2017-11-26.
 */
let app = require("express")();
let _ = devops.underscore._;
let pDepartmentService = new devops.PDepartmentService();
app.post("/index", function (req, res) {
    res.render("subpage", {
        title: "部门管理"
    })
});
app.get("/department/list", function (req, res) {
    /*
     * 获取部门信息
     * */
    pDepartmentService.listGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/department/select", function (req, res) {
    /*
     * 树节点点击后渲染内容
     * */
    if (!_.has(req.form_fields, "active_tab")) {
        req.form_fields["active_tab"] = 0;
    }
    res.render("mainpage", {
        treeNode: req.form_fields
    });
});
app.post("/department/add", function (req, res, next) {
    /*
     * 添加部门
     * */
    pDepartmentService.addPost(req).then(data => {
        res.send({
            "status": "success",
            "msg": "",
            "data": {"msg": "子节点添加成功", "data": data}
        });
    }).catch(err => {
        next(err)
    });
});
app.post("/department/edit", function (req, res) {
    /*
     * 修改部门节点
     * */
    pDepartmentService.editPost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": {"msg": "选中节点修改成功", "data": data}
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/department/del", function (req, res, next) {
    /*
     * 删除部门节点
     * */
    pDepartmentService.delPost(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(function (err) {
        next(err);
    });
});
//------------------员工--------------------------
app.get("/employee", function (req, res) {
    /*
     * 选项卡员工页面
     * */
    res.render("employee")
});
app.get("/employee/list", function (req, res) {
    /*
     * 查询部门已有员工
     * */
    pDepartmentService.userListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.get("/employee/addlist", function (req, res) {
    /*
     * 部门添加员工列表
     * */
    pDepartmentService.addEmployeeListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/employee/add", function (req, res, next) {
    /*
     * 添加部门员工
     * */
    pDepartmentService.addEmployeePost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/employee/del", function (req, res, next) {
    /*
     * 从部门移出员工
     * */
    pDepartmentService.delEmployeePost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
//------------------角色--------------------------
app.get("/role", function (req, res) {
    res.render("role");
});
app.get("/role/list", function (req, res, next) {
    /*
     * 显示部门已有角色
     * */
    pDepartmentService.roleListGet(req).then(function (data) {
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
     * 部门添加角色列表
     * */
    pDepartmentService.addRoleListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/role/add", function (req, res, next) {
    /*
     * 添加部门角色
     * */
    pDepartmentService.addRolePost(req).then(function (data) {
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
     * 从部门移出角色
     * */
    pDepartmentService.delRolePost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": data
        });
    }).catch(function (err) {
        next(err);
    });
});
exports.app = app;
exports.controller_name = "PDeparment";