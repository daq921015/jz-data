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
    let path = devops.path;
    let moment = devops.moment;
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
    sequelize.getAllBranchInfo = function (type, condition) {
        /*
         * 根据条件获取所有门店信息
         * */
        //条件类型
        let _where = {
            1: {branch_code: condition ? condition.toString() : ""},//门店编号
            2: {branch_phone: condition ? condition.toString() : ""},//手机号
            3: {branch_id: condition || 0},//门店id
        };
        if (!_.has(_where, type)) {
            return Promise.reject("传入条件类型错误，无法获取门店信息:" + type);
        }
        _where[type]["is_deleted"] = 0;
        _where[type]["custom_options"] = {
            raw: true
        };
        return models["Branch"].findAllCustom(_where[type]).then(data => {
            if (_.isEmpty(data)) {
                return Promise.reject("根据条件没有找到门店信息：" + condition);
            }
            return Promise.resolve(data)
        });
    };
    sequelize.getAllCountBranchInfo = function (param) {
        /*
         * 根据条件获取门店信息（分页）
         * param {[tenant_id], type, branch_info, page}
         * */
        if (!_.isObject(param)) {
            return Promise.reject("获取单机版门店信息，参数不符合要求。");
        }
        //条件类型
        let _where = {
            is_deleted: 0,
            "custom_options": {
                raw: true
            }
        };
        if (_.has(param, "tenant_id")) {

        }
        let _where_type = {
            1: {branch_code: param["branch_info"] ? param["branch_info"].toString() : ""},//门店编号
            2: {branch_phone: param["branch_info"] ? param["branch_info"].toString() : ""},//手机号
            3: {branch_id: param["branch_info"] || 0},//门店id
        };
        if (!_.isEmpty(param["branch_info"]) || _.isNumber(param["branch_info"])) {
            if (!_.has(_where_type, param["type"])) {
                return Promise.reject("传入条件类型错误，无法获取门店信息:" + param["type"]);
            }
            _.extend(_where, _where_type[param["type"]]);
        }
        if (!_.has(param, "tenant_id") && !_.has(_where_type, param["type"])) {//商户id或门店条件必须有其一
            return Promise.reject("查询单机版门店条件缺失。")
        }
        if (_.has(param, "tenant_id")) {//惠掌柜门店查询可以没有tenant_id条件
            _where["tenant_id"] = param["tenant_id"] || 0;
        }
        if (_.isObject(param["page"])) {
            _where["custom_options"]["offset"] = param["page"]["offset"] || 0;
            _where["custom_options"]["limit"] = param["page"]["limit"] || 0;
        }
        return models["Branch"].findAndCountAllCustom(_where).then(data => {
            return Promise.resolve(data)
        });
    };
    //------------------------------------END------------------------------------------------------
    //---------------------------------设置表间关系------------------------------------------------
    models.Vip.hasOne(models.Card, {foreignKey: "holder_id"});
    //-------------------------------------END-----------------------------------------------------
};
