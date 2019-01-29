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
        order_id: {type: DataTypes.BIGINT(20).UNSIGNED, field: "order_id"},
        branch_id: {type: DataTypes.BIGINT(20).UNSIGNED, field: "branch_id"},
        is_deleted: {type: DataTypes.TINYINT(1).UNSIGNED, field: "is_deleted"}
    };
    this.OrderList = sequelize.define("OrderList", this.attributes, {tableName: "order_list"});
    this.OrderList.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.OrderList;
};