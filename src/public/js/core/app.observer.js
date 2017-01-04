/**
 * Created by Ian on 2015/8/18.
 */

(function () {
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();

(function () {
    var c$ = {};
    c$ = $.extend(window.UI.c$, {});
    var b$ = window.BS.b$;

    // 定义总线消息观察者
    c$.MessageCenter = {
        obs:(new kendo.Observable()),
        register:function(messageCode, fn, isOne){
            !isOne ? this.obs.bind(messageCode, fn) : this.obs.one(messageCode, fn);
        },
        send:function(messageCode, data){
            this.obs.trigger(messageCode, {"data":data ||{}});
        }
    };

    window.UI.c$ = $.extend(window.UI.c$, c$);
})();
