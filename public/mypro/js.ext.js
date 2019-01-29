// 扩展bootbox
let customIconDialogModal = function (options, type) {
    let obj = typeof options == "object" ? options : {message: options};
    let fontClass = "";
    if (!_.has(obj, "buttons")) {
        obj["buttons"] = {ok: {label: "确定"}}
    }
    switch (type) {//弹窗标题与字体颜色
        case 'info':
            if (!_.has(obj, "title")) obj["title"] = "信息";
            fontClass = "text-info";
            break;
        case 'warning':
            if (!_.has(obj, "title")) obj["title"] = "警告";
            fontClass = "text-warning";
            break;
        case 'error':
            if (!_.has(obj, "title")) obj["title"] = "错误";
            fontClass = "text-danger";
            break;
        case 'success':
            if (!_.has(obj, "title")) obj["title"] = "成功";
            fontClass = "text-success";
            break;
        default:
            obj["title"] = "未知弹窗标题";
            break;
    }
    obj.message = '<div style="line-height: 32px;" class="' + fontClass + '"><i class="lbl-icon ' + type + '"></i>' + obj.message + '</div>';
    return bootbox.dialog(obj);
};
bootbox.info = function (options) {
    return customIconDialogModal(options, 'info');
};
bootbox.warning = function (options) {
    return customIconDialogModal(options, 'warning');
};
bootbox.error = function (options) {
    return customIconDialogModal(options, 'error');
};
bootbox.success = function (options) {
    return customIconDialogModal(options, 'success');
};
(function ($) {
    //重写分页插件，构建列表单个元素方法，首页、尾页等不消失，而是禁用
    $.extend($.fn.bootstrapPaginator.Constructor.prototype, {
        buildPageItem: function (type, page) {
            let itemContainer = $("<li></li>"),//creates the item container
                itemContent = $("<a></a>"),//creates the item content
                text = "",
                title = "",
                itemContainerClass = this.options.itemContainerClass(type, page, this.currentPage),
                itemContentClass = this.getValueFromOption(this.options.itemContentClass, type, page, this.currentPage),
                tooltipOpts = null;

            let disabled = false;
            switch (type) {

                case "first":
                    if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) {
                        disabled = true;
                    }
                    text = this.options.itemTexts(type, page, this.currentPage);
                    title = this.options.tooltipTitles(type, page, this.currentPage);
                    break;
                case "last":
                    if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) {
                        disabled = true;
                    }
                    text = this.options.itemTexts(type, page, this.currentPage);
                    title = this.options.tooltipTitles(type, page, this.currentPage);
                    break;
                case "prev":
                    if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) {
                        disabled = true;
                    }
                    text = this.options.itemTexts(type, page, this.currentPage);
                    title = this.options.tooltipTitles(type, page, this.currentPage);
                    break;
                case "next":
                    if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) {
                        disabled = true;
                    }
                    text = this.options.itemTexts(type, page, this.currentPage);
                    title = this.options.tooltipTitles(type, page, this.currentPage);
                    break;
                case "page":
                    if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) {
                        return;
                    }
                    text = this.options.itemTexts(type, page, this.currentPage);
                    title = this.options.tooltipTitles(type, page, this.currentPage);
                    itemContent.width(55);
                    break;
            }
            itemContainer.addClass(disabled ? "disabled" : itemContainerClass).append(itemContent);
            this.currentPage != page && itemContent.addClass("cursor");
            itemContent.addClass(itemContentClass).html(text);
            !disabled && itemContent.on("click", null, {type: type, page: page}, $.proxy(this.onPageItemClicked, this));

            if (this.options.pageUrl) {
                itemContent.attr("href", this.getValueFromOption(this.options.pageUrl, type, page, this.currentPage));
            }

            if (this.options.useBootstrapTooltip) {
                tooltipOpts = $.extend({}, this.options.bootstrapTooltipOptions, {title: title});

                itemContent.tooltip(tooltipOpts);
            } else {
                itemContent.attr("title", title);
            }
            return itemContainer;
        }
    });
    $.extend($.fn.bootstrapPaginator.defaults, {
        bootstrapMajorVersion: 3,//如果是bootstrap3版本需要加此标识，并且设置包含分页内容的DOM元素为UL,如果是bootstrap2版本，则DOM包含元素是DIV
        itemTexts: function (type, page, current) {//文字翻译
            switch (type) {
                case "first":
                    return "首页";
                case "prev":
                    return "上一页";
                case "next":
                    return "下一页";
                case "last":
                    return "尾页";
                case "page":
                    return page;
            }
        },
    });
})($);