let CryptoJS = require("crypto-js");
let request_promise = require("request-promise");
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
let _getRequestParams = function (time) {
    let secret = "a769d6bceb7db943ae58b28ae4637ad0";
    let config = {
        "_aid": "S107",
        "_akey": "S107-00000095",
        "_mt": "open.face.passengerflow.getShopDailyPassengers",
        "_sm": "md5",
        "_requestMode": "post",
        "_version": "v2",
        "_timestamp": "20190530084414",
        "orgid": "159",
        "depId": "43266",
        "time": time
    };
    let signValue = '', keyArr = Object.keys(config).sort();
    keyArr.forEach(item => {
        signValue += item + config[item]
    });
    signValue = secret + signValue + secret;
    config["_sig"] = CryptoJS.MD5(signValue).toString().toUpperCase();
    return config;
};
let data = _getRequestParams("2019-05-29");
let headers = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
};
return request_promise({
    url: "http://openapi.ovopark.com/m.api",
    method: "POST",
    headers: headers,
    form: data
}).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});