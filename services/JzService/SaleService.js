/*
 * */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
let moment = devops.moment;

class SaleService {
    constructor() {
    }

    //结转流水
    jzSaleDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' as tenant_code,'tenant_name' as tenant_name,",
            "M.branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "COUNT(IF(M.is_refund=0,1,-1)) AS sale_trade_count,",
            "SUM(IF(M.is_refund=0,M.received_amount,-M.received_amount)) AS sale_trade_amount,",
            "'" + occurred_at + "' as occurred_at",
            "FROM sale M",
            "INNER JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`branch_id`=N.`id` AND N.`is_deleted`=0",
            "WHERE M.is_deleted=0",
            "AND M.last_update_at >= '" + occurred_at + "' and",
            "M.last_update_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.branch_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzSaleVipDate.bulkCreate(data, {
                updateOnDuplicate: ["sale_trade_count", "sale_trade_amount"],
                transaction: transaction
            });
        });
    }

    //注册会员数
    jzVipRegisterDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' AS tenant_code,'tenant_name' AS tenant_name,",
            "M.branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "COUNT(1) AS vip_register_count,",
            "'" + occurred_at + "' as occurred_at",
            "FROM vip M",
            "INNER JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`branch_id`=N.`id` AND N.`is_deleted`=0",
            "WHERE M.is_deleted=0",
            "AND M.create_at >= '" + occurred_at + "' and",
            "M.create_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.branch_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzSaleVipDate.bulkCreate(data, {
                updateOnDuplicate: ["vip_register_count"],
                transaction: transaction
            });
        });
    }

    //储值条数和金额
    jzVipStoreDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' AS tenant_code,'tenant_name' AS tenant_name,",
            "M.store_branch_id AS branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "COUNT(IF(M.`store_type`=1,1,-1)) AS vip_store_count,",
            "IFNULL(SUM(IF(M.`store_type`=1,pay_amount,-pay_amount)),0) vip_store_amount,",
            "'" + occurred_at + "' as occurred_at",
            "FROM vip_store_history M",
            "INNER JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`store_branch_id`=N.`id` AND N.`is_deleted`=0",
            "WHERE M.is_deleted=0 AND M.`store_type` IN (1,2,5)",
            "AND M.create_at >= '" + occurred_at + "' and",
            "M.create_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.store_branch_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzSaleVipDate.bulkCreate(data, {
                // ignoreDuplicates: true
                updateOnDuplicate: ["vip_store_count", "vip_store_amount"],
                transaction: transaction
            });
        });
    }

    //消费条数和金额
    jzVipConsumeDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' AS tenant_code,'tenant_name' AS tenant_name,",
            "M.trade_branch_id AS branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "COUNT(IF(M.`trade_type`=1 OR M.`trade_type`=3,1,-1)) AS vip_consume_count,",
            "IFNULL(SUM(IF(M.`trade_type`=1 OR M.`trade_type`=3,pay_amount,-pay_amount)),0) vip_consume_amount,",
            "'" + occurred_at + "' as occurred_at",
            "FROM vip_trade_history M",
            "INNER JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`trade_branch_id`=N.`id` AND N.`is_deleted`=0",
            "WHERE M.is_deleted=0",
            "AND M.create_at >= '" + occurred_at + "' and",
            "M.create_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.trade_branch_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzSaleVipDate.bulkCreate(data, {
                updateOnDuplicate: ["vip_consume_count", "vip_consume_amount"],
                transaction: transaction
            });
        });
    }

    //结转支付方式
    jzPaymentDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' AS tenant_code,'tenant_name' AS tenant_name,",
            "M.branch_id AS branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "M.`payment_id`,M.`payment_code`,P.`payment_name`,",
            "COUNT(IF(M.`is_refund`=0,1,-1)) AS payment_trade_count,",
            "IFNULL(SUM(IF(M.`is_refund`=0,M.amount,-M.amount)),0) payment_trade_account,",
            "'" + occurred_at + "' as occurred_at",
            "FROM sale_payment M",
            "INNER JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`branch_id`=N.`id` AND N.`is_deleted`=0",
            "INNER JOIN payment P ON M.`tenant_id`=P.`tenant_id` AND M.`payment_id`=P.`id` AND P.`is_deleted`=0",
            "WHERE M.is_deleted=0",
            "AND M.last_update_at >= '" + occurred_at + "' and",
            "M.last_update_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.branch_id,payment_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzPaymentDate.bulkCreate(data, {
                updateOnDuplicate: ["payment_trade_count", "payment_trade_account"],
                transaction: transaction
            });
        });
    }

    //结转商品
    jzGoodsDate(occurred_at, schema, transaction) {
        let sql = [
            "SELECT M.tenant_id,'tenant_code' AS tenant_code,'tenant_name' AS tenant_name,",
            "M.branch_id AS branch_id,N.`code` AS branch_code,N.`name` AS branch_name,",
            "M.`goods_id`,G.`goods_code`,G.`goods_name`,G.`goods_unit_id`,G.`goods_unit_name`,G.`category_id` AS goods_category_id,G.`category_name` AS goods_category_name,",
            "COUNT(IF(M.`is_refund`=0,quantity,-quantity)) AS goods_trade_qty,",
            "IFNULL(SUM(IF(M.`is_refund`=0,M.received_amount,-M.received_amount)),0) goods_trade_amount,",
            "'" + occurred_at + "' as occurred_at",
            "FROM sale_detail M",
            "LEFT JOIN branch N ON M.`tenant_id`=N.`tenant_id` AND M.`branch_id`=N.`id` AND N.`is_deleted`=0",
            "LEFT JOIN goods G ON M.`tenant_id`=G.`tenant_id` AND M.`goods_id`=G.`id` AND G.`is_deleted`=0",
            "WHERE M.is_deleted=0",
            "AND M.last_update_at >= '" + occurred_at + "' and",
            "M.last_update_at < '" + moment(occurred_at).add(1, 'day').format("YYYY-MM-DD") + "'",
            "GROUP BY M.tenant_id,M.branch_id,goods_id;"
        ].join("\n");
        return schema.query(sql, {
            type: schema.QueryTypes.SELECT,
            raw: true,
        }).then(data => {
            return models.JzGoodsDate.bulkCreate(data, {
                updateOnDuplicate: ["goods_trade_qty", "goods_trade_amount"],
                transaction: transaction
            });
        });
    }

    jzStartDate(occurred_at, schema) {
        if (!moment(occurred_at, "YYYY-MM-DD").isValid()) {//传入参数必须YYYY-MM-DD
            return Promise.reject("无法结转,日期格式不正确:" + occurred_at + ",参数格式(YYYY-MM-DD)");
        }
        let that = this;
        return devopsdb.transaction(function (transaction) {
            return Promise.all([
                that.jzSaleDate(occurred_at, schema, transaction),
                that.jzVipRegisterDate(occurred_at, schema, transaction),
                that.jzVipStoreDate(occurred_at, schema, transaction),
                that.jzVipConsumeDate(occurred_at, schema, transaction),
                that.jzPaymentDate(occurred_at, schema, transaction),
                that.jzGoodsDate(occurred_at, schema, transaction),
            ])
        }).then(data => {
            return Promise.resolve("over");
        });
    }
}

module.exports = function (devops) {
    devops["SaleService"] = SaleService;
};