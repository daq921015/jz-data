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
        parent_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
        role_name: {type: DataTypes.STRING(32), allowNull: false},
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
    this.PRole = sequelize.define("PRole", this.attributes, {tableName: "p_role"});
    this.PRole.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "search")) {
            _where["role_name"] = {"$like": "%" + (options["search"]) + "%"}
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    //获取部门包含的角色
    this.PRole.findAndCountAllFilterDepartment = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAndCountAll({
            include: {
                model: models.PDepartment,
                attributes: [],
                where: {
                    id: options["department_id"]
                }
            },
            where: _where,
            attributes: ["id", "role_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //获取部门不包的含角色
    this.PRole.findAndCountAllFilterDepartment_ = function (options) {
        let _where = this.getCustomCondition(options);
        _where["role_id"] = Sequelize.literal("id NOT IN (SELECT role_id FROM p_department_role_r WHERE department_id = " + (options["department_id"] || 0) + ")");
        _where["parent_id"] = {"$not": 0};
        return this.findAndCountAll({
            where: _where,
            attributes: ["id", "role_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //获取员工包含的角色
    this.PRole.findAndCountAllFilterUser = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAndCountAll({
            include: {
                model: models.PUser,
                attributes: [],
                where: {
                    id: options["user_id"]
                }
            },
            where: _where,
            attributes: ["id", "role_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //获取员工不包的含角色
    this.PRole.findAndCountAllFilterUser_ = function (options) {
        let _where = this.getCustomCondition(options);
        _where["role_id"] = Sequelize.literal("id NOT IN (SELECT role_id FROM p_user_role_r WHERE user_id = " + (options["user_id"] || 0) + ")");
        _where["parent_id"] = {"$not": 0};
        return this.findAndCountAll({
            where: _where,
            attributes: ["id", "role_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //角色是否有员工
    this.PRole.hasUser = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAll({
            where: _where
        }).then(async roles => {
            for (let i = 0, j = roles.length; i < j; i++) {
                let users = await roles[i].getPUsers({raw: true});
                if (users.length > 0) {
                    return Promise.resolve(true);
                }
            }
            return Promise.resolve(false);
        });
    };
    //角色是否有部门
    this.PRole.hasDepartment = function (options) {
        let _where = this.getCustomCondition(options);
        return this.findAll({
            where: _where
        }).then(async roles => {
            for (let i = 0, j = roles.length; i < j; i++) {
                let departments = await roles[i].getPDepartments({raw: true});
                if (departments.length > 0) {
                    return Promise.resolve(true);
                }
            }
            return Promise.resolve(false);
        });
    };
    return this.PRole;
};