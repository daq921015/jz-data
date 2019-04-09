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
        return Promise.if(/^[0-9].+/.test(form_fields["login_name"]), function () {
            // 线上用户
            if (!/\d/.test(form_fields["login_name"])) {
                return Promise.reject("只有纯数字的管理员账号可以登陆，其它员工禁止登陆");
            }
            return Sequelize.getBusinessTableModel(1, "z0", "s_user").then(model => {
                return model.findOne({
                    where: {
                        is_deleted: 0,
                        login_name: form_fields["login_name"],
                        login_pass: devops.CryptoJS.MD5(form_fields["login_pwd"].toString()).toString(),
                    }
                })
            }).then(online_user => {
                if (!online_user) {
                    return Promise.reject("用户名或密码错误");
                }
                return models.PUser.findOne({//查找是否已在本地创建用户
                    where: {
                        login_name: form_fields["login_name"]
                    }
                }).then(user => {
                    if (!user) {//本地没有,创建用户
                        let c_user;
                        return models.PUser.create({
                            login_name: online_user.get("login_name"),
                            login_pwd: "nopasswd",
                            user_name: online_user.get("login_name"),
                            is_product: 1,
                            tenant_id: online_user.get("tenant_id")
                        }).then(create_user => {
                            c_user = create_user;
                            // 设置线上用户默认权限
                            return models.PUserRoleR.create({
                                user_id: create_user.get("id"),
                                role_id: 21 //线上用户默认角色
                            });
                        }).then(data => {
                            return c_user;
                        });
                    }
                    if (user.get("status") !== 0) {
                        return Promise.reject("该用户已禁止使用，请联系管理员");
                    }
                    return user;
                });
            })
        }, function () {
            // 本地用户
            return models.PUser.findByUserAndPassword(form_fields).then(user => {
                if (!user) {
                    return Promise.reject("用户名或密码错误")
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
            })
        }).then(user => {
            //登录成功设置用户信息到session
            user["user_id"] = user["id"];
            req.session.user = user;
            req.session.islogin = true;
            console.log(req.session.user.tenant_id);
            return Promise.resolve(user);
        })
    }
}

module.exports = function (devops) {
    devops["PublicService"] = PublicService;
};