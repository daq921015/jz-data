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
        tenant_id: DataTypes.BIGINT(20),
        sale_count: DataTypes.BIGINT(20),
        vip_count: DataTypes.BIGINT(20),
        branch_count: DataTypes.BIGINT(20),
        sale_amount: {type: DataTypes.DECIMAL(11, 3)},
        vip_trade_amount: {type: DataTypes.DECIMAL(11, 3)},
        sale_date: DataTypes.DATEONLY
    };
    this.TmpSaleCarryOver = sequelize.define("TmpSaleCarryOver", this.attributes, {tableName: "tmp_sale_carry_over"});
    this.TmpSaleCarryOver.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.TmpSaleCarryOver;
};