/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, comment: "主键", field: "id"},
        goods_code: {type: DataTypes.CHAR, field: "goods_code"},
        goods_name: {type: DataTypes.STRING, field: "goods_name"},
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