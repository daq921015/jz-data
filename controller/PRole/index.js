/**
 * Created by Administrator on 2017-11-26.
 */
let app = require("express")();
let logError = devops.publicmethod.logError;
let _ = devops.underscore._;
let pRoleService = new devops.PRoleService();
app.post("/index", function (req, res) {
    res.render("subpage", {
        title: "角色管理"
    })
});
app.get("/role/list", function (req, res) {
    /*
     * 获取角色信息
     * */
    pRoleService.listGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data});
    }).catch(err => {
        next(err);
    });
});
app.post("/role/select", function (req, res) {
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
app.post("/role/add", function (req, res, next) {
    /*
     * 添加角色
     * */
    pRoleService.addPost(req).then(data => {
        res.send({
            "status": "success", "msg": "", "data": {
                "msg": "角色添加成功", "data": {
                    id: data.dataValues["id"],
                    parent_id: data.dataValues["parent_id"],
                    name: data.dataValues["role_name"],
                    role_name: data.dataValues["role_name"]
                }
            }
        });
    }).catch(err => {
        next(err)
    });
});
app.post("/role/edit", function (req, res) {
    /*
     * 修改角色节点
     * */
    pRoleService.editPost(req).then(function (data) {
        res.send({
            "status": "success",
            "msg": "",
            "data": {"msg": "角色修改成功", "data": data}
        });
    }).catch(function (err) {
        next(err);
    });
});
app.post("/role/del", function (req, res, next) {
    /*
     * 删除角色节点
     * */
    pRoleService.delPost(req).then(data => {
        res.end(JSON.stringify({"status": "success", "msg": "", "data": data}));
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
app.get("/employee/list", function (req, res, next) {
    /*
     * 查询角色已有员工
     * */
    pRoleService.userListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    })
});
app.get("/employee/addlist", function (req, res, next) {
    /*
     * 角色添加员工列表
     * */
    pRoleService.addEmployeeListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    })
});
app.post("/employee/add", function (req, res, next) {
    /*
     * 添加角色员工
     * */
    pRoleService.addEmployeePost(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(function (err) {
        next(err);
    });
});
app.post("/employee/del", function (req, res, next) {
    /*
     * 从角色移出员工
     * */
    pRoleService.delEmployeePost(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(function (err) {
        next(err);
    });
});
//------------------部门--------------------------
app.get("/department", function (req, res) {
    res.render("department");
});
app.get("/department/list", function (req, res, next) {
    /*
     * 查询角色已有部门
     * */
    pRoleService.departmentListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    })
});
app.get("/department/addlist", function (req, res, next) {
    /*
     * 角色添加员工列表
     * */
    pRoleService.addDepartmentListGet(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    })
});
app.post("/department/add", function (req, res, next) {
    /*
     * 添加角色员工
     * */
    pRoleService.addDepartmentPost(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(function (err) {
        next(err);
    });
});
app.post("/department/del", function (req, res, next) {
    /*
     * 从角色移出员工
     * */
    pRoleService.delDepartmentPost(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(function (err) {
        next(err);
    });
});
//------------------权限--------------------------
app.get("/privilege", function (req, res, next) {
    res.render("privilege");
});
//----菜单
app.post("/privilege/menu", function (req, res, next) {
    res.render("privilege/menu");
});
app.get("/privilege/menu/list", function (req, res, next) {
    pRoleService.getMenuTree(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
app.post("/privilege/menu/save", function (req, res, next) {
    pRoleService.saveMenuTree(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
//----环境
app.post("/privilege/env", function (req, res, next) {
    pRoleService.getEnvs(req).then(envs => {
        res.render("privilege/env/envSidebar", {envs: envs});
    }).catch(err => {
        next(err);
    });
});
app.post("/privilege/env/sidebar/:env_id", function (req, res, next) {//获取环境侧边栏
    let env_id = req.params["env_id"];
    res.render("privilege/env/envTree", {env_id: env_id});
});
app.get("/privilege/env/list/:env_id", function (req, res, next) {//获取环境权限树列表
    let env_id = req.params["env_id"];
    pRoleService.getEnvTree(req, env_id).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
app.post("/privilege/env/save", function (req, res, next) {
    pRoleService.saveEnvTree(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
//----程序
app.post("/privilege/program", function (req, res) {
    pRoleService.getEnvs(req).then(envs => {
        res.render("privilege/program/programSidebar", {envs: envs});
    }).catch(err => {
        next(err);
    });
});
app.post("/privilege/program/sidebar/:env_id", function (req, res, next) {//获取环境侧边栏
    let env_id = req.params["env_id"];
    res.render("privilege/program/programTree", {env_id: env_id});
});
app.get("/privilege/program/list/:env_id", function (req, res, next) {//获取程序权限树列表
    let env_id = req.params["env_id"];
    pRoleService.getProgramTree(req, env_id).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
app.post("/privilege/program/save", function (req, res, next) {
    pRoleService.saveProgramTree(req).then(data => {
        res.send({"status": "success", "msg": "", "data": data})
    }).catch(err => {
        next(err);
    });
});
exports.app = app;
exports.controller_name = "PRole";