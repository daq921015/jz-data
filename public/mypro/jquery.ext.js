/**
 * Created by Administrator on 2017-12-13.
 */
(function ($) {
    //禁用按钮状态
    let closeButton = function () {
        let $that = $(this);
        $that.addClass("disabled");
        $that.attr('disabled', true);
    };
    let openButton = function () {
        let $that = $(this);
        $that.removeClass("disabled");
        $that.attr('disabled', false);
    };
    //获取内联style样式
    let inlineStyle = function (property) {
        let styles = $(this).attr("style");
        let _style = {};
        if (styles) {
            let style_arr = styles.split(";");
            for (let i = 0, j = style_arr.length; i < j; i++) {
                let _sty = style_arr[i].split(":");
                if (_sty.length !== 2) {
                    continue;
                }
                _style[_sty[0].trim()] = _sty[1].trim();
            }
        }
        if (typeof property === "string") {
            if (_style.hasOwnProperty(property)) {
                return _style[property];
            }
            return false;
        }
        return _style;
    };
    //序列化表单
    let serializeForm = function () {
        let $that = $(this);
        let req_data = {};
        let data_array = $that.serializeArray();
        for (let i = 0, j = data_array.length; i < j; i++) {
            req_data[data_array[i]["name"]] = data_array[i]["value"];
        }
        return req_data;
    };
    // 自动填充表单扩展
    let autoFillForm = function (json) {
        /*
         * name填充表单
         * */
        if (typeof json === "string") {
            json = $.parseJSON(json);
        }
        let $form = $(this);
        for (let key in json) {
            $form.find("[name='" + key + "']").val(json[key]);
        }
    };
    //ajax提交封装
    let ajaxForm = function (options, ajaxoption) {
        /*
         * url:远程提交地址
         * data:自定义的提交参数(不在提交form中)（json）
         * method:get或post(默认get)
         * success:返回成功回调
         * error:返回错误回调
         * complete:执行完成回调
         * isFile:false(是否有文件上传)(如果为true,则method为post)
         * beforeSend:function
         * complete:function
         * error:function
         * dataFilter:function
         * btn:提交按钮（防止重复点击）
         * isJson:true  返回结果是否转成json,默认为true
         * */
        if (!_.has(options, "isJson")) {
            options["isJson"] = true;
        }
        if (!_.has(options, "url")) {
            tipbox.warning("ajax提交必须指定URL");
            return false;
        }
        if (!_.has(options, "method")) {
            options["method"] = "get";
        }
        if (!_.has(options, "isFile")) {
            options["isFile"] = false;
        } else if (options["isFile"]) {
            options["method"] = "post";
        }
        let req_data;
        //确认不是$构造调用
        if (this !== $) {
            let $form = $(this);
            //获取form数据以及自定义数据
            if (options["isFile"]) {
                req_data = new FormData($form[0]);
                for (let key in options["data"]) {
                    req_data.append(key, options["data"][key]);
                }
                req_data.append("isJson", options["isJson"]);
            } else {
                req_data = $form.serializeForm();
                $.extend(req_data, options["data"] || {});
                req_data["isJson"] = options["isJson"];
            }
        } else {
            req_data = _.has(options, "data") ? options["data"] : {};
            req_data["isJson"] = options["isJson"];
        }
        _.has(options, "btn") && $(options["btn"]).closeButton();//防止重复提交
        let ajax = {
            url: options["url"],
            type: options["method"],
            async: true,
            cache: false,
            data: req_data,
            contentType: options["isFile"] ? false : "application/x-www-form-urlencoded",
            processData: !options["isFile"],
            beforeSend: function (XMLHttpRequest) {
                if (_.has(options, "beforeSend")) {
                    return options["beforeSend"](XMLHttpRequest);
                } else {
                    return true
                }
            },
            complete: function (XMLHttpRequest, textStatus) {
                _.has(options, "btn") && $(options["btn"]).openButton();
                if (_.has(options, "complete")) {
                    options["complete"](XMLHttpRequest, textStatus);
                }
            },
            success: function (data, textStatus) {
                if (textStatus !== "success") {
                    tipbox.error("ajax提交数据，返回状态错误");
                    return false;
                }
                if (options["isJson"]) {//需要的是json
                    if (typeof data === "string") {
                        try {
                            data = $.parseJSON(data);
                        } catch (e) {
                            tipbox.warning("服务端返回数据无法转换成对象类型");
                            return false;
                        }
                    }
                    if (!_.has(data, "status") || !_.has(data, "msg") || !_.has(data, "data")) {
                        tipbox.warning("ajax提交数据，返回数据格式错误");
                        return false;
                    }
                    if (data["status"] == "sessionTimeOut") {
                        bootbox.alert({
                            title: "提示",
                            message: "当前回话超时，请重新<a href='/public/login' target='_blank'><span style='color:red'>登录</span></a>"
                        });
                        return false;
                    }
                    if (data["status"] !== "success") {
                        tipbox.error(data["msg"]);
                        return false;
                    }
                    data = data["data"];
                }
                if (_.has(options, "success")) {
                    //成功回调 返回结果以及请求参数
                    options["success"](data, req_data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                bootbox.alert({title: "错误", message: XMLHttpRequest["responseText"]});
                if (_.has(options, "error")) {
                    options["error"](XMLHttpRequest, textStatus, errorThrown);
                }
            },
            dataFilter: function (data, type) {
                if (_.has(options, "dataFilter")) {
                    options["dataFilter"](data, type);
                } else {
                    return data;
                }
            },
        };
        _.extend(ajax, ajaxoption);
        $.ajax(ajax);
    };
    //弹出右键菜单
    let contextMenu = function (_options) {
        let $that = $(this);
        let defaultOptions = {event: null, onClick: null};
        let options = $.extend(defaultOptions, _options);
        $that.focus();
        let _smallMenu = {
            popupSmallMenu: function () {
                this._bindClick();
                this._bindMenuEvent();
                this._showMenu();
                return $that;
            },
            _bindClick: function () {
                $that.find('li').each(function (index, obj) {
                    let $li = $(obj);
                    let operator = $li.attr('class');
                    $li.on('click', function (event) {
                        event.stopPropagation();
                        //选中操作后隐藏弹窗并解绑所有点击事件
                        $that.hide().find('li').each(function (index, obj) {
                            $(obj).unbind();
                        });
                        //回调上下文菜单li对象以及操作内容
                        typeof options.onClick === 'function' && options.onClick($(this), operator);
                    });
                });
            },
            _bindMenuEvent: function () {
                $that.hover(function () {
                }, function () {
                    $that.hide().find('li').each(function (index, obj) {
                        $(obj).unbind();
                    });
                });
            },
            _showMenu: function () {
                if (!options.event) {
                    alert('请传入鼠标事件');
                }
                $that.css({
                    top: options.event.clientY + "px",
                    left: options.event.clientX + "px",
                    display: "block"
                });
            }
        };
        return _smallMenu.popupSmallMenu();
    };
    //获取文本框选中内容
    let getSelectText = function () {
        let text_dom = $(this)[0];
        if (document.selection) //IE
        {
            return [document.selection.createRange().text, document.selectionStart, document.selectionStart];
        }
        else {
            return [text_dom.value.substring(text_dom.selectionStart,
                text_dom.selectionEnd), text_dom.selectionStart, text_dom.selectionEnd];
        }
    };
    //设置文本框字体选中
    let setSelectText = function (start, end) {
        let text_dom = $(this)[0];
        if (text_dom.setSelectionRange) {
            text_dom.setSelectionRange(start, end);
        }
        else if (text_dom.createTextRange) //IE
        {
            let range = text_dom.createTextRange();
            range.collapse(true);
            range.moveStart('character', start);
            range.moveEnd('character', end - start - 1);
            range.select();
        }
        text_dom.focus();
    };
    $.extend({
        ajaxForm: ajaxForm,
    });
    $.fn.extend({
        autoFillForm: autoFillForm,
        ajaxForm: ajaxForm,
        closeButton: closeButton,
        openButton: openButton,
        serializeForm: serializeForm,
        inlineStyle: inlineStyle,
        contextMenu: contextMenu,
        getSelectText: getSelectText,
        setSelectText: setSelectText
    });
})(jQuery);
