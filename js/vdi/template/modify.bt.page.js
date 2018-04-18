var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $is_personalTemp = $hash[2]?true:false;
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
    "$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "$$$os_types", "$$$I18N",
    function($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, $$$os_types, $$$I18N){
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
        var host, port, password, path, token;
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
    $scope.is_template = false;
    $scope.saveDisabled = false;$scope.undoDisabled = false;
    $scope.is_windows = $is_windows;
    $scope.is_personalTemp = $is_personalTemp;
    $scope.instance_count = 0;
    
    function getStatus(){
        $timeout(function(){
            personTemplate.status({ id: $id }, function(res){
                $scope.saveDisabled = (res.status === "installed" || res.status === "alive" || res.status === "update failed") ? true : false;
                $scope.undoDisabled = (res.status === "alive") ? true : false;
                getStatus();
            });
        }, 3000);
    }

    var flag = false;
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
                        init_params(res.passwd, res.instance_id, res.vnc_host, res.vnc_token);
                        getStatus();
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
        return rfb ? rfb._rfb_state : "";
    }
    $scope.start = function(){
        
        if($scope.status() !== "normal"){
            vm.start({instance_ids:[$scope.instance_id]},function(){
                function _loop(){
                    template.get_image_vnc_info({instance_id:$instance_id},function(res){
                        init_params($scope.passwd, $scope.instance_id, $scope.vnc_host, res.result.token);
                        setTimeout(function(){
                            console.log($scope.status());
                            if($scope.status() !== "normal"){
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
    };
    $scope.shutdown = function(){
        var instance_id = $scope.instance_id;
        if($scope.status() === "normal"){
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
    };
    $scope.CAD = function(){
        rfb.sendCtrlAltDel();
    };
    // $scope.updateTemplate = function(){
        //     if($scope.is_template){
        //         vnc.save({
        //             instance_id: $scope.instance_id,
        //             image_id: $id
        //         }, function(){
        //             $D('noVNC_status').innerHTML = "Update directive has been sent";
        //             rfb.disconnect();
        //         });
        //     }
        //     else{
        //         rfb.disconnect();
        //         var p_scope = $scope;
        //         $modal.open({
        //             templateUrl: "views/vdi/dialog/desktop/personal_save_template.html",
        //             size: "md",
        //             controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
        //                 $scope.min_namelength=2;$scope.max_namelength=20;
        //                 admin.query(function(res){
        //                     $scope.owners = res.users;
        //                     $scope.owner = $scope.owners[0];
        //                 });
        //                 $scope.classifys = $$$os_types;
        //                 $scope.classify = $scope.classifys[0];

        //                 $scope.selectTemplate = function(item){
        //                     $scope.template = item;
        //                 };
        //                 $scope.ok = function(){
        //                     // console.log($scope, this);
        //                     if(this.saveTemplate.$valid){
        //                         // return;
        //                         desktop.saveAsTemplate({
        //                             instance_id: p_scope.instance_id,
        //                             os_type: p_scope.os_type,
        //                             name: this.name,
        //                             type_code: this.type,
        //                             owner: $scope.owner.id
        //                         }, function(res){
        //                             //console.log(124124);
        //                             $modalInstance.close();
        //                         });
        //                     }
        //                 };
        //                 $scope.close = function(){
        //                     location.reload();
        //                     $modalInstance.close();
        //                     init_params(it.passwd, it.instance_id);
        //                 };
        //             }]
        //         });
        //     }
    // };
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
        rfb.disconnect();
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
.run(["$rootScope", "settings", "localize", function($rootScope, settings, localize){
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function(lang){
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;