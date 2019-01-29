/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        activation_code: {type: DataTypes.STRING(30), field: "activation_code"},
        active_type: {type: DataTypes.TINYINT(3), field: "type"},
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT(20), field: "branch_id"},
        active_mobile: {type: DataTypes.STRING(11), field: "mobile"},
        device_code: {type: DataTypes.STRING(50), field: "device_code"},
        is_deleted: DataTypes.TINYINT(1),
        active_create_at: {type: DataTypes.DATE, field: "create_at"}
    };
    this.ActivationCodeHistory = sequelize.define("ActivationCodeHistory", this.attributes, {tableName: "activation_code_history"});
    this.ActivationCodeHistory.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.ActivationCodeHistory;
};