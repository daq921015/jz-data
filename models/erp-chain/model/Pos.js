/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        pos_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: {type: DataTypes.BIGINT, field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT, field: "branch_id"},
        device_code: {type: DataTypes.STRING, field: "device_code"},
        pos_code: {type: DataTypes.STRING, field: "pos_code"},
        branch_code: {type: DataTypes.STRING, field: "branch_code"},
        password: {type: DataTypes.STRING, field: "password"},
        status: {type: DataTypes.TINYINT, field: "status"},
        branch_name: {type: DataTypes.STRING, field: "branch_name"},
        access_token: {type: DataTypes.STRING, field: "access_token"},
        tenant_code: {type: DataTypes.STRING, field: "tenant_code"},
        app_name: {type: DataTypes.STRING, field: "app_name"},
        app_version: {type: DataTypes.STRING, field: "app_version"},
        is_pull_log: {type: DataTypes.TINYINT, field: "is_pull_log"},
        is_deleted: DataTypes.TINYINT
    };
    this.Pos = sequelize.define("Pos", this.attributes, {tableName: "pos"});
    this.Pos.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Pos;
};