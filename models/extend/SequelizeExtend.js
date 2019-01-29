let _ = devops.underscore._;
/*
 * 数据库模型扩展
 * 注意：模型名称 首字母大写，蛇形变成驼峰形
 * */
module.exports = {
    //获取表模型
    getTableModel: function (env_id, db_alias, table_name) {
        /*
         * 根据环境id、数据库别名和表名获取表model对象
         * */
        return this.getSchema(env_id, db_alias).then(schema => {
            let reg = /\b(\w)|\s(\w)|(_\w)/g; //  \b判断边界\s判断空格
            let model_name = table_name.replace(reg, function (m) {
                return m.toUpperCase().replace("_", "");
            });
            if (!_.has(schema.models, model_name)) {
                return Promise.reject("没有找到表model模型:" + table_name)
            }
            return Promise.resolve(schema.models[model_name]);
        });
    },
    //获取数据库模型实例
    getSchema: function (env_id, db_alias) {
        /*
         * 根据环境id、数据库别名获取数据库模型
         * */
        if (!devops.underscore._.has(devops.Sequelize.schema, env_id + "_" + db_alias)) {
            return Promise.reject("没有找到环境对应的数据库模型，环境:" + env_id + ",数据库:" + db_alias);
        }
        return Promise.resolve(devops.Sequelize.schema[env_id + "_" + db_alias]);
    },
    getBusinessSchema: function (env_id, partition_code) {
        /*
         * 根据商户分区码获取业务库schema
         * */
        let partitions = {
            "z0": "z0-saas-db",
            "z3": "z0-goods-db",
            "za1": "za1-rest-db",
            "zb1": "zb1-retail-db",
            "zc1": "zc1-erp-store",
            "zd1": "zd1-erp-chain"
        };
        if (!_.has(partitions, partition_code)) {
            return Promise.reject("没有找到分区码对应的数据库：" + partition_code);
        }
        return this.getSchema(env_id, partitions[partition_code]);
    },
    getBusinessTableModel: function (env_id, partition_code, table_name) {
        /*
         * 根据商户分区码、表名，获取业务库table model
         * */
        return this.getBusinessSchema(env_id, partition_code).then(schema => {
            let reg = /\b(\w)|\s(\w)|(_\w)/g; //  \b判断边界\s判断空格
            let model_name = table_name.replace(reg, function (m) {
                return m.toUpperCase().replace("_", "");
            });
            if (!_.has(schema.models, model_name)) {
                return Promise.reject("没有找到表model模型:" + table_name)
            }
            return Promise.resolve(schema.models[model_name]);
        });
    }
};