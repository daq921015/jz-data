let _ = devops.underscore._;
/*
 * 表模型扩展
 * */
module.exports = {
    //组织查询条件
    getSearchCondition: function (options) {
        options = options || {};
        let _where = {};
        //自定义条件
        if (_.has(options, "custom")) {
            _.extend(_where, options["custom"])
        }
        //字段全为条件
        for (let fields in this.attributes) {
            if (_.has(options, fields)) {
                if (typeof options[fields] === "undefined" || options[fields] === "") {
                    continue;
                }
                if (options[fields] instanceof Array) {
                    _where[fields] = {"$in": options[fields]};
                    continue;
                }
                try {
                    let value = JSON.parse(options[fields]);
                    if (value instanceof Array) {
                        _where[fields] = {"$in": value};
                    } else {
                        _where[fields] = options[fields];
                    }
                } catch (e) {
                    _where[fields] = options[fields];
                }
            }
        }
        return _where;
    },
    countCustom: function (options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        let find_options = {
            where: _where
        };
        _.extend(find_options, options["custom_options"] || {});
        return this.count(find_options);
    },
    findAndCountAllCustom: function (options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        let find_options = {
            where: _where,
            limit: options["limit"] || undefined,
            offset: options["offset"] || undefined,
            raw: true
        };
        if (_.has(options, "sortName") && _.has(options, "sortOrder")) {
            find_options["order"] = [[options["sortName"] || "id", options["sortOrder"] || 'asc']];
        }
        _.extend(find_options, options["custom_options"] || {});
        return this.findAndCountAll(find_options).then(data => {
            return Promise.resolve({total: data["count"], rows: data["rows"]})
        });
    },
    findAllCustom: function (options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        return this.findAll(_.extend({where: _where, raw: true}, options["custom_options"] || {}));
    },
    updateCustom: function (data, options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        let _condition = {where: _where};
        _.extend(_condition, options["custom_options"] || {});
        if (_.isEmpty(_condition)) {
            return Promise.reject("更新数据，条件缺失！");
        }
        return this.update(data, _condition);
    },
    destroyCustom: function (options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        if (_.isEmpty(_where)) {
            return Promise.reject("删除数据，条件缺失！");
        }
        return this.destroy(_.extend({where: _where}, options["custom_options"] || {}));
    },
    findOneCustom: function (options) {
        options = options || {};
        let _where = this.getCustomCondition(options);
        return this.findOne(_.extend({where: _where}, options["custom_options"] || {}));
    }
};