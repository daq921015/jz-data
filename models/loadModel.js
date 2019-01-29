let Sequelize = devops.Sequelize;
module.exports = function () {
    //扩展数据库模型
    let SequelizeExtend = require("./extend/SequelizeExtend");
    for (let method in SequelizeExtend) {
        Sequelize[method] = SequelizeExtend[method];
    }
    //加载本机运行依赖数据库
    require("../models/mydb/ref")(devops.myconfig.mynodeSource);
    //初始化查询数据库(业务)
    let devopsdb = devops.Sequelize.schema.devopsdb;
    devopsdb.models.DReadDb.findAllCustom({
        db_type: 2,
        custom_options: {
            attributes: ["env_id", "db_alias", "db_ip", "db_user", "db_pwd", "db_port", "database"],
        }
    }).then(data => {
        for (let i = 0, j = data.length; i < j; i++) {
            let db_source = {
                "host": data[i]["db_ip"],
                "username": data[i]["db_user"],
                "password": data[i]["db_pwd"],
                "port": data[i]["db_port"],
                "database": data[i]["database"]
            };
            let model_folder = data[i]["database"];
            if (data[i]["database"] === "rest-db" || data[i]["database"] === "retail-db") {
                model_folder = "erp-chain";
            }
            let ref_path = devops.path.join(__dirname, "..", "models", model_folder, "ref.js");
            let schema_prefix = data[i]["env_id"] + "_" + data[i]["db_alias"];
            if (devops.myssh.getLocalIsFileSync(ref_path)) {
                require(ref_path)(db_source, schema_prefix);
            }
        }
    }).catch(err => {
        devops.publicmethod.logError(err);
    });
    //初始化查询数据库(日志)
    devopsdb.models.DReadDb.findAllCustom({
        db_type: 1,
        custom_options: {
            attributes: ["env_id", "db_alias", "db_ip", "db_user", "db_pwd", "db_port", "database"],
        }
    }).then(data => {
        for (let i = 0, j = data.length; i < j; i++) {
            let db_source = {
                "host": data[i]["db_ip"],
                "username": data[i]["db_user"],
                "password": data[i]["db_pwd"],
                "port": data[i]["db_port"]
            };
            let ref_path = devops.path.join(__dirname, "..", "models", data[i]["db_alias"], "ref.js");
            let schema_prefix = data[i]["env_id"] + "_" + data[i]["db_alias"];
            if (devops.myssh.getLocalIsFileSync(ref_path)) {
                require(ref_path)(db_source, schema_prefix);
            }
        }
    }).catch(err => {
        devops.publicmethod.logError(err);
    });
};
