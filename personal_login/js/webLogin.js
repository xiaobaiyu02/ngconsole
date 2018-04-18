window.$$$MAIN_MODULE = "webLogin";
var app = angular.module('webLogin', ["app.localize","app.controllers","vdi"]);
//login 登录控制器
app.controller('webLoginControl', ['$scope', '$http', '$rootScope', '$timeout','$$$os_types','localize','$$$I18N', function($scope, $http, $rootScope, $timeout,$$$os_types,localize,$$$I18N) {
    var webCtrl = this;
    var deskData = null,
        cname = ['toback', 'goback', 'login'];
    webCtrl.userInfo = {}, webCtrl.switch = false,webCtrl.netError=true,webCtrl.version=false;
    //视图控制状态
    webCtrl.showPanel = function(panel) {
        var allPanels = ["loginPage", "registerPage", "deskPage"];
        allPanels.forEach(function(p) {
            webCtrl[p] = false;
        })
        webCtrl[panel] = true;
    }


    webCtrl.showPanel("loginPage");
    //获取管理台版本号
    $http({
        method:"GET",
        url:"/thor/permission"
    }).then(function(res){
        if(!res.data){ return };
        webCtrl.version=true;
        webCtrl.cmpVer=res.data.build;
    })

    //登录提交数据
    webCtrl.webLogin = function() {
        webCtrl.loading = true;
        $http({
            method: "post",
            url:"/thor/desktop/login",
            data: webCtrl.userInfo
        }).then(function(res) {
            webCtrl.loading = false;
            var status = res.data.code;
            if (status === 0) {
                webCtrl.showPanel("deskPage");
                deskData = res.data;
            }
            // webCtrl.userInfo.password='';
        }).catch(function(err) {
            webCtrl.loading = false;
            var status=err.data.code;
            if (status === 17003) {
                webCtrl.switch = true;
                webCtrl.info =$$$I18N.get("用户名或密码错误") ;
                webCtrl.userInfo.password='';
            } else if (status === 17096) {
                webCtrl.switch = true;
                webCtrl.info =$$$I18N.get("域用户名或密码错误") ;
                webCtrl.userInfo.password='';
            } else if (status === 17097) {
                webCtrl.switch = true;
                webCtrl.info =$$$I18N.get("您没有绑定桌面") ;
            } else {
                webCtrl.switch = true;
                webCtrl.info =$$$I18N.get("服务器或网络出错") ;
                webCtrl.loading = false;   
            }
        })
    }

    webCtrl.modifyPsd = function() {
        webCtrl.showPanel("registerPage");
    }

    $scope.$on("getDeskData", function(event, callback) {
        callback(deskData);
    });

    //返回操作
    angular.forEach(cname, function(value, key) {
        $scope.$on(value, function(e, d) {
            if (d) {
                webCtrl.showPanel("loginPage");
                webCtrl.userInfo={};
                webCtrl.switch=false;
            }
        })
    });

    webCtrl.ctrlSend= function(e) {
        var keycode = window.event?e.keyCode:e.which;
        if (webCtrl.userInfo.username && webCtrl.userInfo.password) {
            if(keycode===13){
                webCtrl.webLogin();
            }
        }
    }
}]);
//选择桌面控制器
app.controller('selectDeskControl', ['$scope', '$http','$$$os_types', function($scope, $http,$$$os_types) {
    var selectCtrl = this,
        i = 0,
        perPageCount = 6,
        mockData,
        arr = [],
        o={
            vms:[]  
        };
    $scope.$emit('getDeskData', function(data) {
        mockData = data || o;
    });

    //返回上一页
    selectCtrl.toback = function() {
        $scope.$emit('toback', true);
    }

    //所有ostype类型，图片类型
    $scope.$$$os_types =  $$$os_types;
    angular.forEach(mockData.vms, function(value, key) {
        angular.forEach($scope.$$$os_types , function(v, k) {
            if (value['image'].os_type.indexOf(v.key) >= 0) {
                value['image'].src ="../img/"+ v.icon;
            }
        });
    });

    selectCtrl.next = false, selectCtrl.prev = false;
    selectCtrl.dataset = mockData.vms;
    if (!mockData.vms.length) {
        return;
    } else {
        if (mockData.vms.length > perPageCount) {
            selectCtrl.next = true;
        } else {
            selectCtrl.next = false;
        }
    }
    selectCtrl.connectVnc = function(v) {
        selectCtrl.loadingbuffer = true;
        window.open('../browserOpenVNC.html#' + v.id + '&amp;' + 'Windows7' + '&amp;personal' + '&amp;' + v.display_name);
        selectCtrl.loadingbuffer = false;
        return false;
    }
    selectCtrl.prevPage = function() {
        i--;
        if (i <= 0) {
            i = 0;
            selectCtrl.dataset = mockData.vms.filter(function(item, key) {
                return key < perPageCount;
            });
            if (mockData.vms.length > perPageCount) {
                selectCtrl.prev = false;
                selectCtrl.next = true;
            }
            return;
        }
        selectCtrl.dataset = mockData.vms.filter(function(item, key) {
            return key > (perPageCount * i - 1)
        });
        selectCtrl.prev = true;
        selectCtrl.next = true;
    // selectCtrl.flag=false;
    }

    selectCtrl.nextPage = function() {
        i++;
        if (mockData.vms.length > perPageCount) {
            selectCtrl.dataset = mockData.vms.filter(function(item, key) {
                return key > (perPageCount * i - 1)
            });
            if (selectCtrl.dataset.length > perPageCount) {
                selectCtrl.next = true;
            } else {
                selectCtrl.next = false;
            }
        } else {
            selectCtrl.next = false;
        }
        selectCtrl.prev = true;
    // selectCtrl.flag=true;
    }
}]);
//注册控制器
app.controller('webRegisterController', ['$scope', '$http','$timeout', "$rootScope", "$$$I18N" ,function($scope, $http,$timeout,$rootScope, $$$I18N) {
    var registerCtrl = this;
    registerCtrl.tipsShow = false;
    registerCtrl.userInfo = {};
    registerCtrl.webRegister=function(){
       if(registerCtrl.userInfo.new_password!=registerCtrl.userInfo.confirmPsd){
           registerCtrl.tipsShow = true;
           registerCtrl.registerTips = $$$I18N.get("两次密码输入不一致");
           registerCtrl.isSubmit=true;
       } else {
           registerCtrl.isSubmit=false;
           registerCtrl.loading = true;
            $http({
                url:"/thor/desktop/change_password",
                method: "post",
                data: registerCtrl.userInfo
            }).then(function(res) {
                registerCtrl.loading = false;
                if (res.data.code === 0) {
                   registerCtrl.tipsShow = true;
                   registerCtrl.registerTips = $$$I18N.get("密码修改成功");
                   // $rootScope.$broadcast('localizeLanguageChanged');
                    $timeout(function(){
                       $scope.$emit('login', true);
                    },1000)
                }
            }).catch(function(err) {
                registerCtrl.loading = false;
                if(err.data.code===17003){
                    registerCtrl.tipsShow = true;
                    registerCtrl.registerTips = $$$I18N.get("用户名或密码错误");
                    // $rootScope.$broadcast('localizeLanguageChanged');
                } else {
                    registerCtrl.registerTips = $$$I18N.get("网络故障");
                    // $rootScope.$broadcast('localizeLanguageChanged');
                    registerCtrl.loading = false;  
                }
            })
       } 
    }
    //回退
    registerCtrl.goback = function() {
        $scope.$emit('goback', true);
    }

    registerCtrl.ctrlSend=function(e){
        var keycode = window.event?e.keyCode:e.which,flag=false,len,arr=[];
        if(keycode===13){
            len=Object.keys(registerCtrl.userInfo).length;
           for (var key in registerCtrl.userInfo) {
               if (registerCtrl.userInfo[key]) {
                   flag = true;
                   arr.push(flag);
               } else {
                   flag = false;
                   arr.push(flag)
               }
           }
           if (arr.every(function(it){return it===true})) {
               registerCtrl.webRegister();
           }
        }
    }
}]);
//桌面图标，类型常量
app.constant("$$$os_types", [
    {
        "key": "other",
        "icon": "other.png",
        "value": "Other"
    },
    {
        "key": "ArchLinux",
        "icon": "linux.png",
        "value": "Arch Linux"
    
    },
    {
        "key": "ArchLinux_64",
        "icon": "linux.png",
        "value": "Arch Linux (64 bit)"
    
    },
    {
        "key": "Debian",
        "icon": "linux.png",
        "value": "Debian"
    
    },
    {
        "key": "Debian_64",
        "icon": "linux.png",
        "value": "Debian (64 bit)"
    
    },
    {
        "key": "Fedora",
        "icon": "linux.png",
        "value": "Fedora"
    
    },
    {
        "key": "Fedora_64",
        "icon": "linux.png",
        "value": "Fedora (64 bit)"
    
    },
    {
        "key": "FreeBSD",
        "icon": "linux.png",
        "value": "FreeBSD"
    
    },
    {
        "key": "FreeBSD_64",
        "icon": "linux.png",
        "value": "FreeBSD (64 bit)"
    
    },
    {
        "key": "Gentoo",
        "icon": "linux.png",
        "value": "Gentoo"
    
    },
    {
        "key": "Gentoo_64",
        "icon": "linux.png",
        "value": "Gentoo (64 bit)"
    
    },
    {
        "key": "Linux",
        "icon": "linux.png",
        "value": "Other Linux"
    
    },
    {
        "key": "MacOS",
        "icon": "linux.png",
        "value": "Mac OS X Server"
    
    },
    {
        "key": "MacOS_64",
        "icon": "linux.png",
        "value": "Mac OS X Server (64 bit)"
    
    },
    {
        "key": "OpenBSD",
        "icon": "linux.png",
        "value": "OpenBSD"
    
    },
    {
        "key": "OpenBSD_64",
        "icon": "linux.png",
        "value": "OpenBSD (64 bit)"
    
    },
    {
        "key": "OpenSUSE",
        "icon": "linux.png",
        "value": "openSUSE"
    
    },
    {
        "key": "OpenSUSE_64",
        "icon": "linux.png",
        "value": "openSUSE (64 bit)"
    
    },
    {
        "key": "OpenSolaris",
        "icon": "linux.png",
        "value": "Oracle Solaris 10 10/09 and later"
    
    },
    {
        "key": "OpenSolaris_64",
        "icon": "linux.png",
        "value": "Oracle Solaris 10 10/09 and later (64 bit)"
    
    },
    {
        "key": "Oracle",
        "icon": "linux.png",
        "value": "Oracle"
    
    },
    {
        "key": "Oracle_64",
        "icon": "linux.png",
        "value": "Oracle (64 bit)"
    
    },
    {
        "key": "Other",
        "icon": "unknown.png",
        "value": "Other/Unknown"
    
    },
    {
        "key": "RedHat",
        "icon": "linux.png",
        "value": "Red Hat"
    
    },
    {
        "key": "RedHat_64",
        "icon": "linux.png",
        "value": "Red Hat (64 bit)"
    
    },
    {
        "key": "Solaris",
        "icon": "linux.png",
        "value": "Oracle Solaris 10 5/09 and earlier"
    
    },
    {
        "key": "Solaris_64",
        "icon": "linux.png",
        "value": "Oracle Solaris 10 5/09 and earlier (64 bit)"
    
    },
    {
        "key": "Ubuntu",
        "icon": "linux.png",
        "value": "Ubuntu"
    
    },
    {
        "key": "Ubuntu_64",
        "icon": "linux.png",
        "value": "Ubuntu (64 bit)"
    
    },
    {
        "key": "Windows2000",
        "icon": "win7.png",
        "value": "Windows 2000"
    
    },
    {
        "key": "Windows2003",
        "icon": "win2003.png",
        "value": "Windows 2003"
    
    },
    {
        "key": "Windows2003_64",
        "icon": "win2003.png",
        "value": "Windows 2003 (64 bit)"
    
    },
    {
        "key": "Windows2008",
        "icon": "win2008.png",
        "value": "Windows 2008"
    
    },
    {
        "key": "Windows2008_64",
        "icon": "win2008.png",
        "value": "Windows 2008 (64 bit)"
    
    },
    {
        "key": "Windows7",
        "icon": "win7.png",
        "value": "Windows 7"
    
    },
    {
        "key": "Windows7_64",
        "icon": "win7.png",
        "value": "Windows 7 (64 bit)"
    
    },
    {
        "key": "Windows8",
        "icon": "win8.png",
        "value": "Windows 8"
    
    },
    {
        "key": "Windows8_64",
        "icon": "win8.png",
        "value": "Windows 8 (64 bit)"
    
    },
    {
        "key": "WindowsNT",
        "icon": "win7.png",
        "value": "Other Windows"
    
    },
    {
        "key": "WindowsNT4",
        "icon": "win7.png",
        "value": "Windows NT 4"
    
    },
    {
        "key": "WindowsVista",
        "icon": "win7.png",
        "value": "Windows Vista"
    
    },
    {
        "key": "WindowsVista_64",
        "icon": "win7.png",
        "value": "Windows Vista (64 bit)"
    
    },
    {
        "key": "WindowsXP",
        "icon": "winxp.png",
        "value": "Windows XP"
    
    },
    {
        "key": "WindowsXP_64",
        "icon": "winxp.png",
        "value": "Windows XP (64 bit)"
    
    },
    {
        "key": "Windows 7",
        "icon": "win7.png",
        "value": "Windows 7 series"
    },
    {
        "key": "Windows10",
        "icon": "win8.png",
        "value": "Windows 10"
    
    },
    {
        "key": "Windows10_64",
        "icon": "win8.png",
        "value": "Windows 10 (64 bit)"
    
    },
]);
app.run(['localize',function(localize) {
    localize.setLang();
}]);
app.directive('oemImage', ['localize', function(localize){
        // Runs during compile
        return {
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            template:"<div class='logoWrap'><img ng-src='{{imgSrc}}'></div>",
            link: function($scope, iElm, iAttrs, controller) {
                var lang=localize.currentLang.langCode;
                if(lang==='fan'){
                    $scope.imgSrc="/img/personal_login_logo.png";
                } else {
                    $scope.imgSrc="./img/logo.png"
                }
            }
        };
    }]);