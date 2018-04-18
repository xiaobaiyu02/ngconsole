var $instance_id;
angular.module("vdi.spice", [
    "app.controllers",
    "app.localize",
    "ngResource",
    "ui.bootstrap",
    "vdi",
    "vdi.desktop",
    "vdi.template",
    "vdi.template.teach",
    "vdi.template.person",
    "vdi.template.hardware",
    "vdi.system",
    "vdi.user"
])
.factory('$$base64encode', function(){
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return function base64encodePwd(str) {  
        var out, i, len;  
        var c1, c2, c3;  
        len = str.length;  
        i = 0;  
        out = "";  
        while(i < len) {  
            c1 = str.charCodeAt(i++) & 0xff;  
            if(i == len)  
            {  
                out += base64EncodeChars.charAt(c1 >> 2);  
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);  
                out += "==";  
                break;  
            }  
            c2 = str.charCodeAt(i++);  
            if(i == len)  
            {  
                out += base64EncodeChars.charAt(c1 >> 2);  
                out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);  
                out += "=";  
                break;  
            }  
            c3 = str.charCodeAt(i++);  
            out += base64EncodeChars.charAt(c1 >> 2);  
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));  
            out += base64EncodeChars.charAt(c3 & 0x3F);  
        }  
        return out;  
    }  
})
.controller("isoListController", ["$scope", "$modalInstance", "SystemISO", "VNC", function($scope, $modalInstance, isos, vnc){
    $scope.isos = [];
    isos.get(function(data){
        // console.log(data);
        $scope.isos = data.isos;
        $scope.selectIsos = {
            'package': [],
            'other': [],
            'system': []
        };
        $scope.isos_package = data.isos.filter(function(item){
            return item.type == 'package';
        });
        angular.forEach(data.isos,function(item){
            if(item['type'] == 'package'){
                $scope.selectIsos['package'].push(item);
            }else if(item['type'] == 'other'){
                $scope.selectIsos['other'].push(item);
            }else{
                $scope.selectIsos['system'].push(item);
            }
        });
    });

    $scope.ok = function(iso){
        /*  thor/image/loadISO post instance_id iso_name */
        console.log($scope, iso);

        vnc.loadISO({
            instance_id: $instance_id,
            id: iso ? iso.id : "-1"
        }, function(){
            $modalInstance.close();
        }, function(err){
            //alert(err);
        });

    };
    $scope.close = function(){
        $modalInstance.close();
    };
}])
.controller("updateTemplateController", ["$scope", "$modalInstance","SystemISO", function($scope, $modalInstance, isos){
    $scope.isos = [];
    isos.get(function(data){
        $scope.isos = data.isos;
    })

    $scope.ok = function(){
        $modalInstance.close();
    };
    $scope.close = function(){
        $modalInstance.close();
    };
}])
.controller("spiceBtController", [
    "$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "$$$os_types", "$$$I18N", "$$$var_constant", "$$base64encode", 
    function($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, $$$os_types, $$$I18N, $$$var_constant, $$base64encode){
    var it = $scope;
    var flag = false;
    var oldBigBox = $.bigBox;
    var iframe=document.getElementById("webSpice");
    iframe.onload=function(){
        $scope.CAD = function(){
            iframe.contentWindow.clientAgent.sendCtrlAltDel();
        }  
    }
    //密码错误事件
    jQuery(window).on("passwordError",function(){
        console.log('password invalid tips');
        iframe.contentWindow.location.reload();
    }); 
    //token过期事件
    // jQuery(window).on("tokenError",function(){
    //     //token错误
    //     console.log('token outtime');
    //     iframe.contentWindow.location.reload();
    // });
    jQuery(window).on("socketClose",function(){
        //socket断开处理
        console.log('socketClose');
        iframe.contentWindow.location.reload();
        jQuery('#noVNC_status').html('socket closed');
    });
    //监听5个socket是否全部完成连接，超过5s未完成则刷新页面
    var socketCount=0;
    jQuery(window).on("socketConnect",function(){
        socketCount++;
        console.log('webSpice连接通道'+socketCount)
        if(socketCount==1){
            $timeout(function(){
                if(socketCount<5){
                    console.log("webSpice连接中断，请刷新页面重连");
                    iframe.contentWindow.location.reload();
                }
            },5000)
        }
    })

    function setIframeParams(host,port,token,password){
        var p = port || 6082;
        iframe.src="vdi-client/index.html?host="+host+
        "&port="+p+"&token="+token+"&password="+$$base64encode(password);
        setTimeout(function(){
            iframe.contentWindow.location.reload();
        },32000);
    }
    $scope.instance_id = "";
    $scope.os_type = "";
    $scope.is_template = false;
    $scope.installed = false;
    $scope.is_windows = $$$var_constant.$is_windows;
    $scope.is_personalTemp = $$$var_constant.$is_personalTemp;
    $scope.is_systemTemp = $$$var_constant.$is_systemTemp;
    $scope.instance_count = 0;
    $scope.name = $$$var_constant.$name;
    function getStatus(){
        $timeout(function(){
            personTemplate.status({ id: $$$var_constant.$id }, function(res){
                $scope.saveDisabled = (res.status === "installed" || res.status === "alive" || res.status === "update failed") ? true : false;
                $scope.undoDisabled = (res.status === "alive") ? true : false;
                getStatus();
            });
        }, 3000);
    }

    function getTemplateInfo(){
        $timeout(function(){ 
          if(!flag){
                template.spiceConnectInfo({ instance_id: $instance_id },
                    function(res){
                        flag = true;
                        var data = res.instance.connect;
                        $scope.is_template = res.instance.image.is_template;
                        $scope.os_type = res.instance.os_type;
                        $scope.image_name = res.instance.image.name;
                        $scope.instance_count = res.instance.image.instance_count;
                        $scope.instance_id = res.instance.uuid;
                        getStatus();
                        //端口是固定6082还是由后台提供有待后台确认，暂取固定端口6082；
                        setIframeParams(data.host,6082,data.token,data.password);
                        jQuery('#noVNC_status').html('connecting');
                        $.bigBox = oldBigBox;
                    },
                    function(){
                        getTemplateInfo();
                    }
                );
            }
        }, 3000);  
    }
    getTemplateInfo();
    $scope.start = function(){
        template.virtualStatus({id:$instance_id},function(res){
            if(res.run_status !== "ACTIVE"){
                vm.start({instance_ids:[$scope.instance_id]},function(){
                    function _loop(){
                        template.spiceConnectInfo({instance_id:$instance_id},function(res){
                            setIframeParams(res.vnc_host,6082,res.vnc_token,res.passwd);
                            jQuery('#noVNC_status').html('connecting');
                            setTimeout(function(){
                                console.log(res.run_status);
                                if(res.run_status !== "ACTIVE"){
                                    _loop();
                                }
                            }, 1000);
                        },function(){});
                    }
                    _loop();
                })
            }
            else{
                alert("System has been in the boot state")
            } 
        })
    };
    $scope.shutdown = function(){
        var instance_id = $scope.instance_id;
        template.virtualStatus({id:$instance_id},function(res){
            if(res.run_status === "ACTIVE"){
                $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENTMODIFY_SHUT'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.ok = function(){
                            vm.shutdowns(
                                {instance_ids:[instance_id]},
                                function(){
                                    $modalInstance.close();
                                },
                                function(){}
                            );
                        },
                        $scope.close = function(){
                            $modalInstance.close();
                        }
                    },
                    size : "sm"
                });
            }
            else{
                alert("System has been in the under off state")
            }
        });
    };
    var p_scope = $scope;
    $scope.save = function(){
            $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='保存'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEMP_SAVE_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.ok = function(){
                            console.log(p_scope.is_template)
                            if(p_scope.is_template){
                                template.bt_save_template({
                                    image_id: p_scope.image_id
                                },
                                function(res){
                                    $modalInstance.close();
                                });
                            }
                            else{
                                desktop.saveAsTemplate({
                                    instance_id: p_scope.instance_id,
                                    instance_type : p_scope.instance_type,
                                    os_type: p_scope.os_type,
                                    name: p_scope.image_name,
                                    type_code: p_scope.type_code,
                                    owner: p_scope.owner
                                },
                                function(res){
                                    $modalInstance.close();
                                })                                
                            }

                        };
                        $scope.close = function(){
                            $modalInstance.close();
                        }
                    },
                    size : "sm"
                });
        };
    $scope.undo = function(){
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='撤销本次'>"+
                    "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEMP_UNDO_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller : function($scope, $modalInstance){
                    $scope.ok = function(){
                        template.bt_prev_save_template({
                            image_id: p_scope.image_id
                        },
                        function(res){
                            $modalInstance.close();
                        });
                    };
                    $scope.close = function(){
                        $modalInstance.close();
                    }
                },
                size : "sm"
            });
        };

    $scope.expand = function(){
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='扩容模板C盘'>"+
                    "</h4></div><div class='modal-body'><form class='form-horizontal' name='expendTemplate' ng-submit='expendTemplate.$valid' novalidate>"+
                        "<div >"+
                            "<label class='col-xs-4 control-label required' for='expand' data-localize='扩容大小'></label>"+
                            "<div class='col-xs-4'>"+
                                "<input class='form-control' id='expand' type='text'"+
                                    "name='expand'"+
                                    "required "+
                                    "data-ng-model='expand'"+
                                    "placeholder='1-10'"+
                                    "data-ng-pattern='/^\s*([1-9]|10)\s*$/'"+
                                    "data-ng-trim='false'"+
                                ">"+
                            "</div><span class='col-xs-2' style='margin-top: 9px;padding-left: 0;'>GB</span>"+
                        "</div><br><footer class='text-right' style='margin-top: 40px;'><button class='btn btn-primary' data-ng-disabled='expendTemplate.$invalid'  data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller : function($scope, $modalInstance){
                    $scope.ok = function(){
                        vm.undo({instance_ids:[$scope.instance_id]},
                        function(res){
                            $modalInstance.close();
                        })
                    };
                    $scope.close = function(){
                        location.reload();
                        $modalInstance.close();
                        init_params(it.passwd, it.instance_id);
                    }
                },
                size : "sm"
            });
        };
    
    $scope.loadISO = function(){
        $modal.open({
            templateUrl: "/select-iso.html",
            controller: "isoListController",
            size: "md"
        });
    };
}])
.constant('$$$var_constant', function(){
   var $hashstr = location.hash.substr(1) || "";
   var $hash = $hashstr.replace(/^\/+/, "").split("&");
   var $id = parseInt($hash[0].split('=')[1]);
   var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
   var $name = $hash[2]?decodeURIComponent($hash[2].split('=')[1]):'';
   var $is_personalTemp = $hashstr.indexOf('personal')>=0?true:false;
   var $is_systemTemp = $hashstr.indexOf('sytem_desktop')>=0?true:false;
   var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
   $instance_id=$hash[3] ? $hash[3].split('=')[1]:'';
   return {
        $hashstr:$hashstr,
        $hash:$hash,
        $id:$id,
        $is_windows:$is_windows,
        $name:$name,
        $is_personalTemp:$is_personalTemp,
        $is_systemTemp:$is_systemTemp,
        $sameIp:$sameIp,
        $instance_id:$instance_id
   } 
}())
.run(["$rootScope", "settings", "localize", function($rootScope, settings, localize){
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function(lang){
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;