let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
class PDepartmentService {
    constructor() {
    }

    //列出部门树
    listGet(req) {
        return models.PDepartment.findAll({
            attributes: ["id", "parent_id", ["department_name", "name"], "department_name", [Sequelize.literal("true"), "open"]],
            raw: true
        })
    }

    //添加部门
    addPost(req) {
        let form_fields = req.form_fields;
        if (!_.has(form_fields, "parent_level")) {
            return Promise.reject("获取父节点层级失败。");
        }
        if (!(form_fields["parent_level"] < 2)) {
            return Promise.reject("节点最多只能创建三层！")
        }
        return models.PUser.findOneCustom({department_id: form_fields["parent_id"]}).then(data => {
            if (data) {
                return Promise.reject("部门下已经有员工无法创建子部门！");
            }
            return models.PDepartment.create(form_fields);
        }).then(data => {
            //返回添加的数据（生成id）
            return Promise.resolve({
                id: data.dataValues["id"],
                parent_id: data.dataValues["parent_id"],
                name: data.dataValues["department_name"],
                department_name: data.dataValues["department_name"]
            });
        })
    }

    //修改部门
    editPost(req) {
        let form_fields = req.form_fields;
        form_fields["updated_by"] = req.session.user["login_name"];
        return models.PDepartment.updateCustom(form_fields, {id: form_fields["id"]}).then(function (data) {
            if (data.length === 1 && data[0] === 1) {
                return Promise.resolve({
                    name: form_fields["department_name"],
                    department_name: form_fields["department_name"]
                });
            } else {
                return Promise.reject("选中部门修改失败");
            }
        })
    }

    //删除部门及子部门
    delPost(req) {
        let form_fields = req.form_fields;
        return models.PUser.findOneCustom({department_id: form_fields["ids"]}).then(data => {
            if (data) {
                return Promise.reject("无法删除有员工的部门及其子部门");
            }
            return models.PDepartment.destroyCustom({id: form_fields["ids"]})
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("节点删除成功。删除节点数:" + data);
            } else {
                return Promise.reject("节点删除失败");
            }
        })
    }

    //----------------------员工-----------------------
    //包含员工
    userListGet(req) {
        let form_fields = req.form_fields;
        form_fields["department_id"] = _.has(form_fields, "node_ids") ? form_fields["node_ids"].toString().split(",") : [];
        return models.PUser.findAndCountAllWithName(form_fields);
    }

    //移出员工
    delEmployeePost(req) {
        let form_fields = req.form_fields;
        return models.PUser.updateCustom({
            "department_id": 0,
            "updated_by": req.session.user["login_name"]
        }, form_fields).then(function (data) {
            if (data.length === 1 && data[0] >= 1) {
                return Promise.resolve("选中员工已经从部门中移出。移出数量:" + data[0]);
            } else {
                return Promise.reject("添加移出失败！")
            }
        })
    }

    //添加员工列表
    addEmployeeListGet(req) {
        let form_fields = req.form_fields;
        form_fields["department_id"] = 0;
        return models.PUser.findAndCountAllWithName(form_fields);
    }

    //添加选中员工
    addEmployeePost(req) {
        let form_fields = req.form_fields;
        return models.PUser.updateCustom({
            "department_id": req.form_fields["node_id"],
            "updated_by": req.session.user["login_name"]
        }, form_fields).then(function (data) {
            if (data.length === 1 && data[0] >= 1) {
                return Promise.resolve("部门添加员工完成,添加数量:" + data[0]);
            } else {
                return Promise.reject("添加员工失败！")
            }
        })
    }

    //----------------------角色-----------------------
    roleListGet(req) {
        let form_fields = req.form_fields;
        form_fields["department_id"] = form_fields["node_id"] || 0;
        return models.PRole.findAndCountAllFilterDepartment(form_fields);
    }

    addRoleListGet(req) {
        let form_fields = req.form_fields;
        form_fields["department_id"] = form_fields["node_id"] || 0;
        return models.PRole.findAndCountAllFilterDepartment_(form_fields);
    }

    addRolePost(req) {
        let form_fields = req.form_fields;
        let department_id = form_fields["node_id"];
        let role_id = form_fields["id"];
        let _arr = [];
        if (role_id instanceof Array) {
            for (let i = 0, j = role_id.length; i < j; i++) {
                _arr.push({
                    department_id: department_id,
                    role_id: role_id[i]
                })
            }
        } else {
            _arr.push({
                department_id: department_id,
                role_id: role_id
            })
        }
        return models.PDepartmentRoleR.bulkCreate(_arr).then(data => {
            return Promise.resolve("角色添加成功")
        });
    }

    delRolePost(req) {
        let form_fields = req.form_fields;
        return models.PDepartmentRoleR.destroyCustom({
            department_id: form_fields["node_id"],
            role_id: form_fields["id"]
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("角色移出完成,移出数量:" + data)
            } else {
                return Promise.reject("角色移出失败！")
            }
        });
    }
}

module.exports = function (devops) {
    devops["PDepartmentService"] = PDepartmentService;
};