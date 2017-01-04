/**
 * Created by Ian on 2016/9/16.
 */
(function () {
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();

(function () {
    var c$ = {};
    c$ = $.extend(window.UI.c$, {});
    var b$ = window.BS.b$;
    var _MC = c$.MessageCenter;

    /// 本单元的处理
    var _U = {};

    /// 缓存记忆
    _U.cache = {
            key:'feedback_speedtest',
            current:{},
            load:function () {
                t$ = this;
                var _c = window.localStorage.getItem(t$.key) || null;
                if (_c){
                    try{
                        var obj = JSON.parse(_c);
                        t$.current = obj;
                    }catch(e){}
                }
            },
            save:function () {
                var t$ = this;
                if (t$.current){
                    var dataStr = JSON.stringify(t$.current);
                    window.localStorage.setItem(t$.key, dataStr);
                }
            }
    };


    /// 先加载
    _U._preLoadTempFile = function(){
        var t$ = this;
        $.templateLoaderAgent(["templates/feedback.tmpl.html"], function(){
            t$.showFeedBackDialog();
        });
    };

    /// 显示反馈对话框
    _U.showFeedBackDialog = function () {
        var win = $('#feedBack-window');
        if (!win.data('kendoWindow')){
            win.kendoWindow({
                actions: ["Close"],
                title: "Feedback",
                width: '700px',
                height: '400px',
                resizable: false,
                model:false
            });

            var contentTemplate = kendo.template($('#template-window-feedback').html());
            win.html(contentTemplate({}));

            var validator = $("#feedbackForm").kendoValidator().data("kendoValidator"),
                status = $("#feedbackForm > .status");

            //初始化控件
            _U.cache.load();
            $('#feedback-ui-name').val(_U.cache.current.userName || "");
            $('#feedback-ui-email').val(_U.cache.current.email || "");
            $('#feedback-ui-messege').val(_U.cache.current.messege || "");

            //绑定事件
            $("#feedBack-window > div > div.k-footer > .k-button").kendoButton({
                click: function() {
                    var t$ = this;
                    t$.enable(false);

                    if (validator.validate()) {
                        var userName = $('#feedback-ui-name').val();
                        var email = $('#feedback-ui-email').val();
                        var message = $('#feedback-ui-message').val();

                        _U.cache.current = {
                            userName: userName,
                            email: email
                        };

                        _U.cache.save();

                        /// 反馈给服务器
                        $.feedbackInfo({
                            userName: userName,
                            email: email,
                            message: message
                        });
                    }

                    setTimeout(function(){
                        t$.enable(true);
                    },5000);
                }
            });

        }

        var w = win.data('kendoWindow');
        w.center();
        w.open();

    };

    //////////////////////////////
    //绑定可识别的消息
    _MC.register("FeedBackDialog.show", function(e){_U._preLoadTempFile()});
    _MC.register("FeedBackDialog.cache.load", function(e){_U.cache.load()});
    _MC.register("FeedBackDialog.cache.save", function(e){_U.cache.save()});

    window.UI.c$ = $.extend(window.UI.c$, c$);
})();