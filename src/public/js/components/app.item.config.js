/**
 * Created by Ian on 2016/1/15.
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

  f$.getDefaultConfig = function () {
    return {
      sheetName: undefined,
      exportOnly: false,
      encode: "utf-8",
      separator: ","
    };

  };

  f$._buildUI = function (_data) {
    var params = _data || {
          data: {
            uid: ""
          }
        };

    var $dataItem = params;

    var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_config'] || {});

    //动态创建div_id,然后创建内容,配置
    var winId = 'win-' + $dataItem.uid;
    if ($('#' + winId).length === 0) {
      $("body").append('<div id="' + winId + '\" class=\"wrap-window\" ></div>');
    }
    var sel = $('#' + winId);

    var w = sel.data("kendoWindow");
    if (!w) {
      sel.kendoWindow({
        actions: ["Pin", "Minimize", "Maximize", "Close"],
        width: "800px",
        height: "600px",
        title: _l10n.windowTitle,
        resizable: true
      });

      //var contentTemplate = kendo.template($('#tmpl-config').html());
      //sel.html(contentTemplate({}));

      w = sel.data("kendoWindow");

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      var _$model, _$view, _$rotue;
      /// 数据模型
      _$model = kendo.observable({
        configInfo: _l10n.configInfo + $dataItem.path,

        optionSheetTitle: _l10n.optionSheetTitle,
        optionOthersTitle: _l10n.optionOthersTitle,

        btnCancel: _l10n.btnCancel,
        btnOK: _l10n.btnOK,
        btnApplyAll: _l10n.btnApplyAll,
        btnDefault: _l10n.btnDefault,


        //////////////////////////////////////////////////////////////////////////////////////////////////////////

        updateConfigWith: function (config) {
          config = config || f$.getDefaultConfig();
          var sel_str = "";

          //Page-Sheet
          sel_str = '#' + winId + ' .option-sheet [tag-id="sheet-id"] ';
          config.sheetName && $(sel_str).data("kendoDropDownList").value(config.sheetName);

          sel_str = '#' + winId + ' .option-sheet [tag-id="check_only"] ';
          $(sel_str).attr('checked', config.exportOnly);

          //Page-Others
          sel_str = '#' + winId + ' .option-others [tag-id="encoding-list"] ';
          $(sel_str).data("kendoDropDownList") && $(sel_str).data("kendoDropDownList").value(config.encode);

          sel_str = '#' + winId + ' .option-others [tag-id="separator-list"] ';
          $(sel_str).data("kendoComboBox") && $(sel_str).data("kendoComboBox").value(config.separator);
        },

        _getLastUserConfig: function () {
          var sel_str = "";
          var config = f$.getDefaultConfig();

          //Page-Sheet
          sel_str = '#' + winId + ' .option-sheet [tag-id="sheet-id"] ';
          config.sheetName = $(sel_str).data("kendoDropDownList").value();

          sel_str = '#' + winId + ' .option-sheet [tag-id="check_only"] ';
          config.exportOnly = $(sel_str).prop('checked');

          //Page-Others
          sel_str = '#' + winId + ' .option-others [tag-id="encoding-list"] ';
          config.encode = $(sel_str).data("kendoComboBox").value();

          sel_str = '#' + winId + ' .option-others [tag-id="separator-list"] ';
          config.separator = $(sel_str).data("kendoComboBox").value();

          return config;
        },

        _updateXlsInfo: function (infoData) {

        },

        _updateSheetInfo: function (infoData) {
          var t$ = this;
          infoData = infoData || {};
          var ds_info = infoData.sheets || [
                {
                  name: "DemoSpeed", rowCount: 1, max_colCount: 4, pos: 0, viewData: [
                  ['id', 'name', 'age', 'studio'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB'],
                  ['20140414', 'lab', 2014, 'RomanysoftLAB']
                ]
                }
              ];
          var sel_str = '#' + winId + ' .option-sheet [tag-id="sheet-id"] ';

          var ctrl = $(sel_str).data("kendoDropDownList");
          if (!ctrl) {
            $(sel_str).kendoDropDownList({
              dataTextField: "name",
              dataValueField: "name",
              dataSource: ds_info,
              index: 0,
              select: function (e) {
                var dataItem = this.dataItem(e.item.index());
                t$._updateSheetInfo_Information(dataItem);
                t$._updateSheetInfo_Preview(dataItem);
              }
            });

            ctrl = $(sel_str).data("kendoDropDownList");
          }

          t$._updateSheetInfo_Information(ds_info[0]);
          t$._updateSheetInfo_Preview(ds_info[0]);

        },

        _updateSheetInfo_Information: function (infoData) {
          var ds_info = {
            caption: _l10n.PageSheet.InformationCaption,
            xlsdata: infoData || {}
          };

          var sel_str = '#' + winId + ' .option-sheet .sheet-content-info';
          var cpl = kendo.template($('#sheet-info-template').html());
          $(sel_str).html(cpl(ds_info));

        },

        _updateSheetInfo_Preview: function (infoData) {
          var ds_info = {
            caption: _l10n.PageSheet.PreviewCaption,
            xlsdata: infoData || {}
          };

          var sel_str = '#' + winId + ' .option-sheet .sheet-content-preview';
          var cpl = kendo.template($('#sheet-preview-template').html());
          $(sel_str).html(cpl(ds_info));
        },

        _updateOtherOptions: function (infoData) {
          var t$ = this;

          infoData = infoData || {
                encodings: ['utf-8', 'utf-16'],
                separators: []
              };
          var ds_info = infoData;

          ds_info.separators = [
            {name: ',', value: ','},
            {name: 'Tab', value: '\t'},
            {name: '.', value: '.'},
            {name: 'space', value: ' '}
          ];

          var sel_str = "";

          /// encoding-list
          // 格式化编码
          var fmEncodings = [], fmIndex = 0;
          $.each(ds_info.encodings, function (index, enc) {
            var fm_enc = {
              name: $.trim(enc).toUpperCase(),
              value: enc
            };

            if ($.trim(enc).toUpperCase() === "UTF-8")
              fmIndex = index;

            fmEncodings.push(fm_enc);
          });

          sel_str = '#' + winId + ' .option-others [tag-id="encoding-list"] ';
          if (!$(sel_str).data("kendoComboBox")) {
            $(sel_str).kendoComboBox({
              dataTextField: "name",
              dataValueField: "value",
              index: fmIndex,
              dataSource: fmEncodings,
              select: function (e) {
                var dataItem = this.dataItem(e.item.index());
              }
            });
          }

          /// separator-list
          sel_str = '#' + winId + ' .option-others [tag-id="separator-list"] ';
          if (!$(sel_str).data("kendoComboBox")) {
            $(sel_str).kendoComboBox({
              dataTextField: "name",
              dataValueField: "value",
              dataSource: ds_info.separators,
              index: 0,
              select: function (e) {
                var dataItem = this.dataItem(e.item.index());
              }
            });
          }


        },

        // 更新视图
        updateView: function () {
          var r$ = this;


          $.RTYUtils.queue()
              //MainView
              .next(function (next) {
                $('#' + winId)
                    .on('click', '[tag-action="item-default"]', function (e) {
                      console.log('[tag-action="item-default"]');
                      r$.updateConfigWith();
                    })
                    .on('click', '[tag-action="item-applyAll"]', function (e) {
                      console.log('[tag-action="item-applyAll"]');
                      _MC.send('main.applyConfigToOthers', r$._getLastUserConfig());
                    })
                    .on('click', '[tag-action="item-ok"]', function (e) {
                      console.log('[tag-action="item-ok"]');
                      $dataItem.get('config').set('last', r$._getLastUserConfig());
                      $('#' + winId).data("kendoWindow").close();
                    })
                    .on('click', '[tag-action="item-cancel"]', function (e) {
                      console.log('[tag-action="item-cancel"]');
                      $('#' + winId).data("kendoWindow").close();
                    });

                next && next();
              })
              //Page-Sheet
              .next(function (next) {
                //sheet select setting
                var uiConfig = {
                  sectionTitle: _l10n.PageSheet.sectionTitle,
                  checkBoxLabel: _l10n.PageSheet.checkBoxLabel,
                  checkboxID: "chx" + Date.now()
                };
                var cpl = kendo.template($('#option-sheet-template').html());
                $('#' + winId + " .option-sheet").html(cpl(uiConfig));

                next && next();
              })
              .next(function (next) {
                //other
                var uiConfig = {
                  encodingLabel: _l10n.PageOthers.encodingLabel,
                  separatorLabel: _l10n.PageOthers.separatorLabel
                };
                var cpl = kendo.template($('#option-others-template').html());
                $('#' + winId + " .option-others").html(cpl(uiConfig));

                next && next();
              })
              .next(function (next) {
                _MC.send('plugin.xls2csv.getXlsFileInfo', {
                  config: {
                    helperID: $dataItem.uid,
                    filePath: $dataItem.path
                  },

                  cb: function (infoData) {
                    r$._updateSheetInfo(infoData);
                    r$._updateOtherOptions(infoData);
                    next && next();
                  }
                });
              })
              .next(function (next) {
                //更新配置
                r$.updateConfigWith($dataItem.config.last);

                next && next();
              })
              .done(function (err) {
                console.log("end");
              });
        }

      });

      /// 主视图
      _$view = new kendo.View("tmpl-config", {
        model: _$model,
        init: function () {
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
    } else {
      w["_$model"].updateConfigWith($dataItem.config.last);
    }

    w.center();
    w.open();
  };

  f$._preLoadTempFile = function (data) {
    var t$ = this;
    $.templateLoaderAgent(["templates/config.tmpl.html"], function(){
      t$._buildUI(data);
    });
  };

  /**
   * 销毁配置窗体
   * @param _data
   */
  f$._destroyUI = function (_data) {
    var params = _data || {
          data: {
            uid: ""
          }
        };

    var $dataItem = params;

    //动态创建div_id,然后创建内容,配置
    var winId = 'win-' + $dataItem.uid;
    var sel = $('#' + winId);
    var w = sel.data("kendoWindow");
    if (w) {
      w.destroy();
    }

  };


  //////////////////////////////
  //绑定可识别的消息
  /// 配置页面
  _MC.register("item.config.callConfigView", function (e) {
    f$._preLoadTempFile(e.data);
  });
  _MC.register("item.config.freeConfigView", function (e) {
    f$._destroyUI(e.data);
  });
  _MC.register("item.config.getDefaultConfig", function (e) {
    if ($.isFunction(e.data)) {
      var cb = e.data;
      cb(f$.getDefaultConfig());
    }
  });


  window.UI.c$ = $.extend(window.UI.c$, c$);
})();