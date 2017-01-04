/**
 * Created by Ian on 2016/1/18.
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

  /**
   * 插件内部数据
   * @type {{callMethod: string, tool: {key: string, path: string, method: string, type: string, mainThread: boolean}}}
   */
  f$.plguinData = {
    callMethod: "call",
    tool: {
      key: "xls2csv",
      path: "xls2csv.dylib",
      method: "CLI",
      type: "dylib",
      mainThread: false
    }
  };

  f$.taskID = 1; // 插件任务初始化值

  /**
   * 读取xls文件的内容，获得相关数据
   * @param _path
   * @param cb
   */
  f$.get_xls_file_info = function (_config, cb) {
    var t$ = this;

    var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_config'] || {});

    //创建获取任务
    var copyPlugin = $.objClone(t$.plguinData);
    copyPlugin.tool.command = b$.formatCommand(["-g", {
      data: {
        "$api": "GetXLSFileInfo",
        "filePath": _config.filePath || ""
      }
    }]);

    b$.createTask(copyPlugin.callMethod, ++t$.taskID, [copyPlugin.tool], b$._get_callback(function (obj) {
      b$.autoStartTask(obj, b$._get_callback(function (obj) {
        console.log("[plugin.xls2csv]\n" + $.obj2string(obj));

        //非Native测试代码
        if(!b$.pN){ cb && cb();return;}

        var infoType = obj.type;
        if(infoType === 'type_clicall_reportprogress'){
          try{
            var data = JSON.parse(obj["CLIStateData"]["infoText"]);
            if(data.hasOwnProperty("error")){
              alert(_l10n["Error"]["GetXLSInfoErrWithCantOpenFile"]);
            }else if(data.hasOwnProperty("getXLSFileInfo")){
              cb && cb(data.getXLSFileInfo);
            }
          }catch(e){console.error(e)}
        }
      }, true));
    }, true));
  };

  /**
   * 启动xls2csv任务
   * @param _config
   * @param cb
   */
  f$.start_xls2csv_task = function (_config, cb) {
    var t$ = this;

    var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_config'] || {});

    //创建获取任务
    var copyPlugin = $.objClone(t$.plguinData);
    copyPlugin.tool.command = b$.formatCommand(["-g", {
      helperID:_config.helperID || "",
      data: {
        "$api": "ExportToCSV",
        "filePath": _config.filePath || "",
        "encoding": _config.encoding || "UTF-8",
        "separate": _config.separate || ",",
        "sheet": _config.sheet || "",
        "defaultOpenEncoding": _config.defaultOpenEncoding || "UTF-8",
        "outputDir": _config.outputDir || "",
        "outputFilePath":_config.outputFilePath || "",
        "useSpeCSVFilePath":false,
        "mustCreateDir":true
      }
    }]);

    b$.createTask(copyPlugin.callMethod, ++t$.taskID, [copyPlugin.tool], b$._get_callback(function (obj) {
      b$.autoStartTask(obj, b$._get_callback(function (obj) {
        console.log("[plugin.xls2csv]\n" + $.obj2string(obj));

        //非Native测试代码
        if(!b$.pN){ cb && cb();return;}

        var infoType = obj.type;
        if(infoType === 'type_clicall_reportprogress'){
          try{
            var data = JSON.parse(obj["CLIStateData"]["infoText"]);
            if(data.hasOwnProperty("getExportToCSVInfo")){
              var exportInfoObj = data.getExportToCSVInfo;
              cb && cb(exportInfoObj.progress, exportInfoObj.error);
            }
          }catch(e){console.error(e)}
        }
      }, true));
    }, true));
  };

  /**
   * 停止xls2csv任务
   * @param _config
   * @param cb
   */
  f$.stop_xls2csv_task = function (_config, cb) {
    var t$ = this;

    var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_config'] || {});

    //创建获取任务
    var copyPlugin = $.objClone(t$.plguinData);
    copyPlugin.tool.command = b$.formatCommand(["-g", {
      helperID:_config.helperID || "",
      data: {
        "$api": "StopExportToCSV"
      }
    }]);

    b$.createTask(copyPlugin.callMethod, ++t$.taskID, [copyPlugin.tool], b$._get_callback(function (obj) {
      b$.autoStartTask(obj, b$._get_callback(function (obj) {
        console.log("[plugin.xls2csv]\n" + $.obj2string(obj));

        //非Native测试代码
        if(!b$.pN){ cb && cb();return;}

        var infoType = obj.type;
        if(infoType === 'type_clicall_reportprogress'){
          try{
            var data = JSON.parse(obj["CLIStateData"]["infoText"]);
            if(data.hasOwnProperty("getStopExportToCSV")){
              cb && cb();
            }
          }catch(e){console.error(e)}
        }
      }, true));
    }, true));
  };


  //////////////////////////////
  //绑定可识别的消息
  var regPre = "plugin.xls2csv.";
  _MC.register(regPre + "getXlsFileInfo", function (e) {
    f$.get_xls_file_info(e.data.config, e.data.cb);
  });
  _MC.register(regPre + "startXls2CSVTask", function (e) {
    f$.start_xls2csv_task(e.data.config, e.data.cb);
  });
  _MC.register(regPre + "stopXls2CSVTask", function (e) {
    f$.stop_xls2csv_task(e.data.config, e.data.cb);
  });


  //////////////////////////////
  //插件注册
  _MC.send("registerPlugin", f$.plguinData);


  window.UI.c$ = $.extend(window.UI.c$, c$);
})();