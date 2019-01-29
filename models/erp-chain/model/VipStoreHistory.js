/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        store_code: {type: DataTypes.STRING},
        vip_id: {type: DataTypes.BIGINT},
        tenant_id: {type: DataTypes.BIGINT},
        branch_id: {type: DataTypes.BIGINT, field: "store_branch_id"},
        store_type: DataTypes.STRING,
        pay_amount: DataTypes.DECIMAL,
        pay_type: DataTypes.STRING,
        gift_amount: DataTypes.DECIMAL,
        branch_name: {type: DataTypes.STRING, field: "store_branch_name"},
        store_create_at: {type: DataTypes.DATE, field: "create_at"},
        is_deleted: DataTypes.TINYINT
    };
    this.VipStoreHistory = sequelize.define("VipStoreHistory", this.attributes, {tableName: "vip_store_history"});
    this.VipStoreHistory.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.VipStoreHistory;
};