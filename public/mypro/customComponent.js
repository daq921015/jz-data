$(function () {
    initModal();
});
//ztree树添加、修改和删除
let initZtree = function ($tree, options) {
    let tree_options = {
        add: {},
        del: {},
        edit: {},
        click: {}
    };
    _.extend(tree_options, options || {});
    let getSelectNodeIds = function (node) {
        /*
         * 获取选中节点及其所有子节点id
         * */
        let ids = [];
        //递归获取当前节点及其所有子节点id
        (function (node) {
            ids.push(node["id"]);//寄存当前节点id
            if (node.isParent) {
                let childrens = node.children;
                for (let i = 0, j = childrens.length; i < j; i++) {
                    arguments.callee(childrens[i]);
                }
            } else {
                return false;
            }
        })(node);
        return ids;
    };
    let treeAdd = function (tree_obj, $btn, node) {
        if (node) {
            let parent_id = node["id"];
            let parent_level = node["level"];
            let parent_name = node["name"];
            let add_form = $btn.data("form");
            let url = $btn.data("url");
            if (typeof add_form !== "undefined" && typeof url !== "undefined") {
                tipbox.dialog({
                    title: _.has(tree_options.add, "title") ? tree_options.add.title : "添加子节点",
                    btn_concel: "取消",
                    btn_ok: "保存",
                    body_content: $(add_form),
                    show: function ($modal) {
                        let $form = $modal.find("form");
                        if ($form.length > 0) {
                            $form[0].reset();
                        }
                        $form.autoFillForm({
                            parent_id: parent_id,
                            parent_level: parent_level,
                            parent_name: parent_name
                        });
                    },
                    submit: function ($btn_ok, $modal) {
                        let $form = $modal.find("form");
                        $form.ajaxForm({
                            url: url,
                            method: "post",
                            success: function (data) {
                                tree_obj.addNodes(node, data["data"]);
                                tipbox.ainfo(data["msg"]);
                                $modal.modal("hide");
                            },
                            btn: $btn_ok
                        });
                    }
                });
            } else {
                tipbox.warning("没有找到添加子节点对应的form或提交url")
            }
        }
    };
    let treeEdit = function (tree_obj, $btn, node) {
        if (node) {
            let add_form = $btn.data("form");
            let url = $btn.data("url");
            if (typeof add_form !== "undefined" && typeof url !== "undefined") {
                $(add_form).show();
                tipbox.dialog({
                    title: _.has(tree_options.edit, "title") ? tree_options.edit.title : "修改选中节点",
                    btn_concel: "取消",
                    btn_ok: "保存",
                    body_content: $(add_form),
                    show: function ($modal) {
                        let $form = $modal.find("form");
                        $form[0].reset();
                        $form.autoFillForm(node);
                    },
                    submit: function ($btn_ok, $modal) {
                        let $form = $modal.find("form");
                        $form.ajaxForm({
                            url: url,
                            method: "post",
                            success: function (data) {
                                _.extend(node, data["data"]);
                                tree_obj.updateNode(node);
                                tipbox.ainfo(data["msg"]);
                                $modal.modal("hide");
                            },
                            btn: $btn_ok
                        });
                    }
                });
            } else {
                tipbox.warning("没有找到修改选中节点对应的form或提交url")
            }
        }
    };
    let treeDel = function (tree_obj, $btn, node) {
        if (node) {
            if (node["level"] === 0) {
                tipbox.error({
                    body_content: "根节点不允许被删除！"
                });
                return;
            }
            let ids = getSelectNodeIds(node);
            let url = $btn.data("url");
            if (typeof url !== "undefined") {
                tipbox.info({
                    body_content: _.has(tree_options.del, "title") ? tree_options.del.title : "确认要删除选中节点以及所有子节点？",
                    submit: function ($btn_ok, $modal) {
                        $.ajaxForm({
                            url: url,
                            method: "post",
                            data: {
                                ids: JSON.stringify(ids)
                            },
                            success: function (data) {
                                tree_obj.removeNode(node);
                                tipbox.ainfo(data);
                                $modal.modal("hide");
                            },
                            btn: $btn_ok
                        });
                    }
                });
            } else {
                tipbox.warning("没有找到删除节点对应的提交url")
            }
        }
    };
    let beforClickExec = function ($button, button_type, node, tree_obj) {
        if (_.has(tree_options, button_type)) {
            if (typeof tree_options[button_type]["before"] === "function") {
                if (!tree_options[button_type]["before"]($button, node, tree_obj)) {
                    return false;
                }
            }
        }
        return true;
    };
    let hiddenNodes = []; //用于存储被隐藏的结点
    let filter = function (filter_val) {
        treeObj.showNodes(hiddenNodes);//显示上次搜索后背隐藏的结点
        hiddenNodes = treeObj.getNodesByFilter(function (node) {//获取不符合条件的叶子结点
            if (node.level === 0) {//根节点不过滤
                return false;
            }
            return node.name.indexOf(filter_val);
        });
        treeObj.hideNodes(hiddenNodes);//隐藏不符合条件的叶子结点
    };
    //获取tree元素上的数据
    let tree_id = $tree.attr("id");
    let url = $tree.data("url");
    let tree_tools = $tree.data("tools");
    let selectParam = $tree.data("selectParam");//单机节点传递的参数
    let selectUrl = $tree.data("select");//单击节点调用的url
    let $filter_tree = tree_options["filter_tree"];
    let setting = {
        async: {
            enable: true,
            type: "get",
            dataType: "json",
            otherParam: _.extend({"isJson": "true"}, options.otherParam || {}),
            dataFilter: function (treeId, parentNode, responseData) {
                if (responseData["status"] !== "success") {
                    tipbox.error(responseData["msg"]);
                    return [];
                } else {
                    return responseData.data;
                }
            },
            url: ""
        },
        check: {
            enable: false,
            chkboxType: {"Y": "ps", "N": "ps"}
        },
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parent_id",
                rootPId: 0
            }
        },
        view: {},
        callback: {}
    };
    //扩展初始化参数
    _.extend(setting, options["setting"] || {});
    let treeObj;
    //鼠标左击节点事件以及默认选中第一个节点
    if (typeof selectParam !== "undefined") {
        setting["callback"]["onClick"] = function (event, treeId, treeNode) {
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            let data = _.pick(treeNode, selectParam.split(","));
            data["tree_id"] = treeId;
            data["node_id"] = treeNode.id;
            data["node_ids"] = getSelectNodeIds(treeNode);
            if (typeof tree_options["click"]["before"] === "function") {
                _.extend(data, tree_options["click"]["before"]())
            }
            if (typeof tree_options["click"]["exec"] === "function") {
                tree_options["click"]["exec"](data, treeObj, treeNode);
                return true;
            }
            if (typeof selectUrl !== "undefined") {
                loadPage(options["loadPage"] || ".lbl-content>.main", selectUrl, data);
            }
        };
        let initd = false;
        setting["callback"]["onAsyncSuccess"] = function zTreeOnAsyncSuccess(event, treeId, treeNode, msg) {
            if (!initd) {//只加载一次（初始化时）
                let tree_obj = $.fn.zTree.getZTreeObj(treeId);
                let nodes = tree_obj.getNodes();
                if (nodes.length > 0) {
                    let select_node = nodes[0];
                    tree_obj.selectNode(select_node);
                    setting.callback.onClick(null, tree_obj.setting.treeId, select_node);
                }
                initd = true;
            }
            //过滤器(加载完成执行过滤)
            if (typeof $filter_tree !== "undefined" && $filter_tree.length > 0) {
                filter($filter_tree.val());
            }
        };
    }
    //鼠标右击节点事件
    if (typeof tree_tools !== "undefined") {
        setting["callback"]["onRightClick"] = function (event, treeId, treeNode) {
            if (!treeNode) {
                return false;
            }
            let tree_obj = $.fn.zTree.getZTreeObj(treeId);
            tree_obj.selectNode(treeNode);
            setting.callback.onClick(null, treeId, treeNode);
            $(tree_tools).contextMenu({
                event: event,//右击事件对象
                onClick: function ($button, operator) {//右键菜单选中回调
                    if (operator === "add") {
                        if (!beforClickExec($button, "add", treeNode, tree_obj)) {
                            return false;
                        }
                        treeAdd(tree_obj, $button, treeNode);
                    } else if (operator === "edit") {
                        if (!beforClickExec($button, "edit", treeNode, tree_obj)) {
                            return false;
                        }
                        treeEdit(tree_obj, $button, treeNode);
                    } else if (operator === "del") {
                        if (!beforClickExec($button, "del", treeNode, tree_obj)) {
                            return false;
                        }
                        treeDel(tree_obj, $button, treeNode);
                    } else {//没有处理的回调
                        typeof tree_options.contextMenu === "function" && tree_options["contextMenu"](tree_obj, $button, treeNode);
                    }
                }
            })
        };
    }
    //初始化树，加载根节点数据
    if ($tree.length > 0 && typeof url !== "undefined") {
        setting.async.url = url;//远程加载数据
        treeObj = $.fn.zTree.init($tree, setting, null);
    } else {
        return undefined;
    }
    //树过滤器
    if (typeof $filter_tree !== "undefined" && $filter_tree.length > 0) {
        $filter_tree.on("input propertychange", function (e) {
            let filter_val = $(this).val();
            filter(filter_val);
        });
    }
    return treeObj;
};
//初始化表格
let initTable = function ($table, options, callback) {
    /*
     * $table：table Jquery对象
     * options：bootstrap-table初始化自定义参数
     * {
     * modal_width:xx  表格添加修改，弹框宽度
     * }
     * callback:回调函数（输出表格工具按钮最终点击后返回数据）（如果操作太复杂，执行回调由主逻辑处理）
     * */
    let table_height = $(window).height() - $table.offset().top;
    let bootStrap = _.extend({
        add: {},
        edit: {},
        del: {},
        import: {},
        export: {},
        btn_search: {},
        displayTable: {},
        classes: "table table-hover table-condensed table-responsive",
        sortOrder: "",
        sortName: "",
        uniqueId: "id",                     //每一行的唯一标识，一般为主键列
        method: 'GET',                      //请求方式（*）
        striped: true,                      //是否显示行间隔色
        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true,                   //是否显示分页（*）
        sortable: true,                     //是否启用排序
        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,                       //初始化加载第一页，默认第一页
        pageSize: 20,                       //每页的记录行数（*）
        pageList: [20, 50, 100, 200],        //可供选择的每页的行数（*）
        clickToSelect: true,                //是否启用点击选中行
        singleSelect: false,//多选
        height: table_height > 350 ? table_height : 350,
        escape: true,//转义特殊字符
        rowStyle: function rowStyle(row, index) {
            return {
                css: {
                    "white-space": "nowrap"
                }
            };
        },
        responseHandler: function (res) {
            if (res.status == "sessionTimeOut") {
                tipbox.warning("当前回话超时，请重新<a href='/public/login' target='_blank'><span style='color:red'>登录</span></a>");
                return false;
            }
            if (res.status !== "success") {
                tipbox.warning(res.msg);
                return {total: 0, rows: []};
            } else {
                return res.data;
            }
        },
        columns: []
    }, options || {});
    let $table_tools = $table.data("tools") ? $($table.data("tools")) : [];
    let old_queryParams = bootStrap.queryParams;//包装原查询条件，多加一个请求参数
    bootStrap.queryParams = function (params) {
        return _.extend(old_queryParams(params), {"isJson": true});
    };
    //获取初始化form查询条件，与下次查询条件对比，判断条件是否改变(pageNumber变为1)
    let old_condition = $table_tools.length === 1 ? $table_tools.find("form").serializeForm() : {};
    $table.bootstrapTable(bootStrap);
    let getSelectDataIndex = function ($table, unique_value) {
        let index = -1;
        let table_data = $table.bootstrapTable('getData');
        for (let i = 0, j = table_data.length; i < j; i++) {
            if (unique_value === table_data[i][bootStrap["uniqueId"]]) {
                index = i;
                break;
            }
        }
        return index;
    };
    //按钮操作前执行函数
    let beforClickExec = function ($button, button_type) {
        if (typeof bootStrap[button_type]["before"] === "function") {
            if (!bootStrap[button_type]["before"]($button)) {
                return false;
            }
        }
        return true;
    };
    //modal显示前
    let modalShow = function ($button, button_type, row) {
        if (typeof bootStrap[button_type]["beforeShow"] === "function") {
            if (!bootStrap[button_type]["beforeShow"]($button, row)) {
                return false;
            }
        }
        return true;
    };
    //注册表格事件
    //uncheck
    $table.on("uncheck.bs.table", function (e, row, element) {
        if (bootStrap.singleSelect) {
            let index = $(element).parents("tr").data("index");
            $table.bootstrapTable("check", index)
        }
    });
    if ($table_tools.length === 1) {
        $table.on("load-success.bs.table", function () {
            $table_tools.find("button.search").openButton();
        });
        $table.on("load-error.bs.table", function () {
            $table_tools.find("button.search").openButton();
        });
        $table.on("refresh.bs.table", function () {
            $table_tools.find("button.search").closeButton();
        });
        //注册工具点击事件
        let $buttons = $table_tools.find("button");
        $buttons.each(function () {
            let $button = $(this);
            $button.unbind();//防止表格被多次初始化，按钮被多次绑定
            $button.click(function () {
                let url = $button.data("url");
                let $form = $($button.data("form"));
                //切换表格视图
                if ($button.hasClass("toggle")) {
                    $table.bootstrapTable("toggleView");
                    return true;
                }
                //查询按钮
                if ($button.hasClass("search")) {
                    if (!beforClickExec($button, "btn_search")) {
                        return false;
                    }
                    $button.closeButton();
                    let new_condition = $table_tools.find("form").serializeForm();
                    //判断前后两次查询条件，如果不一致设置从第一页查询
                    if (_.isEqual(new_condition, old_condition)) {
                        $table.bootstrapTable("refresh");
                    } else {
                        old_condition = new_condition;
                        $table.bootstrapTable('refreshOptions', {pageNumber: 1});
                    }
                    return true;
                }
                //删除
                if ($button.hasClass("del")) {
                    if (!beforClickExec($button, "del")) {
                        return false;
                    }
                    let rows = $table.bootstrapTable("getSelections");
                    if (rows.length < 1) {
                        tipbox.warning("请先选中操作行！");
                        return false;
                    }
                    let ids = _.pluck(rows, bootStrap["uniqueId"]);
                    tipbox.info({
                        body_content: _.has(bootStrap.del, "title") ? bootStrap.del.title : "确认要删除选中数据？",
                        submit: function ($btn_ok, $modal) {
                            let req_data = {"id": ids};
                            _.extend(req_data, bootStrap.del.params || {});
                            $.ajaxForm({
                                url: url,
                                method: "post",
                                data: req_data,
                                success: function (data) {
                                    tipbox.ainfo(data);
                                    $modal.modal("hide");
                                    for (let i = 0, j = ids.length; i < j; i++) {
                                        $table.bootstrapTable('removeByUniqueId', ids[i]);
                                    }
                                },
                                btn: $btn_ok
                            });
                        }
                    });
                }
                //添加
                if ($button.hasClass("add")) {
                    if (!beforClickExec($button, "add")) {
                        return false;
                    }
                    let $lbl_edit_disable = $form.find(".lbl-edit-disable");
                    $lbl_edit_disable.attr("disabled", false);
                    $lbl_edit_disable.find("input").attr("disabled", false);
                    $form.show();
                    let _modal = {
                        title: _.has(bootStrap.add, "title") ? bootStrap.add.title : "添加数据",
                        btn_concel: "取消",
                        btn_ok: "保存",
                        body_content: $form,
                        show: function ($modal) {
                            $form[0].reset();//添加前重置表单
                            modalShow($button, "add");
                        },
                        submit: function ($btn_ok, $modal) {
                            let req_data = {};
                            _.extend(req_data, bootStrap.add.params || {});
                            $form.ajaxForm({
                                url: url,
                                data: req_data,
                                method: "post",
                                success: function (data) {
                                    tipbox.ainfo(data);
                                    $modal.modal("hide");
                                    $table.bootstrapTable("refresh");
                                },
                                btn: $btn_ok
                            });
                        }
                    };
                    if (_.has(bootStrap, "modal_width")) {
                        _modal.width = bootStrap["modal_width"];
                    }
                    tipbox.dialog(_modal);
                }
                //修改
                if ($button.hasClass("edit")) {
                    if (!beforClickExec($button, "edit")) {
                        return false;
                    }
                    let row = $table.bootstrapTable("getSelections");
                    if (row.length < 1) {
                        tipbox.warning("请先选中要修改的数据");
                        return false;
                    }
                    if (row.length > 1) {
                        tipbox.warning("只有一条数据被选中时,才能修改！");
                        return false;
                    }
                    let $lbl_edit_disable = $form.find(".lbl-edit-disable");
                    $lbl_edit_disable.attr("disabled", true);
                    $lbl_edit_disable.find("input").attr("disabled", true);
                    $form.show();
                    let _modal = {
                        title: _.has(bootStrap.edit, "title") ? bootStrap.edit.title : "修改数据",
                        btn_concel: "取消",
                        btn_ok: "保存",
                        body_content: $form,
                        show: function ($modal) {
                            $form[0].reset();//添加前重置表单
                            modalShow($button, "edit", row[0]);
                            $form.autoFillForm(row[0])
                        },
                        submit: function ($btn_ok, $modal) {
                            let req_data = {};
                            _.extend(req_data, bootStrap.edit.params || {});
                            $form.ajaxForm({
                                url: url,
                                data: req_data,
                                method: "post",
                                success: function (data, req_data) {
                                    tipbox.ainfo(data);
                                    $modal.modal("hide");
                                    let index = getSelectDataIndex($table, row[0][bootStrap["uniqueId"]]);
                                    $table.bootstrapTable('updateRow', {
                                        "index": index,
                                        "row": req_data
                                    });
                                },
                                btn: $btn_ok
                            });
                        }
                    };
                    if (_.has(bootStrap, "modal_width")) {
                        _modal.width = bootStrap["modal_width"];
                    }
                    tipbox.dialog(_modal);
                }
                //导出
                if ($button.hasClass("export")) {
                    if (!beforClickExec($button, "export")) {
                        return false;
                    }
                    $form.show();
                    tipbox.dialog({
                        title: _.has(bootStrap.export, "title") ? bootStrap.export.title : "导出数据",
                        btn_concel: "取消",
                        btn_ok: "开始导出",
                        body_content: $form,
                        show: function ($modal) {
                            if ($form.length !== 0) {
                                $form[0].reset();//添加前重置表单
                            }
                        },
                        submit: function ($btn_ok, $modal) {
                            $.ajaxForm({
                                url: url,
                                method: "post",
                                data: _.has(bootStrap.export, "data") && typeof bootStrap.export["data"] === "function" ? bootStrap.export["data"]() : {},
                                success: function (data) {
                                    // tipbox.info(data);
                                    $("body").append($("<iframe style='display: none'/>").attr("src", data));
                                    $modal.modal("hide");
                                },
                                btn: $btn_ok
                            });
                        }
                    });
                }
                //导入
                if ($button.hasClass("import")) {
                    if (!beforClickExec($button, "import")) {
                        return false;
                    }
                    $form.show();
                    tipbox.dialog({
                        title: _.has(bootStrap.import, "title") ? bootStrap.import.title : "导入数据",
                        btn_concel: "取消",
                        btn_ok: "开始上传",
                        body_content: $form,
                        show: function ($modal) {
                            if ($form.length !== 0) {
                                $form[0].reset();//添加前重置表单
                            }
                        },
                        submit: function ($btn_ok, $modal) {
                            $form.ajaxForm({
                                url: url,
                                method: "post",
                                isFile: true,
                                beforeSend: function () {
                                    let $files = $form.find("input[type='file']");
                                    for (let i = 0, j = $files.length; i < j; i++) {
                                        if ($($files[i]).val().trim() === "") {
                                            tipbox.warning("上传文件不能为空！");
                                            $btn_ok.openButton();
                                            return false;
                                        }
                                    }
                                },
                                success: function (data) {
                                    tipbox.info(data);
                                    $modal.modal("hide");
                                    $table.bootstrapTable("refresh");
                                },
                                btn: $btn_ok
                            });
                        }
                    });
                }
            });
        });
    }
};
//初始化弹窗表格
let initModalTable = function ($div, options, callback) {
    let $table = $div.find("table");
    if ($table.length !== 1) {
        tipbox.warning("没有找到弹窗内容！");
        return false;
    }
    let default_options = {};
    default_options.height = 280;
    default_options.pageSize = 6;
    default_options.pageList = [6];
    default_options.columns = [];
    default_options.singleSelect = false;
    _.extend(default_options, options || {});
    let tipboxy_options = {
        title: _.has(options, "title") ? options["title"] : "选择数据",
        btn_ok: "确认",
        btn_concel: "取消",
        body_content: $div,
        show: typeof default_options["show"] === "function" ? default_options["show"] : undefined,
        shown: function () {
            initTable($table, default_options);
        },
        submit: function ($button, $modal) {
            let modal_select_rows = $table.bootstrapTable("getSelections");
            if (modal_select_rows.length <= 0) {
                tipbox.warning("请先选中要确认数据");
                return false;
            }
            $modal.modal("hide");
            typeof callback === "function" && callback(modal_select_rows);
        },
        hidden: function () {
            $table.bootstrapTable("destroy");
        }
    };
    if (_.has(options, "width")) {//设置modal宽度
        tipboxy_options["width"] = options.width;
    }
    tipbox.dialog(tipboxy_options);
};
//初始化全局弹出框插件
let initModal = function () {
    window.tipbox = {};
    let box_pack = function (body_content, type) {
        //title: "自定义标题",
        //btn_concel: "自定义取消",
        //btn_ok: "自定义确定",
        //body_content: "<div>自定义body标签</div>",
        //submit 提交函数($btn_ok,$modal)
        let options = {};
        if (_.isEmpty(body_content)) {
            body_content = "没有获取到弹窗内容！！"
        }
        if (_.isObject(body_content)) {
            options = body_content;
            body_content = body_content["body_content"];
        }
        let $global_modal = $($("#global_modal").html());
        let $modal_title = $global_modal.find(".modal-title");
        let $btn_concel = $global_modal.find(".btn_concel");
        let $modal_body = $global_modal.find(".modal-body");
        let $btn_ok = $global_modal.find(".btn_ok");
        let type_select = {
            warning: {
                title: "警告",
                color: "text-warning",
                icon: "lbl-icon warning"
            },
            info: {
                title: "信息",
                color: "text-info",
                icon: "lbl-icon info"
            },
            error: {
                title: "错误",
                color: "text-danger",
                icon: "lbl-icon error"
            },
            success: {
                title: "成功",
                color: "text-success",
                icon: "lbl-icon success"
            }
        };
        _.has(options, "title") ? $modal_title.text(options["title"]) : $modal_title.text(type_select[type]["title"]);
        _.has(options, "btn_concel") ? $btn_concel.text(options["btn_concel"]) : $btn_concel.text("取消");
        _.has(options, "btn_ok") ? $btn_ok.text(options["btn_ok"]) : $btn_ok.text("确认");
        let div_arr = [
            "<div style='line-height: 32px;' class='" + type_select[type]["color"] + "'>",
            "<i class='" + type_select[type]["icon"] + "'></i>",
            "</div>"
        ];
        let $div = $(div_arr.join(""));
        $modal_body.append($div);
        $div.append(body_content);
        $global_modal.modal({
            backdrop: "static",
            keyboard: false
        });
        //注册按钮点击事件
        $btn_ok.click(function () {
            (_.has(options, "submit") && typeof options["submit"] === "function") ? options["submit"]($btn_ok, $global_modal) : $global_modal.modal("hide");
        });
        $global_modal.modal("show");
        $global_modal.on('hidden.bs.modal', function () {
            $global_modal.remove();//窗口关闭后删除自己
        });
    };
    let abox_pack = function (body_content, type) {
        let type_select = {
            awarning: "awarning",
            ainfo: "ainfo",
            aerror: "aerror",
            asuccess: "asuccess"
        };
        let $div = $("<div class='lbl-auto-tipbox " + type_select[type] + "'></div>");
        $div.append(body_content);
        $("body").append($div);
        let timer = setTimeout(function () {
            $div.remove();
        }, 2500);
        $div.on({
            "mouseenter": function () {
                window.clearTimeout(timer);
            },
            "mouseleave": function () {
                timer = setTimeout(function () {
                    $div.remove();
                }, 2500);
            },
        });
    };
    tipbox.dialog = function (options) {
        //title: "自定义标题",
        //btn_concel: "自定义取消",
        //btn_ok: "自定义确定",
        //body_content: "<div>自定义body标签</div>",
        //// url: "/privilege/test",//远程获取body
        //width: "100%", //500px
        //max_height: "300"，//默认充斥window高度
        //submit 提交函数($btn_ok,$modal)
        //show 函数 (modal)
        //shown 函数 (modal)
        //hidden 函数(modal) 窗口隐藏后
        let $global_modal = $($("#global_modal").html());
        let $modal_dialog = $global_modal.find(".modal-dialog");
        let $modal_header = $global_modal.find(".modal-header");
        let $modal_title = $global_modal.find(".modal-title");
        let $modal_body = $global_modal.find(".modal-body");
        let $btn_concel = $global_modal.find(".btn_concel");
        let $btn_ok = $global_modal.find(".btn_ok");
        let $modal_footer = $global_modal.find(".modal-footer");
        options = _.extend({name: "liu"}, options || {});
        let modal_init = {
            backdrop: "static",
            keyboard: false
        };
        //----------modal参数,url获取body时无效------
        let max_height = _.has(options, "max_height") ? options["max_height"] : $(window).height() - 200;
        $modal_body.css("max-height", max_height);
        $modal_body.css("overflow-y", "auto");//body高度滚动条
        _.has(options, "title") ? $modal_title.text(options["title"]) : $modal_header.remove();
        _.has(options, "btn_concel") ? $btn_concel.text(options["btn_concel"]) : $btn_concel.remove();
        _.has(options, "btn_ok") ? $btn_ok.text(options["btn_ok"]) : $btn_ok.remove();
        (!_.has(options, "btn_concel") && !_.has(options, "btn_ok")) && $modal_footer.remove();
        let $parent, $body_content;
        if (_.has(options, "body_content")) {
            $body_content = $(options["body_content"]);
            $parent = $body_content.parent();
            $modal_body.append(options, $body_content);
            $body_content.show();
        }
        //------------------end-----------------
        _.has(options, "url") && (modal_init.remote = options["url"]);
        _.has(options, "width") && $modal_dialog.width(options["width"]);
        //修复小屏弹出框无法居中问题
        $modal_dialog.css("margin-left", "auto");
        $modal_dialog.css("margin-right", "auto");
        $global_modal.modal(modal_init);
        //注册按钮点击事件
        $btn_ok.click(function () {
            (_.has(options, "submit") && typeof options["submit"] === "function") ? options["submit"]($btn_ok, $global_modal) : $global_modal.modal("hide");
        });
        $btn_concel.click(function () {
            (_.has(options, "concel") && typeof options["concel"] === "function") && options["concel"]($btn_ok, $global_modal);
        });
        $global_modal.on('show.bs.modal', function () {
            (_.has(options, "show") && typeof options["show"] === "function") && options["show"]($global_modal);
        });
        $global_modal.on('shown.bs.modal', function () {
            (_.has(options, "shown") && typeof options["shown"] === "function") && options["shown"]($global_modal);
        });
        $global_modal.on('hide.bs.modal', function () {
            //窗口关闭后还原body内容位置
            if ($parent) {
                $body_content.hide();
                $parent.append($body_content);
            }
            (_.has(options, "hide") && typeof options["hide"] === "function") && options["hide"]($global_modal);
        });
        $global_modal.on('hidden.bs.modal', function () {
            $global_modal.remove();//窗口关闭后删除自己
            (_.has(options, "hidden") && typeof options["hidden"] === "function") && options["hidden"]($global_modal);
        });
        $global_modal.modal("show");
    };
    tipbox.warning = function (body_content) {
        box_pack(body_content, "warning");
    };
    tipbox.info = function (body_content) {
        box_pack(body_content, "info");
    };
    tipbox.error = function (body_content) {
        box_pack(body_content, "error");
    };
    tipbox.success = function (body_content) {
        box_pack(body_content, "success");
    };
    //自动消失提示框
    tipbox.awarning = function (body_content) {
        abox_pack(body_content, "awarning");
    };
    tipbox.ainfo = function (body_content) {
        abox_pack(body_content, "ainfo");
    };
    tipbox.aerror = function (body_content) {
        abox_pack(body_content, "aerror");
    };
    tipbox.asuccess = function (body_content) {
        abox_pack(body_content, "asuccess");
    };
};
//初始化时间控件
let initDateInput = function dateControlInit($control, custom_option, datetime) {
    /*
     * 初始化日期控件
     * */
    let control_option = $.extend({
        format: 'yyyy-mm-dd hh:ii:ss',
        startView: "month",
        minView: "month",
        maxView: "month",
        todayBtn: true,
        language: "zh-CN",
        autoclose: true,
        pickerPosition: "bottom-left",
        todayHighlight: true
    }, custom_option || {});
    $control.datetimepicker(control_option);
    if (typeof datetime !== "undefined") {
        $control.find("input").val(datetime);
    } else {
        $control.find("input").val(moment().format("YYYY-MM-DD HH:mm:ss"));
    }
};