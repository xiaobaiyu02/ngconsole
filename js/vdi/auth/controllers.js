angular.module("vdi.auth", [
    "ngResource",
    "app.localize",
    "app.controllers",
    "vdi.user"
])
.factory("UserAuth", ["$resource", "$rootScope", "$Domain", function($resource, $root, $Domain){
    console.log($Domain);
    return $resource($Domain + "/login", null, {
        precheck: {method: "GET", url: $Domain + "/thor/home/system_check"},
        login: { method: "POST", isArray:false },
        logout: {
            method: "GET", isArray: false,
            url: $Domain + "/logout",
            transformRequest(){
                // TODO: 修改
                // 这里先获取了部分缓存，然后清空缓存，再保存部分缓存
                var theme = $$$storage.getSessionStorage('current_theme') || "smart-style-0";
                var lang_code = $$$storage.getSessionStorage('lang_code') || "e-vdi";
                var dev_host;
                if($$$storage.getSessionStorage('dev_host')){
                    dev_host = $$$storage.getSessionStorage('dev_host');
                }
                $$$storage.clearSessionStorage();
                $$$storage.setSessionStorage('current_theme', theme);
                $$$storage.setSessionStorage('lang_code', lang_code);
                if(dev_host){
                    $$$storage.setSessionStorage('dev_host', dev_host);
                }
                $root.$broadcast("NOAUTH");
            }
        }
    });
}])
.factory("init", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/init", null, {
        get_language:{ method: "GET", url: $Domain + "/thor/init/record_lang"},
        get_version:{ method: "GET", url: $Domain + "/thor/init/lang"}
    });
}])
.controller("loginController", [
    "$scope", "loginResource", "localize", "settings", "$Domain", "$$$version", "$$$I18N", "$$$MSG", "UserAuth", "UserRole", "$rootScope","init", "$$$UserRoles",
    function($scope, loginresource, localize, settings, $Domain, $$$version, $$$I18N, $$$MSG, Auth, Role, $root, init, $$$UserRoles){
        $scope.$on("changeSkin", function(e,value){
            $scope.current_theme = value;
        });
        $scope.showLoginScreen = !Role.logined;
        $scope.$on("NOAUTH", function(){
            $scope.showLoginScreen = true;
        });
        $scope.$on("AUTHED", function(){
            $scope.showLoginScreen = false;
        });
    $scope.domain = $Domain;
    $scope.langversion = $$$version;
	//document.title = $$$I18N.get("TITLE_NAME")
    loginresource.query(function(res){
        $scope.version = res.version;
    });
    $scope.current_theme = $$$storage.getSessionStorage('current_theme') || "smart-style-0";
    $scope.getCurrLang = function(){
    	$scope.currentLang = settings.languages.filter(function(l) {
			return l.langCode === $$$storage.getSessionStorage('lang_code');
		})[0];
    };
    init.get_version(function(res){
        $$$storage.setSessionStorage('lang_code', res.current_lang_type);
        $scope.getCurrLang();
        localize.setLang($scope.currentLang);
    });
	// init.get_language(function(res){
 //        localStorage.lang_code = settings.languages.reduce(function(langCode, l){
 //            if(res.language === l.langCode){
 //                return res.language;
 //            }
 //            return langCode;
 //        }, localStorage.lang_code || settings.languages[0].langCode);
	// 	$scope.getCurrLang();
	// 	localize.setLang($scope.currentLang);
	// });

    // $scope.getCurrLang();
    // localize.setLang($scope.currentLang);
    
    $scope.login = function(){
        var self = this;
        var data = {
            username: self.username,
            password: self.password
        };
        self.loading = true;
        Auth.precheck().$promise.then(function(){
            return Auth.login(data, function(res){
                // test--
                // res.user.keys = "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About";
                $$$storage.setSessionStorage('loginInfo', JSON.stringify(res.user));
                $$$storage.setSessionStorage('power', res.user.keys || $$$UserRoles);
                $$$storage.setSessionStorage('userId', res.user.id);
                $root.$broadcast("AUTHED", res.user);
                // 清空输入的用户信息
                self.username = self.password = "";
                var dms = (res.source && res.source.dms && res.source.dms!=='')?('http://'+res.source.dms):'nodms';
                $root.$broadcast("DMS", dms);
                $$$storage.setSessionStorage('DMS', dms);
            }).$promise;
        }).finally(function(){
            self.loading = false;
        });
        
    }

    // $("#login-form").on("submit", function(e){
    // 	e.preventDefault();
    //     console.log(123);
    // 	if(this.username.value && this.password.value){
    // 		$.ajax($Domain + "/login", {
    // 			method: "POST",
    // 			data: JSON.stringify({
    // 				username: this.username.value,
    // 				password: this.password.value
    // 			}),
    // 			xhrFields: {
    // 				withCredentials: true
    // 			},
    // 			crossDomain: true
    // 		}).promise().then(
    // 			function(res){
    // 				if(res.code === 0){
    // 					localStorage.loginInfo = JSON.stringify(res.user);
    // 					var powers = "Summary,Resource,Host,Network,Storage,Desktop,Teaching_desktop,Personal_desktop,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Timetable,Course_list,System,System_backup,System_ISO,USB_redirection,System_upgrade,Operation_log,About";
    // 					localStorage["power"] = res.user.keys || powers;
                        
    // 					//location.replace(localStorage.returnUrl || "index.html");
    // 				}
    // 				else{
    // 					$.bigBox({
    // 						title : $$$MSG.get("PAI_CODE") + res.code,
    // 						content : $$$MSG.get(res.code),
    // 						color : "#C46A69",
    // 						icon : "fa fa-warning shake animated",
    // 						timeout : 6000
    // 					});
    // 				}
    // 			},
    // 			function(err){

    // 			}
    // 		);
    // 	}else if(!this.username.value){
    // 		this.username.focus();
    // 	}else{
    // 		this.password.focus();
    // 	}
    // });
}])
.run([function(){
    console.log("running auth module");
}])
.config([function(){
    console.log("config auth module")
}])