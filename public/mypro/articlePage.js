/**
 * 特卖api调用静态类
 */
class TemaiApiHandler {
    //获取商品详情
    static getGoodsDetail(sku_id, callback) {
        //获取分类api
        let that = this;
        if (_.isEmpty(sku_id)) {
            return bootbox.warning("无法查询商品详情，商品id为空");
        }
        $.ajaxForm({
            url: "/TarticleApi/ajaxGetCommodityDetail",
            method: "GET",
            data: {sku_id: sku_id},
            success: function (data) {
                typeof callback == "function" && callback(data);
            }
        });
    }

    //获取分类api
    static getCategoryList(category_id, callback) {
        let that = this;
        let categoryUrl = "/TarticleApi/ajaxGetCommodityCategory";
        let url = category_id ? categoryUrl + "?category_id=" + category_id : categoryUrl;
        $.ajaxForm({
            url: url,
            method: "GET",
            success: function (data) {
                typeof callback == "function" && callback(data);
            }
        });
    }

    //获取商品列表信息api
    static getGoodsList(options, callback) {
        let that = this;
        $.ajaxForm({
            url: "/TarticleApi/ajaxGetCommodityList",
            method: "GET",
            data: options || {},
            success: function (data) {
                typeof callback == "function" && callback(data);
            }
        });

    }

}

/**
 * 商品库类，商品的查询页面
 */
class GoodsLibary {
    constructor(empType, openType) {
        this.paginationInited = false;
        this.goodsHanler = new GoodsHandler(empType, openType);
    }

    //获取商品查询条件
    getGoodsSearchData(options) {
        let that = this;
        let sortData = that.getGoodsSearchSortData();
        let formData = that.$formSearch.serializeForm();
        let searchData = {
            is_recommend: 0,
            flag: 0,
            platform: 3,
            task_pool_flag: true,
            page: 0,
        };
        _.extend(searchData, formData, options || {}, sortData);
        return searchData;
    }

    //获取商品查询排序条件
    getGoodsSearchSortData() {
        let that = this;
        let sort = "", order = "desc";//默认查询条件
        let $sortedButton = that.$formSearch.find("button.btn-primary.sort");
        if ($sortedButton.length == 1) {
            sort = $sortedButton.data("sort");
            order = $sortedButton.find("span").hasClass("glyphicon-arrow-down") ? "desc" : "asc";
        }
        return {
            sort: sort,
            order: order
        }
    }

    //刷新商品列表，并重置分页和描述信息
    refreshGoodsListAndReSearch(options) {
        let that = this;
        that.refreshGoodsList(options || {}, function (totalPages, totalCount) {
            that.initBootStrapPagination(totalPages);
            that.setGoodsItemDescription(totalPages, totalCount);
        });
    }

    //刷新商品列表，查询+渲染
    refreshGoodsList(options, callback) {
        let that = this;
        let searchData = that.getGoodsSearchData();
        _.extend(searchData, options || {});//自定义额外参数
        that.$goodsList.empty();//原来的列表清空
        that.$loading.show();//显示正在加载提示
        that.$btnGoodsSearch.closeButton();//查询时，跳转和搜索按钮不可用
        that.$btnSkipPage.closeButton();
        TemaiApiHandler.getGoodsList(searchData, function (data) {//获取商品列表数据
            that.$btnGoodsSearch.openButton();
            that.$btnSkipPage.openButton();
            that.$loading.hide();//隐藏正在加载
            let goods_infos = data["goods_infos"];
            if (goods_infos.length == 0) {//如果加载数据为空
                that.$emptyPage.show();//显示空数据提示
                that.$pagination.parent().hide();//隐藏分页列表
                return true;
            }
            that.$pagination.parent().show();//显示分页列表
            that.$emptyPage.hide();//隐藏空数据提示
            let totalPages = Math.ceil(data["total_count"] / data["page_size"]);
            let totalCount = data["total_count"];
            that.renderGoodsItem(goods_infos);
            that.initGoodsEvent();
            typeof callback == "function" && callback(totalPages, totalCount);
        });
    }

    //初始化商品列表事件，插入商品按钮，隐藏与显示事件
    initGoodsEvent() {
        let that = this;
        let $goodsLi = that.$commodityContainer.find("li");
        $goodsLi.on({
            "mouseenter": function () {
                $(this).find(".selectCommodityBtn").removeClass("hide-goods").addClass("show-goods");
            },
            "mouseleave": function () {
                $(this).find(".selectCommodityBtn").removeClass("show-goods").addClass("hide-goods");
            },
        });
        //商品元素，点击事件
        $goodsLi.click(function () {
            window.open($(this).data("href"));
        });
        //插入商品按钮，点击事件
        that.$commodityContainer.find(".selectCommodityBtn").click(function (e) {
            let $that = $(this);
            $that.closeButton();
            e.stopPropagation();
            let select_goods = {
                sku_id: $that.data("id"),
                cos_ratio: $that.data("cosRatio"),
                hotrank: $that.data("hotrank"),
                month_sell_num: $that.data("monthSellNum")
            };
            that.goodsHanler.init(select_goods, function () {
                $that.openButton();
                that.dialog.modal("hide");
            });

            // that.$goodsList.trigger("select-goods", {
            //     sku_id: $that.data("id"),
            //     cos_ratio: $that.data("cosRatio"),
            //     hotrank: $that.data("hotrank"),
            //     month_sell_num: $that.data("monthSellNum")
            // });//触发事件
        });
    }

    //设置商品列表描述信息，共多少页，共多少数据
    setGoodsItemDescription(totalPages, totalCount) {
        let that = this;
        that.$pageTotal.text(totalPages);
        that.$dataTotal.text(totalCount);
    }

    //渲染商品列表
    renderGoodsItem(goods_infos) {
        let that = this;
        if (goods_infos.length <= 0) {//商品列表为空，显示为找到商品，并隐去分页元素
            that.$emptyPage.show();
            that.$pagination.parent().hide();
        }
        let buildItem = [];
        goods_infos.forEach(function (item) {
            item["global"] = window;//模板不支持js函数
            buildItem.push(template('temp_goods_panel', item));
        });
        that.$goodsList.append(buildItem.join(''));
    }

    //初始化分页插件
    initBootStrapPagination(totalPages) {
        let that = this;
        if (that.paginationInited) {//分页插件已经初始化,重置分页参数
            return that.$pagination.bootstrapPaginator("setOptions", {
                currentPage: 1,
                totalPages: totalPages
            });
        }
        that.$pagination.bootstrapPaginator({//初始化分页插件
            currentPage: 1, //当前页
            totalPages: totalPages, //总页数
            numberOfPages: 5, //设置控件显示的页码数
            onPageClicked: function (event, originalEvent, type, page) {
                that.refreshGoodsList({"page": page - 1});
            }
        });
    }

    //初始化页面事件
    initEvent() {
        let that = this;
        //窗口自适应
        that.$commodityContainer.height($(window).height() - 350);
        $(window).resize(function () {
            that.$commodityContainer.height($(window).height() - 350);
        });
        //搜索点击事件
        that.$btnGoodsSearch.click(function () {
            that.refreshGoodsListAndReSearch();
        });
        //一级品类change事件
        that.$category1Id.change(function () {
            let selectValue = $(this).find('option:selected').val();
            that.$category2Id.empty();
            that.$category2Id.append('<option value="">二级品类</option>');
            if (!_.isEmpty(selectValue)) {//选择“一级品类”选项，不查询二级品类
                TemaiApiHandler.getCategoryList(selectValue, function (data) {
                    let category_list = data["category_list"];
                    category_list.forEach(function (item) {
                        that.$category2Id.append('<option value="' + item["category_id"] + '">' + item["category_name"] + '</option>');
                    });
                });
            }
        });
        //推荐商品change事件
        that.$isRecommend.change(() => {
            that.$isRecommend.prop("checked") == true ? that.refreshGoodsListAndReSearch({is_recommend: 1})
                : that.refreshGoodsListAndReSearch({is_recommend: 0});
        });
        //排序按钮点击事件
        that.$sort.click(function () {
            let $that = $(this);
            let alreadySelected = $that.hasClass("btn-primary");
            if (!alreadySelected) {//之前没选中，移除已选中的，标记自己选中状态
                that.$sort.removeClass("btn-primary");
                $that.addClass("btn-primary");
            }
            let $span = $that.find("span");
            if (!$that.hasClass("sort-default") && alreadySelected) {//默认排序，不需要排序样式,已经选中的再次选中，更改排序样式
                $span.hasClass("glyphicon-arrow-down") ? $span.removeClass("glyphicon-arrow-down").addClass("glyphicon-arrow-up") :
                    $span.removeClass("glyphicon-arrow-up").addClass("glyphicon-arrow-down");
            }
            that.refreshGoodsListAndReSearch();
        });
        //跳转页码事件
        that.$btnSkipPage.click(function () {
            let pageNum = that.$skipPage.val();
            if (!/\d+/.test(pageNum)) {
                return bootbox.warning("请输入正整数页码");
            }
            let pages = that.$pagination.bootstrapPaginator("getPages");
            pageNum = parseInt(pageNum);
            if (!_.has(pages, "total") || pages["total"] < pageNum || pageNum < 1) {
                return bootbox.warning("跳转的页码，超出了最大页数");
            }
            that.refreshGoodsList({"page": pageNum - 1}, function () {//跳转页面完成，重新设置分页参数
                that.$pagination.bootstrapPaginator("show", pageNum);
            });
        });
    }

    //初始化页面元素
    initElement(dialog) {
        this.dialog = dialog;
        this.$skipPage = dialog.find("#skip_page");
        this.$btnSkipPage = dialog.find("#btn_skip_page");
        this.$pageTotal = dialog.find("#pageTotal");
        this.$dataTotal = dialog.find("#dataTotal");
        this.$isRecommend = dialog.find("#is_recommend");
        this.$category1Id = dialog.find("#category1_id");
        this.$category2Id = dialog.find("#category2_id");
        this.$pagination = dialog.find("#pagination");
        this.$formSearch = dialog.find("#form_search");
        this.$sort = this.$formSearch.find("button.sort");
        this.$btnGoodsSearch = dialog.find("#btn_goods_search");
        this.$commodityContainer = dialog.find(".commodity-container");
        this.$loading = this.$commodityContainer.find(".loading");
        this.$emptyPage = this.$commodityContainer.find(".empty-page");
        this.$goodsList = dialog.find("#goods_list");
    }

    //添加产品，类初始化
    init($btn) {
        let that = this;
        $btn.closeButton();
        TemaiApiHandler.getCategoryList(null, function (data) {//获取一级分类
            $btn.openButton();
            let html = template('temp_goods_table', {category1_list: data["category_list"]});
            let dialog = bootbox.dialog({
                message: html,
                closeButton: false,
                className: "modal-goods-table"
            });
            dialog.init(function () {
                that.initElement(dialog);//定义页面使用的元素
                that.refreshGoodsListAndReSearch();//获取商品信息，并渲染等一些列操作
                that.initEvent();//初始化窗口事件，窗口自适应自适应、排序、搜索等等
            });
        });
    }
}

/**
 * 图片处理抽象类，添加、修改等操作
 */
class ImageAbstract {
    constructor(empType, openType) {
        this.empType = empType;//组长和独立写作者可以更改文章
        this.openType = openType;//默认文章为查看
    }

    //产品添加拖拽事件
    initDragEvent($element) {
        $element.on('dragstart', function (e) {//开始移动
            // dragElement = this;//保存当前移动元素
            let dataTransfer = e.originalEvent.dataTransfer;
            let dragElementIndex = $(this).parent().children().index(this);//保存当前的位置
            dataTransfer.setData("dragElementIndex", dragElementIndex.toString());
        });

        $element.on('drop', function (e) {//进入元素
            let dataTransfer = e.originalEvent.dataTransfer;
            let dragElementIndex = dataTransfer.getData("dragElementIndex");
            let destIndex = $(this).parent().children().index(this);
            if (destIndex == dragElementIndex) {
                return;
            }
            let $children = $(this).parent().children();
            let dragElement = $children.get(dragElementIndex);
            if (destIndex > dragElementIndex) {//目标在后面 after
                $(dragElement).insertAfter(this);
            }
            if (destIndex < dragElementIndex) {//目标在前面 before
                $(dragElement).insertBefore(this);
            }
        });
    };

    //禁用默认的拖拽操作
    disableDragDefaultEvent() {
        $(document).on('dragover drop', function (e) {
            e.preventDefault();
        });
    }

    //添加副图，图片区域事件
    addImgEvent() {
        let that = this;
        return function () {
            let $that = $(this);
            that.loadModalImg("添加副图", function ($img) {
                let $e = $('<div style="height: 100px;width: 100px" class="page-img"><span class="img-close"></span> <img src="#" draggable="false"></div>');
                $that.before($e);
                $e.find("img").attr("src", $img.attr('src'));
                $e.find(".img-close").click(that.deleteImgEvent());
                $e.dblclick(that.updateImgEvent());
                if ($that.parent().children(".page-img").length >= 2) {
                    $that.addClass("hidden");
                }
            });
        }
    }

    //更新图片内容事件
    updateImgEvent() {
        let that = this;
        return function () {
            let $that = $(this);
            that.loadModalImg("修改图片", function ($img) {
                $that.find("img").attr("src", $img.attr('src'));
            })
        }
    }

    //删除副图，图片区域事件
    deleteImgEvent() {
        let that = this;
        return function () {
            let $that = $(this);
            bootbox.confirm({
                title: "警告",
                message: "确认要删除此副图？",
                callback: function (result) {
                    if (!result) return true;
                    let $parent = $that.parent();
                    let $grandpa = $parent.parent();
                    let $imgAdd = $grandpa.children(".img-add");
                    that.delElementRepord("image", $that.next());//元素删除前记录
                    $parent.remove();
                    if ($grandpa.children(".page-img").length <= 1) {
                        $imgAdd.removeClass("hidden");
                    }
                }
            });
        }
    }

    //删除产品或图片面板事件
    delGoodsOrPicturePanelEvent() {
        let that = this;
        return function () {
            let $that = $(this);
            bootbox.confirm({
                title: "警告",
                message: "确认要删除此产品，删除后无法恢复？",
                callback: function (result) {
                    if (!result) return true;
                    let $goods = $that.parents("li.page-li");
                    that.delElementRepord("goods", $goods);//元素删除前记录
                    $goods.remove();
                    that.toogleGoodsDemo();
                }
            })
        }
    }

    //记录删除的产品id或副图id
    delElementRepord(type, $that) {
        let that = this;
        if (type == "goods") {//删除的是产品
            let goods_id = $that.data("goodsId");
            /\d+/.test(goods_id) && that.deleteGoodsId.push(goods_id);
        }
        if (type == "image") {//删除的是图片
            let image_id = $that.data("imageId");
            /\d+/.test(image_id) && that.deleteImageId.push(image_id);
        }
    }

    //多行文本空间，TAB事件
    textareaTabEvent() {
        return function (e) {
            if (e.keyCode == 9) {
                e.preventDefault();
                let indent = '      ';
                let start = this.selectionStart;
                let end = this.selectionEnd;
                let selected = window.getSelection().toString();
                selected = indent + selected.replace(/\n/g, '\n' + indent);
                this.value = this.value.substring(0, start) + selected
                    + this.value.substring(end);
                this.setSelectionRange(start + indent.length, start
                    + selected.length);
            }
        }
    }

    //产品或图片面板添加完毕后，初始化元素交互
    initGoodsOrPicturePanel($panel) {
        let that = this;
        if ((that.empType == 1 || that.empType == 3) && that.openType == '编辑') {//组长具有这些事件
            //更新图片
            $panel.find(".page-img").dblclick(that.updateImgEvent());
            //删除面板
            $panel.find(".pannel-close").click(that.delGoodsOrPicturePanelEvent());
            //删除副图
            $panel.find(".img-close").click(that.deleteImgEvent());
            //添加副图
            $panel.find(".img-add").click(that.addImgEvent());
            that.initDragEvent($panel);//添加拖拽事件
        }
        //文本框TAB
        $panel.find("textarea").keydown(that.textareaTabEvent());
    }

    //渲染文章产品面板
    renderGoodsOrPaicturePanel(temp_id, options) {
        let that = this;
        options["emp_type"] = that.empType;
        options["open_type"] = that.openType;
        let $html = $(template(temp_id, options));
        that.$goodsWall.append($html);//产品墙添加产品
        that.initGoodsOrPicturePanel($html);//初始化产品面板事件
        that.toogleGoodsDemo();//判断是否删除demo图片
    }

    //显示或隐藏，示例产品面板
    toogleGoodsDemo() {
        let that = this;
        if (that.$goodsDemo.siblings().size() > 0) {
            that.$goodsDemo.addClass("hidden");
        } else {
            that.$goodsDemo.removeClass("hidden");
        }
    }

    //加载图片操作弹窗
    loadModalImg(title, callback) {
        let html = template('temp_img_upload', {});
        let dialog = bootbox.dialog({
            title: title,
            message: html,
            buttons: {
                concel: {
                    label: "取消"
                },
                ok: {
                    label: "确定",
                    callback: function () {
                        let $img = dialog.find("img");
                        if ($img.length != 1) {
                            bootbox.warning("请先添加图片再点击确定");
                            return false;
                        }
                        typeof callback == "function" && callback($img);//把图片img,jquery对象回调出来
                    }
                }
            }
        });
        dialog.init(function () {
            let $select_img = dialog.find("#select_img");
            let $display_img = dialog.find("#display_img");
            initPlUpload($select_img, null, $display_img);
        });
    }

    //初始化需要的页面元素
    initElement() {
        this.$goodsWall = $("#goods_list_well");
        this.$goodsDemo = $("#goods_demo");
    }
}

/**
 * 图片操作类，添加、修改、上传图片（单张）
 */
class ImageHandler extends ImageAbstract {
    constructor(empType, openType) {
        super(empType, openType);
    }

    //图片类初始化
    init(title) {
        let that = this;
        that.initElement();//初始化页面元素
        that.loadModalImg(title, function ($img) {
            that.renderGoodsOrPaicturePanel('temp_add_picture', {main_img: {image_id: "", addr: $img.attr('src')}});//渲染图片到文章墙
        });
    }
}

/**
 * 产品处理，选择主副图
 */
class GoodsHandler extends ImageAbstract {
    constructor(empType, openType) {
        super(empType, openType);
    }

    //初始化
    init(select_goods, callback) {
        let that = this;
        that.renderGoodsModal(select_goods, callback);//查询商品详情，并渲染主副图选择弹窗
    }

    //渲染主副图选择弹窗
    renderGoodsModal(select_goods, callback) {
        let that = this;
        TemaiApiHandler.getGoodsDetail(select_goods["sku_id"], function (commodity) {
            _.extend(commodity, select_goods);//把选择商品时的部分属性，扩充到商品属性上
            let html = template("temp_goods_img_select", commodity);
            let dialog = bootbox.dialog({
                title: "添加宝贝",
                message: html,
                className: "modal-goods-info",
                buttons: {
                    concel: {
                        label: "取消"
                    },
                    ok: {
                        label: "确定",
                        callback: function () {
                            let _main_img = that.$goodsMainImg.attr("src");
                            let _attach_img = that.$goodsAttachImg.attr("src");
                            if (_.isEmpty(_main_img) || _.isEmpty(_attach_img)) {
                                bootbox.warning("请先设置主图和副图，再点击确定。");
                                return false;
                            }
                            //主副图，渲染格式
                            commodity["main_img"] = {image_id: "", addr: _main_img};
                            commodity["attach_img"] = [{image_id: "", addr: _attach_img}];
                            //统一下，商品id key名称
                            commodity["sku_id"] = commodity["shop_goods_id"];
                            that.renderGoodsOrPaicturePanel("temp_add_goods", commodity);
                        }
                    }
                }
            });
            dialog.init(function () {
                typeof callback == "function" && callback();//主副图选择窗口，渲染前回调，关闭之前的商品查询弹窗
                that.initElement(dialog);//元素对象初始化
                that.initEvent();//事件初始化
            });
        })
    }

    //初始化元素事件
    initEvent() {
        let that = this;
        //图片双击事件
        that.$mainImg.dblclick(that.updateImgEvent());
        that.$attachImg.dblclick(that.updateImgEvent());
        //图片hover事件，显示主副图按钮
        that.dialog.find(".thumb-container").on({
            "mouseenter": function () {
                let $that = $(this);
                if (!$that.hasClass("main-selected") && !$that.hasClass("attach-selected")) {
                    $that.find(".set-img").show();
                }
            },
            "mouseleave": function () {
                let $that = $(this);
                if (!$that.hasClass("main-selected") && !$that.hasClass("attach-selected")) {
                    $that.find(".set-img").hide();
                }
            },
        });
        //设置主副按钮图点击事件
        that.dialog.find(".set-img-button").click(function () {
            let $that = $(this);
            let $parent = $that.parent();
            let $grandpa = $parent.parent();
            let $img = $parent.prev();
            if ($that.hasClass("set-attached-img-button")) {//选择副图
                that.$goodsAttachImg.attr("src", $img.attr("src"));
                that.dialog.find(".attach-selected").removeClass("attach-selected");
                $grandpa.addClass("attach-selected");
            } else {
                that.$goodsMainImg.attr("src", $img.attr("src"));
                that.dialog.find(".main-selected").removeClass("main-selected");
                $grandpa.addClass("main-selected");
            }
            $parent.hide();
        });
    }

    //初始化元素
    initElement(dialog) {
        super.initElement();
        this.dialog = dialog;
        this.$mainImg = dialog.find(".thumb-container.main");//主图父元素
        this.$attachImg = dialog.find(".thumb-container.attach");//副图父元素
        this.$goodsMainImg = this.$mainImg.find("img");//主图img
        this.$goodsAttachImg = this.$attachImg.find("img");//副图img
    }
}

class ArticlePage extends ImageAbstract {
    constructor(empType, openType, pageType) {
        super(empType, openType);
        this.goodsLibary = new GoodsLibary(empType, openType);
        this.imageHandler = new ImageHandler(empType, openType);
        this.deleteGoodsId = [];//记录删除产品id
        this.deleteImageId = [];//记录删除图片id(副图)
        this.pageType = pageType;
    }

    //添加产品
    addGoodsEvent() {
        let that = this;
        return function () {
            that.goodsLibary.init($(this));
        }
    }

    //添加图片
    addPictureEvent() {
        let that = this;
        return function () {
            that.imageHandler.init("添加图片");
        }
    }

    //初始化元素对象
    initElement() {
        super.initElement();
        this.$addGoods = $("#add_goods");//添加宝宝
        this.$addUploadImg = $("#add_upload_img");//上传图片
        this.$btnArticleSave = $("#btn_article_save");//保存文章
        this.$articleTitle = $("#article_title");//文章标题
        this.$articleDescription = $("#article_description");//文章描述
    }

    //初始化元素事件
    initEvent() {
        let that = this;
        if (that.openType == "编辑") {
            //上传图片（导语）
            that.$addUploadImg.click(that.addPictureEvent());
            //添加宝贝
            that.$addGoods.click(that.addGoodsEvent());
            //保存文章
            that.$btnArticleSave.click(that.articleSaveEvent());
        }
        //禁用默认拖拽效果
        that.disableDragDefaultEvent();
    }

    //获取整片文章的内容
    getArticleContent() {
        let that = this;
        let article = {
            article_id: that.$articleTitle.data("articleId"),
            article_type: that.$articleTitle.data("articleType"),
            article_title: that.$articleTitle.val(),
            article_description: that.$articleDescription.val(),
            deleteGoodsId: that.deleteGoodsId,//记录删除产品id
            deleteImageId: that.deleteImageId,//记录删除图片id(副图)
            goods: []
        };
        let $goods = that.$goodsWall.children("li[id!='goods_demo']");
        for (let i = 0, j = $goods.length; i < j; i++) {
            let $item = $($goods[i]);
            let $imgs = $item.find("img");//获取产品下的所有图片，第一张图为主图
            let goods = {};
            goods["goods_id"] = $item.data("goodsId");
            goods["goods_index"] = i + 1;//保存标签顺序，用于查询时排序
            if ($item.hasClass("img")) {//图片
                goods["type"] = "图片";
                goods["main_description"] = $item.find("textarea[name='picture_write']").val();
                goods["images"] = [{
                    image_id: $imgs.data("imageId"), img_index: 1, addr: $imgs.attr("src")
                }];
            }
            if ($item.hasClass("goods")) {//宝贝
                let commodity = $item.find("form").serializeForm();
                _.extend(goods, commodity);//商品详情数据，全部提交
                goods["type"] = "宝贝";
                goods["main_description"] = $item.find("textarea[name='main_write']").val();
                goods["attach_description"] = $item.find("textarea[name='attach_write']").val();
                goods["goods_title"] = $item.find("input[name='goods_title']").val();
                let images = [];
                for (let i = 0, j = $imgs.length; i < j; i++) {
                    let $img = $($imgs[i]);
                    let image_info = {};
                    image_info["image_id"] = $img.data("imageId");
                    image_info["img_index"] = i + 1;//保存标签顺序，用于查询时排序
                    image_info["addr"] = $img.attr("src");
                    images.push(image_info);
                }
                goods["images"] = images;
            }
            article["goods"].push(goods);
        }
        return article;
    }

    //保存文章事件
    articleSaveEvent() {
        let that = this;
        return function () {
            let $that = $(this);
            let article = that.getArticleContent();
            $.ajaxForm({
                url: "/TArticleManage/content/save",
                method: "POST",
                data: JSON.stringify(article),
                btn: that.$btnArticleSave,
                success: function (data) {
                    bootbox.success("文章保存成功");
                    if (that.pageType == "draft") {
                        $("#btn_return").click();
                    }
                }
            }, {
                contentType: "application/json"
            });
        }
    }

    openArticle(data) {
        let that = this;
        this.$article_zone = $("#article_zone");//文章区域
        data["emp_type"] = that.empType;
        data["open_type"] = that.openType;
        data["page_type"] = that.pageType;
        let html = template("temp_article", data);
        that.$article_zone.append(html);
    }

    //新增文章
    addArticle(obj) {
        let that = this;
        let data = {
            "title": "新建文章"
        };
        _.extend(data, obj || {});
        that.openArticle(data)
    }

    //修改文章
    editArticle(data) {
        let that = this;
        data["title"] = "修改文章";
        that.openArticle(data)
    }

    //通过修改数据，渲染产品面板
    renderGoodsOrPictureByEditData(data) {
        let that = this;
        if (!_.has(data, "goods") || !(data["goods"] instanceof Array)) {
            return bootbox.warning("这篇文章，没有获取到宝贝信息");
        }
        let goods = data["goods"];
        if (goods.length > 0) {
            goods.forEach(function (goods_info) {
                let images = goods_info["images"];//商品图片
                goods_info["main_img"] = images.length < 1 ? {} : images[0];//主图设置
                if (goods_info["type"] == "宝贝") {
                    goods_info["attach_img"] = images.length < 1 ? [] : images.slice(1);//宝贝产品，设置副图
                    that.renderGoodsOrPaicturePanel("temp_add_goods", goods_info);
                } else {
                    that.renderGoodsOrPaicturePanel("temp_add_picture", goods_info);
                }
            })
        }
    }

    //文章页面初始化
    init() {
        let that = this;
        that.initElement();
        that.initEvent();
    }
}

// 设置组员
class Employee {
    constructor() {
        this.added = [];
        this.unadd = [];//未添加数据
        this.employeeListUrl = "/PUser/user/employeeList";//设置组员，获取组员信息url
        this.employeeSaveUrl = "/PUser/user/employeeSave";//保存组员信息url
        this.leaderId = null;
    }

    //保存组员
    saveEmployee(dialog) {
        let that = this;
        let save_info = [];
        for (let key in that.added) {
            save_info.push(key);
        }
        $.ajaxForm({
            url: that.employeeSaveUrl,
            method: "POST",
            data: {leader_id: that.leaderId, save_info: save_info},
            success: function (data) {
                dialog.modal("hide");
                bootbox.info(data);
            }
        });
    }

    //远程获取，组员信息
    initItemBody() {
        let that = this;
        let data = that.leaderId ? {leader_id: that.leaderId} : {};
        $.ajaxForm({
            url: that.employeeListUrl,
            method: "POST",
            data: data,
            success: function (data) {
                that.added = data["added"];
                that.unadd = data["unadd"];
                for (let key in that.added) {
                    that.$rightBody.append('<div data-id="' + key + '" class="list-row item">' + that.added[key] + '</div>');
                }
                for (let key in that.unadd) {
                    that.$leftBody.append('<div data-id="' + key + '" class="list-row item">' + that.unadd[key] + '</div>');
                }
            }
        });
    }

    init(leader_id) {
        let that = this;
        that.leaderId = leader_id;
        that.initElement();
        that.initEvent();
        that.initItemBody();
    }

    toogleStyle($btn, $eventButton) {
        $btn.toggleClass("actived");
        let len = $btn.parent().children(".actived").size();
        if (len > 0) {
            $eventButton.removeClass("disabled");
            $eventButton.attr("disabled", false);
        } else {
            $eventButton.addClass("disabled");
            $eventButton.attr("disabled", true);
        }
    };

    changeEmployee(type) {
        let that = this;
        let $selectItem, $addBody;
        if (type == "add") {//添加
            $selectItem = $(".left-body .item.actived");
            $addBody = that.$rightBody;
            that.$rightButton.closeButton();
        } else {//删除
            $selectItem = $(".right-body .item.actived");
            $addBody = that.$leftBody;
            that.$leftButton.closeButton();
        }
        $selectItem.each(function () {
            let $that = $(this);
            let item = {id: $that.data("id"), user_name: $that.text()};
            $that.removeClass("actived");
            $addBody.append($that);//对方添加自己
            $addBody.scrollTop($addBody[0].scrollHeight);
            let id = $that.data("id");
            let user_name = $that.text();
            if (type == "add") {
                delete that.unadd[$that.data("id")];
                that.added[id] = user_name;
            } else {
                delete that.added[$that.data("id")];
                that.unadd[id] = user_name;
            }
        });
    };

    initElement() {
        this.$leftBody = $(".left-body");
        this.$rightBody = $(".right-body");
        this.$rightButton = $(".right-button");
        this.$leftButton = $(".left-button");
        this.$searchInput = $(".header .search > input");
    }

    initEvent() {
        let that = this;
        that.$leftBody.on("click", ".item", function () {//这种监听方式，添加的元素依然有效
            that.toogleStyle($(this), that.$rightButton);
        });
        that.$rightBody.on("click", ".item", function () {
            that.toogleStyle($(this), that.$leftButton);
        });
        that.$searchInput.change(function () {
            let $that = $(this);
            let text = $that.val().trim();
            that.$leftBody.empty();
            for (let key in that.unadd) {
                let reg = new RegExp(text);
                if (reg.test(that.unadd[key])) {
                    that.$leftBody.append('<div data-id="' + key + '" class="list-row item">' + that.unadd[key] + '</div>');
                }
            }
        });
        that.$rightButton.click(function () {
            that.changeEmployee("add");
        });
        that.$leftButton.click(function () {
            that.changeEmployee("del");
        });
    }
}

// 指派文章
class ArticlePoint {
    constructor() {
        this.added = [];
        this.unadd = [];//未添加数据
        this.pointerListUrl = "/TArticleManage/draft/pointerList";//设置组员，获取组员信息url
        this.pointerSaveUrl = "/TArticleManage/draft/pointerSave";//保存组员信息url
        this.articleId = null;
    }

    //保存组员
    savePointer(callback) {
        let that = this;
        let save_info = [];
        for (let key in that.added) {
            save_info.push(key);
        }
        $.ajaxForm({
            url: that.pointerSaveUrl,
            method: "POST",
            data: {article_id: that.articleId, save_info: save_info},
            success: function (data) {
                typeof callback == "function" && callback(data);
            }
        });
    }

    //远程获取，组员信息
    initItemBody() {
        let that = this;
        let data = that.articleId ? {article_id: that.articleId} : {};
        $.ajaxForm({
            url: that.pointerListUrl,
            method: "POST",
            data: data,
            success: function (data) {
                that.added = data["added"];
                that.unadd = data["unadd"];
                for (let key in that.added) {
                    that.$rightBody.append('<div data-id="' + key + '" class="list-row item">' + that.added[key] + '</div>');
                }
                for (let key in that.unadd) {
                    that.$leftBody.append('<div data-id="' + key + '" class="list-row item">' + that.unadd[key] + '</div>');
                }
            }
        });
    }

    init(article_id) {
        let that = this;
        that.articleId = article_id;
        that.initElement();
        that.initEvent();
        that.initItemBody();
    }

    toogleStyle($btn, $eventButton) {
        $btn.toggleClass("actived");
        let len = $btn.parent().children(".actived").size();
        if (len > 0) {
            $eventButton.removeClass("disabled");
            $eventButton.attr("disabled", false);
        } else {
            $eventButton.addClass("disabled");
            $eventButton.attr("disabled", true);
        }
    };

    changePointer(type) {
        let that = this;
        let $selectItem, $addBody;
        if (type == "add") {//添加
            $selectItem = $(".left-body .item.actived");
            $addBody = that.$rightBody;
            that.$rightButton.closeButton();
        } else {//删除
            $selectItem = $(".right-body .item.actived");
            $addBody = that.$leftBody;
            that.$leftButton.closeButton();
        }
        $selectItem.each(function () {
            let $that = $(this);
            let item = {id: $that.data("id"), user_name: $that.text()};
            $that.removeClass("actived");
            $addBody.append($that);//对方添加自己
            $addBody.scrollTop($addBody[0].scrollHeight);
            let id = $that.data("id");
            let user_name = $that.text();
            if (type == "add") {
                delete that.unadd[$that.data("id")];
                that.added[id] = user_name;
            } else {
                delete that.added[$that.data("id")];
                that.unadd[id] = user_name;
            }
        });
    };

    initElement() {
        this.$leftBody = $(".left-body");
        this.$rightBody = $(".right-body");
        this.$rightButton = $(".right-button");
        this.$leftButton = $(".left-button");
        this.$searchInput = $(".header .search > input");
    }

    initEvent() {
        let that = this;
        that.$leftBody.on("click", ".item", function () {//这种监听方式，添加的元素依然有效
            that.toogleStyle($(this), that.$rightButton);
        });
        that.$rightBody.on("click", ".item", function () {
            that.toogleStyle($(this), that.$leftButton);
        });
        that.$searchInput.change(function () {
            let $that = $(this);
            let text = $that.val().trim();
            that.$leftBody.empty();
            for (let key in that.unadd) {
                let reg = new RegExp(text);
                if (reg.test(that.unadd[key])) {
                    that.$leftBody.append('<div data-id="' + key + '" class="list-row item">' + that.unadd[key] + '</div>');
                }
            }
        });
        that.$rightButton.click(function () {
            that.changePointer("add");
        });
        that.$leftButton.click(function () {
            that.changePointer("del");
        });
    }
}