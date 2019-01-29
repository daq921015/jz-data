/*
 * */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;

class JzApiService {
    constructor() {
        //构造函数
    }
    //会员储值与销售金额
    vipStoreAndConsumeByDay(tenant_id, days, today) {
        /*
        * today:有值：包括今天，无值：不包括
        * */
        if (typeof today == "undefined") {
            today = 0;
        } else {
            today = 1;
            days = days - 1;
        }
        let sql = [
            "SELECT occurred_at,SUM(vip_store_amount) AS store_amount,SUM(vip_consume_amount) AS consume_amount",
            "FROM `jz_sale_vip_date` WHERE tenant_id =? AND occurred_at >=DATE(DATE_ADD(NOW(),INTERVAL -? DAY)) AND occurred_at < DATE(DATE_ADD(NOW(),INTERVAL ? DAY))",
            "GROUP BY occurred_at"
        ].join("\n");
        return devopsdb.query(sql, {
            type: Sequelize.QueryTypes.SELECT,
            replacements: [tenant_id, days, today],
            raw: true
        }).then(data => {
            let _obj = [];
            if (_.isEmpty(data)) {
                return Promise.resolve(_obj)
            }
            data.forEach(function (item) {
                _obj.push({
                    occurred_at: item["occurred_at"],
                    amount: item["store_amount"],
                    type: "store",
                });
                _obj.push({
                    occurred_at: item["occurred_at"],
                    amount: item["consume_amount"],
                    type: "consume",
                });
            });
            return Promise.resolve(_obj)
        });
    }

}

module.exports = function (devops) {
    devops["JzApiService"] = new JzApiService();
};