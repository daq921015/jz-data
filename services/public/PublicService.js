let _ = devops.underscore._;
let devopsdb = devops.Sequelize.schema.devopsdb;
let Sequelize = devops.Sequelize;
let models = devopsdb.models;

class PublicService {
    constructor() {
    }

    login(req) {
        if (req.session.islogin) {
            return Promise.resolve("用户已登录");
        }
        let form_fields = req.form_fields;
        let product_user = form_fields["product_user"];
        delete form_fields["product_user"];
        if (_.size(form_fields) !== 2) {
            return Promise.reject("用户名和密码不能为空");
        }
        return Promise.if(product_user == "1", function () {
            // 线上用户
            // if (!/\d+/.test(form_fields["login_name"])) {
            //     return Promise.reject("只有纯数字的管理员账号可以登陆，其它员工禁止登陆");
            // }
            let online_user;
            return Promise.all([
                Sequelize.getBusinessTableModel(1, "z0", "s_user"),
                Sequelize.getBusinessTableModel(1, "z0", "tenant"),
            ]).then(models => {
                let SUser = models[0];
                let Tenant = models[1];
                return SUser.findOne({
                    include: {
                        model: Tenant,
                        where: {
                            is_deleted: 0
                        }
                    },
                    where: {
                        is_deleted: 0,
                        login_name: form_fields["login_name"],
                        login_pass: devops.CryptoJS.MD5(form_fields["login_pwd"].toString()).toString(),
                    }
                })
            }).then(data => {
                if (!data) {
                    return Promise.reject("用户名或密码错误");
                }
                online_user = data;
                let partition_code = online_user.get("Tenant").get("partition_code");
                let tenant_id = online_user.get("tenant_id");
                let branch_id;
                let branch_name;
                let commercial_type;
                if (!_.contains(["za1", "zd1"], partition_code)) {
                    return Promise.reject("该分区用户，不允许登录");
                }
                return Promise.all([
                    Sequelize.getBusinessTableModel(1, partition_code, "employee"),
                    Sequelize.getBusinessTableModel(1, partition_code, "branch"),
                ]).then(data => {
                    let Employee = data[0], Branch = data[1];
                    return Employee.findOneCustom({
                        tenant_id: tenant_id,
                        login_name: form_fields["login_name"],
                        is_deleted: 0,
                        custom_options: {
                            include: {
                                model: Branch,
                                required: true,
                                attributes: ["branch_name", "commercial_type"]
                            }
                        }
                    })
                }).then(data => {
                    if (!data) {
                        return Promise.reject("没有找到登录员工信息")
                    }
                    branch_id = data.get("branch_id");
                    branch_name = data.get("Branch").get("branch_name");
                    commercial_type = data.get("Branch").get("commercial_type");

                    return models.PUser.findOne({//查找是否已在本地创建用户
                        where: {
                            login_name: form_fields["login_name"]
                        }
                    })
                }).then(user => {
                    if (!user) {//本地没有,创建用户
                        let c_user;
                        return models.PUser.create({
                            login_name: online_user.get("login_name"),
                            login_pwd: "nopasswd",
                            user_name: branch_name,
                            is_product: 1,
                            tenant_id: online_user.get("tenant_id"),
                            tenant_name: online_user.get("Tenant").get("tenant_name"),
                            branch_id: branch_id,
                            branch_name: branch_name,
                            commercial_type: commercial_type,
                            partition_code: online_user.get("Tenant").get("partition_code"),
                            last_login_ip: req.ip,
                            last_login_time: new Date(),
                            login_count: 1,
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
                    user["last_login_ip"] = req.ip;
                    user["last_login_time"] = new Date();
                    user.increment('login_count');
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
            return Promise.resolve(user);
        })
    }
}

module.exports = function (devops) {
    devops["PublicService"] = PublicService;
};