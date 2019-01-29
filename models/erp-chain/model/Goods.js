/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        goods_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: DataTypes.BIGINT,
        branch_id: DataTypes.BIGINT,
        category_id: DataTypes.BIGINT,
        category_name: DataTypes.STRING,
        goods_code: DataTypes.STRING,
        goods_name: DataTypes.STRING,
        goods_unit_id: DataTypes.BIGINT,
        goods_unit_name: DataTypes.STRING,
        goods_status: DataTypes.TINYINT,
        is_store: DataTypes.TINYINT,
        goods_create_at: {type: DataTypes.DATE, field: "create_at"},
        weigh_plu: DataTypes.INTEGER,
        is_deleted: DataTypes.TINYINT
    };
    this.Goods = sequelize.define("Goods", this.attributes, {tableName: "goods"});
    this.Goods.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Goods;
};