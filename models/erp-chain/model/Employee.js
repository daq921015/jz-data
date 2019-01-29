/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        employee_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: {type: DataTypes.BIGINT(20), field: "tenant_id"},
        branch_id: {type: DataTypes.BIGINT(20), field: "branch_id"},
        user_id: {type: DataTypes.BIGINT(20), field: "user_id"},
        login_name: {type: DataTypes.STRING(30), field: "login_name"},
        employee_name: {type: DataTypes.STRING(50), field: "name"},
        password_for_local: {type: DataTypes.STRING(50), field: "password_for_local"},
        last_update_at: {type: DataTypes.DATE, field: "last_update_at"},
        is_deleted: DataTypes.TINYINT(1),
        employee_create_at: {type: DataTypes.DATE, field: "create_at"}
    };
    this.Employee = sequelize.define("Employee", this.attributes, {tableName: "employee"});
    this.Employee.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Employee;
};