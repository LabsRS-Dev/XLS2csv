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

    var _$U = {};

    _$U._configKendoLocalization = function () {
        var kendoui_url = $.RTY_Config.kendoui_url;
        if (kendoui_url){
            baseMessageUrl = kendoui_url + "/js/messages/kendo.messages.";
            baseCultureUrl = kendoui_url + "/js/cultures/kendo.culture.";

            // 获取当前语言标识。然后通过兼容获取可能的文件列表
            var compatibleObj = $.RTYUtils.googleLangIDMaps[c$.l10nLangKey];
            if (!compatibleObj) return;

            var cfku = compatibleObj.compatibleForKendoUI;

            var key_culture = "en-US", key_message = "en-US";
            if(cfku.culture.length > 0)
                key_culture = cfku.culture;
            if(cfku.message.length > 0)
                key_message = cfku.message;

            var js_url_calture = baseCultureUrl + key_culture + ".min.js",
            js_url_message = baseMessageUrl + key_message + ".min.js";


            $.RTYUtils.queue()
                .next(function(nxt){
                    $.RTY_3rd_Ensure.ensure({js: js_url_calture}, function () {
                        kendo.culture(key_culture);
                        nxt && nxt();
                    },function(list){
                        nxt && nxt();
                    });
                })
                .next(function(nxt){
                    $.RTY_3rd_Ensure.ensure({js: js_url_message}, function () {
                        nxt && nxt();
                    },function(list){
                        nxt && nxt();
                    });
                })
                .done(function(nxt){
                    console.log('cultrue: ' + key_culture + ' ,message: ' + key_message);
                    console.log('----------- load kendo Globalization and Localization complate ----------------');
                })
        }
    };

    _$U._buildMainUI = function () {
        ///
        var _l10n = c$.l10nFormatObj(c$.l10n.UI['view_main'] || {});

        /// 数据模型
        var model = kendo.observable({
            appLogoImgUrl: 'images/logo_128.png',
            appName: '<a href="javascript:void(0)">' + b$.App.getAppName() + '<span>' + _l10n.appDescription +
            '</span></a>',

            ui: {
                getDataListViewDataSource: function () {
                    return $('#wrap dataListView').getKendoListView().dataSource;
                },
                onImportFiles: function (_data) {
                    console.log('onImportFiles');
                    var t$ = this;

                    function common_import(obj) {
                        if (obj.success) {
                            try {
                                $.each(obj.filesArray, function (index, fileObj) {
                                    t$.onCreateNewItem(fileObj.fileName, fileObj.filePath);
                                });
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    }

                    if (typeof _data === "undefined") {
                        //使用选择对话框
                        b$.importFiles({
                            callback: b$._get_callback(function (obj) {
                                common_import(obj);
                            }, true),
                            allowMulSelection: true,
                            title: _l10n.importDialog.title,
                            prompt: _l10n.importDialog.prompt,
                            types: ['xls']
                        }, function () {
                            for (var i = 0; i < 50; i++) {
                                t$.onCreateNewItem("Test" + i,
                                    "http://docs.telerik.com/KENDO-UI/api/javascript/data/datasource#methods-remove"
                                );
                            }
                        })
                    } else {
                        common_import(_data);
                    }

                },
                onClearAll: function () {
                    console.log('onClearAll');
                    var t$ = this;

                    var ds = t$.getDataListViewDataSource();
                    for (var index = ds.data().length - 1; index >= 0; --index) {
                        var dataItem = ds.at(index);
                        t$.onStopConvertTask(dataItem);
                        ds.remove(dataItem);
                    }
                },
                onConvertAll: function () {
                    console.log('onConvertAll');
                    var t$ = this;

                    var ds = t$.getDataListViewDataSource();
                    $.each(ds.data(), function (i, item) {
                        t$.onCreateConvertTask(item);
                    });
                },

                onCreateNewItem: function (fileName, filePath) {
                    var t$ = this;

                    var ds = t$.getDataListViewDataSource();
                    _MC.send('item.config.getDefaultConfig', function (defaultConfigObj) {
                        ds.add({
                            name: fileName,
                            path: filePath,
                            config: {
                                default: defaultConfigObj, //系统默认
                                last: defaultConfigObj //最近一次
                            },
                            taskCreated: false, //关联的任务是否已经创建
                            taskOutputPath: "", //任务输出目录
                            err: "", //错误信息

                            /// CSS样式的附带处理，关联模板tpl-datalist
                            css: {
                                fileObjectStyle: "",
                                progressbarStyle: "",
                                itemRevealCss: "k-button k-state-disabled",
                                itemConvertCss: "k-i-arrow-e"
                            }
                        });
                    });
                },

                onCreateConvertTask: function (dataItem) {
                    var t$ = this;

                    var lastOutputPath = c$.localSettingsWrap.getItem("lastOutputPath") || "";
                    lastOutputPath = $.trim(lastOutputPath);
                    if (lastOutputPath === "" || !b$.App.checkPathIsWritable(lastOutputPath)) {
                        return _MC.send("main.selectOutputDir", {
                            lastDir: lastOutputPath || ""
                        });
                    }

                    //创建任务，并更新进度，记录错误日志
                    dataItem.set('taskCreated', true);
                    dataItem.set('taskOutputPath', lastOutputPath);
                    dataItem.set('err', "");

                    _MC.send('plugin.xls2csv.startXls2CSVTask', {
                        config: {
                            helperID: dataItem.uid,
                            filePath: dataItem.path,
                            encoding: dataItem.config.last.encode,
                            separate: dataItem.config.last.separator,
                            sheet: (function () {
                                return dataItem.config.last.exportOnly ? dataItem.config
                                    .last.sheetName : "";
                            }()),
                            outputDir: dataItem.taskOutputPath
                        },
                        cb: function (progress, err) {
                            t$.updateConvertProgress(dataItem.uid, progress, err);
                        }
                    });


                },

                onStopConvertTask: function (dataItem) {
                    var t$ = this;

                    if (dataItem.taskCreated) {
                        _MC.send('plugin.xls2csv.startXls2CSVTask', {
                            config: {
                                helperID: dataItem.uid
                            },
                            cb: function () {

                            }
                        });
                    }
                },

                /**
                 * 更新转换进度
                 * @param uid  对象ID
                 * @param progress 进度百分比
                 * @param err  是否发现错误
                 */
                updateConvertProgress: function (uid, progress, err) {
                    var t$ = this;

                    progress = progress || 0.1;
                    progress = typeof err !== "undefined" ? 1 : progress;

                    var dataItem = t$.getDataListViewDataSource().getByUid(uid);

                    var sel = '#wrap dataListView fileObject[data-uid="' + uid + '"]';

                    function comCSS(bgGradient, progress) {
                        var bgColor = "rgba(31, 123, 250," + progress + ")";
                        $(sel).css({
                            //"background-color":bgColor,
                            "background-image": bgGradient,
                            "transition-property": "background-image, background-color, background",
                            "transition": "All 0.4s ease-in-out"
                        });

                        dataItem.get('css').set('fileObjectStyle', $(sel).attr('style'));
                    }

                    function progressCss(bgColor, progress) {
                        var sel = '#wrap dataListView fileObject[data-uid="' + uid +
                            '"] progressbar';
                        $(sel).css({
                            "background-color": bgColor,
                            "transition-property": "background-image, background-color, background",
                            "transition": "All 0.4s ease-in-out",
                            "width": progress * 100 + "%"
                        });

                        dataItem.get('css').set('progressbarStyle', $(sel).attr('style'));
                    }

                    // 更新进度
                    function up_progress(progress) {
                        //var bgGradient = $.stringFormat("none, linear-gradient(to right, rgba(31, 123, 250, 0.6) {0}, rgba(255, 255, 255, 0) {0})", progress * 100 + "%");
                        //comCSS(bgGradient, progress);
                        progressCss("rgba(31, 123, 250, 0.6)", progress);
                    }

                    // 更新出错时的状态
                    function up_whenErr(progress, err) {
                        if (err) {
                            //var bgGradient = $.stringFormat("none, linear-gradient(to right, #FF6666 {0}, rgba(255, 255, 255, 0) {0})", "100%");
                            //comCSS(bgGradient, progress);
                            progressCss("rgba(255, 0, 0, 0.6)", 1);
                            dataItem.set('err', err);
                        }
                    }

                    // 更新完成转换的状态
                    function up_whenEnd(progress) {
                        if (progress >= 1) {

                            dataItem.get('css').set('itemRevealCss', "k-button"); // CSS状态保存
                            dataItem.get('css').set('itemConvertCss', "k-i-refresh"); // CSS状态保存

                            //闪烁动画
                            $(sel + ' [tag-action="item-reveal"]')
                                .animate({
                                    opacity: 0.5
                                }, 2000)
                                .animate({
                                    opacity: 1
                                }, 2000);


                        }
                    }


                    up_progress(progress);
                    up_whenEnd(progress);
                    up_whenErr(progress, err);

                },

                // 更新主窗体的导入按钮
                updateImportBtnState: function(data){
                    var t$ = this;

                    var btn = $('#wrap .layer-import > button');
                    if (data.length > 0){
                        btn.hide();
                    }else{
                        btn.show();
                    }

                },

                updateFooterView: function () {
                    var t$ = this;
                    var sel_str = "",
                        ctl;

                    var lastPath = c$.localSettingsWrap.getItem("lastOutputPath");

                    sel_str = '#root footer input[tag-id="outputList-list"]';
                    ctl = $(sel_str).data("kendoComboBox");
                    if (!ctl) {
                        $(sel_str).kendoComboBox({
                            dataTextField: "path",
                            dataValueField: "path",
                            dataSource: lastPath ? [{
                                path: lastPath
                            }] : [],
                            index: 0,
                            select: function (e) {
                                var dataItem = this.dataItem(e.item.index());
                                console.log("on selected");
                            },
                            change: function (e) {
                                console.log("on change");
                                var path = $.trim(this.value());
                                if (path !== "") {
                                    //检测是否可写
                                    if (!b$.App.checkPathIsWritable(path)) {
                                        alert(_l10n.output.validChecker.notWritablePathMsg);
                                        return;
                                    }

                                    var found = false;
                                    $.each(ctl.dataSource.data(), function (i, obj) {
                                        return obj.path === path ? !(found =
                                            true) : true;
                                    });

                                    if (!found) {
                                        ctl.dataSource.add({
                                            path: path
                                        });
                                    }

                                    c$.localSettingsWrap.setItem("lastOutputPath", path);
                                }
                            },
                            dataBound: function (e) {
                                console.log("on dataBound");
                            },
                            filtering: function (e) {
                                console.log("on filtering");
                            }
                        });

                        ctl = $(sel_str).data("kendoComboBox");

                        function addPathToCBX(path) {
                            ctl.value(path);
                            ctl.trigger("change");
                        }

                        //绑定"选择外部调用选择输出目录"
                        _MC.register("main.selectOutputDir", function (e) {
                            var lastDir = e.data.lastDir || "";
                            try {
                                b$.selectOutDir({
                                    callback: b$._get_callback(function (obj) {
                                        try {
                                            if (obj.success) {
                                                var filesArray = obj.filesArray;
                                                $.each(filesArray, function (index, fileObj) {
                                                    addPathToCBX(
                                                        fileObj
                                                            .filePath
                                                    );
                                                });
                                            }
                                        } catch (e) {
                                            console.error(e)
                                        }
                                    }, true),
                                    title: _l10n.output.selectOutputDialog.title,
                                    prompt: _l10n.output.selectOutputDialog.prompt,
                                    directory: lastDir,
                                    canAddToRecent: false
                                }, function () {
                                    addPathToCBX("d:\\output\\");
                                });
                            } catch (e) {
                                console.error(e)
                            }
                        });

                    }


                    //选择输出路径处理
                    $('#root footer')
                        .on('click', '[tag-action="item-select"]', function (e) {
                            console.log('[tag-action="item-select"]');
                            var lastPath = c$.localSettingsWrap.getItem("lastOutputPath");
                            _MC.send("main.selectOutputDir", {
                                lastDir: lastPath || ""
                            });
                        });

                },


                updateView: function () {
                    var r$ = this;

                    $.RTYUtils.queue()
                    //hear
                        .next(function (next) {
                            $('header')
                                .on('click', '[tag-action="item-goFeedback"]', function (e) {
                                    console.log('[tag-action="item-goFeedback"]');
                                    _MC.send('FeedBackDialog.show');
                                })
                                .on('click', '[tag-action="item-goFAQ"]', function (e) {
                                    console.log('[tag-action="item-goFAQ"]');
                                    b$.App.open(
                                        "https://github.com/Romanysoft/xls2csv/issues");
                                })
                                .on('click', '[tag-action="item-goHelp"]', function (e) {
                                    console.log('[tag-action="item-goHelp"]');
                                    b$.App.open(
                                        "https://github.com/Romanysoft/xls2csv/issues");
                                })
                                .on('click', '[tag-action="item-settings"]', function (e) {
                                    console.log('[tag-action="item-settings"]');
                                    c$.openSettingsWindow();
                                });
                            next && next();
                        })
                        //header toolbar
                        .next(function (next) {
                            // 设置工具的名称
                            $('header a[tag-action="item-goFeedback"] ').text(_l10n.head["toolbar_feedback"] || "Feedback");
                            $('header a[tag-action="item-goHelp"] ').text(_l10n.head["toolbar_help"] || "Help");
                            $('header a[tag-action="item-settings"] ').text(_l10n.head["toolbar_setting"] || "Setting");
                            $('header a[tag-action="item-goFAQ"] ').text(_l10n.head["toolbar_FAQ"] || "FAQ");

                            next && next();
                        })
                        //toolbar
                        .next(function (next) {
                            $('#wrap toolbar').kendoToolBar({
                                items: [
                                    {template: '<a class="btnImport"><span>' +  _l10n.toolBar.btnImport + '</span></a>'},
                                    {template: '<a class="btnClear"><span>' +  _l10n.toolBar.btnClear + '</span></a>'},
                                    {template: '<a class="btnConvert"><span>' +  _l10n.toolBar.btnConvert + '</span></a>'}
                                ]

                            });

                            $('#wrap toolbar a.btnImport').kendoButton({
                                imageUrl: "images/toolbar/add_16px.png",
                                click:function (e) {
                                    model.ui.onImportFiles();
                                }
                            });

                            $('#wrap toolbar a.btnClear').kendoButton({
                                imageUrl: "images/toolbar/delete_16px.png",
                                click:function (e) {
                                    model.ui.onClearAll();
                                }
                            });

                            $('#wrap toolbar a.btnConvert').kendoButton({
                                imageUrl: "images/toolbar/convert_16px.png",
                                click:function (e) {
                                    model.ui.onConvertAll();
                                }
                            });

                            next && next();
                        })
                        //dataListView
                        .next(function (next) {
                            $('#wrap dataListView').kendoListView({
                                dataSource: (function () {
                                    return new kendo.data.DataSource({
                                        data: [],
                                        change: function (e) {
                                            var data = this.data();
                                            model.ui.updateImportBtnState(data);
                                        }
                                    });
                                }()),
                                template: kendo.template($("#tpl-datalist").html())
                            });


                            $('#wrap dataListView')
                                .on('click', '[tag-action="item-copy"]', function (e) {
                                    console.log('[tag-action="item-copy"]');
                                    var uid = $(this).parents("fileObject").data('uid');
                                    var dataItem = model.ui.getDataListViewDataSource().getByUid(
                                        uid);
                                    b$.Clipboard.copy(dataItem.path);
                                })
                                .on('click', '[tag-action="item-remove"]', function (e) {
                                    console.log('[tag-action="item-remove"]');
                                    var uid = $(this).parents("fileObject").data('uid');
                                    var ds = model.ui.getDataListViewDataSource();
                                    var dataItem = ds.getByUid(uid);
                                    _MC.send('item.config.freeConfigView', dataItem);
                                    ds.remove(ds.getByUid(uid));

                                })
                                .on('click', '[tag-action="item-reveal"]', function (e) {
                                    console.log('[tag-action="item-reveal"]');
                                    var uid = $(this).parents("fileObject").data('uid');
                                    var dataItem = model.ui.getDataListViewDataSource().getByUid(
                                        uid);
                                    b$.revealInFinder(dataItem.taskOutputPath);
                                })
                                .on('click', '[tag-action="item-config"]', function (e) {
                                    console.log('[tag-action="item-config"]');

                                    var uid = $(this).parents("fileObject").data('uid');
                                    var dataItem = model.ui.getDataListViewDataSource().getByUid(
                                        uid);
                                    _MC.send('item.config.callConfigView', dataItem);

                                })
                                .on('click', '[tag-action="item-convert"]', function (e) {
                                    console.log('[tag-action="item-convert"]');
                                    var uid = $(this).parents("fileObject").data('uid');
                                    var dataItem = model.ui.getDataListViewDataSource().getByUid(
                                        uid);
                                    model.ui.onCreateConvertTask(dataItem);
                                });

                            next && next();
                        })
                        .next(function (next) {

                            $('#wrap .layer-import > button').kendoButton({
                                imageUrl: "images/toolbar/Open_folder_add_128px.png",
                                click:function (e) {
                                    model.ui.onImportFiles();
                                }
                            });

                            next && next();
                        })
                        //statueBar
                        .next(function (next) {
                            console.log("3");
                            next && next();
                        })
                        //footer
                        .next(function (next) {
                            //other
                            var uiConfig = {
                                outputLabel: _l10n.output.outputLabel,
                                btnSelect: _l10n.output.btnSelect
                            };
                            var cpl = kendo.template($('#tpl-outputList').html());
                            $("footer").html(cpl(uiConfig));

                            r$.updateFooterView();
                            next && next();
                        })
                        //message
                        .next(function (next) {

                            //绑定"应用到全部"
                            _MC.register("main.applyConfigToOthers", function (e) {
                                var config = e.data;
                                var ds = r$.getDataListViewDataSource();
                                for (var index = ds.data().length - 1; index >= 0; --
                                    index) {
                                    var dataItem = ds.at(index);
                                    dataItem.get('config').set('last', config);
                                }
                            });

                            //绑定"import外部调用"
                            _MC.register("main.importFile", function (e) {
                                r$.onImportFiles(e.data);
                            });

                            next && next();
                        })
                        // done
                        .done(function (err) {
                            //支持拖拽功能
                            b$.enableDragDropFeature({
                                callback: b$._get_callback(function (obj) {
                                    _MC.send("main.importFile", obj);
                                }, true),
                                fileTypes: ['xls']
                            });

                            console.log("end");
                        });
                },

            },

            onWrapClick: function (e) {
                e.stopImmediatePropagation();
            },
            toggleFocus: function (e) {
                //$(document.body).toggleClass("focused");
            },


        });

        /// 主视图
        var mainView = new kendo.View("tpl-main", {
            model: model,
            init: function () {
                this.model.ui.updateView();
            }
        });

        /// 路由
        var router = new kendo.Router({
            init: function () {
                mainView.render('#root');
            }
        });

        /// 启动路由
        router.start();
    };

    _$U._preLoadTempFile = function () {
        var t$ = this;
        $.templateLoaderAgent(["templates/main.tmpl.html"], function () {
            setTimeout(function () {
                t$._configKendoLocalization();
                t$._buildMainUI();
            }, 200);

        });
    };

    _$U.createUI = function () {
        var t$ = this;
        t$._preLoadTempFile();
    };


    //////////////////////////////
    //绑定可识别的消息
    /// 主界面
    _MC.register("createUI", function (e) {
        _$U.createUI()
    });


    window.UI.c$ = $.extend(window.UI.c$, c$);
})();
