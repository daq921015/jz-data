/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        user_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        login_name: {type: DataTypes.STRING(30), field: "login_name"},
        login_pass: {type: DataTypes.STRING(32), field: "login_pass"},
        user_type: {type: DataTypes.TINYINT(3).UNSIGNED, field: "user_type"},
        state: {type: DataTypes.TINYINT(3).UNSIGNED, field: "state"},
        name: {type: DataTypes.STRING(50), field: "name"},
        login_count: {type: DataTypes.INTEGER(11), field: "login_count"},
        last_login_time: {type: DataTypes.DATE, field: "last_login_time"},
        create_at: {type: DataTypes.DATE, field: "create_at"},
        bind_mobile: {type: DataTypes.STRING(20), field: "bind_mobile"},
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        is_deleted: DataTypes.TINYINT(1)
    };
    this.SUser = sequelize.define("SUser", this.attributes, {tableName: "s_user"});
    this.SUser.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.SUser;
};