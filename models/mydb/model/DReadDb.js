/**
 * Created by Administrator on 2017-10-29.
 */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
module.exports = function (sequelize, DataTypes) {
    this.attributes = {
        id: {type: DataTypes.BIGINT(20).UNSIGNED, autoIncrement: true, primaryKey: true},
        env_id: {type: DataTypes.BIGINT(20).UNSIGNED, allowNull: false, defaultValue: 0},
        db_alias: {type: DataTypes.STRING(32), allowNull: false},
        db_ip: {type: DataTypes.STRING(32), allowNull: false, validate: {isIP: {msg: "ip格式不正确"}}},
        db_user: {type: DataTypes.STRING(32), allowNull: false},
        db_pwd: {type: DataTypes.STRING(32), allowNull: false},
        db_port: {type: DataTypes.STRING(32), allowNull: false},
        db_type: {type: DataTypes.TINYINT(1), allowNull: false},
        database: {type: DataTypes.STRING(32), allowNull: true},
        memo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "备注"
        },
        created_by: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: "default",
            comment: "创建人"
        },
        updated_by: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: "default",
            comment: "修改人"
        }
    };
    this.DReadDb = sequelize.define("DReadDb", this.attributes, {tableName: "d_read_db"});
    this.DReadDb.getCustomCondition = function (options) {
        let that = this;
        let _where = {};
        //自定义条件
        if (_.has(options, "search")) {
            _where["$or"] = [
                {db_alias: {$like: "%" + (options["search"]) + "%"}},
                {db_ip: {$like: "%" + (options["search"]) + "%"}},
            ]
        }
        _.extend(_where, that.getSearchCondition(options));
        return _where;
    };
    //获取读取数据库信息(分页)
    this.DReadDb.findAndCountAllWithName = function (options) {
        let _where = this.getCustomCondition(options);
        let find_options = {
            include: {
                model: models.DEnv,
                required: true,
                attributes: ["env_name"]
            },
            where: _where,
            limit: options["limit"] || undefined,
            offset: options["offset"] || undefined,
            order: [[models.DEnv, "env_name", "desc"], [options["sortName"] || "db_alias", options["sortOrder"] || 'asc']],
            raw: true
        };
        _.extend(find_options, options["custom_options"] || {});
        return this.findAndCountAll(find_options).then(data => {
            return Promise.resolve({
                total: data["count"],
                rows: _.getPlaneData(data["rows"])
            })
        });
    };
    //获取读取数据库信息
    this.DReadDb.findAllWithName = function (options) {
        let _where = this.getCustomCondition(options);
        let find_options = {
            include: {
                model: models.DEnv,
                required: true,
                attributes: ["env_name"]
            },
            where: _where,
            limit: options["limit"] || undefined,
            offset: options["offset"] || undefined,
            order: [[models.DEnv, "env_name", "desc"], [options["sortName"] || "db_alias", options["sortOrder"] || 'asc']],
            raw: true
        };
        _.extend(find_options, options["custom_options"] || {});
        return this.findAll(find_options).then(data => {
            return Promise.resolve(_.getPlaneData(data));
        });
    };
    return this.DReadDb;
};