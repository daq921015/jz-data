/*
 * 定时service
 * */
let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let logError = devops.publicmethod.logError;
let logInfo = devops.publicmethod.logInfo;
let Sequelize = devops.Sequelize;
let schedule = devops.schedule;
let models = devopsdb.models;
let moment = devops.moment;
let ElasticsearchUtils = devops.ElasticsearchUtils;
let Za1JzDate = function () {
    /*
    * 按天结转za1区
    * */
    let saleService = new devops.SaleService();
    let schema, occurred_at;
    Sequelize.getSchema(1, "za1-rest-db").then(data => {
        schema = data;
        return models.JzResult.findOne({
            where: {
                jz_status: 0,
                occurred_at: {$lt: moment().format("YYYY-MM-DD")}
            },
            raw: true,
            order: [["occurred_at", "desc"]]
        })
    }).then(data => {//开始结转
        if (data == null || typeof data == "undefined") {
            return Promise.reject("没有找到结转日期");
        }
        occurred_at = data["occurred_at"];
        return saleService.jzStartDate(occurred_at, schema)
    }).then(data => {//标记日期为结转成功
        return devopsdb.query("update jz_result set jz_status=1,jz_times=jz_times+1 where occurred_at=?", {
            type: Sequelize.QueryTypes.UPDATE,
            replacements: [occurred_at],
        });
    }).then(data => {
        logInfo(occurred_at + ":数据结转成功");
    }).catch(err => {
        logError(err, occurred_at + ":数据结转失败");
    });
};
module.exports = function (devops) {
    // let a = schedule.scheduleJob('1 */30 * * * *', function () {
    //     Za1JzDate();
    // });
};