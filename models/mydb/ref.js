/**
 * Created by Administrator on 2017-10-29.
 * model 关系映射
 */
let default_options = {
    // "host": "192.168.51.78",
    // "username": "root",
    // "password": "root",
    // "database": "test",
    "port": "3306",
    "pool": {
        "max": 5,
        "min": 1,
        "idle": 10000
    },
    "dialect": "mysql",  //数据库类型默认mysql
    //时区
    "timezone": "+08:00",
    //定义表时，全局默认配置
    "define": {
        //定义模型时自动带两个事件字段
        timestamps: false,
        //时间字段格式下划线
        underscored: true,
        //删除控制，删除时只记录删除时间
        paranoid: false,
        //模型名称与数据库表名一直
        freezeTableName: true,
        //表默认为innodb引擎
        engine: 'InnoDB',
        //表版本控制
        // version: true
        //字符集
        charset: 'utf8mb4',
        //核对
        collate: 'utf8mb4_general_ci'
    },
    //使用操作符别名 Op.like = $like
    // operatorsAliases: false,
    //Default options for sequelize.query
    "query": {
        //查询的结果以不同对象展示
        raw: false
    },
    //Default options for sequelize.set
    "set": {},
    //Default options for sequelize.sync
    "sync": {
        //强一致，存在则删除
        force: false
    },
    //mysql执行日志输出位置
    "logging": null
    // "logging": console.log
};
module.exports = function (options) {
    let Sequelize = devops.Sequelize;
    let _ = devops.underscore._;
    let myssh = devops.myssh;
    let path = devops.path;
    let new_options = _.extend(default_options, options || {});
    let sequelize = new Sequelize(new_options);
    typeof Sequelize["schema"] === "undefined" ? Sequelize["schema"] = {
        devopsdb: sequelize
    } : Sequelize["schema"]["devopsdb"] = sequelize;
    //---------------------------数据库加载model--------------------------------------------
    let model_dir = path.join(__dirname, "model");
    let files = myssh.getLocalReadDirSync(model_dir);
    for (let i = 0, j = files.length; i < j; i++) {
        sequelize.import(path.join(__dirname, "model", files[i]));
    }
    let models = sequelize.models;
    //------------------------------------END------------------------------------------------------
    //--------------------------------自定义model/Sequelize函数-----------------------------------------------
    let modelExtend = require("../extend/modelExtend");
    let modelInstanceExtend = require("../extend/modelInstanceExtend");
    let schemaExtend = require("../extend/schemaExtend");
    for (let method in schemaExtend) {
        sequelize[method] = schemaExtend[method];
    }
    for (let model_name in models) {
        let model = models[model_name];
        for (let method in modelExtend) {
            model[method] = modelExtend[method];
        }
        for (let method in modelInstanceExtend) {
            model.prototype[method] = modelInstanceExtend[method];
        }
    }
    //------------------------------------END------------------------------------------------------
    //---------------------------------设置表间关系------------------------------------------------
    models.PRole.belongsToMany(models.PPrivilege, {
        through: models.PRolePPrivilegeR,
        foreignKey: "role_id",
        otherKey: "privilege_id"
    });
    models.PPrivilege.belongsToMany(models.PRole, {
        through: models.PRolePPrivilegeR,
        foreignKey: "privilege_id",
        otherKey: "role_id"
    });
    models.PRole.belongsToMany(models.PUser, {through: models.PUserRoleR, foreignKey: "role_id", otherKey: "user_id"});
    models.PUser.belongsToMany(models.PRole, {through: models.PUserRoleR, foreignKey: "user_id", otherKey: "role_id"});
    models.PRole.belongsToMany(models.PDepartment, {
        through: models.PDepartmentRoleR,
        foreignKey: "role_id",
        otherKey: "department_id"
    });
    models.PDepartment.belongsToMany(models.PRole, {
        through: models.PDepartmentRoleR,
        foreignKey: "department_id",
        otherKey: "role_id"
    });
    models.PUser.belongsTo(models.PDepartment, {foreignKey: "department_id"});
    //--------------------------------------END----------------------------------------------------
};
