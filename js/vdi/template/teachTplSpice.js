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
.config(["$locationProvider", function($locationProvider){
    $locationProvider.html5Mode(true);
}])
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
.controller("teachTplSpiceController", [
    "$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "Scene", "$$$os_types", "UserRole", "$$$I18N", "$$$var_constant", "$Domain", 
    function($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, scen, $$$os_types, UserRole, $$$I18N, $$$var_constant, $Domain){
    var rfb;
    var it = $scope;
    var iframe=document.getElementById("webSpice");
    it.$$$var_constant = $$$var_constant;
    //iframe.src="vdi-client/index.html?host=172.16.201.188&port=6082&token="+token+"&password=";
    iframe.src="vdi-client/index.html?host=172.16.201.188&port=6080&token=65a809e9-950f-4b0d-bd4a-c55c44dbc383&password=caZPb2jr";
    iframe.onload=function(){
        console.log('SPICE控制器',iframe.contentWindow,iframe.contentWindow.clientAgent);
        $scope.CAD = function(){
            iframe.contentWindow.clientAgent.sendCtrlAltDel();
        }  
    }
    //不同网卡上不能存在相同网段的IP提示框
    function  duplicatedIp(){
        if($$$var_constant.$sameIp){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
                timeout:6000
            });
        }   
    }
    duplicatedIp();

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
                $scope.installed = (res.status === "installed" || res.status === "alive") ? true : false;
                $scope.making_installed = res.status === "making" || res.status === "installed" ? true : false;
                getStatus();
            }, function(){
            });
        }, 3000);
    }

    var flag = false;
    var oldBigBox = $.bigBox;
    $.bigBox = null;
    function checkLoad(){
        $timeout(function(){
            if(!flag){
                template.update(
                    { id: $$$var_constant.$id },
                    function(res){
                        flag = true;
                        $scope.is_template = res.is_template;
                        $scope.instance_id = res.instance_id;
                        $scope.os_type = res.os_type;
                        $instance_id =  res.instance_id;
                        $scope.passwd = res.passwd;
                        $scope.vnc_host = res.vnc_host;
                        $scope.image_name = res.image_name;
                        $scope.instance_count = res.instance_count;
                        // init_params(res.passwd, res.instance_id, res.vnc_host, res.vnc_token);
                        // getStatus();
                        iframe.src="vdi-client/index.html?host="+res.vnc_host+"&port=6080&token="+res.vnc_token+"&password="+res.passwd;
                        $.bigBox = oldBigBox;
                    },
                    function(){
                        checkLoad();
                    }
                );

            }
        }, 3000);
    }
    checkLoad();
    
    $scope.status = function(){
        console.log(5555,rfb)
        return rfb ? rfb._rfb_state : "";
    }
    $scope.start = function(){
        if($scope.status() !== "normal"){
            vm.start({instance_ids:[$scope.instance_id]},function(){
                function _loop(){
                    template.get_image_vnc_info({instance_id:$instance_id},function(res){
                        // init_params(res.result.password, $scope.instance_id, $scope.vnc_host, res.result.token);
                        iframe.src="vdi-client/index.html?host="+res.vnc_host+"&port=6080&token="+res.vnc_token+"&password="+res.passwd;
                        setTimeout(function(){
                            console.log($scope.status());
                            if($scope.status() !== "normal"){
                                _loop();
                            }
                        }, 1000);
                    },function(){alert("start error")});
                }
                _loop();
            })
        }
        else{
            alert("System has been in the boot state")
        }
    };
    $scope.shutdown = function(){
        var instance_id = $scope.instance_id;
        if($scope.status() === "normal"){
            $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>"+
                    "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENTMODIFY_SHUT'></p><footer class='text-right'><img data-ng-if='loading' src='./img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller : function($scope, $modalInstance){
                    $scope.ok = function(){
                        $scope.loading = true;
                        vm.shutdowns(
                            {instance_ids:[instance_id]},
                            function(){
                                $scope.loading = false;
                                $modalInstance.close();
                            },
                            function(){ $scope.loading = false; alert("shutdown error") }
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
    };
    $scope.updateTemplate = function(is_sys){
        var instance_id = $scope.instance_id;
        var image_name = $scope.image_name;
        var is_personalTemp = $scope.is_personalTemp;
        var instance_count = $scope.instance_count;
        if(!is_sys && $scope.is_template){
            $modal.open({
                templateUrl: "views/vdi/dialog/template/template_update.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
                    $scope.hasSchool = false;
                    $scope.is_personalTemp = is_personalTemp;
                    $scope.instance_count = instance_count;
                    if($scope.is_personalTemp){
                        desktop.update_instance({id: $id},function(res){
                            $scope.instance = res.values;
                        })
                    }else{
                        scen.query(function(res){
                            var schools = [];$scope.schools=[];
                            res.modes.filter(function(item){
                                if(item.image_name === image_name)
                                    return item;
                            }).forEach(function(item){
                                if(!schools[item.schoolroom]){
                                    schools[item.schoolroom] = {name: item.schoolroom, modes: [item]};
                                    $scope.schools.push({name: item.schoolroom, modes: [item]});
                                }
                                else{
                                    schools[item.schoolroom].modes.push(item);
                                    $scope.schools.forEach(function(sch){
                                        if(sch.name == item.schoolroom){
                                            sch.modes.push(item);
                                        }
                                    })
                                }
                            });
                            if($scope.schools.length){ $scope.hasSchool = true; }
                        })
                    }
                    $scope.ok = function(){
                        $scope.loading = true;
                        vnc.save({
                            instance_id: instance_id,
                            image_id: $$$var_constant.$id
                        }, function(){
                            $scope.loading = false;
                            $modalInstance.close();
                            window.close();
                        }, function(){
                            $scope.loading = false;
                            $modalInstance.close();
                            // window.close();
                        });
                    };
                    $scope.close = function(){
                        $modalInstance.close();
                    };
                } ]
            });

        }
        else if(!is_sys && !$scope.is_template){
            $scope.saveTem_loading = true;
            var p_scope = $scope;
            vnc.save({
                instance_id: p_scope.instance_id,
                image_id: $$$var_constant.$id
            }, function(res){
                rfb.disconnect();
                window.close();
            },function(){ $scope.saveTem_loading = false; });
        }
        else{
            $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='安装完成确认'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='我已安装完成确认' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller: function($scope, $modalInstance){
                    $scope.ok = function(){
                        $modalInstance.close();
                        it.saveTem_loading = true;
                        vnc.save({
                            instance_id: instance_id,
                            image_id: $id
                        }, function(res){

                        },function(){ it.saveTem_loading = false; });
                    };
                    $scope.close = function(){
                        $modalInstance.close();
                    }
                },
                size: "sm"
            });
        }
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
   console.log($hash,'hash5566');
   var $id = parseInt($hash[0].split('=')[1]);
   var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
   var $name = $hash[2]?decodeURIComponent($hash[2].split('=')[1]):'';
   var $is_personalTemp = $hash[3]=="personal"?true:false;
   var $is_systemTemp = $hash[3]=="sytem_desktop"?true:false;
   var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
   var $token =$hash[1] ? $hash[1].split('=')[1]:null;
   var $port = $hash[2] ? $hash[2].split('=')[1]:6080;
   var $password =$hash[3] ? $hash[3].split('=')[1]:'';
   return {
        $hashstr:$hashstr,
        $hash:$hash,
        $id:$id,
        $is_windows:$is_windows,
        $name:$name,
        $is_personalTemp:$is_personalTemp,
        $is_systemTemp:$is_systemTemp,
        $sameIp:$sameIp,
        $token:$token,
        $port:$port,
        $password:$password
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