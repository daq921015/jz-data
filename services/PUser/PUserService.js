let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;

class PUserService {
    constructor() {
    }

    indexPost() {
        return models.PDepartment.findAllLeafNode();
    }

    list(req) {
        let form_fields = req.form_fields;
        return models.PUser.findAndCountAllWithName(form_fields);
    }

    addPost(req) {
        let form_fields = req.form_fields;
        form_fields["created_by"] = req.session.user["login_name"];
        form_fields["updated_by"] = req.session.user["login_name"];
        return models.PUser.findOneCustom({
            login_name: form_fields["login_name"]
        }).then(function (user) {
            if (user) {
                return Promise.reject(form_fields["login_name"] + ",登录名已经存在");
            } else {
                return models.PUser.create(form_fields);
            }
        });
    }

    editPost(req) {
        let form_fields = req.form_fields;
        form_fields["updated_by"] = req.session.user["login_name"];
        return models.PUser.updateCustom(form_fields, _.pick(form_fields, "id")).then(function (data) {
            if (data.length === 1 && data[0] >= 1) {
                return Promise.resolve("用户修改完成。")
            } else {
                return Promise.reject("修改用户失败！")
            }
        });
    }

    delPost(req) {
        let form_fields = req.form_fields;
        return models.PUser.destroyCustom(_.pick(form_fields, "id")).then(function (data) {
            if (data >= 1) {
                return Promise.resolve("删除用户成功。")
            } else {
                return Promise.reject("删除用户失败！")
            }
        })
    }

    pwdPost(req) {
        if (!_.has(req.form_fields, "old_pwd") || !_.has(req.form_fields, "new_pwd")) {
            return Promise.reject("原密码和新密码不能为空");
        } else {
            let user_id = req.session.user["id"] || 0;
            return models.PUser.findOneCustom({
                id: user_id,
                login_pwd: req.form_fields["old_pwd"].toString()
            }).then(function (user) {
                if (!user) {
                    return Promise.reject("原密码不正确，修改失败")
                } else {
                    user.login_pwd = req.form_fields["new_pwd"];
                    return user.save();
                }
            })
        }
    }

    //------------角色------------
    roleListGet(req) {
        let form_fields = req.form_fields;
        form_fields["user_id"] = form_fields["user_id"] || 0;
        return models.PRole.findAndCountAllFilterUser(form_fields);
    }

    addRoleListGet(req) {
        let form_fields = req.form_fields;
        form_fields["user_id"] = form_fields["user_id"] || 0;
        return models.PRole.findAndCountAllFilterUser_(form_fields);
    }

    addRolePost(req) {
        let form_fields = req.form_fields;
        let user_id = form_fields["user_id"];
        let role_id = form_fields["id"];
        let _arr = [];
        if (role_id instanceof Array) {
            for (let i = 0, j = role_id.length; i < j; i++) {
                _arr.push({
                    user_id: user_id,
                    role_id: role_id[i]
                })
            }
        } else {
            _arr.push({
                user_id: user_id,
                role_id: role_id
            })
        }
        return models.PUserRoleR.bulkCreate(_arr).then(data => {
            return Promise.resolve("角色添加成功")
        });
    }

    delRolePost(req) {
        let form_fields = req.form_fields;
        //没有传入删除角色的user_id
        return Promise.reject("此功能有bug,暂停使用,请用角色管理菜单配置");
        if (!_.has(form_fields, "user_id") || !_.has(form_fields, "id")) {
            return Promise.reject("参数缺失，角色移出失败");
        }
        return models.PUserRoleR.destroyCustom({
            user_id: form_fields["user_id"] || 0,
            role_id: form_fields["id"] || 0,
        }).then(data => {
            if (data > 0) {
                return Promise.resolve("角色移出完成,移出数量:" + data)
            } else {
                return Promise.reject("角色移出失败！")
            }
        });
    }

    //---设置下属
    //查询组员 已添加和未添加
    employeeList(leader_id, user_id) {
        // AND M.emp_type=2 注释：组长不可以被添加成组员
        return Promise.all([
            devopsdb.query("SELECT M.id,M.user_name FROM p_user M LEFT JOIN `p_user_r` N ON M.id=N.`employee_id` AND " +
                "N.`leader_id`=? AND (N.`deleted_at` IS NULL OR N.`deleted_at` > NOW()) " +
                "WHERE N.id IS NULL and M.id <> ? and (M.`deleted_at` IS NULL OR M.`deleted_at` > NOW())", {//未添加
                type: Sequelize.QueryTypes.SELECT,
                replacements: [leader_id, user_id],
                raw: true
            }),
            devopsdb.query("SELECT N.id,N.`user_name` FROM `p_user_r` M INNER JOIN p_user N ON M.`employee_id`=N.`id` " +
                "AND (N.`deleted_at` IS NULL OR N.`deleted_at` > NOW()) WHERE M.`leader_id`=? AND " +
                "(M.`deleted_at` IS NULL OR M.`deleted_at` > NOW())", {//已添加
                type: Sequelize.QueryTypes.SELECT,
                replacements: [leader_id],
                raw: true
            })
        ]).then(data => {
            let unadd = {};
            let added = {};
            data[0].forEach((item) => {
                unadd[item["id"]] = item["user_name"];
            });
            data[1].forEach((item) => {
                added[item["id"]] = item["user_name"];
            });
            return Promise.resolve({
                unadd: unadd,
                added: added
            });
        });
    }

    //保存组员，先删除所有
    employeeSave(leader_id, save_info) {
        let create = [];
        save_info.forEach(function (item) {
            create.push({leader_id: leader_id, employee_id: item});
        });
        return devopsdb.transaction(function (transaction) {
            return models.PUserR.destroy({
                where: {
                    leader_id: leader_id || 0
                },
                transaction: transaction
            }).then(data => {
                return models.PUserR.bulkCreate(create, {
                    transaction: transaction,
                    ignoreDuplicates: true
                });
            }).then(data => {
                return Promise.resolve("组员设置完成");
            });
        });
    }
}

module.exports = function (devops) {
    devops["PUserService"] = PUserService;
};