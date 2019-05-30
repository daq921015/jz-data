let _ = devops.underscore._;
//扩展_
module.exports = function () {
    //去除对象key中所有的前缀（点号分隔）
    //同样的key保留前面的
    _.getPlaneData = function (data) {
        if (data instanceof Array) {
            let re_data = [];
            //去除别名中 表名称
            for (let i = 0, j = data.length; i < j; i++) {
                let tmp = {};
                for (let field_name in data[i]) {
                    let field = field_name.replace(/^.*\./, "");
                    if (!_.has(tmp, field)) {
                        tmp[field] = data[i][field_name];
                    }
                }
                re_data.push(tmp);
            }
            return re_data;
        } else {
            let tmp = {};
            for (let field_name in data) {
                let field = field_name.replace(/^.*\./, "");
                if (!_.has(tmp, field)) {
                    tmp[field] = data[i][field_name];
                }
            }
            return tmp;
        }

    };
    /**
     * 扩展Promise选择处理,参数1表达式，true处理第一个，false处理第二个参数
     * 参数1和2为函数或函数组成的数组
     * 返回值：Promise 对象
     * @type {function(*, *=, *=): *}
     */
    Promise.if = Promise.prototype.if = function (flag, planAS, planBS) {
        let first = typeof planAS == "function" ? planAS : function () {
            return Promise.all(planAS.map((f) => {
                return f();
            }))
        };
        let second = typeof planBS == "function" ? planBS : function () {
            return Promise.all(planBS.map((f) => {
                return f();
            }))
        };
        if (flag) {
            let a = first();
            return a instanceof Promise ? a : Promise.resolve(a);
        } else {
            let b = second();
            return b instanceof Promise ? b : Promise.resolve(b);
        }
    };
    Date.prototype.format = function (fmt) {
        let o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };
};
