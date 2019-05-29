/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true},
        login_name: {
            type: DataTypes.STRING(32), allowNull: false
        },
        login_pwd: {
            type: DataTypes.STRING(32), allowNull: false, validate: {
                is: {
                    args: ["^[a-z0-9@#!$&]+$", 'i'],
                    msg: "登录密码不符合规则，不满足大小写、数字及特殊符号@#!$&",
                },
                len: {args: [6, 15], msg: "密码应为6到15位"}
            }
        },
        user_name: {type: DataTypes.STRING(32), allowNull: false},
        status: {
            type: DataTypes.TINYINT(1).UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            validate: {isIn: {args: [[0, 1]], msg: "用户状态只能为启用或停用"}}
        },
        mobile: {type: DataTypes.STRING(32), allowNull: true, validate: {isAlphanumeric: {msg: "电话只能为数字"}}},
        email: {type: DataTypes.STRING(32), allowNull: true, validate: {isEmail: {msg: "邮箱格式不正确"}}},
        last_login_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: {msg: "最后登录时间日期格式不正确"}}},
        last_login_ip: {type: DataTypes.STRING(32), allowNull: true, validate: {isIP: {msg: "ip地址格式不正确"}}},
        login_count: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, defaultValue: 0},
        department_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, defaultValue: 0},
        emp_type: {type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 2},
        is_product: {type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0},
        tenant_id: {type: DataTypes.BIGINT.UNSIGNED},
        tenant_name: {type: DataTypes.STRING},
        branch_id: {type: DataTypes.BIGINT.UNSIGNED},
        branch_name: {type: DataTypes.STRING},
        commercial_type: {type: DataTypes.BIGINT.UNSIGNED},
        partition_code: {type: DataTypes.STRING},
        memo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "备注"
        },
        created_by: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: "default",
            comment: "创建人"
        },
        updated_by: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: "default",
            comment: "修改人"
        }
    };
    this.PUser = sequelize.define("PUser", this.attributes, {tableName: "p_user"});
    this.PUser.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "start_date") && _.has(options, "end_date")) {
            _where["last_login_time"] = {
                "$between": [options["start_date"], options["end_date"]]
            }
        }
        if (_.has(options, "search")) {
            _where["$or"] = [
                {login_name: {$like: "%" + (options["search"]) + "%"}},
                {user_name: {$like: "%" + (options["search"]) + "%"}},
            ]
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    //验证用户名和密码
    this.PUser.findByUserAndPassword = function (options) {
        return this.findOne({
            where: _.pick(options, ["login_name", "login_pwd"])
        });
    };
    //获取用户信息
    this.PUser.findAndCountAllWithName = function (options) {
        let PUser_where = this.getCustomCondition(options);
        return this.findAndCountAll({
            include: {
                model: models.PDepartment,
                required: false,
                attributes: [
                    Sequelize.literal("`PDepartment`.`department_name`"),
                    Sequelize.literal("`PDepartment`.`id` as `department_id`")
                ]
            },
            where: PUser_where,
            limit: options["limit"] || undefined,
            offset: options["offset"] || undefined,
            order: [[options["sortName"] || "login_name", options["sortOrder"] || 'asc']],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        });
    };
    //获取角色包含员工
    this.PUser.findAndCountAllFilterRole = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAndCountAll({
            include: {
                model: models.PRole,
                attributes: [],
                where: {
                    id: options["role_id"]
                }
            },
            where: _where,
            attributes: ["id", "login_name", "user_name", "status"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //获取角色不包含员工
    this.PUser.findAndCountAllFilterRole_ = function (options) {
        let _where = this.getCustomCondition(options);
        _where["role_id"] = Sequelize.literal("id NOT IN (SELECT user_id FROM p_user_role_r WHERE role_id = " + (options["role_id"] || 0) + ")");
        return this.findAndCountAll({
            where: _where,
            limit: options["limit"] || undefined,
            offset: options["offset"] || undefined,
            attributes: ["id", "login_name", "user_name", "status"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    this.PUser.findAllFilterRole = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAll({
            include: {
                model: models.PRole,
                where: {
                    id: {"$in": options["role_id"]},
                },
                require: true
            },
            where: _where,
            attributes: ["id", "login_name", "user_name", "status"],
            raw: true,
        }).then(data => {
            return Promise.resolve(_.getPlaneData(data));
        })
    };
    return this.PUser;
};