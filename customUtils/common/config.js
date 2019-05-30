export const SECRET = '';   // 万店掌开放平台对应商第三方的开发者Secret
// API 公共参数配置文件
export const CONFIG = {
    _aid: 'S107',                                // 开放平台系统编号
    _akey: 'S107-00000095',                      // 万店掌开放平台分配给第三方的开发者key
    _mt: 'open.face.passengerflow.getShopDailyPassengers',                                  // 接口名称
    _sm: 'md5',                                  // 签名算法 md5,sha1
    _requestMode: 'post',                         // 请求方式post,get
    _version: 'v2',                              // 版本号
    _timestamp: new Date().format('yyyyMMddhhmmss')
    // _sig: ''                                  // 签名token
};