/**
 * Created by Ian on 2015/8/15.
 * 创建目的，主要是方便后面集成更多的不可控的函数功能
 */

(function () {
    window['UI'] = window['UI'] || {};
    window.UI.c$ = window.UI.c$ || {};
})();

(function () {
    var c$ = {};
    c$ = $.extend(window.UI.c$, {});
    var b$ = window.BS.b$;

    var msgPrefix = 'IAPMessage_', busHelperMsgPrefix = 'BusHelperMsg_';

    c$.BusHelperMessage = {
        UNKnown: busHelperMsgPrefix + "UNKnown"
        ,onCreate:busHelperMsgPrefix + "onCreate"

        /// process_init
        ,onNativeEngineInitSuccess: '_native_engine_init_success'
        ,onNativeEngineInitFailed: '_native_engine_init_failed'

        /// process_dylibCLI
        ,onDylibCLIStart: '_native_clicall_start'
        ,onDylibCLIFeedback: '_native_clicall_feedback'
        ,onDylibCLIEnd: '_native_clicall_end'

        /// process_execCommand
        ,onExecCommandAdded: '_native_execCommand_added'
        ,onExecCommandStarted: '_native_execCommand_start'
        ,onExecCommandFeedback: '_native_execCommand_feedback'
        ,onExecCommandSuccess: '_native_execCommand_success'
        ,onExecCommandCanceled: '_native_execCommand_canceled'
        ,onExecCommandError: '_native_execCommand_error'

        /// process_task
        ,onTaskAdded:'_native_task_added'
        ,onTaskStarted:'_native_task_started'
        ,onTaskFinished:'_native_task_finished'
        ,onTaskError:'_native_task_error'
        ,onTaskCanceled:'_native_task_canceled'
    };

    c$.IAPMessage = {
        UNKnown: msgPrefix + "UNKnown"
        ,updateProductByIdWhitAppStore:msgPrefix + "updateProductByIdWhitAppStore"  // 更新商品信息
        ,productPurchased:msgPrefix + "productPurchased"                            // 商品已经被购买
        ,ProductCompletePurchased:msgPrefix + "ProductCompletePurchased"            // 商品已经完成购买
        ,ProductPurchaseFailed:msgPrefix + "ProductPurchaseFailed"                  // 商品购买失败
        ,ProductBuyFailed:msgPrefix + "ProductBuyFailed"                            // 商品购买失败
        ,ProductPurchaseFailedDetail:msgPrefix + "ProductPurchaseFailedDetail"      // 商品购买失败详细信息
        ,productRequested:msgPrefix + "productRequested"                            // 商品发送到服务器，进行验证
        ,productSyncNoAppStore:msgPrefix + "productSyncNoAppStore"                  // 在非AppStore产品状态下，同步插件信息
        ,syncProductWithAppStore:msgPrefix + "syncProductWithAppStore"              // 同步商品
    };

    var $BusNoticeCenter = c$.BusNoticeCenter = $.Callbacks();
    c$.BusHelper_private = {
        // 配置内核启动成功后的处理方式
        configOnNativeEngineInitSuccessCallback:function(cb){

        },


        // 配置执行任务的更新信息的回调处理; _fnGName: 可配置的函数的全局名称
        configExecTaskUpdateInfoCallback:function(_fnGName){
            var fnName = _fnGName || "BS.b$.cb_execTaskUpdateInfo";
            var fn = function(obj){
                console.log($.obj2string(obj));

                var mt = c$.BusHelperMessage;

                // 声明处理插件初始化的方法
                function process_init(obj){
                    try{
                        if (obj.type == "type_initcoresuccess") {
                            c$.BusNoticeCenter.fire({type:mt.onNativeEngineInitSuccess, data:obj});
                        }else if(obj.type == "type_initcorefailed") {
                            console.error('init core plugin failed!');
                            c$.BusNoticeCenter.fire({type:mt.onNativeEngineInitFailed, data:obj});
                        }
                    }catch(e){
                        console.error(e);
                    }

                }

                // 声明处理CLI的回调处理
                function process_dylibCLI(obj){
                    try{
                        var infoType = obj.type;
                        var c$ = UI.c$, b$ = BS.b$;
                        if (infoType == 'type_clicall_start'){
                            c$.BusNoticeCenter.fire({type:mt.onDylibCLIStart, data:obj});
                        }else if(infoType == 'type_clicall_reportprogress'){
                            c$.BusNoticeCenter.fire({type:mt.onDylibCLIFeedback, data:obj});
                        }else if(infoType == 'type_clicall_end'){
                            c$.BusNoticeCenter.fire({type:mt.onDylibCLIEnd, data:obj});
                        }

                    }catch(e){
                        console.error(e);
                    }
                }

                // 声明处理ExecCommand的方法
                function process_execCommand(obj){
                    try{
                        var infoType = obj.type;
                        if(infoType == 'type_addexeccommandqueue_success'){
                            var queueID = obj.queueInfo.id;
                            BS.b$.sendQueueEvent(queueID, "execcommand", "start", fnName);

                            c$.BusNoticeCenter.fire({type:mt.onExecCommandAdded, data:obj});
                        } else if(infoType == 'type_execcommandstart'){
                            c$.BusNoticeCenter.fire({type:mt.onExecCommandStarted, data:obj});
                        } else if(infoType == 'type_reportexeccommandprogress'){
                            c$.BusNoticeCenter.fire({type:mt.onExecCommandFeedback, data:obj});
                        } else if(infoType == 'type_execcommandsuccess'){
                            c$.BusNoticeCenter.fire({type:mt.onExecCommandSuccess, data:obj});
                        } else if(infoType == 'type_canceledexeccommand'){
                            c$.BusNoticeCenter.fire({type:mt.onExecCommandCanceled, data:obj});
                        } else if(infoType == 'type_execcommanderror'){
                            c$.BusNoticeCenter.fire({type:mt.onExecCommandError, data:obj});
                        }
                    }catch(e){
                        console.error(e);
                    }

                }

                // 声明处理Task的方法
                function process_task(obj){

                    var c$ = UI.c$;
                    var b$ = BS.b$;
                    try{
                        var infoType = obj.type;
                        if(infoType == "type_addcalltaskqueue_success"){
                            var queueID = obj.queueInfo.id;
                            b$.sendQueueEvent(queueID, "calltask", "start", fnName);

                            c$.BusNoticeCenter.fire({type:mt.onTaskAdded, data:obj});
                        }else if(infoType == "type_calltask_start"){
                            var queueID = obj.queueInfo.id;
                            c$.BusNoticeCenter.fire({type:mt.onTaskStarted, data:obj});

                        }else if(infoType == "type_calltask_error"){
                            console.error($.obj2string(obj));
                            c$.BusNoticeCenter.fire({type:mt.onTaskError, data:obj});

                        }else if(infoType == "type_calltask_success"){
                            console.log($.obj2string(obj));
                            c$.BusNoticeCenter.fire({type:mt.onTaskFinished, data:obj});

                        }else if(infoType == "type_type_calltask_cancel"){
                            console.log($.obj2string(obj));
                            c$.BusNoticeCenter.fire({type:mt.onTaskCanceled, data:obj});
                        }
                    }catch(e){
                        console.error(e);
                    }

                }

                // 以下是调用顺序
                process_init(obj);
                process_dylibCLI(obj);
                process_execCommand(obj);
                process_task(obj);
            };
            try{
                eval(fnName + " = fn;");
            }catch(e){console.error(e)}
        },

        // 配置IAP的更新信息回调处理; _fnGName: 可配置的函数的全局名称
        configIAPUpdateInfoCallback:function(_fnGName){
            var fnName = _fnGName || "BS.b$.cb_handleIAPCallback";
            var fn = function(obj){
                try{
                    console.log($.obj2string(obj));
                    var info = obj.info, notifyType = obj.notifyType;

                    // 修正兼容键值对
                    if(typeof info === "string") info = JSON.parse(info);

                    // 获得兼容的键值, 也就说原先的IAP系统返回值有了变动
                    var _getCompatibleKey = function(infoObj, key){
                        //NOTE:使用标准的函数来处理
                        if(typeof infoObj[key] !== "undefined") return infoObj[key];
                        if(typeof infoObj["payment"] !== "undefined"){
                            if(typeof infoObj["payment"][key] !== "undefined")
                                return infoObj["payment"][key];
                        }
                        return "[ '" + key + "' no found.]" ;
                    };

                    ///////////////////////////////////////////////////////////////////////////////////////////////////
                    // 处理核心
                    if(notifyType == "ProductBuyFailed"){
                        console.log('[section] ProductBuyFailed');
                        //@"{'productIdentifier':'%@', 'message':'No products found in apple store'}"
                        var pluginId = _getCompatibleKey(info, "productIdentifier");
                        var message = _getCompatibleKey(info, "message");

                        var log = $.stringFormat("{0} order plugin failed! {1}", pluginId, message);
                        console.warn(log);

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.ProductBuyFailed, {
                            id:pluginId,
                            message:message
                        });
                    }else if(notifyType == "ProductPurchased"){
                        console.log('[section] ProductPurchased');
                        //@"{'productIdentifier':'%@', 'quantity':'%@'}"

                        var pluginId = _getCompatibleKey(info, "productIdentifier");
                        //$IAPProvider.syncProductWithAppStore(pluginId, function(product){
                        //    //说明：product{enable, inAppStore, quantity, price}
                        //
                        //    //使用消息中心发送商品已经购买的消息
                        //    $NoticeCenter.fire(c$.NCMessage.productPurchased, pluginId);
                        //});

                        var log = $.stringFormat("{0} order plugin success!", pluginId);
                        console.log(log);

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.syncProductWithAppStore,pluginId);
                    }else if(notifyType == "ProductPurchaseFailed"){
                        console.log('[section] ProductPurchaseFailed');
                        //@"{‘transactionId':'%@',‘transactionDate’:'%@', 'payment':{'productIdentifier':'%@','quantity':'%@'}}"

                        // 使用兼容模式
                        var pluginId = _getCompatibleKey(info, "productIdentifier");
                        var orderDate = _getCompatibleKey(info, "transactionDate");

                        var log = $.stringFormat("{0} order plugin failed! orderDate {1}", pluginId, orderDate);
                        console.log(log);

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.ProductPurchaseFailedDetail, {
                            id:pluginId,
                            orderDate:orderDate
                        });
                    }else if(notifyType == "ProductPurchaseFailedDetail"){
                        console.log('[section] ProductPurchaseFailedDetail');
                        //@"{'failBy':'cancel', 'transactionId':'%@', 'message':'%@', ‘transactionDate’:'%@', 'payment':{'productIdentifier':'%@','quantity':'%@'}}"
                        //_nativeCallback.ncb0({"info":"{\"message\":\"Unknown Error.\",\"payment\":{\"quantity\":1,\"productIdentifier\":\"com.romanysoft.app.macos.MarkdownD.plugin.support.atLink\"},\"failBy\":\"error\",\"transactionDate\":\"2015-06-19 05:31:06\",\"transactionId\":\"E33C0E13-782E-4433-B080-40B416024933\"}","notifyType":"ProductPurchaseFailedDetail"});

                        // 使用兼容模式
                        var pluginId = _getCompatibleKey(info, "productIdentifier");
                        var failBy = _getCompatibleKey(info, "failBy");
                        var transactionDate = _getCompatibleKey(info, "transactionDate");
                        var message = _getCompatibleKey(info, "message");

                        var log = $.stringFormat("error: {0} failed by {1} ({2}) order date: {3}", pluginId, failBy, message, transactionDate);
                        console.log(log);

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.ProductPurchaseFailedDetail, {
                            id:pluginId,
                            failBy:failBy,
                            transactionDate:transactionDate,
                            message:message
                        });

                    }else if(notifyType == "ProductRequested"){
                        console.log('[section] ProductRequested');
                        var productInfoList = info;
                        if(typeof info == "string"){
                            productInfoList = JSON.parse(info);
                        }

                        var log = $.stringFormat("Request product info from app store.");
                        console.log(log);

                        //说明：productInfoList = [{productIdentifier, description, price}]
                        $.each(productInfoList, function(index, product){
                            var info = {
                                id: product.productIdentifier,
                                price:product.price,
                                description:product.description
                            };

                            //$IAPProvider.updateProductByIdWhitAppStore(info.id, info, undefined);
                            $BusNoticeCenter.fire(c$.IAPMessage.updateProductByIdWhitAppStore, info);
                        });

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.productRequested, productInfoList);

                    }else if(notifyType == "ProductCompletePurchased"){
                        console.log('[section] ProductCompletePurchased');
                        //@"{'productIdentifier':'%@', 'transactionId':'%@', 'receipt':'%@'}"

                        //使用兼容模式
                        var pluginId = _getCompatibleKey(info, "productIdentifier");
                        var transactionId = _getCompatibleKey(info, "transactionId");
                        var receipt = _getCompatibleKey(info, "receipt");

                        var log = $.stringFormat("pluginId: {0}, transactionId: {1}, receipt: {2}", pluginId, transactionId, receipt);
                        console.log(log);

                        //使用消息中心发送商品信息请求的消息
                        $BusNoticeCenter.fire(c$.IAPMessage.ProductCompletePurchased, {
                            id:pluginId,
                            transactionId:transactionId,
                            receipt:receipt
                        });
                    }else if(notifyType == "ProductsPaymentRemovedTransactions"){
                        //{"info":"{\"payment\":[{\"quantity\":1,\"productIdentifier\":\"com.romanysoft.app.macos.MarkdownD.plugin.support.atLink\"},{\"quantity\":1,\"productIdentifier\":\"com.romanysoft.app.macos.MarkdownD.plugin.support.atLink\"}],\"removedTransactions\":[{\"quantity\":1,\"productIdentifier\":\"com.romanysoft.app.macos.MarkdownD.plugin.support.atLink\"}]}","notifyType":"ProductsPaymentRemovedTransactions"}
                    }

                }catch(e){console.error(e)}
            };
            try{
                eval(fnName + " = fn;");
            }catch(e){console.error(e)}
        }

    };

    c$.BusHelper={
        // 添加消息订阅者
        addMessageSubscribers:function(fn){
            c$.BusNoticeCenter.add(fn);
        },

        // 初始化
        create:function(fn){
            var t = this;
            var mt = c$.BusHelperMessage;

            //默认进行初始化
            c$.BusHelper_private.configExecTaskUpdateInfoCallback();
            c$.BusHelper_private.configIAPUpdateInfoCallback();

            t.addMessageSubscribers(fn);

            c$.BusNoticeCenter.fire({type:mt.onCreate, data:""});
        }
    };

    window.UI.c$ = $.extend(window.UI.c$, c$);
})();
