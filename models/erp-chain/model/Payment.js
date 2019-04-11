/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        payment_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: DataTypes.BIGINT,
        branch_id: DataTypes.BIGINT,
        payment_code: {type: DataTypes.STRING},
        payment_name: {type: DataTypes.STRING},
        payment_status: DataTypes.TINYINT,
        last_update_at: DataTypes.DATE,
        is_deleted: DataTypes.TINYINT
    };
    this.Payment = sequelize.define("Payment", this.attributes, {tableName: "payment"});
    this.Payment.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Payment;
};