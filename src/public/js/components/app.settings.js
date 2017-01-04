/**
 * Created by Ian on 2016/1/17.
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


  var f$ = {};

  f$._buildUI = function(_data){
    var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_settings'] || {});
    var winId = 'win-settings';
    if ($('#' + winId).length === 0) {
      $("body").append('<div id="' + winId + '\" class=\"wrap-window\" ></div>');
    }
    var sel = $('#' + winId);

    var w = sel.data("kendoWindow");
    if (!w) {
      sel.kendoWindow({
        actions: ["Pin", "Minimize", "Maximize", "Close"],
        width: "400px",
        height: "300px",
        title: _l10n.windowTitle,
        resizable: true
      });

      w = sel.data("kendoWindow");
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      var _$model, _$view, _$rotue;
      /// 数据模型
      _$model = kendo.observable({
        //settings-lang 语言包选择
        langSelectLabel: _l10n.langSelectLabel,
        langSelectHint: "",

        btnCancel: _l10n.btnCancel,
        btnOK: _l10n.btnOK,

        //-- combobox 处理
        selectedLang: c$.languageMap.local[c$.l10nLangKey],
        langList:(function(){
          var list = [];
          var lmap = c$.languageMap.local;
          for(var key in lmap){
            list.push({key:key, value:lmap[key]})
          }
          return list;
        }()),
        isLangChanged: false,
        onLangChange:function(e){
          var t$ = this;
          var changed = (c$.l10nLangKey !== t$.selectedLang);
          t$.set("isLangChanged", changed);
          changed ? t$.set("langSelectHint", _l10n.langSelectHint) : t$.set("langSelectHint", "");
        },

        //配置视图\更新视图
        updateView:function(){
          var r$ = this;

          $.RTYUtils.queue()
              .next(function(next){
                $('#' + winId)
                    .on('click', '[tag-action="item-ok"]', function (e) {
                      console.log('[tag-action="item-ok"]');

                      if(r$.isLangChanged){
                        //保存选择的语言标签
                        c$.setUserCustomLanguage(r$.selectedLang);
                        alert(_l10n.langSelectHint);
                      }
                      $('#' + winId).data("kendoWindow").close();
                    })
                    .on('click', '[tag-action="item-cancel"]', function (e) {
                      console.log('[tag-action="item-cancel"]');
                      $('#' + winId).data("kendoWindow").close();
                    });

                next && next();
              })
              .done(function(err){
                console.log("end");
              });
        }


      });

      /// 主视图
      _$view = new kendo.View("tmpl-settings", {
        model:_$model,
        init: function(){
          var t$ = this;
          t$.model.updateView();
        }
      });

      /// 路由
      _$rotue = new kendo.Router({
        init: function () {
          _$view.render('#' + winId);
        }
      });

      /// 启动路由
      _$rotue.start();

      w["_$model"] = _$model;

    }else{

    }

    w.center();
    w.open();
  };

  /**
   * 加载模板，构建UI
   * @param data
   * @private
   */
  f$._preLoadTempFile = function(data){
    var t$ = this;
    $.templateLoaderAgent(["templates/settings.tmpl.html"], function(){
      t$._buildUI(data);
    });


  };

  /**
   * 销毁配置窗体
   * @param _data
   */
  f$._destroyUI = function(_data){
    var winId = 'win-settings';
    var sel = $('#' + winId);
    var w = sel.data("kendoWindow");
    if(w){
      w.destroy();
    }
  };

  //////////////////////////////
  //绑定可识别的消息
  /// 配置页面
  _MC.register("settings.callSettingsView", function (e) {
    f$._preLoadTempFile(e.data);
  });
  _MC.register("settings.freeSettingsView", function (e) {
    f$._destroyUI(e.data);
  });


  // 绑定关联
  c$.openSettingsWindow = function(){
    _MC.send("settings.callSettingsView");
  };


  window.UI.c$ = $.extend(window.UI.c$, c$);
})();