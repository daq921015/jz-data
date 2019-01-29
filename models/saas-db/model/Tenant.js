/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        tenant_id: {
            type: DataTypes.BIGINT(19).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        agent_id: {type: DataTypes.BIGINT(19), field: "agent_id"},
        tenant_code: {type: DataTypes.CHAR(8), field: "code"},
        tenant_name: {type: DataTypes.STRING(50), field: "name"},
        tenant_address: {type: DataTypes.STRING(100), field: "address"},
        tenant_phone: {type: DataTypes.STRING(20), field: "phone_number"},
        tenant_linkman: {type: DataTypes.STRING(20), field: "linkman"},
        tenant_business: {type: DataTypes.STRING(20), field: "business1"},
        tenant_status: {type: DataTypes.TINYINT(3), field: "status", comment: "状态：0-未激活，1-启用，2-停用"},
        partition_code: DataTypes.STRING(20),
        is_test: DataTypes.TINYINT(1),
        is_beta: {type: DataTypes.TINYINT(1), field: "is_bate"},
        tenant_create_at: {type: DataTypes.DATE, field: "create_at"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.Tenant = sequelize.define("Tenant", this.attributes, {tableName: "tenant"});
    this.Tenant.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Tenant;
};