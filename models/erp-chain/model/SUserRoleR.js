/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        user_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true, field: "user_id"},
        role_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true, field: "role_id"}
    };
    this.SUserRoleR = sequelize.define("SUserRoleR", this.attributes, {tableName: "s_user_role_r"});
    this.SUserRoleR.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.SUserRoleR;
};