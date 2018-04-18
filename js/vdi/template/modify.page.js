var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2]?decodeURIComponent($hash[2]):'';
var $is_personalTemp = $hash[3]=="personal"?true:false;
var $is_systemTemp = $hash[3]=="sytem_desktop"?true:false;
var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
angular.module("vdi.vnc", [
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

.controller("vncController", [
    "$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "Scene", "$$$os_types", "UserRole", "$$$I18N",
    function($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, scen, $$$os_types, UserRole, $$$I18N){
    var rfb;
    var it = $scope;
    //不同网卡上不能存在相同网段的IP提示框
    function  duplicatedIp(){
        if($sameIp){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
                timeout:6000
            });
        }   
    }
    duplicatedIp();
    function passwordRequired(rfb) {
        var msg;
        msg = '<form onsubmit="return setPassword();"';
        msg += '  style="margin-bottom: 0px">';
        msg += 'Password Required: ';
        msg += '<input type=password size=10 id="password_input" class="noVNC_status">';
        msg += '<\/form>';
        $D('noVNC_status_bar').setAttribute("class", "noVNC_status_warn");
        $D('noVNC_status').innerHTML = msg;
    }
    function setPassword() {
        rfb.sendPassword($D('password_input').value);
        return false;
    }
    function sendCtrlAltDel() {
        rfb.sendCtrlAltDel();
        return false;
    }
    function init_params(password, instance_id, vnc_host, vnc_token){
        var host, port, path, token;
        host = WebUtil.getQueryVar('host', vnc_host); // vnc_host
        port = WebUtil.getQueryVar('port', 6080);
        password = WebUtil.getQueryVar('password', password);
        //path = WebUtil.getQueryVar('path', 'websockify?instance_id=' + instance_id);
        token = WebUtil.getQueryVar('token', null);
        if (token) {
           WebUtil.createCookie('token', token, 1)
        }       
        path = WebUtil.getQueryVar('path', 'websockify?token=' + vnc_token);

        rfb = new RFB({'target':       $D('noVNC_canvas'),
                       'encrypt':      WebUtil.getQueryVar('encrypt',
                                (window.location.protocol === "https:")),
                       'repeaterID':   WebUtil.getQueryVar('repeaterID', ''),
                       'true_color':   WebUtil.getQueryVar('true_color', true),
                       'local_cursor': WebUtil.getQueryVar('cursor', true),
                       'shared':       WebUtil.getQueryVar('shared', false),
                       'view_only':    WebUtil.getQueryVar('view_only', false),
                       'onUpdateState':  updateState,
                       // 'onXvpInit':    xvpInit,
                       'onPasswordRequired':  passwordRequired});

        // rfb = new RFB({'target': $D('noVNC_canvas'),
        //     'encrypt':    WebUtil.getQueryVar('encrypt',
        //             (window.location.protocol === "https:")),
        //     'true_color':   WebUtil.getQueryVar('true_color', true),
        //     'local_cursor': WebUtil.getQueryVar('cursor', true),
        //     'shared':      WebUtil.getQueryVar('shared', false),
        //     'view_only':    WebUtil.getQueryVar('view_only', false),
        //     'updateState':  updateState,
        //     'onPasswordRequired':  passwordRequired});


        rfb.connect(host, port, password, path);
    }
    function updateState(rfb, state, oldstate, msg) {
        var s, sb, cad, level,save_as_temp,load_iso;
        s = $D('noVNC_status');
        sb = $D('noVNC_status_bar');
        cad = $D('sendCtrlAltDelButton');
        save_as_temp = $D('save_as_template');
        load_iso = $D('load_iso')
        switch (state) {
            case 'failed':     level = "error";  break;
            case 'fatal':       level = "error";  break;
            case 'normal':     level = "normal"; break;
            case 'disconnected': level = "normal"; break;
            case 'loaded':     level = "normal"; break;
            default:             level = "warn";   break;
        }

        if (typeof(msg) !== 'undefined') {
        //    sb.setAttribute("class", "noVNC_status_" + level);
            s.innerHTML = msg;
        }
    }

    $scope.instance_id = "";
    $scope.os_type = "";
    $scope.is_template = false;
    $scope.installed = false;
    $scope.is_windows = $is_windows;
    $scope.is_personalTemp = $is_personalTemp;
    $scope.is_systemTemp = $is_systemTemp;
    $scope.instance_count = 0;
    $scope.name = $name;
    
    function getStatus(){
        $timeout(function(){
            personTemplate.status({ id: $id }, function(res){
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
                    { id: $id },
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
                        init_params(res.passwd, res.instance_id, res.vnc_host, res.vnc_token);
                        getStatus();
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
                        init_params(res.result.password, $scope.instance_id, $scope.vnc_host, res.result.token);
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
    $scope.CAD = function(){
        rfb.sendCtrlAltDel();
    };
    $scope.updateTemplate = function(is_sys){
        var instance_id = $scope.instance_id;
        var image_name = $scope.image_name;
        var is_personalTemp = $scope.is_personalTemp;
        var instance_count = $scope.instance_count;
        /*4.5.0添加模板更新提示*/
        var is_update = false;
        template.update_tpl_tip(function(res){
            var resp = res.result;
            if(resp.storage_type!=="remote" && resp.ha_mode==="active_passive"){
                is_update = true;
            }
        })
        if(is_update){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("HA_MODE_REMOTE"),
                timeout:6000
            });
            return false; 
        }
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
                            image_id: $id
                        }, function(){
                            $scope.loading = false;
                            $D('noVNC_status').innerHTML = "Update directive has been sent";
                            rfb.disconnect();
                            $modalInstance.close();
                            window.close();
                        }, function(){
                            $scope.loading = false;
                            rfb.disconnect();
                            $modalInstance.close();
                            $D('noVNC_status').innerHTML = "Update failed";
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
                image_id: $id
            }, function(res){
                rfb.disconnect();
                window.close();
            },function(){ $scope.saveTem_loading = false; });
            // $modal.open({
            //     templateUrl: "views/vdi/dialog/desktop/personal_save_template.html",
            //     size: "md",
            //     controller: ["$scope", "$modalInstance", "UserRole", function($scope, $modalInstance, UserRole){
            //         let user = UserRole.currentUser;
            //         $scope.min_namelength=2;
            //         $scope.max_namelength=20;
            //         $scope.saveTemp = true;
            //         if(user){
            //             var userName = user.name || "admin";
            //         }
            //         admin.query(function(res){
            //             $scope.owners = res.users;
            //             $scope.owner = $scope.owners.filter(function(item){ return item.name === userName })[0];
            //         });
            //         $scope.classifys = $$$os_types;
            //         $scope.classify = $scope.classifys[0];

            //         $scope.selectTemplate = function(item){
            //             $scope.template = item;
            //         };
            //         $scope.ok = function(){
            //             var aa = {
            //                     instance_id: p_scope.instance_id,
            //                     image_id: $id
            //                 }
            //                 vnc.save({
            //                     instance_id: p_scope.instance_id,
            //                     image_id: $id
            //                 }, function(res){
            //                     //console.log(124124);
            //                     $modalInstance.close();
            //                 });
            //         };
            //         $scope.close = function(){
            //             location.reload();
            //             $modalInstance.close();
            //             init_params(it.passwd, it.instance_id);
            //         };
            //     } ]
            // });
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
.run(["$rootScope", "settings", "localize", function($rootScope, settings, localize){
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function(lang){
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;