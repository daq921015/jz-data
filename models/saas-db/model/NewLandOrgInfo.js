/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {
            type: DataTypes.BIGINT(19).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: "主键",
            field: "id"
        },
        org_no: {type: DataTypes.STRING, field: "org_no"},
        private_key: {type: DataTypes.STRING, field: "private_key"},
        md5_key: {type: DataTypes.STRING, field: "md5_key"},
        create_at: {type: DataTypes.DATE, field: "create_at"},
        create_by: {type: DataTypes.STRING, field: "create_by"},
        is_deleted: {type: DataTypes.TINYINT, field: "is_deleted", defaultValue: 0},
    };
    this.NewLandOrgInfo = sequelize.define("NewLandOrgInfo", this.attributes, {tableName: "new_land_org_info"});
    this.NewLandOrgInfo.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    return this.NewLandOrgInfo;
};