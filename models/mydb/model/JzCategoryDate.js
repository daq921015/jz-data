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
        tenant_id: {type: DataTypes.BIGINT.UNSIGNED, allowNull: false},
        tenant_code: {type: DataTypes.STRING, allowNull: false},
        tenant_name: {type: DataTypes.STRING, allowNull: false},
        branch_id: {type: DataTypes.BIGINT.UNSIGNED, allowNull: false},
        branch_code: {type: DataTypes.STRING, allowNull: false},
        branch_name: {type: DataTypes.STRING, allowNull: false},
        category_id: {type: DataTypes.BIGINT.UNSIGNED, allowNull: false},
        category_code: {type: DataTypes.STRING, allowNull: false},
        category_name: {type: DataTypes.STRING, allowNull: false},
        category_trade_count: {type: DataTypes.INTEGER, allowNull: false},
        category_trade_amount: {type: DataTypes.DECIMAL, allowNull: false},
        deleted: {type: DataTypes.STRING, allowNull: false, defaultValue: 0},
        occurred_at: {type: DataTypes.DATE, allowNull: false},
    };
    this.JzCategoryDate = sequelize.define("JzCategoryDate", this.attributes, {tableName: "jz_category_date"});
    this.JzCategoryDate.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.JzCategoryDate;
};