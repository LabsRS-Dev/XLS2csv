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
  var _MC = c$.MessageCenter; //

  /**
   * 本地设置存储器
   * @type {{obs: *, bind: c$.localSettingsWrap.bind, unbind: c$.localSettingsWrap.unbind, bindOnChange: c$.localSettingsWrap.bindOnChange, setItem: c$.localSettingsWrap.setItem, getItem: c$.localSettingsWrap.getItem}}
   */
  c$.localSettingsWrap = {
    obs: (new kendo.Observable()),
    bind: function (event, cb) {
      this.obs.bind(event, cb || function (e) {
          });
    },
    unbind: function (event, cb) {
      this.obs.unbind(event, cb);
    },
    bindOnChange: function (cb) {
      this.bind("onChange", cb || function (e) {
          });
    },
    setItem: function (key, value) {
      if ($.trim(key) === "") return;

      var jsonStrValue = JSON.stringify(value);
      var oldValue = localStorage.getItem(key);
      if (oldValue !== jsonStrValue) {
        localStorage.setItem(key, jsonStrValue);
        this.obs.trigger("onChange", {key: key, curValue: value, oldValue:oldValue});
      }
    },

    getItem: function (key) {
      var value;
      value = (value = localStorage.getItem(key)) && JSON.parse(value);
      return value;
    }
  };

  var f$ = {};
  // 发现出错，弹出警告
  f$.show_Dlg = function (info) {
    var message = {
      title: "Test Error",
      message: info,
      buttons: ["OK"],
      alertType: "Information"
    };
    b$.Notice.alert(message);
  };

  // report Error
  f$.reportError = function (error) {
    var appName = BS.b$.App.getAppName();
    var appVersion = BS.b$.App.getAppVersion();
    var sn = BS.b$.App.getSerialNumber();
    var info = BS.b$.App.getRegInfoJSONString();
    var sandbox = BS.b$.App.getSandboxEnable();
    $.reportInfo({
      appName: appName,
      version: appVersion,
      sn: sn,
      info: info,
      sandbox: sandbox,
      error: error
    });
  };

  //绑定可识别的消息
  _MC.register("show_Dlg", function (e) {
    f$.show_Dlg(e.data)
  });
  _MC.register("reportError", function (e) {
    f$.reportError(e.data)
  });


  window.UI.c$ = $.extend(window.UI.c$, c$);
})();

