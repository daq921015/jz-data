let initPlUpload = function ($select_img, $upload_img, $display_img) {
    let url = $display_img.data("url");
    let uploader = new plupload.Uploader({
        browse_button: $select_img[0],
        url: url,
        flash_swf_url: '/public/common/plupload/Moxie.swf',
        silverlight_xap_url: '/public/common/plupload/js/Moxie.xap',
        multi_selection: false,
        drop_element: $display_img[0],
        max_retries: 1,
        multipart_params: {
            isJson: true
        },
        unique_names: true,
        filters: {
            max_file_size: '2mb',
            mime_types: [
                {title: "图片类型", extensions: "jpg,gif,png"}
            ],
            prevent_duplicates: true
        },
        init: {
            PostInit: function () {
            },
            FilesAdded: function (up, files) {
                // uploader.files.splice(0, uploader.files.length);
                uploader.start();
            },
            FileUploaded: function (up, files, res) {
                let resp = $.parseJSON(res.response);
                if (!resp) throw Error("上传图片，返回文本异常");
                if (res.status == 200 && resp.status == "success") {
                    $display_img.empty();
                    $display_img.append('<img class="" src="' + resp.data.src + '" />');
                } else {
                    bootbox.alert({
                        title: "上传失败",
                        message: resp.msg
                    });
                }
            }
        }
    });
    uploader.init();
};
$(document).on('paste', '#display_img', function (eventObj) {
    let $display_img = $(this);
    let url = $display_img.data("url");
    // 处理粘贴事件
    let event = eventObj.originalEvent;
    let imageRe = new RegExp(/image\/.*/);
    let fileList = $.map(event.clipboardData.items, function (o) {
        if (!imageRe.test(o.type)) {
            return
        }
        return o.getAsFile();
    });
    if (fileList.length <= 0) {
        return
    }
    //阻止默认行为即不让剪贴板内容在p中显示出来
    event.preventDefault();
    let form_data = new FormData();
    let file = fileList[0];//只上传一张
    // file["name"] = Math.floor(Math.random() * 100000);
    form_data.append('file', file);
    $.ajax({
        url: url,
        type: 'POST',
        data: form_data,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res.status == "success") {
                $display_img.empty();
                $display_img.append('<img class="" src="' + res.data.src + '" />');
            } else {
                bootbox.alert({
                    title: "上传失败",
                    message: res.msg
                });
            }
        },
        error: function () {
            alert("上传图片错误");
        }
    });
});

