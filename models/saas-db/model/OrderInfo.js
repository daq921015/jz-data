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
        tenant_id: {type: DataTypes.BIGINT(20).UNSIGNED, field: "tenant_id"},
        status: {type: DataTypes.TINYINT(3).UNSIGNED, field: "status"},
        is_deleted: {type: DataTypes.TINYINT(1).UNSIGNED, field: "is_deleted"}
    };
    this.OrderInfo = sequelize.define("OrderInfo", this.attributes, {tableName: "order_info"});
    this.OrderInfo.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.OrderInfo;
};