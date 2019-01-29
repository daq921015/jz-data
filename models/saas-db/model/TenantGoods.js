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
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT(20), field: "branch_id"},
        goods_id: {type: DataTypes.BIGINT(20), field: "goods_id"},
        limit_date: {type: DataTypes.DATE, field: "limit_date"},
        create_at: {type: DataTypes.DATE, field: "create_at", defaultValue: new Date()},
        create_by: {type: DataTypes.STRING(50), field: "create_by", defaultValue: "lbl"},
        last_update_at: {type: DataTypes.DATE, field: "last_update_at", defaultValue: new Date()},
        last_update_by: {type: DataTypes.STRING(50), field: "last_update_by", defaultValue: "lbl"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.TenantGoods = sequelize.define("TenantGoods", this.attributes, {tableName: "tenant_goods"});
    this.TenantGoods.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.TenantGoods;
};