angular.module("vdi.init",["ngRoute","ngResource", "ui.bootstrap","app.localize","app.controllers","vdi"])
// .config(["$httpProvider",function($httpProvider){
//     $httpProvider.interceptors.push(function($q,$$$MSG){
//         return{
//             "response":function(res){
//                 if(/^https?\:\/\//.test(res.config.url)){
//                     if(/\/v1\/node\//.test(res.config.url)){
//                         return res;
//                     }
//                     else{
//                         switch(res.data.code){
//                             case 0:
//                                 return res;
//                                 break;
//                             default:
//                                 $.bigBox({
//                                     title : $$$MSG.get("PAI_CODE") + res.data.code,
//                                     content : $$$MSG.get(res.data.code),
//                                     color : "#C46A69",
//                                     icon : "fa fa-warning shake animated",
//                                     timeout : 6000
//                                 });
//                             break;
//                         }
//                     }
//                     return $q.reject({AAA:res});
//                 }
//                 return res;
//             }
//         }
//     });

// }])

.factory("init", ["$resource", "$Domain","$location","$controllerDomain","$interfaceDomain", function($resource, $Domain,$location,$controllerDomain,$interfaceDomain){
return $resource($Domain + "/thor/init", null, {
    //检查已经初始化到第几步
    check: { method: "GET", url: $Domain + "/thor/init/check",timeout: 5000},

     set_version:{ method: "POST", url: $Domain + "/thor/init/lang"},
     get_version:{ method: "GET", url: $Domain + "/thor/init/lang"},
     // 检查初始化环境
    init_data: { method: "GET", url: $Domain + "/thor/init/data" },
     init_classes_setting: { method: "POST", url: $Domain + "/thor/init/classes" },
     init_complete:{ method: "POST",url: $Domain + "/thor/init/complete" },

     // 激活检查
     license_check: { method:"GET", url: $Domain + "/thor/license/check"},
     get_resource_id: { method:"GET", url: $Domain + "/thor/init/get_resouce_id"},

     //设置主控节点
    get_controller_status : { method:"GET", url: $controllerDomain + "/v1/node/status"},
    set_controller:{method:"POST", url:$controllerDomain + "/v1/node/config/set/controller/"},
   //获取可用网络信息
    get_interfaces : 
        { method:"GET", url: $interfaceDomain + "/v1/network/interface/list"},
    // 校验主控节点root账号
    check_root:
        { method: "POST", url: $controllerDomain + "/v1/node/check/root_account"},
    //列出管理（镜像）网络
    query_manage_network:
        { method: "GET", url: $Domain + "/thor/management_networks"},
    //列出数据网络
    query_data_network:
       { method: "GET", url: $Domain + "/thor/networks"},
     //添加计算节点
     add_agent: { method: "POST", url: $Domain + "/thor/hosts/:id", params:{id: "@id"} },
     init_agent: { method: "POST", url: $Domain + "/thor/init/agent"},

     //初始化网络
     add_network: { method: "POST", url: $Domain + "/thor/networks"},
     init_network: { method: "POST", url: $Domain + "/thor/init/network"},
     get_physic_net: { method: "GET", url: $Domain + "/thor/host/get_node_physical_network"},
     network_info: { method: "GET", url: $Domain + "/thor/host/networkInfo"}
});
}])
.controller("initController", ["$scope","init","localize","settings","$q","$$$version","$$$I18N", "$Domain","$timeout","$location","$rootScope","$splitDomain",
function($scope,init,localize,settings, $q, $$$version, $$$I18N,$Domain,$timeout,$location,$rootScope,$splitDomain){
$scope.gotoLogin = function(){
    $scope.waitComplete = true;
    checkComplete();
    function checkComplete(){
        init.get_controller_status(function(res){
            if(res.is_control_node && !res.progress){
                done();
            } else {
                $timeout(checkComplete, 1);
            }
        });
    }
    function done(){
        $scope.waitComplete = false;
        init.init_complete();
        localStorage.quickstart = true;
        location.replace("index.html");
    }
};
$scope.next = function(data){
    $rootScope.$broadcast('initGotoNext',data);
};
$scope.agent = {};
$scope.console = {
    ip:$Domain.split("http://")[1].split(":")[0],
    name:"root",
    password: $$$storage.getSessionStorage('rootPassword')
};
$scope.network = {};

$scope.get_console_status = function(){
    init.get_controller_status(function(res){
        $scope.console.is_compute_node = res.is_compute_node;
        $scope.console.is_control_node = res.is_control_node;
        if(res.is_control_node && !res.progress){
            loop_check();
        }
        else{
            $scope.next();
        }
    });
 };
 $scope.get_console_status();
 localize.setLang(settings.currentLang);

 //开始初始化
 $scope.verifyAuth = function(){
    $scope.submitting = true;
    init.check_root({
        root_password:$scope.console.password,
        node_ip:$scope.console.ip
    },function(){
        $$$storage.setSessionStorage('rootPassword', $scope.console.password)
        $scope.submitting = true;
        $scope.next();
    },function(err){
        $scope.submitting = false;
        $.bigBox({
            title : "ERROR",
            content : err.info.data,
            color : "#C46A69",
            icon : "fa fa-warning shake animated",
            timeout : 6000
        });
    });
     // $scope.next();
 }
//设置主控节点
 $scope.get_network = function(){
    init.get_interfaces(function(res){
        var interfaces = res.interfaces;
        var rows = $scope.interfaces = {};
        Object.keys(interfaces).forEach(key => {
            if(interfaces[key]){
                var member = interfaces[key].member;
                if(member){
                    member.forEach(mem => {
                        interfaces[mem] = undefined;
                    });
                }
            }
        });
        Object.keys(interfaces).forEach(key => {
            if(interfaces[key]){
                var cidrs = interfaces[key].cidr;
                if(cidrs.length){
                    rows[key] = interfaces[key];
                    rows[key]._ips = cidrs.map(c => {
                        var rtn = formatIP(c);
                        if(rtn.ip === $scope.console.ip){
                           setDefault(rows[key],rtn);
                        }
                        return rtn;
                    });
                }
            }
        });
    },function(err){
        $.bigBox({
            title : "ERROR",
            content : err.info.data,
            color : "#C46A69",
            icon : "fa fa-warning shake animated",
            timeout : 6000
        });
    });
 }
$scope.set_console_ip = function(){
    $scope.console.loadding = true;
    var d = $scope.console;
    var postData = {
        root_password:d.password,
        glance_ip:d.image_ip.ip,
        management_ip:d.manage_ip.ip,
        management_network:d.manage_ip.cidr
    };
    init.set_controller(postData).$promise
    .then(function(){
        loop_get_status();
    })
    .catch(function(err){
        $scope.console.loadding = false;
        $.bigBox({
            title : "ERROR",
            content : err.info.data,
            color : "#C46A69",
            icon : "fa fa-warning shake animated",
            timeout : 6000
        });
    });
};
    
 //激活
 $scope.finishUpload = function(){
    $scope.next();
 };

 // 初始化导入数据
$scope.importData = function(){
    var date = new Date();
    var end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 3);
    var postData = {
        "semester_start":date.getTime(),
        "semester_end":end_date.getTime()
    };

    init.init_data(function(res){
        $scope.init_data = res.result;
        init.init_classes_setting(postData);
    });
};

 // 获取及设置页面语言
 
 $scope.changeLanguage = function(key){
    settings.currentLang = settings.languages.filter(function(lang){ return lang.key === key})[0];
    localize.setLang(settings.currentLang);
 };

 //初始化版本
 $scope.get_version = function(){
    init.get_version(function(res){
        $scope.versions = settings.languages;
        $scope.versions.selected_lang = res.current_lang_type;
    });
 };
 $scope.set_version = function(){
    $scope.submitting_version = true;
    init.set_version({lang_type: $scope.versions.selected_lang},function(res){
        $scope.changeLanguage(res.current_lang_type);
        $scope.next();
    }).$promise.finally(function(){
        $scope.submitting_version = false;
    });
 };
 $scope.ex={
     url: $Domain + '/thor/license/export'
 };
 //初始化网络
 $scope.init_network = function(){
    $scope.loading_net = true;
    var _netData = $scope.network;
    var postData = {};
    postData.name = _netData.name;
   postData.switch_type = _netData.type;
    postData.create_subnet = true;
   if(_netData.type === 'vlan'){
        postData.vlan_id = _netData.vlanid;
    }
    postData.switch_name = _netData.virtual_name;
    if(postData.create_subnet){
        postData.subnet_name = _netData.subnet_name;
        postData.start_ip = _netData.dhcp_start;
        postData.end_ip = _netData.dhcp_end;
        postData.netmask = _netData.netmask;
        postData.gateway = _netData.gateway;
        postData.dns1 = _netData.dns1;
        postData.dns2 = _netData.dns2;
    }
    init.init_network(postData,function(res){
        $scope.next();
    }).$promise.finally(function(){
        $scope.loading_net = false;
    });
 };
//初始化计算节点
$scope.get_console_network = function(){
    init.query_manage_network(function(res){
        $scope.agent.manage_nets = res.result;
        $scope.agent.manage_net = $scope.agent.manage_nets[0];
        init.get_interfaces(res => {
            $scope.interfaces = {};
            Object.keys(res.interfaces).forEach(key => {
                if(res.interfaces[key]){
                    var member = res.interfaces[key].member;
                    if(member){
                        member.forEach(mem => {
                            res.interfaces[mem] = undefined;
                        });
                    }
                }
            });
            Object.keys(res.interfaces).filter(key => res.interfaces[key]).sort()
            .forEach((key,idx) => {
                !$scope.agent.dev && ($scope.agent.dev = key);
                $scope.interfaces[key] = res.interfaces[key]; 
            });
        });
    });
    init.query_data_network(function(res){
        $scope.agent.data_nets = res.networks;
        $scope.agent.data_net = $scope.agent.data_nets[0];
    });
    
};
$scope.init_agent = function(){
    if($scope.agent.on){
        $scope.agent.loadding = true;
        init.get_resource_id(function(res){
            var postData = {
                id:res.result.resouce_pool_uuid,
                ip:$scope.agent.manage_net.management_ip,
                root_password:$scope.console.password,
                virtual_type:"kvm",
                management_dev:$scope.agent.manage_net.management_dev,
                management_ip:$scope.agent.manage_net.management_ip,
                management_netmask:$scope.agent.manage_net.management_netmask,
                bond_switch_infos:[
                    {
                      'dev': $scope.agent.dev ? $scope.agent.dev : null,
                      'switch': $scope.agent.data_net.switch_name
                    }
                ]
            };
            init.init_agent(postData,function(){
                $scope.next();
            }).$promise.finally(function(){
                $scope.agent.loadding = false;
            });
        });
    }else{
        $scope.next();
    }
};

var timer = null;
var timer2 = null;
function loop_check(){
    init.check(function(res){
        $scope.console.loadding = false;
        $timeout.cancel(timer2);
        $scope.next(res.X);
    },function(err){
        timer2 = $timeout(function(){
            loop_check();
        },1000)
    });
}
function loop_get_status(){
    timer = $timeout(function(){
        init.get_controller_status(function(res){
            if(res.is_control_node && !res.progress){
                $timeout.cancel(timer);
                loop_check();
            }else{
                loop_get_status();
            }
        });
    },10000);
}
function formatIP(cidr){
    var ip = cidr.split("/")[0];
    var masklen = Number(cidr.split("/")[1]);
    var binaryMask = 0xFFFFFFFF << (32 - masklen);
    var arrmask = [];
    for(var i = 32/8; i > 0 ;i--){
        arrmask.push(binaryMask >>> 8 * (i-1) & 0xff);
    }
    return {
        cidr:cidr,
        ip:ip,
        netmask:arrmask.join(".")
    };
}
function setDefault(inter,ip){
    $scope.console.manage_net = inter;
    $scope.console.image_net = inter;
    $scope.console.manage_ip = ip;
    $scope.console.image_ip = ip;
}
}])
.directive("initStep", ["init","localize","settings","$$$version","$$$I18N",function(init,settings,$$$version,$$$I18N){
return {
    restrict: "AE",
    scope:{
        language:"@",
         getInit:"&"
     },
    transclude:true,
    replace:true,
    template:'<div class="init">\
                <aside id="left-panel" class="left-panel">\
                    <div class="logo-word">VDI</div>\
                    <div class="step-list">\
                        <header localize="系统初始化"></header>\
                        <ul>\
                            <li ng-repeat="step in steps" ng-class="{on:$index < currentIdx}"><i class="fa txt-color-greenjj icon-jj-Complete" ></i>{{$index+1}} &nbsp;&nbsp;<span  localize="{{step.title}}"></span></li>\
                        </ul>\
                    </div>\
                </aside>\
                <div id="main" class="main" >\
                    <header class="clearfix">\
                        <h3  ng-repeat="step in steps" ng-show="step.title === currentStep.title" class="title pull-left"><span localize="{{step.title}}"></span></h3>\
                        <div class="pull-right" data-lang-tool></div>\
                    </header>\
                    <div class="init-widget" ng-transclude>\
                    </div>\
                </div>\
            </div>',
    controller:["$scope","$$$I18N","$Domain",function($scope,$$$I18N,$Domain){
        var steps = $scope.steps =[];
        $scope.btn = true;
                
        $scope.domain = $Domain;
        $scope.version = $$$version;
        
        $scope.title = function(){
            return $$$I18N.get($scope.currentStep.title);
        }
        $scope.btnName = function(){
            return $$$I18N.get($scope.currentStep.btnName);
        }
        $scope.isLastStep = function(){
            return $scope.currentIdx === steps.length - 1
        };
        // 初始化数据
        $scope.initFunc = function(){
            var promise = $scope.currentStep.initData();
            angular.forEach(steps,function(s){ s.active = false})
             $scope.currentStep.active = true;
             $scope.btn = false;
             if(promise){
                promise && promise.then(function(){
                    $scope.btn = true;
                },function(){
                    $scope.btn = false;
                });
             }else{
                $scope.btn = true;
             }
             // $scope.$apply();
        }
        $scope.goStep = function(num){
             if(typeof(num)=="number" && num < steps.length && num >= 0){
                //跳入某一步
                 $scope.currentIdx = num;
                 $scope.currentStep = steps[$scope.currentIdx];
                 $scope.initFunc();
             }else if(num == "-2"){
                 //提交数据，并进入下一步 
                 var defer =  $scope.currentStep.postData();
                 if(defer){
                    defer.then(function(){
                        $scope.currentIdx += 1;
                        $scope.currentStep = steps[$scope.currentIdx];
                        $scope.initFunc();
                    });
                 }else{
                    $scope.currentIdx += 1;
                    $scope.currentStep = steps[$scope.currentIdx];
                    $scope.initFunc();
                 }
                 
             }else if(num == "-1"){
                //跳入最后一步
                 $scope.currentIdx = steps.length-1;
                 $scope.currentStep = steps[$scope.currentIdx];
                 $scope.initFunc();
             }
        };
        $scope.getLang = function(str){
            return $$$I18N.get(str);
        };
        $scope.$on('inituploadFinished',function(){
            $scope.goStep(-2);
        });

        this.addStep = function(s){
            if (steps.length === 0) {
                 $scope.currentStep = s;
             }
             steps.push(s);
        };              
    }],
    link: function(scope, element, attrs){
        scope.currentIdx = -1;
        element.css('display','block');
            scope.$on('initGotoNext',function(e,num){
                if(num){
                    scope.goStep(num);
                }else{
                scope.goStep(-2);
            }
        });
        scope.$on('initGotoLastStep',function(){
            scope.goStep(-1);
        });
    }
};
}])
.directive("stepCont",["localize",function(init){
return {
    restrict: "AE",
    transclude:true,
    replace:false,
    require:"^initStep",
    template:'<div class="step-cont" aa="{{this.$id}}{{active}}" ng-class="{active:active}" ng-transclude></div>',
    scope: {
        title: '@',
        btnName:'@',
        langVersion:"=",
        initData:'&initData',
        postData:'&postData'
    },
    controller:function($scope){
        $scope.active = false;
    },
    link: function(scope, element, attrs,initStepCtr){
        initStepCtr.addStep(scope); 
    }
};
}])
.directive("base64", ["$$$IMAGES", function($$$IMAGES){
return {
    restrict: "AE",
    link: function(scope, element, attrs){
        element.attr("src", $$$IMAGES.get(attrs.key));
        scope.$on("localizeLanguageChanged", function(){
            element.attr("src", $$$IMAGES.get(attrs.key));
        });
    }
};
}])
.directive('langTool',['localize','settings',function(localize,settings){
return {
    restrict: "AE",
    template:'\
        <button style="margin-right:10px" ng-show="show" class="btn btn-primary" ng-repeat="(key,lang) in versions" ng-click="setLang(lang.key)">{{lang.langDes}}</button>\
    ',
    link: function(scope, element, attrs){
        scope.versions = settings.languages.reduce(function(rtn,lang){
            if(!rtn[lang.langType]){
                rtn[lang.langType] = lang;
            } 
            return rtn;
        },{});
        scope.show = Object.keys(scope.versions).length > 1;
        scope.setLang = function(key){
            settings.currentLang = settings.languages.filter(function(l) {return l.langCode === key})[0];
            localize.setLang(settings.currentLang);
        }; 
    }
}
}])
