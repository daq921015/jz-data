class TableAbstract {
    constructor($table) {
        this.$table = $table;
        this.size = "large";//弹出框大小
        this.title = "弹窗标题";//弹出框标题
        this.form_button_concel = "取消";//取消按钮名称
        this.form_button_ok = "确定";//确定按钮名称
        this.form_data = {};//提交时额外数据
        this.url = null;//提交url
        this.message = '没有设置body弹窗内容';//弹框body或搜索表单
        this.$message = null;//弹窗body jquery对象
        this.isModal = true;//按钮点击是否弹窗，默认为true
        this.$button = null;//按钮对象
    }

    //获取选中行
    getTableSelectRows() {
        let that = this;
        return that.$table.bootstrapTable("getSelections");
    }

    //获取选中行索引
    getSelectDataIndex(unique_value) {
        let that = this;
        let index = -1;
        let table_data = that.$table.bootstrapTable('getData');
        let uniqueKey = this.getUniqueKey();
        for (let i = 0, j = table_data.length; i < j; i++) {
            if (unique_value === table_data[i][uniqueKey]) {
                index = i;
                break;
            }
        }
        return index;
    }

    //获取表格行的唯一标示字段
    getUniqueKey() {
        let that = this;
        return that.$table.bootstrapTable('getOptions')["uniqueId"];
    }

    //设置按钮点击事件,callback按钮事件绑定时自定义额外执行内容
    //参数1：按钮对象 参数2：点击执行函数 参数3：同步函数，返回false,阻止事件继续执行 参数4：绑定事件时额外设置（不常用）
    setButton($btn, clickEvent, beforeClickExec, callback) {
        let that = this;
        typeof callback == "function" && callback.call(that);
        that.$button = $btn;
        that.$button.click(() => {//绑定按钮点击事件，并传递按钮对象
            //按钮事件执行前
            let continueClick = typeof beforeClickExec == "function" ? beforeClickExec.call(that) : true;
            if (continueClick === false) return false;
            that.isModal ? that.buttonClickModal(clickEvent) : clickEvent.call(that);//this指向类对象
        });
    }

    //按钮弹窗
    buttonClickModal(clickEvent) {
        let that = this;
        let dialog = bootbox.dialog({
            size: that.size,
            title: that.title,
            message: that.message,
            buttons: {
                cancel: {
                    label: that.form_button_concel,
                    className: 'btn-default',
                },
                ok: {
                    label: that.form_button_ok,
                    className: 'btn-primary',
                    callback: function () {
                        typeof clickEvent == "function" && clickEvent.call(that, dialog);
                        return false;
                    }
                }
            }
        });
        dialog.init(typeof that.dialogInit == "function" ? that.dialogInit(dialog) : () => {
        });
    }

    //设置弹窗body内容
    setMessage(message) {
        if (message instanceof jQuery) {
            this.$message = message;
            this.message = message.prop("outerHTML");
        } else {
            this.message = message;
        }
    }

    //设置是否弹窗
    setIsModal(isModal) {
        this.isModal = isModal;
    }

    //设置按钮，提交额外提交参数
    setFormData(form_data) {
        this.form_data = form_data;
    }

    //设置弹框大小
    setSize(size) {
        this.size = size;
    }

    //设置弹框标题
    setTitle(title) {
        this.title = title;
    }

    //设置按钮，提交URL
    setUrl(url) {
        this.url = url;
    }

    //设置弹窗取消按钮名称
    setFormButtonConcel(form_button_concel) {
        this.form_button_concel = form_button_concel;
    }

    //设置弹窗确定按钮名称
    setFormButtonOk(form_button_ok) {
        this.form_button_ok = form_button_ok;
    }

    //设置功能参数
    setParams(options) {
        let that = this;
        if (_.has(options, "message")) that.setMessage(options["message"]);
        if (_.has(options, "url")) this.setUrl(options["url"]);//删除提交url
        if (_.has(options, "form_button_ok")) this.setFormButtonOk(options["form_button_ok"]);//弹窗确定按钮
        if (_.has(options, "form_button_concel")) this.setFormButtonConcel(options["form_button_concel"]);//弹窗取消按钮
        if (_.has(options, "title")) this.setTitle(options["title"]);//弹窗标题
        if (_.has(options, "size")) this.setSize(options["size"]);//弹窗宽度
        if (_.has(options, "form_data")) this.setFormData(options["form_data"]);//表单额外条件
        if (_.has(options, "isModal")) this.setIsModal(options["isModal"]);//按钮点击弹窗设置
    }

    //判断选中行数，
    judgeSelectRow() {//返回true,中断执行
        let that = this;
        let rows = that.getTableSelectRows();
        if (rows.length != 1) {
            bootbox.warning("请先选中操作行,并且只能选中一行！");
            return false;
        }
        return true;
    }

    //判断选中行数，
    judgeSelectMultiRow() {//返回true,中断执行
        let that = this;
        let rows = that.getTableSelectRows();
        if (rows.length < 1) {
            bootbox.warning("请先选中操作行,至少选中一行！");
            return false;
        }
        return true;
    }
}

class TableSearch extends TableAbstract {
    constructor($table) {
        super($table);
        this.search_condition_old = null;//历史查询条件，变换时从第一页查询
    }

    //查询返回数据，标记按钮可用
    enableSearchButton() {
        let that = this;
        that.$table.on("load-success.bs.table", function () {
            that.$button.openButton();
        });
        that.$table.on("load-error.bs.table", function () {
            that.$button.openButton();
        });
    }

    //保存上一次查询条件，用来与本次查询对比，初始化页码
    setSearchConditionOld(value) {
        this.search_condition_old = value;
    }

    //获取查询条件，表单+自定义数据
    getSearchCondition() {
        let that = this;
        let obj = that.form_data;
        if (typeof obj == "function") {
            let obj2 = that.form_data();
            obj = _.isObject(obj2) ? obj2 : {};
        }
        return _.extend(that.$message == null ? {} : that.$message.serializeForm(), obj);
    }

    //设置按钮参数
    setParams(options) {
        let that = this;
        super.setParams(options);
        if (_.has(options, "button")) this.setButton(options["button"], that.execSearch, null, that.enableSearchButton);
    }

    //执行查询
    execSearch() {
        let that = this;
        that.$button.closeButton();
        let search_condition = that.getSearchCondition();
        if (_.isEqual(search_condition, this.search_condition_old)) {
            that.$table.bootstrapTable("refresh");
        } else {
            that.search_condition_old = search_condition;
            that.$table.bootstrapTable('refreshOptions', {pageNumber: 1});
        }
    }
}

class TableAdd extends TableAbstract {
    constructor($table) {
        super($table);
    }

    //设置按钮参数
    setParams(options) {
        let that = this;
        super.setParams(options);
        if (_.has(options, "button")) that.setButton(options["button"], that.execAdd);
    }

    //执行新增
    execAdd(dialog) {
        let that = this;
        if (that.url == null) throw Error("还没有设置表单提交url");
        let $modal_form = dialog.find("form");
        let $confirmBtn = dialog.find("button[data-bb-handlr='ok']");
        $modal_form.ajaxForm({
            url: that.url,
            data: that.form_data,
            method: "post",
            success: function (data) {
                bootbox.success(data);
                that.$table.bootstrapTable("refresh");
                dialog.modal('hide');
            },
            btn: $confirmBtn
        });
    }
}

class TableDel extends TableAbstract {
    constructor($table) {
        super($table);
    }

    //设置按钮参数
    setParams(options) {
        let that = this;
        if (_.has(options, "message")) {
            options["message"] = '<div style="line-height: 32px;" class="text-warning"><i class="lbl-icon warning"></i>' + options["message"] + '</div>'
        }
        super.setParams(options);
        if (_.has(options, "button")) this.setButton(options["button"], that.execDel, that.judgeSelectRow);//删除按钮
    }

    //执行删除
    execDel(dialog) {
        let that = this;
        let rows = that.getTableSelectRows();
        let id = _.pluck(rows, that.getUniqueKey());
        $.ajaxForm({
            url: that.url,
            method: "post",
            data: _.extend({"id": id}, that.form_data),
            success: function (data) {
                bootbox.success(data);
                dialog.modal("hide");
                for (let i = 0, j = id.length; i < j; i++) {
                    that.$table.bootstrapTable('removeByUniqueId', id[i]);
                }
            }
        });
    }
}

class TableUpdate extends TableAbstract {
    constructor($table) {
        super($table);
    }

    //设置input更新时禁止编辑
    setUpdateInputDisable($modal_form) {
        let $lbl_edit_disable = $modal_form.find(".lbl-edit-disable");
        $lbl_edit_disable.attr("disabled", true);
        $lbl_edit_disable.find("input").attr("disabled", true);
    }

    //设置按钮参数
    setParams(options) {
        let that = this;
        super.setParams(options);
        if (_.has(options, "button")) that.setButton(options["button"], that.execUpdate, this.judgeSelectRow);
    }

    //弹窗显示前，初始化更新表单
    dialogInit(dialog) {
        let that = this;
        let rows = that.getTableSelectRows();
        let $modal_form = dialog.find("form");
        $modal_form.autoFillForm(rows[0]);
        that.setUpdateInputDisable($modal_form);
    }

    execUpdate(dialog) {
        let that = this;
        if (this.url == null) throw Error("还没有设置表单提交url");
        let $modal_form = dialog.find("form");
        let $confirmBtn = dialog.find("button[data-bb-handlr='ok']");
        let rows = that.getTableSelectRows();
        $modal_form.ajaxForm({
            url: that.url,
            data: that.form_data,
            method: "post",
            success: function (data, req_data) {
                bootbox.success(data);
                let index = that.getSelectDataIndex(rows[0][that.getUniqueKey()]);
                that.$table.bootstrapTable('updateRow', {
                    "index": index,
                    "row": req_data
                });
                dialog.modal('hide');
            },
            btn: $confirmBtn
        });
    }
}

//初始化表格
class InitTableNew extends TableAbstract {
    constructor($table, options) {
        super($table);
        let that = this;
        this.$table = $table;
        this.table_height = $(window).height() - $table.offset().top;
        this.add = new TableAdd($table);
        this.del = new TableDel($table);
        this.update = new TableUpdate($table);
        this.search = new TableSearch($table);
        this.bootStrap = _.extend({
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
            height: that.table_height > 350 ? that.table_height : 350,
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
            queryParams: function (params) {
                return _.extend({
                    limit: params.limit,   //页面大小
                    offset: params.offset,  //页码
                    sortOrder: params.order,//排序
                    sortName: params.sort,//排序字段
                }, that.search.getSearchCondition());
            },
            columns: []
        }, options || {});
    }

    //table初始化
    init() {
        let that = this;
        that.search.setSearchConditionOld(that.search.getSearchCondition());//保存初始化时的查询参数
        that.$table.bootstrapTable(that.bootStrap);
    }
}


