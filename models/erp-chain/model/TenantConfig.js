/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, comment: "主键", field: "id"},
        tenant_id: {type: DataTypes.BIGINT},
        name: {type: DataTypes.STRING},
        value: {type: DataTypes.STRING},
        max_value: {type: DataTypes.STRING},
        last_update_at: {type: DataTypes.DATE},
        is_deleted: DataTypes.TINYINT
    };
    this.TenantConfig = sequelize.define("TenantConfig", this.attributes, {tableName: "tenant_config"});
    this.TenantConfig.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.TenantConfig;
};