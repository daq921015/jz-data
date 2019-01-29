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
        trade_branch_id: DataTypes.BIGINT(20),
        trade_amount: DataTypes.DECIMAL(11, 3),
        is_deleted: DataTypes.TINYINT(1)
    };
    this.VipTradeHistory = sequelize.define("VipTradeHistory", this.attributes, {tableName: "vip_trade_history"});
    this.VipTradeHistory.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.VipTradeHistory;
};