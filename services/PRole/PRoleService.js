/**
 * Created by Administrator on 2017-12-28.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;

class PRoleService {
    constructor() {
    }

    listGet(req) {
        return models.PRole.findAll({
            attributes: ["id", "parent_id", "role_name", ["role_name", "name"], [Sequelize.literal("true"), "open"]],
            raw: true
        });
    }

    //添加角色
    addPost(req) {
        let form_fields = req.form_fields;
        if (!_.has(form_fields, "parent_level")) {
            return Promise.reject("获取父节点层级失败。");
        }
        if (!(form_fields["parent_level"] < 1)) {
            return Promise.reject("角色最多只能创建两层！")
        }
        return models.PRole.create(form_fields);
    }

    //修改角色
    editPost(req) {
        let form_fields = req.form_fields;
        form_fields["updated_by"] = req.session.user["login_name"];
        return models.PRole.updateCustom(form_fields, {id: form_fields["id"]}).then(function (data) {
            if (data.length === 1 && data[0] === 1) {
                return Promise.resolve({
                    name: form_fields["role_name"],
                    role_name: form_fields["role_name"]
                });
            } else {
                return Promise.reject("角色修改失败");
            }
        })
    }

    //删除角色
    delPost(req) {
        /*
         * 无法删除已经被员工或部门使用的角色
         * */
        let form_fields = req.form_fields;
        return Promise.all([
            models.PRole.hasUser({id: form_fields["ids"]}),
            models.PRole.hasDepartment({id: form_fields["ids"]})
        ]).then(data => {
            if (data[0]) {
                return Promise.reject("角色包含员工，删除失败");
            }
            if (data[1]) {
                return Promise.reject("角色包含部门，删除失败");
            }
            return models.PRole.destroyCustom({id: form_fields["ids"]});
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("角色删除成功。删除节点数:" + data);
            } else {
                return Promise.reject("角色删除失败");
            }
        });
    }

    //-------------员工--------------------
    //展示员工
    userListGet(req) {
        let form_fields = req.form_fields;
        form_fields["role_id"] = form_fields["node_id"] || 0;
        return models.PUser.findAndCountAllFilterRole(form_fields);
    }

    //添加员工列表
    addEmployeeListGet(req) {
        let form_fields = req.form_fields;
        form_fields["role_id"] = form_fields["node_id"] || 0;
        return models.PUser.findAndCountAllFilterRole_(form_fields);
    }

    //添加选中员工
    addEmployeePost(req) {
        let form_fields = req.form_fields;
        let role_id = form_fields["node_id"];
        let user_id = form_fields["id"];
        let _arr = [];
        if (user_id instanceof Array) {
            for (let i = 0, j = user_id.length; i < j; i++) {
                _arr.push({
                    role_id: role_id,
                    user_id: user_id[i]
                })
            }
        } else {
            _arr.push({
                role_id: role_id,
                user_id: user_id
            })
        }
        return models.PUserRoleR.bulkCreate(_arr).then(data => {
            return Promise.resolve("角色添加员工成功")
        });
    }

    //角色移出员工
    delEmployeePost(req) {
        let form_fields = req.form_fields;
        return models.PUserRoleR.destroyCustom({
            role_id: form_fields["node_id"],
            user_id: form_fields["id"]
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("员工移出完成,移出数量:" + data)
            } else {
                return Promise.reject("员工移出失败！")
            }
        });
    }

    //-------------部门--------------------
    //展示部门
    departmentListGet(req) {
        let form_fields = req.form_fields;
        form_fields["role_id"] = form_fields["node_id"] || 0;
        return models.PDepartment.findAndCountAllFilterUser(form_fields);
    }

    //添加部门列表
    addDepartmentListGet(req) {
        let form_fields = req.form_fields;
        form_fields["role_id"] = form_fields["node_id"] || 0;
        return models.PDepartment.findAndCountAllFilterUser_(form_fields);
    }

    //添加选中部门
    addDepartmentPost(req) {
        let form_fields = req.form_fields;
        let role_id = form_fields["node_id"];
        let department_id = form_fields["id"];
        let _arr = [];
        if (department_id instanceof Array) {
            for (let i = 0, j = department_id.length; i < j; i++) {
                _arr.push({
                    role_id: role_id,
                    department_id: department_id[i]
                })
            }
        } else {
            _arr.push({
                role_id: role_id,
                department_id: department_id
            })
        }
        return models.PDepartmentRoleR.bulkCreate(_arr).then(data => {
            return Promise.resolve("部门添加成功")
        });
    }

    //移出选中部门
    delDepartmentPost(req) {
        let form_fields = req.form_fields;
        return models.PDepartmentRoleR.destroyCustom({
            role_id: form_fields["node_id"],
            department_id: form_fields["id"]
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("部门移出完成,移出数量:" + data)
            } else {
                return Promise.reject("部门移出失败！")
            }
        });
    }

    //-------------权限--------------------
    //---菜单
    getMenuTree(req) {
        let form_fields = req.form_fields;
        return Promise.all([
            models.PPrivilege.findAll({//获取所有菜单权限
                attributes: [
                    "id", "parent_id", ["privilege_name", "name"],
                    [Sequelize.literal("1"), "open"],
                    [Sequelize.literal("0"), "checked"],
                    [Sequelize.literal("1"), "chkDisabled"]
                ],
                raw: true,
                order: [["id", "asc"], ["order", "asc"]]
            }),
            models.PRole.findOne({//已有权限
                where: {
                    id: form_fields["node_id"] || 0
                },
            }).then(data => {
                if (!data) {
                    return Promise.resolve([]);
                } else {
                    return data.getPPrivileges({
                        attributes: ["id"],
                        raw: true
                    });
                }
            })
        ]).then(data => {
            let ids = _.pluck(data[1], 'id');
            data[0].forEach(function (item) {
                if (_.indexOf(ids, item["id"]) >= 0) {
                    item["checked"] = 1;
                }
            });
            return Promise.resolve(data[0]);
        });
    }

    saveMenuTree(req) {
        let form_fields = req.form_fields;
        if (!_.has(form_fields, "role_id") || !_.has(form_fields, "check_ids")) {
            return Promise.reject("请求参数缺失。")
        }
        let check_ids = form_fields["check_ids"];
        if (!_.isArray(check_ids)) {
            return Promise.reject("选中节点参数类型错误。")
        }
        return models.PRolePPrivilegeR.destroyCustom({
            role_id: form_fields["role_id"] || 0,
        }).then(data => {
            let _create = [];
            check_ids.forEach(function (item) {
                _create.push({
                    role_id: form_fields["role_id"],
                    privilege_id: item
                })
            });
            return models.PRolePPrivilegeR.bulkCreate(_create);
        }).then(data => {
            return Promise.resolve("菜单权限保存完成。")
        });
    }
}

module.exports = function (devops) {
    devops["PRoleService"] = PRoleService;
};