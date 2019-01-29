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
        department_name: {type: DataTypes.STRING(32), allowNull: false},
        parent_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false},
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
    this.PDepartment = sequelize.define("PDepartment", this.attributes, {tableName: "p_department"});
    this.PDepartment.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "search")) {
            _where["department_name"] = {"$like": "%" + (options["search"]) + "%"}
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    //查找所有叶子节点（没有子部门）
    this.PDepartment.findAllLeafNode = function () {
        return this.findAll({
            where: {
                "id": Sequelize.literal("id NOT IN (SELECT parent_id FROM `p_department` WHERE `deleted_at` > NOW() OR `deleted_at` IS NULL)"),
                "parent_id": {"$not": 0}
            },
            attributes: ["id", "department_name"]
        });
    };
    //获取角色包含的部门
    this.PDepartment.findAndCountAllFilterUser = function (options) {
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
            attributes: ["id", "department_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    //获取角色不包含的部门
    this.PDepartment.findAndCountAllFilterUser_ = function (options) {
        let _where = this.getCustomCondition(options);
        _where["department_id"] = Sequelize.literal("id NOT IN (SELECT department_id FROM p_department_role_r WHERE role_id = " + (options["role_id"] || 0) + ")");
        _where["parent_id"] = {"$not": 0};
        return this.findAndCountAll({
            where: _where,
            attributes: ["id", "department_name"],
            raw: true
        }).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        })
    };
    return this.PDepartment;
};