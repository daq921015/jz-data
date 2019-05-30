
import { CONFIG, SECRET } from './config';
// 导入外部模块并立即执行
import '../common/js/md5';
import '../common/js/date';

/**
 * 扩展网关接口公共参数
 * @param methodName  接口名称
 * @param params      参数对象
 * @param requestMode 传递方式，默认get
 * @returns {*}
 */
export function paramsExtend({methodName, params = {}, requestMode = 'get'}) {
    let extendParams = {
        _mt: methodName,
        _timestamp: new Date().format('yyyyMMddhhmmss'),
        _requestMode: requestMode
    };
    let ret = Object.assign({}, CONFIG, extendParams, params);
    let _sig = (secret => {
        let signValue = '',
            paramKeyArr = [],
            keyArr = Object.keys(ret).sort();
        keyArr.forEach(item => {
            signValue += item + ret[item]
        });
        signValue = `${secret}${signValue}${secret}`;
        signValue = $.md5(signValue).toUpperCase();
        return signValue;
    })(SECRET);
    ret._sig = _sig;
    return ret;
}