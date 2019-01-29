/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        app_name: {type: DataTypes.STRING(100), field: "name"},
        version_no: {type: DataTypes.STRING(20), field: "version_no"},
        app_type: {type: DataTypes.TINYINT(3), field: "type"},
        app_notes: {type: DataTypes.TEXT, defaultValue: "", field: "notes"},
        version_type: {type: DataTypes.TINYINT(3), field: "version_type"},
        app_business: {type: DataTypes.CHAR(1), field: "business"},
        file_path: {type: DataTypes.STRING(100), field: "file_path"},
        file_md5: {type: DataTypes.STRING(32), field: "md5"},
        is_force_update: DataTypes.TINYINT(1),
        is_latest: DataTypes.TINYINT,
        is_web_latest: DataTypes.TINYINT,
        is_web_beta_latest: DataTypes.TINYINT,
        is_deleted: DataTypes.TINYINT(1),
        app_create_at: {type: DataTypes.DATE, field: "create_at"},
        app_create_by: {type: DataTypes.STRING(20), field: "create_by"}
    };
    this.App = sequelize.define("App", this.attributes, {tableName: "app"});
    this.App.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.App;
};