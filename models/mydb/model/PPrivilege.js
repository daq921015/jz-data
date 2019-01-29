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
        privilege_name: {type: DataTypes.STRING(32), allowNull: false},
        privilege_url: {type: DataTypes.STRING(32), allowNull: false, defaultValue: "#"},
        privilege_type: {type: DataTypes.TINYINT(1), allowNull: false},
        order: {type: DataTypes.TINYINT(3), allowNull: false, defaultValue: 0},
        label_class: {type: DataTypes.STRING(32), allowNull: true},
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
    this.PPrivilege = sequelize.define("PPrivilege", this.attributes, {tableName: "p_privilege"});
    this.PPrivilege.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "search")) {
            _where["$or"] = [
                {privilege_name: {$like: "%" + (options["search"]) + "%"}}
            ]
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.PPrivilege;
};