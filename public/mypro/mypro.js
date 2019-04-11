$(function () {
    //框架全局参数
    let global_options = {
        mobile_width: 768
    };
    ajaxSetup();
    initSiderBar(global_options);
    initNavBar(global_options);
    initContent(global_options);
    triggerFixTable();
    windowResize();
    initKeyBoardEvent();
    initMobileBootStrapTableChines();
});
//ajax全局变量设置
let ajaxSetup = function () {
    $.ajaxSetup({
        cache: false,
        traditional: true //解决数组参数问题
    });
};
//菜单栏初始化
let initSiderBar = function (global_options) {
    let $body = $("body");
    let mobile_width = global_options["mobile_width"];
    //菜单栏，菜单折叠与展开
    $body.on("click", ".lbl-sidebar .main-menu>.father,.lbl-sidebar .main-menu>.child", function () {
        let $that = $(this);
        let $father_open = $(".lbl-sidebar .father>.fa-angle-down");
        let closed = $that.find(".icon").hasClass("fa-angle-right");//之前是关闭状态
        $father_open.removeClass("fa-angle-down").addClass("fa-angle-right");
        $father_open.parent().next("div.sub-menu").slideUp(100);
        if (closed) {
            $that.find(".icon").removeClass("fa-angle-right").addClass("fa-angle-down");
            $that.next("div.sub-menu").slideDown(100);
        }
    });
    //菜单栏 子菜单点击，激活并加载工作区域
    $body.on("click", ".lbl-sidebar .child", function () {
        $(".lbl-sidebar .child.active").removeClass("active");
        $(this).addClass("active");
        let url = $(this).data("url");
        let privilege_id = $(this).data("privilegeId");
        $("title").html($(this).text() || "报表管理系统");
        loadPage(".lbl-content", url, {privilege_id: privilege_id});
    });
    //菜单栏，mini/open/off显示状态切换
    $body.on("click", ".lbl-navbar .button.fa-bars", function () {
        let $sideBar = $(".lbl-sidebar");
        if ($sideBar.hasClass("open")) {
            if ($(window).width() > mobile_width) {
                $sideBar.removeClass("open").addClass("mini");
            } else {
                $sideBar.removeClass("open").addClass("off");
            }
        } else if ($sideBar.hasClass("mini")) {
            $sideBar.removeClass("mini").addClass("open");
        } else if ($sideBar.hasClass("off")) {
            $sideBar.removeClass("off").addClass("open");
        }
    });
    //菜单栏 mini鼠标悬浮提示框
    let $div = $("<div class='bubble'><div>");
    $body.on({
        "mouseenter": function (e) {
            let $that = $(this);
            let title = $that.find(".title").text();
            let _top = $that.offset().top;
            if (title) {
                $div.text(title);
                $div.css("top", _top + "px");
                $(".lbl-sidebar").append($div);
            }
        },
        "mouseleave": function (e) {
            $div.remove();
        }
    }, ".lbl-sidebar.mini .father,.lbl-sidebar.mini .child");
};
//导航栏初始化
let initNavBar = function (global_options) {
    //导航栏按钮弹出框
    let $btns = $(".lbl-navbar .button[data-box*='#']");
    $btns.each(function () {
        let $btn = $(this);
        let box_id = $btn.data("box");
        let $box = $(box_id);
        if ($box.length > 0) {
            //设置box位置样式
            let box_top = $btn.offset().top + $btn.height();
            let box_right = $(window).width() - $btn.offset().left - $btn.outerWidth();
            $box.css("top", box_top + "px");
            $box.css("max-width", ($(window).width() - box_right) + "px");
            $box.css("right", box_right + "px");
            // 点击按钮切换box显示与隐藏
            $btn.click(function () {
                $box.toggle();
            });
            //点击其它正文区域隐藏box
            $(".lbl-content").on("click", function (e) {
                $box.hide();
            });
            //点击box中的按钮,a标签隐藏
            $box.find("botton,a,input[type='button']").click(function (e) {
                $box.hide();
            });
        }
    });
};
//工作区域初始化
let initContent = function (global_options) {
    //折叠菜单栏
    let $body = $("body");
    let width;
    $body.on("click", ".lbl-content>.sidebar>.pointer", function () {
        let $sideBar = $(".lbl-content>.sidebar");
        if ($sideBar.hasClass("open")) {
            $sideBar.removeClass("open").addClass("off");
            width = $sideBar.inlineStyle("width");//保留内联宽度
            width && $sideBar.css("width", 0);
        } else if ($sideBar.hasClass("off")) {
            $sideBar.removeClass("off").addClass("open");
            width && $sideBar.css("width", width);
        }
    });
    //菜单点击，激活与请求
    $body.on("click", ".lbl-content>.sidebar .body>.menu>li", function () {
        let url = $(this).data("url");
        $(this).siblings().removeClass('active').end().addClass("active");
        let privilege_id = $(this).data("privilegeId");
        if (url && url !== "#") {
            loadPage(".lbl-content>.main", url, {privilege_id: privilege_id});
        }
    });
};
//加载工作区域内容
let loadPage = function (selector, url, options, callback) {
    let $lbl_content = $(selector);
    $lbl_content.empty();//为了出现刷新一闪的效果
    $lbl_content.load(url, options, function () {
        if (typeof callback === "function") {
            callback();
        }
    });
};
//修复表格高度、header、footer
let fixTable = function () {
    //修复table前先修复主区域
    let $table_parents = $("body").find("div.bootstrap-table");
    $table_parents.each(function () {
        let $table_parent = $(this);
        //弹出框内的表格不修复
        if ($table_parent.parents(".modal").length > 0) {
            return false;
        }
        let $table = $table_parent.find(".fixed-table-body>table");
        let table_height = $(window).height() - $table_parent.offset().top;
        $table.bootstrapTable("resetView", {
            height: table_height > 350 ? table_height : 350
        });
        $table.bootstrapTable("resetWidth");
    });
};
//transition完成修复表格
let triggerFixTable = function () {
    let $body = $("body");
    //一级左侧边栏隐藏与显示
    $body.on("transitionend", ".lbl-sidebar", function () {
        fixTable();
    });
    //二级左侧边栏隐藏与显示
    $body.on("transitionend", ".lbl-content>.sidebar", function () {
        fixTable();
    });
};
//浏览器窗口调整
let windowResize = function () {
    $(window).resize(function () {
        fixTable();
    });
};
//初始化键盘事件
let initKeyBoardEvent = function () {
    $(document).keyup(function (event) {
        //回车键
        if (event.keyCode === 13) {
            let $buttons = $("button.search");
            $buttons.each(function () {
                !$(this).is(":hidden") && $(this).click();
            });
        }
    });
};
//更改手机表格显示文字，减少横向空间占用
let initMobileBootStrapTableChines = function () {
    if ($(window).width() < 768) {
        (function ($) {
            'use strict';
            $.fn.bootstrapTable.locales['zh-CN'] = {
                formatShowingRows: function (pageFrom, pageTo, totalRows) {
                    return '第' + pageFrom + '~' + pageTo + '条，共' + totalRows + '条';
                }
            };
            $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);
        })(jQuery);
    }
};