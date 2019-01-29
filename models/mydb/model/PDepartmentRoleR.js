/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        department_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true},
        role_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true}
    };
    this.PDepartmentRoleR = sequelize.define("PDepartmentRoleR", this.attributes, {
        timestamps: false,
        underscored: true,
        paranoid: false,
        tableName: "p_department_role_r"
    });
    this.PDepartmentRoleR.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "search")) {
            _where["department_name"] = {"$like": "%" + (options["search"]) + "%"}
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.PDepartmentRoleR;
};