/**
 * Created by Ian on 2015/8/16.
 * App 全局性的可配置文件. 每个项目都可以有自己的配置处理，然后自己来处理
 */

(function () {
  window['UI'] = window['UI'] || {};
  window.UI.c$ = window.UI.c$ || {};
})();

(function () {
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var c$ = {};
  c$ = $.extend(window.UI.c$, {});
  var b$ = BS.b$;
  var _MC = c$.MessageCenter; //

  c$.Config = {
    pluginList: [],
    /// 获取本地扩展插件集合
    getNativePluginList: function () {
      var t$ = this;
      return t$.pluginList;
    },

    /**
     * 注册
     * @param plugin
     */
    registerPlugin: function (plugin) {
      var t$ = this;
      t$.pluginList.push(plugin);
    }
  };

  //////////////////////////////
  //绑定可识别的消息
  _MC.register("registerPlugin", function (e) {
    c$.Config.registerPlugin(e.data);
  });


  window.UI.c$ = $.extend(window.UI.c$, c$);
}());