let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;
class PublicService {
    constructor() {
    }

    login(req) {
        let form_fields = req.form_fields;
        if (_.size(form_fields) !== 2) {
            return Promise.reject("用户名和密码不能为空");
        }
        return models.PUser.findByUserAndPassword(form_fields).then(user => {
            if (!user) {
                return Promise.reject("用户名或密码不正确");
            } else {
                if (user.get("status") !== 0) {
                    return Promise.reject("该用户已禁止使用，请联系管理员");
                }
                //更新最后一次登录信息
                user["last_login_ip"] = req.ip;
                user["last_login_time"] = new Date();
                user.increment('login_count');
                return user.save();
            }
        }).then(user => {
            //登录成功设置用户信息到session
            user["user_id"] = user["id"];
            req.session.user = user;
            req.session.islogin = true;
            return Promise.resolve(user);
        })
    }
}
module.exports = function (devops) {
    devops["PublicService"] = PublicService;
};