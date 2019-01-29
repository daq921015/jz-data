/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        agent_id: {
            type: DataTypes.BIGINT(19).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        agent_code: {type: DataTypes.CHAR(8), field: "code"},
        agent_name: {type: DataTypes.STRING(50), field: "name"},
        agent_city_name: {type: DataTypes.STRING(20), field: "city_name"},
        agent_address: {type: DataTypes.STRING(100), field: "address"},
        agent_phone_number: {type: DataTypes.STRING(20), field: "phone_number"},
        agent_linkman: {type: DataTypes.STRING(20), field: "linkman"},
        agent_mobile: {type: DataTypes.STRING(20), field: "mobile"},
        agent_status: {type: DataTypes.TINYINT(3).UNSIGNED, field: "status"},
        agent_create_at: {type: DataTypes.DATE, field: "create_at"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.Agent = sequelize.define("Agent", this.attributes, {tableName: "agent"});
    this.Agent.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Agent;
};