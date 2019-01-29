/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        pay_account_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT(20), field: "branch_id"},
        umpay_id: {type: DataTypes.STRING(50), field: "umpay_id"},
        use_type: {type: DataTypes.TINYINT, field: "use_type"},
        use_original_wei_xin_pay: {type: DataTypes.TINYINT, field: "use_original_wei_xin_pay"},
        is_deleted: DataTypes.TINYINT(1),
        create_at: {type: DataTypes.DATE, field: "create_at"},
        create_by: {type: DataTypes.STRING(50), field: "create_by"},
        last_update_at: {type: DataTypes.DATE, field: "last_update_at"},
        last_update_by: {type: DataTypes.STRING(50), field: "last_update_by"}
    };
    this.SPayAccount = sequelize.define("SPayAccount", this.attributes, {tableName: "s_pay_account"});
    this.SPayAccount.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.SPayAccount;
};