/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        category_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        tenant_id: DataTypes.BIGINT,
        branch_id: DataTypes.BIGINT,
        cat_code: {type: DataTypes.STRING},
        cat_name: {type: DataTypes.STRING},
        parent_id: {type: DataTypes.BIGINT},
        last_update_at: DataTypes.DATE,
        is_deleted: DataTypes.TINYINT
    };
    this.Category = sequelize.define("Category", this.attributes, {tableName: "category"});
    this.Category.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.Category;
};