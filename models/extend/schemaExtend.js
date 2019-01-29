let _ = devops.underscore._;
let Sequelize = devops.Sequelize;
/*
 * 数据库模型实例扩展
 * */
module.exports = {
    //获取表模型
    getTableModel: function (table_name) {
        /*
         * 根据环境id、数据库别名和表名获取表model对象
         * */
        let _ = devops.underscore._;
        let reg = /\b(\w)|\s(\w)|(_\w)/g; //  \b判断边界\s判断空格
        let model_name = table_name.replace(reg, function (m) {
            return m.toUpperCase().replace("_", "");
        });
        if (!_.has(this.models, model_name)) {
            return Promise.reject("没有找到表model模型:" + table_name)
        }
        return Promise.resolve(this.models[model_name]);
    },
    //获取建表语句
    showCreateTable: function (table_name) {
        if (!_.isString(table_name)) {
            return Promise.resolve("获取建表语句：表名不能为空。")
        }
        let sql = "show create table " + table_name;
        return this.query(sql, {type: this.QueryTypes.SELECT, plain: true}).then(data => {
            return Promise.resolve({
                table_name: table_name,
                table_info: _.has(data, "Create Table") ? data["Create Table"] : data["Create View"]
            });
        });
    },
    //获取表字段信息语句
    describeTable: function (table_name) {
        if (!_.isString(table_name)) {
            return Promise.resolve("获取表字段结构：表名不能为空。")
        }
        let sql = "describe " + table_name;
        return this.query(sql, {type: this.QueryTypes.SELECT}).then(data => {
            return Promise.resolve({
                table_name: table_name,
                column_info: data
            });
        });
    },
    //获取单表部分数据及总数，sql查询
    findAndCountAllBySql: function (options) {
        let table_name = options["table_name"];
        let limit = options["limit"] || 0;
        let offset = options["offset"] || 0;
        let sortName = options["sortName"];
        let sortOrder = options["sortOrder"];
        let where = options["where"] || "";
        let datasql = "select * from " + table_name + " where 1=1 " + where;
        let countsql = "select count(1) as total from " + table_name + " where 1=1 " + where;
        if (_.isString(sortName) && _.isString(sortOrder)) {
            datasql = datasql + " order by " + sortName + " " + sortOrder;
        }
        datasql = datasql + " limit " + offset + "," + limit;
        return Promise.all([
            this.query(countsql, {type: this.QueryTypes.SELECT}),
            this.query(datasql, {type: this.QueryTypes.SELECT})
        ]).then(data => {
            let total = data[0][0]["total"];
            let rows = data[1];
            return Promise.resolve({
                total: total,
                rows: rows
            });
        });
    },
    //获取一个数据库中所有表字段名称
    getSchemaAllTableColumn: function (database) {
        /*
         * 返回{table_name:{column_name:{result}}}
         * */
        let sql = "SELECT `table_name`,`column_name`,column_default,`is_nullable`,`column_type`,`column_comment` " +
            "FROM information_schema.`columns` WHERE table_schema = ?";
        let options = [database];
        return this.query(sql, {
            type: this.QueryTypes.SELECT,
            raw: true,
            replacements: options
        }).then(function (data) {
            let table_info = {};
            for (let i = 0, j = data.length; i < j; i++) {
                let table_name = data[i]["table_name"];
                let column_name = data[i]["column_name"];
                if (!_.has(table_info, table_name)) {
                    table_info[table_name] = {}
                }
                table_info[table_name][column_name] = data[i];
            }
            return Promise.resolve(table_info);
        });
    },
    //获取一个数据库中所有表索引信息
    getSchemaAllTableIndex: function (database) {
        /*
         * 返回{table_name:{index_name:{result}}}
         * */
        let sql = "SELECT `table_name`,`index_name`,`column_name`,`seq_in_index`,`non_unique` " +
            "FROM `INFORMATION_SCHEMA`.`STATISTICS`  WHERE `table_schema` = ?";
        let options = [database];
        return this.query(sql, {type: this.QueryTypes.SELECT, raw: true, replacements: options}).then(function (data) {
            let table_info = {};
            for (let i = 0, j = data.length; i < j; i++) {
                let table_name = data[i]["table_name"];
                let index_name = data[i]["index_name"];
                let column_name = data[i]["column_name"];
                if (!_.has(table_info, table_name)) {
                    table_info[table_name] = {}
                }
                if (!_.has(table_info[table_name], index_name)) {
                    table_info[table_name][index_name] = {}
                }
                table_info[table_name][index_name][column_name] = data[i];
            }
            return Promise.resolve(table_info);
        });
    }
};