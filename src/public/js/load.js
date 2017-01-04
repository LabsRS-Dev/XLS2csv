/**
 * Created by Ian on 2016/10/18.
 */

(function () {
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var b$ = BS.b$;

    var _U =  {};

    _U.launch = function () {
        var t$ = this;

        var kendoui_url = $.RTY_Config.kendoui_url = "common/kendoui/v2016.3.914";
        var kendoui_stype = "black";
        //var kendoui_url = "http://kendo.cdn.telerik.com/2016.3.914";

        var cssUrls = [
            kendoui_url + "/styles/kendo.common.min.css",
            kendoui_url + "/styles/kendo.rtl.min.css",
            kendoui_url + "/styles/kendo." + kendoui_stype + ".min.css",
            kendoui_url + "/styles/kendo.dataviz.min.css",
            kendoui_url + "/styles/kendo.dataviz." + kendoui_stype + ".min.css",
        ];

        var jsUrls = [

            //<!--UI第三方库-->
            "common/jquery/jszip.min.js",
            kendoui_url + "/js/kendo.all.min.js",
            // kendoui_url + "/js/messages/kendo.messages.en-US.min.js",
            // kendoui_url + "/js/cultures/kendo.culture.en-US.min.js",

            //<!--插件部分加载-->

            //<!--扩展加载-->
            "js/extends/business.native.js",
            "js/extends/l10n.js",

            //<!--App 核心-->
            "js/core/app.observer.js",
            "js/core/app.config.js",
            "js/core/app.util.js",

            //<!--App 插件-->
            "js/plugins/plugin.xls2csv.js",

            //<!--App UI组件-->
            "js/components/app.item.config.js",
            "js/components/app.feedback.js",
            "js/components/app.settings.js",
            "js/components/app.main.js",

            // <!--App 启动-->
            "js/app.js",
        ];
        $.RTYUtils.queue()
            .next(function(nxt){
                var _f = function(urls){
                    if (urls.length > 0){
                        /**
                         * 备注：
                         * $.RTY_3rd_Ensure.ensure 完全兼容多款浏览器，
                         * $.RTYUtils.loadCSS 不支持Safari
                         */
                        $.RTY_3rd_Ensure.ensure({css: urls.shift()}, function () {  _f && _f(urls);})
                        //$.RTYUtils.loadCSS(urls.shift(), function () {  _f && _f(urls);})
                    }else{
                        nxt && nxt();
                    }
                };

                _f(cssUrls);
            })
            .next(function(nxt){
                var _f = function(urls){
                    if (urls.length > 0){
                        /**
                         * 备注：
                         * $.RTY_3rd_Ensure.ensure 完全兼容多款浏览器，
                         * $.RTYUtils.loadScript 不支持Safari
                         */
                        $.RTY_3rd_Ensure.ensure({js: urls.shift()}, function () {_f && _f(urls);})
                        //$.RTYUtils.loadScript(urls.shift(), function () {_f && _f(urls);})
                    }else{
                        nxt && nxt();
                    }
                };

                _f(jsUrls);
            })
            .done(function(nxt){
                console.log('----------- load complate ----------------');
            })

    };

    //-----------------------------------------------------------------------------------------------------------------
    $(document).ready(function () {
        _U.launch();
    });

}());