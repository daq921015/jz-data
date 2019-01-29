/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        role_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true},
        privilege_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true}
    };
    this.PRolePPrivilegeR = sequelize.define("PRolePPrivilegeR", this.attributes, {
        timestamps: false,
        underscored: true,
        paranoid: false,
        tableName: "p_role_p_privilege_r"
    });
    this.PRolePPrivilegeR.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.PRolePPrivilegeR;
};