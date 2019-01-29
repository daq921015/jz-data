let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
class HomeService {
    constructor() {
    }

    getSiderBar(req) {
        return Promise.all([
            devops.PrivilegeService.getUserMainSiderBar(req),
            devops.PrivilegeService.getUserSubSiderBar(req)
        ]).then(data => {
            let menu = {};
            let sub_menu = _.groupBy(data[1], "parent_id");
            for (let i = 0, j = data[0].length; i < j; i++) {
                menu[data[0][i]["id"]] = data[0][i];
            }
            return Promise.resolve([menu, sub_menu]);
        });
    }
}

module.exports = function (devops) {
    devops["HomeService"] = HomeService;
};