/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes =  {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: DataTypes.BIGINT(20),
        branch_id: DataTypes.BIGINT,
        vip_code: DataTypes.STRING,
        vip_name: DataTypes.STRING,
        phone: DataTypes.STRING,
        status: DataTypes.TINYINT,
        buy_times: DataTypes.TINYINT,
        remaining_score: DataTypes.DECIMAL,
        vip_store: DataTypes.DECIMAL,
        reg_date: DataTypes.DATE,
        create_at: DataTypes.DATE,
        password_for_trading: DataTypes.STRING,
        sum_consume: {type: DataTypes.DECIMAL(11, 3)},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.Vip = sequelize.define("Vip", this.attributes, {tableName: "vip"});
    this.Vip.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Vip;
};