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
        charset: 'utf8',
        //核对
        collate: 'utf8_general_ci'
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
};
module.exports = function (options, schema_prefix) {
    let Sequelize = devops.Sequelize;
    let _ = devops.underscore._;
    let myssh = devops.myssh;
    let moment = devops.moment;
    let path = devops.path;
    let new_options = _.extend(default_options, options || {});
    let sequelize = new Sequelize(new_options);
    typeof Sequelize["schema"] === "undefined" ? Sequelize["schema"] = {
        schema_prefix: sequelize
    } : Sequelize["schema"][schema_prefix] = sequelize;
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
    //自定义扩展sequelize实例方法
    sequelize.getTenantInfo = function (type, condition) {
        /*
         * 根据条件获取商户信息
         * */
        if (_.isEmpty(condition) && !(_.isNumber(condition))) {
            return Promise.reject("请传入商户信息检索条件");
        }
        let _where = {
            1: {login_name: condition ? condition.toString() : ""},//登录名
            2: {bind_mobile: condition ? condition.toString() : ""},//手机号
            3: {tenant_id: condition || 0},//商户id
            4: {tenant_name: {$like: '%' + condition + '%'}} //商户名称，模糊查询
        };
        if (!_.has(_where, type)) {
            return Promise.reject("传入条件类型错误，无法获取商户信息:" + type);
        }
        _where[type]["is_deleted"] = 0;
        _where[type]["custom_options"] = {};
        if (type === 4) {
            return models["Tenant"].findAndCountAllCustom(_where[type]);
        }
        return models["SUser"].findOneCustom(_where[type]).then(data => {
            if (!data) {
                return Promise.reject("根据传入条件没有找到商户：" + condition);
            }
            return models["Tenant"].findOneCustom({
                tenant_id: data.get("tenant_id") || 0,
                is_deleted: 0,
                custom_options: {
                    raw: true
                }
            });
        }).then(data => {
            if (!data) {
                return Promise.reject("根据传入条件没有找到商户信息：" + condition);
            }
            return Promise.resolve(data)
        });
    };
    //------------------------------------END------------------------------------------------------
    //---------------------------------设置表间关系------------------------------------------------
    models.Tenant.hasOne(models.SUser, {foreignKey: "tenant_id"});
    models.SUser.belongsTo(models.Tenant, {foreignKey: "tenant_id"});
    models.TenantGoods.belongsTo(models.Goods, {foreignKey: "goods_id"});
    models.OrderInfo.hasOne(models.OrderList, {foreignKey: "order_id"});
    //-------------------------------------END-----------------------------------------------------
};
