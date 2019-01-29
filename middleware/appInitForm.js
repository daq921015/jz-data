/*
 * 封装请求参数到req
 * time:2017-11-23
 * */
let filterFields = function (fields) {
    for (let field_name in fields || {}) {
        try {//所有的参数 对象解析一下
            if (isNaN(fields[field_name])) {//数字字符串不解析，长度太多parse会有问题。
                fields[field_name] = JSON.parse(fields[field_name]);
            }
        } catch (e) {
        } finally {
            if (typeof fields[field_name] === "string") {//去除两侧空格
                fields[field_name] = fields[field_name].trim();
            }
            //删除为空或null的参数
            if (fields[field_name] === "" || fields[field_name] === null) {
                delete fields[field_name];
            }
            //为了防止数据库number类型，字符串无法插入，所有数字参数全部转换成number
            //字符数不能超过10个，超过10个的数字字符转换成字符的时候可能有问题（超出数字最大长度）
            if (typeof fields[field_name] === "string") {
                if (fields[field_name].length > 10) {
                    continue;
                } else {
                    //是数字字符并且不以0开头（0除外）
                    if (!isNaN(fields[field_name]) && (fields[field_name] === "0" || !fields[field_name].startsWith("0"))) {
                        fields[field_name] = Number(fields[field_name]);
                    }
                }
            }
        }
    }
    return fields;
};
module.exports = function (req, res, next) {
    if (req.method.toLowerCase() === "get") {
        req.form_fields = filterFields(req.query);
        req.form_files = {};
        next();
    } else if (req.method.toLowerCase() === "post") {
        if (/multipart\/form-data/.test(req.get('Content-Type'))) {
            //表单提交并且content-type  multipart/form-data
            const form = devops.formidable.IncomingForm();
            const _ = devops.underscore._;
            const path = devops.path;
            _.extend(form, {
                encoding: 'utf-8',
                uploadDir: path.join(__dirname, "..", "upload"),
                keepExtensions: true,
                maxFieldsSize: 2 * 1024 * 1024,//上传文件大小
                maxFields: 100,
                hash: false,
                multiples: true,
            });
            //更改上传文件存储路径名称
            form.on('fileBegin', function (name, file) {
                file.path = path.join(__dirname, "..", "upload", file.name);
            });
            form.on('error', function (err) {
                next(err);
            });
            form.on('aborted', function (msg) {
                next(msg);
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    req.form_fields = filterFields(fields);
                    let _files = {};
                    for (let key in files) {
                        _files[key] = files[key]["path"];
                        _files["type"] = files[key]["type"];
                    }
                    req.form_files = _files;
                    next();
                }
            });
        } else {
            req.form_fields = filterFields(req.body);
            req.form_files = {};
            next();
        }
    } else {
        next();
    }
};