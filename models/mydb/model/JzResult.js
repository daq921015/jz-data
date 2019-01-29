/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true},
        occurred_at: {type: DataTypes.DATE, allowNull: false},
        jz_status: {type: DataTypes.TINYINT, allowNull: false},
    };
    this.JzResult = sequelize.define("JzResult", this.attributes, {tableName: "jz_result"});
    this.JzResult.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.JzResult;
};