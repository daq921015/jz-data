/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        role_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT(20), field: "branch_id"},
        role_code: {type: DataTypes.STRING(20), field: "role_code"},
        role_name: {type: DataTypes.STRING(50), field: "role_name"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.SRole = sequelize.define("SRole", this.attributes, {tableName: "s_role"});
    this.SRole.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.SRole;
};