/*
 * 用户权限获取service
 * */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;

class PrivilegeService {
    constructor() {
    }

    //获取用户id
    getUserId(req) {
        if (typeof req === "undefined" || !_.isObject(req.session) || !_.has(req.session, "user")) {
            return Promise.reject("请求参数错误，无法获取当前用户信息。")
        }
        let user = req.session.user;
        if (!_.has(user, "id")) {
            return Promise.reject("无法获取当前用户id。")
        }
        return Promise.resolve(user["id"]);
    }

    //获取用户信息
    getUserInfo(req) {
        if (typeof req === "undefined" || !_.isObject(req.session) || !_.has(req.session, "user")) {
            return Promise.reject("请求参数错误，无法获取当前用户信息。")
        }
        return Promise.resolve(req.session.user);
    }

    // 获取用户所有角色id 返回 角色id数组
    getUserRoleId(req) {
        return this.getUserId(req).then(user_id => {
            return models.PUserRoleR.findAllCustom({
                user_id: user_id,
            })
        }).then(data => {
            return Promise.resolve(_.pluck(data, "role_id"))
        });
    }

    //获取角色对应的所有菜单权限id 返回权限id数组
    getRoleMenuPrivilegeId(role_id) {
        let _where = _.isArray(role_id) ? {
            role_id: {$in: role_id}
        } : {
            role_id: role_id
        };
        return models.PRolePPrivilegeR.findAll({
            where: _where,
            raw: true
        }).then(data => {
            return Promise.resolve(_.groupBy(data, "privilege_id"))
        });
    }

    _getSiderBar(req, type, parent_id) {//获取菜单一级、二级、三级
        let _where = {
            privilege_type: type || 0
        };
        if (typeof parent_id !== "undefined") {
            _where["parent_id"] = parent_id;
        }
        return this.getUserRoleId(req).then(role_id => {
            return models.PPrivilege.findAll({
                where: _where,
                attributes: ["id", "parent_id", "privilege_name", "privilege_url", "label_class"],
                order: [["order", "asc"]],
                raw: true,
                group: ["id"],//防止一个用户多个角色，导致权限重复，菜单重复
                include: {
                    model: models.PRole,
                    where: {
                        id: {$in: role_id}
                    },
                    attributes: ["id"],
                    required: true,
                    through: {
                        attributes: [],
                    }
                }
            })
        }).then(data => {
            return Promise.resolve(_.getPlaneData(data));
        });
    }

    //获取一级侧边栏 父菜单
    getUserMainSiderBar(req) {
        return this._getSiderBar(req, 1);
    }

    //获取二级侧边栏 子菜单
    getUserSubSiderBar(req) {
        return this._getSiderBar(req, 2);
    }

    //获取三级侧边栏 功能侧边栏
    getUserThirdSiderBar(req, parent_id) {
        return this._getSiderBar(req, 3, parent_id);
    }

    //获取用户功能环境权限
    getUserEnv(req, type, privilege_id) {
        /*
         * type 权限类型 1环境权限，2程序权限
         * privilege_id 功能代号（d_privilege_env表id或d_privilege_program表id）
         * */
        let _where, _model;
        if (type === 1) {
            _where = {
                privilege_id: privilege_id || 0
            };
            _model = models.PRoleDPrivilegeEnvR;
        } else if (type === 2) {
            _where = {
                privilege_id: {$like: "%," + privilege_id || 0 + "%"}
            };
            _model = models.PRoleDPrivilegeProgramR;
        } else {
            return Promise.reject("权限类型参数不符合要求")
        }
        return this.getUserRoleId(req).then(role_id => {
            _where["role_id"] = {$in: role_id};
            return _model.findAll({
                where: _where,
                attributes: ["env_id"],
                raw: true,
                include: {
                    model: models.DEnv,
                    attributes: ["env_name"],
                    required: true
                },
                order: [[models.DEnv, "env_name", "desc"]],
                group: ["env_id"]
            })
        }).then(data => {
            return Promise.resolve(_.getPlaneData(data));
        });
    }

    //获取用户功能环境项目权限
    getUserEnvProject(req, env_id, privilege_id) {
        /*
         * env_id 环境id
         * privilege_id 权限id
         * */
        return this.getUserRoleId(req).then(role_id => {
            return models.PRoleDPrivilegeProgramR.findAll({
                where: {
                    role_id: {$in: role_id},
                    env_id: env_id,
                    privilege_id: {$like: "%," + privilege_id || 0 + "%"}
                },
                attributes: ["privilege_id"],
                raw: true,
            })
        }).then(data => {
            //获取所有项目id
            let project_id = [];
            data.forEach(function (item) {
                let _arr = item["privilege_id"].split(",");
                if (_arr.length === 2) {
                    project_id.push(parseInt(_arr[0]));
                }
            });
            return models.DProject.findAllWithName({
                custom_options: {
                    where: {
                        id: {$in: project_id}
                    }
                }
            });
        }).then(data => {
            if (data.length <= 0) {
                return Promise.reject("没有获取到环境下的程序。")
            }
            let projects = [];
            for (let i = 0, j = data.length; i < j; i++) {
                projects.push({
                    id: data[i]["id"],
                    env_id: data[i]["env_id"],
                    group_id: data[i]["group_id"],
                    program_id: data[i]["program_id"],
                    env_name: data[i]["env_name"],
                    group_name: data[i]["group_name"],
                    program_name: data[i]["program_name"]
                });
            }
            return Promise.resolve(projects);
        });
    }

    //获取配置文件操作按钮权限
    getUserConfigFileButtonPrivilege(req, project_id) {
        let form_fields = req.form_fields;
        return this.getUserRoleId(req).then(role_id => {
            return models.PRoleDPrivilegeProgramR.findAll({
                where: {
                    role_id: {$in: role_id},
                    env_id: form_fields["env_id"] || 0,
                    privilege_id: {$like: "%" + project_id + ",%"}
                },
                raw: true
            });
        }).then(data => {
            //获取程序所有权限id
            let privilege_id = [];
            data.forEach(function (item) {
                let _arr = item["privilege_id"].split(",");
                if (_arr.length === 2) {
                    privilege_id.push(parseInt(_arr[1]));
                }
            });
            //获取程序配置文件按钮权限名称
            return models.DPrivilegeProgram.findAll({
                where: {
                    id: {$in: privilege_id},
                    parent_id: 21
                },
                attributes: ["privilege_name"],
                raw: true
            });
        }).then(data => {
            return Promise.resolve(_.pluck(data, "privilege_name"));
        })
    }
}

module.exports = function (devops) {
    devops["PrivilegeService"] = new PrivilegeService();
};