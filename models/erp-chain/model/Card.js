/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        card_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        card_code: {type: DataTypes.STRING(50), field: "code"},
        card_type: {type: DataTypes.TINYINT(3), field: "type"},
        card_state: {type: DataTypes.TINYINT(3), field: "state"},
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        tenant_code: {type: DataTypes.STRING(20), field: "tenant_code"},
        branch_code: {type: DataTypes.STRING(20), field: "branch_code"},
        holder_id: {type: DataTypes.STRING, field: "holder_id"},
        create_at: {type: DataTypes.DATE, field: "create_at"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.Card = sequelize.define("Card", this.attributes, {tableName: "card"});
    this.Card.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Card;
};