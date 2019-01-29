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
        env_id: {type: DataTypes.BIGINT(20).UNSIGNED, primaryKey: true},
        privilege_id: {type: DataTypes.STRING(32), primaryKey: true}
    };
    this.PRoleDPrivilegeProgramR = sequelize.define("PRoleDPrivilegeProgramR", this.attributes, {
        timestamps: false,
        underscored: true,
        paranoid: false,
        tableName: "p_role_d_privilege_program_r"
    });
    this.PRoleDPrivilegeProgramR.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.PRoleDPrivilegeProgramR;
};