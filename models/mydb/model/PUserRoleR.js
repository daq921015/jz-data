/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        user_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true},
        role_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true}
    };
    this.PUserRoleR = sequelize.define("PUserRoleR", this.attributes, {
        timestamps: false,
        underscored: true,
        paranoid: false,
        tableName: "p_user_role_r"
    });
    this.PUserRoleR.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "start_date") && _.has(options, "end_date")) {
            _where["last_login_time"] = {
                "$between": [options["start_date"], options["end_date"]]
            }
        }
        if (_.has(options, "search")) {
            _where["$or"] = [
                {login_name: {$like: "%" + (options["search"]) + "%"}},
                {user_name: {$like: "%" + (options["search"]) + "%"}},
            ]
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.PUserRoleR;
};