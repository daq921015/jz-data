/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        branch_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: DataTypes.BIGINT(20),
        branch_type: DataTypes.TINYINT(3),
        branch_code: {type: DataTypes.STRING(20), field: "code"},
        branch_name: {type: DataTypes.STRING(30), field: "name"},
        branch_status: {type: DataTypes.TINYINT(3), field: "status", comment: "状态0 停用1启用"},
        branch_create_at: {type: DataTypes.DATE, field: "create_at"}
    };
    this.Branch = sequelize.define("Branch", this.attributes, {tableName: "branch"});
    this.Branch.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Branch;
};