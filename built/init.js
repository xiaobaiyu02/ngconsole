/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/devbuild/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 159);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 这个文件会在每个独立页面用到，如：init, index, templateXXX
 */

// TODO: 移动到基础代码
window.$$$storage = {
	getSessionStorage: function getSessionStorage(key) {
		return sessionStorage.getItem('vdi_' + key);
	},
	setSessionStorage: function setSessionStorage(key, value) {
		sessionStorage.setItem('vdi_' + key, value);
	},
	clearSessionStorage: function clearSessionStorage() {
		sessionStorage.clear();
	}
};

// 提供翻译的闭包变量
var codeData = {};
var i18nData = {};
var imagesData = {};

var firstKey = void 0; // 记录第一个支持的 OEM，没有其它选择的时候使用这个
var ng = angular.module("ng");
var supportedOems = getSupportedOEMs();
var currentOEM = null;

var host = location.hostname;
var hasBootstrap = false;

// 定义后端接口地址
var domain = location.protocol + "//" + host + ":8081"; // 多数用这个
var controllerDomain = location.protocol + "//" + host + ":19891"; // 很少用
var interfaceDomain = location.protocol + "//" + host + ":19893"; // 很少用
if (window.vdiEnvironment === "development") {
	host = $$$storage.getSessionStorage('dev_host');
	// use dev_host
	if (host) {
		domain = "http://" + host + ":8081";
		controllerDomain = "http://" + host + ":19891";
		interfaceDomain = "http://" + host + ":19893";
	} else {
		// use mock server
		domain = controllerDomain = interfaceDomain = location.origin;
	}
}

main();

/* 定义一些 angular 服务 */
ng.constant("$Domain", domain);
ng.constant("$controllerDomain", controllerDomain);
ng.constant("$interfaceDomain", interfaceDomain);
ng.constant("$splitDomain", location.protocol + "//" + ($$$storage.getSessionStorage('splitIP') || domain) + ":8081");
var splitDomain = location.protocol + "//" + ($$$storage.getSessionStorage('splitIP') || domain) + ":8081";
ng.service("$RESOURCE", [function () {
	this.get = function (key) {
		return supportedOems[key];
	};
	this.load = function (langCode, cb) {
		loadOEMResources(langCode, cb);
	};
}]);

ng.factory("settings", [function () {
	return {
		languages: Object.keys(supportedOems).map(function (key) {
			return supportedOems[key];
		}),
		currentLang: supportedOems[currentOEM]
	};
}]);

ng.service("$$$MSG", [function () {
	this.get = function (key) {
		return codeData[key] || "";
	};
}]);

ng.service("$$$I18N", [function () {
	this.get = function (key) {
		return i18nData[key] || "";
	};
}]);
ng.service("$$$IMAGES", [function () {
	this.get = function (key) {
		return imagesData[key] || "";
	};
}]);
ng.constant("$$$os_types", __webpack_require__(1));
ng.config(["$httpProvider", function ($httpProvider) {
	$httpProvider.interceptors.push(["$q", "$rootScope", "$$$MSG", function ($q, $root, $$$MSG) {
		return {
			"request": function request(config) {
				if (/^https?\:\/\//.test(config.url)) {
					config.withCredentials = true;
					return config;
				}
				if (/\.html$/i.test(config.url)) {
					return config;
				}
				if (!/^https?:\/\//.test(config.url)) {
					config.withCredentials = true;
					config.url = domain + config.url;
				}
				return config;
			},
			"requestError": function requestError(reject) {
				console.log("REQ_ERROR");
				return $q.reject({
					info: reject
				});
			},
			"responseError": function responseError(reject) {
				console.log("RES_ERROR", arguments);
				return $q.reject({
					code: 100,
					message: $$$MSG.get("返回信息格式错误"),
					info: reject
				});
			},
			"response": function response(res) {
				if (/^https?\:\/\//.test(res.config.url)) {
					if (/\/thor\/toolkit\//.test(res.config.url) || /\/v1\/(?:node|network)\//.test(res.config.url)) {
						return res;
					} else {
						switch (res.data.code) {
							case 17001:
								$root.$broadcast("NOAUTH");
								break;
							case 11011:
								$$$storage.setSessionStorage('returnUrl', location.href);
								location.replace("init.html");
								break;
							case 0:
								return res;
							default:
								if (/\/thor\/home\/tasklog/.test(res.config.url)) {
									return $q.reject(res);
								}
								if (window.ignoreAnyRequestError) {
									return res;
								}
								$.bigBox && $.bigBox({
									title: $$$MSG.get("PAI_CODE") + res.data.code,
									content: $$$MSG.get(res.data.code) == '' ? res.data.message : $$$MSG.get(res.data.code),
									color: "#C46A69",
									icon: "fa fa-warning shake animated",
									timeout: 6000
								});
								break;
						}
						return $q.reject(res);
					}
				}
				return res;
			}
		};
	}]);
}]);

/**
 * 启动 angular app
 * @param {String} oem oem 名字
 */
function bootstrap(oem) {
	var oemData = supportedOems ? supportedOems[oem] : null;
	if (!oemData) {
		if (window.vdiEnvironment === "development") {
			return alert("加载资源出错！");
		}
	}
	if (oemData.code && oemData.lang && oemData.images) {
		var $body = $(document.body);
		var theme = $$$storage.getSessionStorage('current_theme') || "smart-style-0";
		if (!/personal_login/.test(location.pathname)) {
			$body.addClass(theme);
			$("#vdi_skins_url").attr("href", '/resources/pkg/' + oem + '/skins.css');
			$body.fadeIn(1000);
		}

		// 仅开发模式提示
		if (window.vdiEnvironment === "development" && !window.$$$MAIN_MODULE) {
			return alert("main module is not defined!");
		}
		angular.bootstrap(document, [].concat(window.$$$MAIN_MODULE));
		hasBootstrap = true;
	}
}

/**
 * 加载指定的 OEM 资源
 * @param {String} oem 要加载的 OEM 资源
 * @param {Function} cb 加载成功后的回调
 */
function loadOEMResources(oem, cb) {
	if (!oem) {
		if (window.vdiEnvironment === "development") {
			return alert("获取资源 key 失败！");
		}
	}
	if (!(oem in supportedOems)) {
		console.error("unsupported resource key:", oem);
		oem = Object.keys(supportedOems)[0];
	}
	var oemData = supportedOems[oem];
	// 先检查后加载
	if (oemData.code && oemData.lang && oemData.images) {
		codeData = oemData.code;
		i18nData = oemData.lang;
		imagesData = oemData.images;
		return cb(oemData);
	}
	$.when($.getJSON('/resources/pkg/' + oem + '/code.js'), $.getJSON('/resources/pkg/' + oem + '/lang.js'), $.getJSON('/resources/pkg/' + oem + '/images.js')).done(function (codeResponse, langResponse, imagesResponse) {
		codeData = oemData.code = codeResponse[0];
		i18nData = oemData.lang = langResponse[0];
		imagesData = oemData.images = imagesResponse[0];
		if (!hasBootstrap) {
			registerLazyService();
			bootstrap(oem);
		} else {
			cb && cb(oemData);
		}
	}).fail(function () {
		console.log('load ' + oem + ' resource error:', arguments[2]);
	});
	currentOEM = oem;
}
function main() {
	var statusXhr = $.get(controllerDomain + "/v1/node/status");
	var langXhr = $.get(domain + "/thor/init/lang");
	var status_ha = $.get(domain + "/thor/get_controller_ha_status");
	$.when(statusXhr, langXhr, status_ha).done(function (statusResponse, langResponse, haResponse) {
		if (typeof statusResponse[0] === "string") {
			statusResponse[0] = JSON.parse(statusResponse[0]);
		}
		var oem = langResponse[0].current_lang_type;
		var isSplitBrain = haResponse[0].result.is_split_brain;
		var isInitPage = /init\.html$/.test(location.pathname);
		var isPersonalLoginPage = location.pathname === '/personal_login/';
		var isControlNode = statusResponse[0].is_control_node;
		var isSplitBrainPage = /split\.html$/.test(location.pathname);
		if (isSplitBrainPage) {
			if (!isSplitBrain) {
				location.replace("/");
			} else {
				start();
			}
		} else {
			if (isSplitBrain) {
				// $$$storage.clearSessionStorage();
				$$$storage.setSessionStorage('splitIP', haResponse[0].result.roles[0].ip);
				location.replace("split.html");
			} else {
				if (isControlNode) {
					if (isInitPage || isPersonalLoginPage) {
						start();
					} else {
						start(oem);
						initCurrentUser();
					}
				} else {
					if (isInitPage || isPersonalLoginPage) {
						start();
					} else {
						location.replace("init.html");
					}
				}
			}
		}
	});
}

function start(oem) {
	// 初始化页面默认没有语言
	if (!oem) {
		// NOTE: 版本是和语言相关的
		// 如果支持多个版本，优先使用系统默认语言
		if (Object.keys(supportedOems).length > 1) {
			// 仅仅我们自己的版本支持多语言
			// 参考：https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/language
			// 调试时，使用这段代码将浏览器设置为其它语言
			//   navigator.__defineGetter__("language", function(){ return "en-us" })
			var lang = navigator.language;
			if (lang) {
				lang = lang.split("-")[0].toLowerCase();
			}
			if (lang === "zh") {
				oem = "e-vdi";
			} else if (lang === "en") {
				oem = "classEn";
			}
			if (!supportedOems[oem]) {
				oem = firstKey;
			}
		} else {
			oem = firstKey; // 否则的话使用仅支持的版本
		}
	}
	loadOEMResources(oem, supportedOems);
}

function getSupportedOEMs() {
	var list = __webpack_require__(2).resources;
	var ret = {};
	list.forEach(function (item) {
		ret[item.key] = item;
		// 不知道旧代码为什么要这么做
		item.langCode = item.key;
		item.flagCode = item.key;
		item.language = item.name;
		item.translation = item.title;
	});
	firstKey = list[0].key;
	return ret;
}

function initCurrentUser() {
	var userId = $$$storage.getSessionStorage('userId');
	if (!userId) {
		return;
	}
	$.ajax({
		method: "POST",
		url: domain + "/thor/user/session",
		data: JSON.stringify({
			user_id: userId
		}),
		dataType: 'json'
	}).done(function (res) {
		if (res.code === 0) {
			// res.user.keys = "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About";
			var oldInfo = JSON.parse($$$storage.getSessionStorage("loginInfo")) || {};
			Object.keys(res.user).forEach(function (key) {
				oldInfo[key] = res.user[key];
			});
			$$$storage.setSessionStorage('loginInfo', JSON.stringify(oldInfo));
			$$$storage.setSessionStorage('power', res.user.keys);
		}
	});
}

function registerLazyService() {
	ng.constant("$$$version", i18nData["GOD_VERSION"] || "dev");
}

/***/ }),

/***/ 1:
/***/ (function(module, exports) {

module.exports = [{"key":"other","icon":"other.png","value":"Other"},{"key":"ArchLinux","icon":"linux.png","value":"Arch Linux"},{"key":"ArchLinux_64","icon":"linux.png","value":"Arch Linux (64 bit)"},{"key":"Debian","icon":"debian.png","value":"Debian"},{"key":"Debian_64","icon":"debian.png","value":"Debian (64 bit)"},{"key":"Fedora","icon":"fedora.png","value":"Fedora"},{"key":"Fedora_64","icon":"fedora.png","value":"Fedora (64 bit)"},{"key":"FreeBSD","icon":"linux.png","value":"FreeBSD"},{"key":"FreeBSD_64","icon":"linux.png","value":"FreeBSD (64 bit)"},{"key":"Gentoo","icon":"linux.png","value":"Gentoo"},{"key":"Gentoo_64","icon":"linux.png","value":"Gentoo (64 bit)"},{"key":"Linux","icon":"linux.png","value":"Other Linux"},{"key":"MacOS","icon":"linux.png","value":"Mac OS X Server"},{"key":"MacOS_64","icon":"linux.png","value":"Mac OS X Server (64 bit)"},{"key":"OpenBSD","icon":"linux.png","value":"OpenBSD"},{"key":"OpenBSD_64","icon":"linux.png","value":"OpenBSD (64 bit)"},{"key":"OpenSUSE","icon":"linux.png","value":"openSUSE"},{"key":"OpenSUSE_64","icon":"linux.png","value":"openSUSE (64 bit)"},{"key":"OpenSolaris","icon":"linux.png","value":"Oracle Solaris 10 10/09 and later"},{"key":"OpenSolaris_64","icon":"linux.png","value":"Oracle Solaris 10 10/09 and later (64 bit)"},{"key":"Oracle","icon":"linux.png","value":"Oracle"},{"key":"Oracle_64","icon":"linux.png","value":"Oracle (64 bit)"},{"key":"Other","icon":"unknown.png","value":"Other/Unknown"},{"key":"RedHat","icon":"redhat.png","value":"Red Hat"},{"key":"RedHat_64","icon":"redhat.png","value":"Red Hat (64 bit)"},{"key":"Solaris","icon":"linux.png","value":"Oracle Solaris 10 5/09 and earlier"},{"key":"Solaris_64","icon":"linux.png","value":"Oracle Solaris 10 5/09 and earlier (64 bit)"},{"key":"Ubuntu","icon":"ubuntu.png","value":"Ubuntu"},{"key":"Ubuntu_64","icon":"ubuntu.png","value":"Ubuntu (64 bit)"},{"key":"Windows2000","icon":"win7.png","value":"Windows 2000"},{"key":"Windows2003","icon":"win2003.png","value":"Windows 2003"},{"key":"Windows2003_64","icon":"win2003.png","value":"Windows 2003 (64 bit)"},{"key":"Windows2008","icon":"win2008.png","value":"Windows 2008"},{"key":"Windows2008_64","icon":"win2008.png","value":"Windows 2008 (64 bit)"},{"key":"Windows7","icon":"win7.png","value":"Windows 7"},{"key":"Windows7_64","icon":"win7.png","value":"Windows 7 (64 bit)"},{"key":"Windows8","icon":"win8.png","value":"Windows 8"},{"key":"Windows8_64","icon":"win8.png","value":"Windows 8 (64 bit)"},{"key":"WindowsNT","icon":"win7.png","value":"Other Windows"},{"key":"WindowsNT4","icon":"win7.png","value":"Windows NT 4"},{"key":"WindowsVista","icon":"win7.png","value":"Windows Vista"},{"key":"WindowsVista_64","icon":"win7.png","value":"Windows Vista (64 bit)"},{"key":"Windowsxp","icon":"winxp.png","value":"Windows XP"},{"key":"Windowsxp_64","icon":"winxp.png","value":"Windows XP (64 bit)"},{"key":"WindowsXP","icon":"winxp.png","value":"Windows XP"},{"key":"WindowsXP_64","icon":"winxp.png","value":"Windows XP (64 bit)"},{"key":"Windows 7","icon":"win7.png","value":"Windows 7 series"},{"key":"Windows10","icon":"win8.png","value":"Windows 10"},{"key":"Windows10_64","icon":"win8.png","value":"Windows 10 (64 bit)"}]

/***/ }),

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
__webpack_require__(4);
__webpack_require__(3);
__webpack_require__(5);
module.exports = __webpack_require__(160);


/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.init", ["ngRoute", "ngResource", "ui.bootstrap", "app.localize", "app.controllers", "vdi"])
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

.factory("init", ["$resource", "$Domain", "$location", "$controllerDomain", "$interfaceDomain", function ($resource, $Domain, $location, $controllerDomain, $interfaceDomain) {
    return $resource($Domain + "/thor/init", null, {
        //检查已经初始化到第几步
        check: { method: "GET", url: $Domain + "/thor/init/check", timeout: 5000 },

        set_version: { method: "POST", url: $Domain + "/thor/init/lang" },
        get_version: { method: "GET", url: $Domain + "/thor/init/lang" },
        // 检查初始化环境
        init_data: { method: "GET", url: $Domain + "/thor/init/data" },
        init_classes_setting: { method: "POST", url: $Domain + "/thor/init/classes" },
        init_complete: { method: "POST", url: $Domain + "/thor/init/complete" },

        // 激活检查
        license_check: { method: "GET", url: $Domain + "/thor/license/check" },
        get_resource_id: { method: "GET", url: $Domain + "/thor/init/get_resouce_id" },

        //设置主控节点
        get_controller_status: { method: "GET", url: $controllerDomain + "/v1/node/status" },
        set_controller: { method: "POST", url: $controllerDomain + "/v1/node/config/set/controller/" },
        //获取可用网络信息
        get_interfaces: { method: "GET", url: $interfaceDomain + "/v1/network/interface/list" },
        // 校验主控节点root账号
        check_root: { method: "POST", url: $controllerDomain + "/v1/node/check/root_account" },
        //列出管理（镜像）网络
        query_manage_network: { method: "GET", url: $Domain + "/thor/management_networks" },
        //列出数据网络
        query_data_network: { method: "GET", url: $Domain + "/thor/networks" },
        //添加计算节点
        add_agent: { method: "POST", url: $Domain + "/thor/hosts/:id", params: { id: "@id" } },
        init_agent: { method: "POST", url: $Domain + "/thor/init/agent" },

        //初始化网络
        add_network: { method: "POST", url: $Domain + "/thor/networks" },
        init_network: { method: "POST", url: $Domain + "/thor/init/network" },
        get_physic_net: { method: "GET", url: $Domain + "/thor/host/get_node_physical_network" },
        network_info: { method: "GET", url: $Domain + "/thor/host/networkInfo" }
    });
}]).controller("initController", ["$scope", "init", "localize", "settings", "$q", "$$$version", "$$$I18N", "$Domain", "$timeout", "$location", "$rootScope", "$splitDomain", function ($scope, init, localize, settings, $q, $$$version, $$$I18N, $Domain, $timeout, $location, $rootScope, $splitDomain) {
    $scope.gotoLogin = function () {
        $scope.waitComplete = true;
        checkComplete();
        function checkComplete() {
            init.get_controller_status(function (res) {
                if (res.is_control_node && !res.progress) {
                    done();
                } else {
                    $timeout(checkComplete, 1);
                }
            });
        }
        function done() {
            $scope.waitComplete = false;
            init.init_complete();
            localStorage.quickstart = true;
            location.replace("index.html");
        }
    };
    $scope.next = function (data) {
        $rootScope.$broadcast('initGotoNext', data);
    };
    $scope.agent = {};
    $scope.console = {
        ip: $Domain.split("http://")[1].split(":")[0],
        name: "root",
        password: $$$storage.getSessionStorage('rootPassword')
    };
    $scope.network = {};

    $scope.get_console_status = function () {
        init.get_controller_status(function (res) {
            $scope.console.is_compute_node = res.is_compute_node;
            $scope.console.is_control_node = res.is_control_node;
            if (res.is_control_node && !res.progress) {
                loop_check();
            } else {
                $scope.next();
            }
        });
    };
    $scope.get_console_status();
    localize.setLang(settings.currentLang);

    //开始初始化
    $scope.verifyAuth = function () {
        $scope.submitting = true;
        init.check_root({
            root_password: $scope.console.password,
            node_ip: $scope.console.ip
        }, function () {
            $$$storage.setSessionStorage('rootPassword', $scope.console.password);
            $scope.submitting = true;
            $scope.next();
        }, function (err) {
            $scope.submitting = false;
            $.bigBox({
                title: "ERROR",
                content: err.info.data,
                color: "#C46A69",
                icon: "fa fa-warning shake animated",
                timeout: 6000
            });
        });
        // $scope.next();
    };
    //设置主控节点
    $scope.get_network = function () {
        init.get_interfaces(function (res) {
            var interfaces = res.interfaces;
            var rows = $scope.interfaces = {};
            Object.keys(interfaces).forEach(function (key) {
                if (interfaces[key]) {
                    var member = interfaces[key].member;
                    if (member) {
                        member.forEach(function (mem) {
                            interfaces[mem] = undefined;
                        });
                    }
                }
            });
            Object.keys(interfaces).forEach(function (key) {
                if (interfaces[key]) {
                    var cidrs = interfaces[key].cidr;
                    if (cidrs.length) {
                        rows[key] = interfaces[key];
                        rows[key]._ips = cidrs.map(function (c) {
                            var rtn = formatIP(c);
                            if (rtn.ip === $scope.console.ip) {
                                setDefault(rows[key], rtn);
                            }
                            return rtn;
                        });
                    }
                }
            });
        }, function (err) {
            $.bigBox({
                title: "ERROR",
                content: err.info.data,
                color: "#C46A69",
                icon: "fa fa-warning shake animated",
                timeout: 6000
            });
        });
    };
    $scope.set_console_ip = function () {
        $scope.console.loadding = true;
        var d = $scope.console;
        var postData = {
            root_password: d.password,
            glance_ip: d.image_ip.ip,
            management_ip: d.manage_ip.ip,
            management_network: d.manage_ip.cidr
        };
        init.set_controller(postData).$promise.then(function () {
            loop_get_status();
        }).catch(function (err) {
            $scope.console.loadding = false;
            $.bigBox({
                title: "ERROR",
                content: err.info.data,
                color: "#C46A69",
                icon: "fa fa-warning shake animated",
                timeout: 6000
            });
        });
    };

    //激活
    $scope.finishUpload = function () {
        $scope.next();
    };

    // 初始化导入数据
    $scope.importData = function () {
        var date = new Date();
        var end_date = new Date();
        end_date.setMonth(end_date.getMonth() + 3);
        var postData = {
            "semester_start": date.getTime(),
            "semester_end": end_date.getTime()
        };

        init.init_data(function (res) {
            $scope.init_data = res.result;
            init.init_classes_setting(postData);
        });
    };

    // 获取及设置页面语言

    $scope.changeLanguage = function (key) {
        settings.currentLang = settings.languages.filter(function (lang) {
            return lang.key === key;
        })[0];
        localize.setLang(settings.currentLang);
    };

    //初始化版本
    $scope.get_version = function () {
        init.get_version(function (res) {
            $scope.versions = settings.languages;
            $scope.versions.selected_lang = res.current_lang_type;
        });
    };
    $scope.set_version = function () {
        $scope.submitting_version = true;
        init.set_version({ lang_type: $scope.versions.selected_lang }, function (res) {
            $scope.changeLanguage(res.current_lang_type);
            $scope.next();
        }).$promise.finally(function () {
            $scope.submitting_version = false;
        });
    };
    $scope.ex = {
        url: $Domain + '/thor/license/export'
    };
    //初始化网络
    $scope.init_network = function () {
        $scope.loading_net = true;
        var _netData = $scope.network;
        var postData = {};
        postData.name = _netData.name;
        postData.switch_type = _netData.type;
        postData.create_subnet = true;
        if (_netData.type === 'vlan') {
            postData.vlan_id = _netData.vlanid;
        }
        postData.switch_name = _netData.virtual_name;
        if (postData.create_subnet) {
            postData.subnet_name = _netData.subnet_name;
            postData.start_ip = _netData.dhcp_start;
            postData.end_ip = _netData.dhcp_end;
            postData.netmask = _netData.netmask;
            postData.gateway = _netData.gateway;
            postData.dns1 = _netData.dns1;
            postData.dns2 = _netData.dns2;
        }
        init.init_network(postData, function (res) {
            $scope.next();
        }).$promise.finally(function () {
            $scope.loading_net = false;
        });
    };
    //初始化计算节点
    $scope.get_console_network = function () {
        init.query_manage_network(function (res) {
            $scope.agent.manage_nets = res.result;
            $scope.agent.manage_net = $scope.agent.manage_nets[0];
            init.get_interfaces(function (res) {
                $scope.interfaces = {};
                Object.keys(res.interfaces).forEach(function (key) {
                    if (res.interfaces[key]) {
                        var member = res.interfaces[key].member;
                        if (member) {
                            member.forEach(function (mem) {
                                res.interfaces[mem] = undefined;
                            });
                        }
                    }
                });
                Object.keys(res.interfaces).filter(function (key) {
                    return res.interfaces[key];
                }).sort().forEach(function (key, idx) {
                    !$scope.agent.dev && ($scope.agent.dev = key);
                    $scope.interfaces[key] = res.interfaces[key];
                });
            });
        });
        init.query_data_network(function (res) {
            $scope.agent.data_nets = res.networks;
            $scope.agent.data_net = $scope.agent.data_nets[0];
        });
    };
    $scope.init_agent = function () {
        if ($scope.agent.on) {
            $scope.agent.loadding = true;
            init.get_resource_id(function (res) {
                var postData = {
                    id: res.result.resouce_pool_uuid,
                    ip: $scope.agent.manage_net.management_ip,
                    root_password: $scope.console.password,
                    virtual_type: "kvm",
                    management_dev: $scope.agent.manage_net.management_dev,
                    management_ip: $scope.agent.manage_net.management_ip,
                    management_netmask: $scope.agent.manage_net.management_netmask,
                    bond_switch_infos: [{
                        'dev': $scope.agent.dev ? $scope.agent.dev : null,
                        'switch': $scope.agent.data_net.switch_name
                    }]
                };
                init.init_agent(postData, function () {
                    $scope.next();
                }).$promise.finally(function () {
                    $scope.agent.loadding = false;
                });
            });
        } else {
            $scope.next();
        }
    };

    var timer = null;
    var timer2 = null;
    function loop_check() {
        init.check(function (res) {
            $scope.console.loadding = false;
            $timeout.cancel(timer2);
            $scope.next(res.X);
        }, function (err) {
            timer2 = $timeout(function () {
                loop_check();
            }, 1000);
        });
    }
    function loop_get_status() {
        timer = $timeout(function () {
            init.get_controller_status(function (res) {
                if (res.is_control_node && !res.progress) {
                    $timeout.cancel(timer);
                    loop_check();
                } else {
                    loop_get_status();
                }
            });
        }, 10000);
    }
    function formatIP(cidr) {
        var ip = cidr.split("/")[0];
        var masklen = Number(cidr.split("/")[1]);
        var binaryMask = 0xFFFFFFFF << 32 - masklen;
        var arrmask = [];
        for (var i = 32 / 8; i > 0; i--) {
            arrmask.push(binaryMask >>> 8 * (i - 1) & 0xff);
        }
        return {
            cidr: cidr,
            ip: ip,
            netmask: arrmask.join(".")
        };
    }
    function setDefault(inter, ip) {
        $scope.console.manage_net = inter;
        $scope.console.image_net = inter;
        $scope.console.manage_ip = ip;
        $scope.console.image_ip = ip;
    }
}]).directive("initStep", ["init", "localize", "settings", "$$$version", "$$$I18N", function (init, settings, $$$version, $$$I18N) {
    return {
        restrict: "AE",
        scope: {
            language: "@",
            getInit: "&"
        },
        transclude: true,
        replace: true,
        template: '<div class="init">\
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
        controller: ["$scope", "$$$I18N", "$Domain", function ($scope, $$$I18N, $Domain) {
            var steps = $scope.steps = [];
            $scope.btn = true;

            $scope.domain = $Domain;
            $scope.version = $$$version;

            $scope.title = function () {
                return $$$I18N.get($scope.currentStep.title);
            };
            $scope.btnName = function () {
                return $$$I18N.get($scope.currentStep.btnName);
            };
            $scope.isLastStep = function () {
                return $scope.currentIdx === steps.length - 1;
            };
            // 初始化数据
            $scope.initFunc = function () {
                var promise = $scope.currentStep.initData();
                angular.forEach(steps, function (s) {
                    s.active = false;
                });
                $scope.currentStep.active = true;
                $scope.btn = false;
                if (promise) {
                    promise && promise.then(function () {
                        $scope.btn = true;
                    }, function () {
                        $scope.btn = false;
                    });
                } else {
                    $scope.btn = true;
                }
                // $scope.$apply();
            };
            $scope.goStep = function (num) {
                if (typeof num == "number" && num < steps.length && num >= 0) {
                    //跳入某一步
                    $scope.currentIdx = num;
                    $scope.currentStep = steps[$scope.currentIdx];
                    $scope.initFunc();
                } else if (num == "-2") {
                    //提交数据，并进入下一步 
                    var defer = $scope.currentStep.postData();
                    if (defer) {
                        defer.then(function () {
                            $scope.currentIdx += 1;
                            $scope.currentStep = steps[$scope.currentIdx];
                            $scope.initFunc();
                        });
                    } else {
                        $scope.currentIdx += 1;
                        $scope.currentStep = steps[$scope.currentIdx];
                        $scope.initFunc();
                    }
                } else if (num == "-1") {
                    //跳入最后一步
                    $scope.currentIdx = steps.length - 1;
                    $scope.currentStep = steps[$scope.currentIdx];
                    $scope.initFunc();
                }
            };
            $scope.getLang = function (str) {
                return $$$I18N.get(str);
            };
            $scope.$on('inituploadFinished', function () {
                $scope.goStep(-2);
            });

            this.addStep = function (s) {
                if (steps.length === 0) {
                    $scope.currentStep = s;
                }
                steps.push(s);
            };
        }],
        link: function link(scope, element, attrs) {
            scope.currentIdx = -1;
            element.css('display', 'block');
            scope.$on('initGotoNext', function (e, num) {
                if (num) {
                    scope.goStep(num);
                } else {
                    scope.goStep(-2);
                }
            });
            scope.$on('initGotoLastStep', function () {
                scope.goStep(-1);
            });
        }
    };
}]).directive("stepCont", ["localize", function (init) {
    return {
        restrict: "AE",
        transclude: true,
        replace: false,
        require: "^initStep",
        template: '<div class="step-cont" aa="{{this.$id}}{{active}}" ng-class="{active:active}" ng-transclude></div>',
        scope: {
            title: '@',
            btnName: '@',
            langVersion: "=",
            initData: '&initData',
            postData: '&postData'
        },
        controller: function controller($scope) {
            $scope.active = false;
        },
        link: function link(scope, element, attrs, initStepCtr) {
            initStepCtr.addStep(scope);
        }
    };
}]).directive("base64", ["$$$IMAGES", function ($$$IMAGES) {
    return {
        restrict: "AE",
        link: function link(scope, element, attrs) {
            element.attr("src", $$$IMAGES.get(attrs.key));
            scope.$on("localizeLanguageChanged", function () {
                element.attr("src", $$$IMAGES.get(attrs.key));
            });
        }
    };
}]).directive('langTool', ['localize', 'settings', function (localize, settings) {
    return {
        restrict: "AE",
        template: '\
        <button style="margin-right:10px" ng-show="show" class="btn btn-primary" ng-repeat="(key,lang) in versions" ng-click="setLang(lang.key)">{{lang.langDes}}</button>\
    ',
        link: function link(scope, element, attrs) {
            scope.versions = settings.languages.reduce(function (rtn, lang) {
                if (!rtn[lang.langType]) {
                    rtn[lang.langType] = lang;
                }
                return rtn;
            }, {});
            scope.show = Object.keys(scope.versions).length > 1;
            scope.setLang = function (key) {
                settings.currentLang = settings.languages.filter(function (l) {
                    return l.langCode === key;
                })[0];
                localize.setLang(settings.currentLang);
            };
        }
    };
}]);

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = {"resource_template":{"key":"0","title":"dev"},"resources":[{"key":"e-vdi","name":"E-VDI","title":"E-VDI","langType":"cn","langDes":"中文","clientKey":"public","public":true},{"key":"pc","name":"云PC","title":"云PC","langType":"cn","langDes":"中文","clientKey":"public","public":true},{"key":"classCh","name":"云教室","title":"云教室中文","langType":"cn","langDes":"中文","clientKey":"public","public":true},{"key":"classEn","name":"Cloud Class","title":"云教室英文","langType":"en","langDes":"English","clientKey":"public","public":true}]}

/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("app.controllers", []).controller("PageViewController", ["$scope", "$route", "$animate", function ($scope, $route, $animate) {
	// controler of the dynamically loaded views, for DEMO purposes only.
	// $scope.$on("$viewContentLoaded", function() {
	// 	console.log("ffffffff")
	// })
}]).controller("LangController", ["$scope", "settings", "localize", function ($scope, settings, localize) {
	$scope.languages = settings.languages;
	$scope.currentLang = settings.currentLang || $scope.languages[0];
	$scope.setLang = function (lang) {
		settings.currentLang = lang;
		$scope.currentLang = lang;
		localize.setLang(lang);
		$$$storage.setSessionStorage('lang_code', lang.langCode);
	};
	// set the default language
	$scope.setLang($scope.currentLang);
}]);

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module('app.main', [])
// initiate body
.directive('body', function () {
	return {
		restrict: 'E',
		link: function link(scope, element, attrs) {
			element.on('click', 'a[href="#"], [data-toggle]', function (e) {
				e.preventDefault();
			});
		}
	};
}).factory('ribbon', ['$rootScope', function ($rootScope) {
	var ribbon = {
		currentBreadcrumb: [],
		updateBreadcrumb: function updateBreadcrumb(crumbs) {
			var breadCrumb = crumbs.reverse();
			ribbon.currentBreadcrumb = breadCrumb;
			$rootScope.$broadcast('navItemSelected', breadCrumb);
		}
	};

	return ribbon;
}]).directive('action', function () {
	return {
		restrict: 'A',
		link: function link(scope, element, attrs) {
			/*
    * SMART ACTIONS
    */
			var smartActions = {

				// LOGOUT MSG 
				userLogout: function userLogout($this) {

					// ask verification
					$.SmartMessageBox({
						title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> Logout <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
						content: $this.data('logout-msg') || "You can improve your security further after logging out by closing this opened browser",
						buttons: '[No][Yes]'

					}, function (ButtonPressed) {
						if (ButtonPressed == "Yes") {
							$.root_.addClass('animated fadeOutUp');
							setTimeout(logout, 1000);
						}
					});
					function logout() {
						window.location = $this.attr('href');
					}
				},

				// RESET WIDGETS
				resetWidgets: function resetWidgets($this) {
					$.widresetMSG = $this.data('reset-msg');

					$.SmartMessageBox({
						title: "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
						content: $.widresetMSG || "Would you like to RESET all your saved widgets and clear LocalStorage?",
						buttons: '[No][Yes]'
					}, function (ButtonPressed) {
						if (ButtonPressed == "Yes" && localStorage) {
							localStorage.clear();
							location.reload();
						}
					});
				},

				// LAUNCH FULLSCREEN 
				launchFullscreen: function launchFullscreen(element) {

					if (!$.root_.hasClass("full-screen")) {

						$.root_.addClass("full-screen");

						if (element.requestFullscreen) {
							element.requestFullscreen();
						} else if (element.mozRequestFullScreen) {
							element.mozRequestFullScreen();
						} else if (element.webkitRequestFullscreen) {
							element.webkitRequestFullscreen();
						} else if (element.msRequestFullscreen) {
							element.msRequestFullscreen();
						}
					} else {

						$.root_.removeClass("full-screen");

						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						}
					}
				},

				// MINIFY MENU
				minifyMenu: function minifyMenu($this) {
					if (!$.root_.hasClass("menu-on-top")) {
						$.root_.toggleClass("minified");
						$.root_.removeClass("hidden-menu");
						$('html').removeClass("hidden-menu-mobile-lock");
						$this.effect("highlight", {}, 500);
					}
				},

				// TOGGLE MENU 
				toggleMenu: function toggleMenu() {
					if (!$.root_.hasClass("menu-on-top")) {
						$('html').toggleClass("hidden-menu-mobile-lock");
						$.root_.toggleClass("hidden-menu");
						$.root_.removeClass("minified");
					} else if ($.root_.hasClass("menu-on-top") && $.root_.hasClass("mobile-view-activated")) {
						$('html').toggleClass("hidden-menu-mobile-lock");
						$.root_.toggleClass("hidden-menu");
						$.root_.removeClass("minified");
					}
				},

				// TOGGLE SHORTCUT 
				toggleShortcut: function toggleShortcut() {

					if (shortcut_dropdown.is(":visible")) {
						shortcut_buttons_hide();
					} else {
						shortcut_buttons_show();
					}

					// SHORT CUT (buttons that appear when clicked on user name)
					shortcut_dropdown.find('a').click(function (e) {
						e.preventDefault();
						window.location = $(this).attr('href');
						setTimeout(shortcut_buttons_hide, 300);
					});

					// SHORTCUT buttons goes away if mouse is clicked outside of the area
					$(document).mouseup(function (e) {
						if (!shortcut_dropdown.is(e.target) && shortcut_dropdown.has(e.target).length === 0) {
							shortcut_buttons_hide();
						}
					});

					// SHORTCUT ANIMATE HIDE
					function shortcut_buttons_hide() {
						shortcut_dropdown.animate({
							height: "hide"
						}, 300, "easeOutCirc");
						$.root_.removeClass('shortcut-on');
					}

					// SHORTCUT ANIMATE SHOW
					function shortcut_buttons_show() {
						shortcut_dropdown.animate({
							height: "show"
						}, 200, "easeOutCirc");
						$.root_.addClass('shortcut-on');
					}
				}

			};

			var actionEvents = {
				userLogout: function userLogout(e) {
					smartActions.userLogout(element);
				},
				resetWidgets: function resetWidgets(e) {
					smartActions.resetWidgets(element);
				},
				launchFullscreen: function launchFullscreen(e) {
					smartActions.launchFullscreen(document.documentElement);
				},
				minifyMenu: function minifyMenu(e) {
					smartActions.minifyMenu(element);
				},
				toggleMenu: function toggleMenu(e) {
					smartActions.toggleMenu();
				},
				toggleShortcut: function toggleShortcut(e) {
					smartActions.toggleShortcut();
				}
			};

			if (angular.isDefined(attrs.action) && attrs.action != '') {
				var actionEvent = actionEvents[attrs.action];
				if (typeof actionEvent === 'function') {
					element.on('click', function (e) {
						actionEvent(e);
						e.preventDefault();
					});
				}
			}
		}
	};
}).directive('header', function () {
	return {
		restrict: 'EA',
		link: function link(scope, element, attrs) {
			// SHOW & HIDE MOBILE SEARCH FIELD
			angular.element('#search-mobile').click(function () {
				$.root_.addClass('search-mobile');
			});

			angular.element('#cancel-search-js').click(function () {
				$.root_.removeClass('search-mobile');
			});
		}
	};
}).directive('ribbon', function () {
	return {
		restrict: 'A',
		link: function link(scope, element, attrs) {
			return;
			element.append('<div class="demo"><span id="demo-setting"><i class="fa fa-cog txt-color-blueDark"></i></span> <form><legend class="no-padding margin-bottom-10">Layout Options</legend><section><label><input name="subscription" id="smart-fixed-header" type="checkbox" class="checkbox style-0"><span>Fixed Header</span></label><label><input type="checkbox" name="terms" id="smart-fixed-navigation" class="checkbox style-0"><span>Fixed Navigation</span></label><label><input type="checkbox" name="terms" id="smart-fixed-ribbon" class="checkbox style-0"><span>Fixed Ribbon</span></label><label><input type="checkbox" name="terms" id="smart-fixed-footer" class="checkbox style-0"><span>Fixed Footer</span></label><label><input type="checkbox" name="terms" id="smart-fixed-container" class="checkbox style-0"><span>Inside <b>.container</b> <div class="font-xs text-right">(non-responsive)</div></span></label><label style="display:block;"><input type="checkbox" id="smart-topmenu" class="checkbox style-0"><span>Menu on <b>top</b></span></label> <span id="smart-bgimages"></span></section><section><h6 class="margin-top-10 semi-bold margin-bottom-5">Clear Localstorage</h6><a href="javascript:void(0);" class="btn btn-xs btn-block btn-primary" id="reset-smart-widget"><i class="fa fa-refresh"></i> Factory Reset</a></section> <h6 class="margin-top-10 semi-bold margin-bottom-5">SmartAdmin Skins</h6><section id="smart-styles"><a href="javascript:void(0);" id="smart-style-0" data-skinlogo="img/logo.png" class="btn btn-block btn-xs txt-color-white margin-right-5" style="background-color:#4E463F;"><i class="fa fa-check fa-fw" id="skin-checked"></i>Smart Default</a><a href="javascript:void(0);" id="smart-style-1" data-skinlogo="img/logo-white.png" class="btn btn-block btn-xs txt-color-white" style="background:#3A4558;">Dark Elegance</a><a href="javascript:void(0);" id="smart-style-2" data-skinlogo="img/logo-blue.png" class="btn btn-xs btn-block txt-color-darken margin-top-5" style="background:#fff;">Ultra Light</a><a href="javascript:void(0);" id="smart-style-3" data-skinlogo="img/logo-pale.png" class="btn btn-xs btn-block txt-color-white margin-top-5" style="background:#f78c40">Google Skin</a></section></form> </div>');

			// hide bg options
			var smartbgimage = "<h6 class='margin-top-10 semi-bold'>Background</h6><img src='img/pattern/graphy-xs.png' data-htmlbg-url='img/pattern/graphy.png' width='22' height='22' class='margin-right-5 bordered cursor-pointer'><img src='img/pattern/tileable_wood_texture-xs.png' width='22' height='22' data-htmlbg-url='img/pattern/tileable_wood_texture.png' class='margin-right-5 bordered cursor-pointer'><img src='img/pattern/sneaker_mesh_fabric-xs.png' width='22' height='22' data-htmlbg-url='img/pattern/sneaker_mesh_fabric.png' class='margin-right-5 bordered cursor-pointer'><img src='img/pattern/nistri-xs.png' data-htmlbg-url='img/pattern/nistri.png' width='22' height='22' class='margin-right-5 bordered cursor-pointer'><img src='img/pattern/paper-xs.png' data-htmlbg-url='img/pattern/paper.png' width='22' height='22' class='bordered cursor-pointer'>";
			$("#smart-bgimages").fadeOut();

			$('#demo-setting').click(function () {
				$('#ribbon .demo').toggleClass('activate');
			});
			/*
    * FIXED HEADER
    */
			$('input[type="checkbox"]#smart-fixed-header').click(function () {
				if ($(this).is(':checked')) {
					//checked
					$.root_.addClass("fixed-header");
				} else {
					//unchecked
					$('input[type="checkbox"]#smart-fixed-ribbon').prop('checked', false);
					$('input[type="checkbox"]#smart-fixed-navigation').prop('checked', false);

					$.root_.removeClass("fixed-header");
					$.root_.removeClass("fixed-navigation");
					$.root_.removeClass("fixed-ribbon");
				}
			});

			/*
    * FIXED NAV
    */
			$('input[type="checkbox"]#smart-fixed-navigation').click(function () {
				if ($(this).is(':checked')) {
					//checked
					$('input[type="checkbox"]#smart-fixed-header').prop('checked', true);

					$.root_.addClass("fixed-header");
					$.root_.addClass("fixed-navigation");

					$('input[type="checkbox"]#smart-fixed-container').prop('checked', false);
					$.root_.removeClass("container");
				} else {
					//unchecked
					$('input[type="checkbox"]#smart-fixed-ribbon').prop('checked', false);
					$.root_.removeClass("fixed-navigation");
					$.root_.removeClass("fixed-ribbon");
				}
			});

			/*
    * FIXED RIBBON
    */
			$('input[type="checkbox"]#smart-fixed-ribbon').click(function () {
				if ($(this).is(':checked')) {

					//checked
					$('input[type="checkbox"]#smart-fixed-header').prop('checked', true);
					$('input[type="checkbox"]#smart-fixed-navigation').prop('checked', true);
					$('input[type="checkbox"]#smart-fixed-ribbon').prop('checked', true);

					//apply
					$.root_.addClass("fixed-header");
					$.root_.addClass("fixed-navigation");
					$.root_.addClass("fixed-ribbon");

					$('input[type="checkbox"]#smart-fixed-container').prop('checked', false);
					$.root_.removeClass("container");
				} else {
					//unchecked
					$.root_.removeClass("fixed-ribbon");
				}
			});

			/*
    * RTL SUPPORT
    */
			$('input[type="checkbox"]#smart-fixed-footer').click(function () {
				if ($(this).is(':checked')) {

					//checked
					$.root_.addClass("fixed-page-footer");
				} else {
					//unchecked
					$.root_.removeClass("fixed-page-footer");
				}
			});

			/*
    * RTL SUPPORT
    */
			$('input[type="checkbox"]#smart-rtl').click(function () {
				if ($(this).is(':checked')) {

					//checked
					$.root_.addClass("smart-rtl");
				} else {
					//unchecked
					$.root_.removeClass("smart-rtl");
				}
			});

			/*
    * MENU ON TOP
    */

			$('#smart-topmenu').on('change', function (e) {
				if ($(this).prop('checked')) {
					//window.location.href = '?menu=top';
					localStorage.setItem('sm-setmenu', 'top');
					location.reload();
				} else {
					//window.location.href = '?';
					localStorage.setItem('sm-setmenu', 'left');
					location.reload();
				}
			});

			if (localStorage.getItem('sm-setmenu') == 'top') {
				$('#smart-topmenu').prop('checked', true);
			} else {
				$('#smart-topmenu').prop('checked', false);
			}

			/*
    * INSIDE CONTAINER
    */
			$('input[type="checkbox"]#smart-fixed-container').click(function () {
				if ($(this).is(':checked')) {
					//checked
					$.root_.addClass("container");

					$('input[type="checkbox"]#smart-fixed-ribbon').prop('checked', false);
					$.root_.removeClass("fixed-ribbon");

					$('input[type="checkbox"]#smart-fixed-navigation').prop('checked', false);
					$.root_.removeClass("fixed-navigation");

					if (smartbgimage) {
						$("#smart-bgimages").append(smartbgimage).fadeIn(1000);
						$("#smart-bgimages img").bind("click", function () {
							var $this = $(this);
							var $html = $('html');
							bgurl = $this.data("htmlbg-url");
							$html.css("background-image", "url(" + bgurl + ")");
						});
						smartbgimage = null;
					} else {
						$("#smart-bgimages").fadeIn(1000);
					}
				} else {
					//unchecked
					$.root_.removeClass("container");
					$("#smart-bgimages").fadeOut();
				}
			});

			/*
    * REFRESH WIDGET
    */
			$("#reset-smart-widget").bind("click", function () {
				$('#refresh').click();
				return false;
			});

			/*
    * STYLES
    */
			$("#smart-styles > a").on('click', function () {
				var $this = $(this);
				var $logo = $("#logo img");
				$.root_.removeClassPrefix('smart-style').addClass($this.attr("id"));
				$logo.attr('src', $this.data("skinlogo"));
				$("#smart-styles > a #skin-checked").remove();
				$this.prepend("<i class='fa fa-check fa-fw' id='skin-checked'></i>");
			});
		}
	};
}).controller('breadcrumbController', ['$scope', function ($scope) {
	$scope.breadcrumbs = [];
	$scope.$on('navItemSelected', function (name, crumbs) {
		$scope.setBreadcrumb(crumbs);
	});

	$scope.setBreadcrumb = function (crumbs) {
		$scope.breadcrumbs = crumbs;
	};
}]).directive('breadcrumb', ['ribbon', 'localize', '$compile', function (ribbon, localize, $compile) {
	return {
		restrict: 'AE',
		controller: 'breadcrumbController',
		replace: true,
		link: function link(scope, element, attrs) {
			scope.$watch('breadcrumbs', function (newVal, oldVal) {
				if (newVal !== oldVal || !element.text()) {
					// update DOM
					scope.updateDOM();
				}
			});
			scope.updateDOM = function () {
				element.empty();
				angular.forEach(scope.breadcrumbs, function (crumb) {
					var li = angular.element('<li data-localize="' + crumb + '">' + crumb + '</li>');
					li.text(localize.localizeText(crumb));

					$compile(li)(scope);
					element.append(li);
				});
			};

			// set the current breadcrumb on load
			scope.setBreadcrumb(ribbon.currentBreadcrumb);
			scope.updateDOM();
		},
		template: '<ol class="breadcrumb"></ol>'
	};
}]);

// directives for localization
angular.module('app.localize', []).factory('localize', ['$http', '$rootScope', '$window', "settings", "$RESOURCE", function ($http, $rootScope, $window, settings, $RESOURCE) {
	// shared variables for `translate`
	var encodeHTML = function encodeHTML(txt) {
		return txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};
	var tmplReg = /\{\{([^\}]+)\}\}/g;
	var interestAttrReg = /^param\d+$/;
	// internal flag
	var ready = false;
	// factory
	var localize = {
		currentLocaleData: {},
		currentLang: {},
		setLang: function setLang(lang) {
			if (!lang) {
				lang = settings.languages[0];
			}
			$RESOURCE.load(lang.key, function (data) {
				localize.currentLocaleData = data.lang;
				localize.currentLang = lang;
				ready = true;
				$rootScope.$broadcast('localizeLanguageChanged');
			});
		},
		getLangUrl: function getLangUrl(lang) {
			return "resources/pkg/" + lang.langCode + "/lang.js";
		},

		localizeText: function localizeText(sourceText) {
			return localize.currentLocaleData[sourceText];
		},
		translate: function translate(scope, element, attrs, transkey) {
			var onAttrChange = function onAttrChange(e) {
				if (!ready) {
					return;
				}
				var tmpl = localize.localizeText(attrs[transkey]);
				// 无效的翻译
				if (!tmpl) {
					// debug
					// return console.error("invalid " + transkey + "=\"" + attrs[transkey] + "\"");
					return;
				}
				var myhtml = tmplReg.test(tmpl) ? tmpl.replace(tmplReg, function (match, index) {
					var myattr = "param" + index;
					var value = attrs[myattr];
					return encodeHTML(value);
				}) : tmpl;
				switch (transkey) {
					case "localize":
						if (element.is("input, textarea")) {
							element.attr("placeholder", myhtml);
						} else {
							element.html(myhtml);
						}
						break;
					case "localizeHref":
						element.attr("href", myhtml);break;
					case "localizeTitle":
						element.attr("title", myhtml);break;
					case "localizePlaceholder":
						element.attr("placeholder", myhtml);break;
				}
			};
			angular.forEach(attrs, function (v, k) {
				if (interestAttrReg.test(k)) {
					attrs.$observe(k, onAttrChange);
				}
			});
			if (ready) {
				onAttrChange();
			}
			scope.$on("localizeLanguageChanged", onAttrChange);
		},
		isReady: function isReady() {
			return ready;
		}
	};

	return localize;
}]).directive('localize', ['localize', function (localize) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			localize.translate(scope, element, attrs, "localize");
		}
	};
}]).directive("localizeTitle", ["localize", function (localize) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			localize.translate(scope, element, attrs, "localizeTitle");
		}
	};
}]).directive("localizePlaceholder", ["localize", function (localize) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			localize.translate(scope, element, attrs, "localizePlaceholder");
		}
	};
}]).directive("localizeHref", ["localize", function (localize) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			localize.translate(scope, element, attrs, "localizeHref");
		}
	};
}]);

// directives for navigation
angular.module('app.navigation', []).directive('navigation', ["$timeout", function ($timeout) {
	return {
		restrict: 'AE',
		controller: ['$scope', function ($scope) {
			//$scope.version = $$$version;
		}],
		transclude: true,
		replace: true,
		link: function link(scope, element, attrs) {
			var timer = null;
			var timer_handle = function timer_handle() {
				if (!topmenu) {
					if (!null) {
						element.first().jarvismenu({
							accordion: true,
							speed: $.menu_speed,
							closedSign: '<em class="fa icon-jj-xiala"></em>',
							openedSign: '<em class="fa icon-jj-sou"></em>'
						});
					} else {
						//alert("Error - menu anchor does not exist");
						$.bigBox({
							title: "Error",
							content: "menu anchor does not exist",
							color: "#C46A69",
							icon: "fa fa-warning shake animated",
							number: "1",
							timeout: 6000
						});
					}
				}

				// SLIMSCROLL FOR NAV
				if ($.fn.slimScroll) {
					element.slimScroll({
						height: '100%'
					});
				}

				scope.getElement = function () {
					return element;
				};
			};
			scope.$on("updateNavData", function (name, navs) {
				scope.navs = navs;
			});
			scope.$on("renderNavItem", function (name) {
				$timeout.cancel(timer);
				timer = $timeout(timer_handle, 100);
			});
		},
		template: "<nav><ul data-ng-transclude></ul></nav>"
	};
}]).controller('NavItemController', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
	$scope.isChild = false;
	$scope.active = false;
	$scope.isActive = function (viewLocation) {
		$scope.active = viewLocation === $location.path();
		return $scope.active;
	};
	$scope.hasIcon = angular.isDefined($scope.icon);
	$scope.hasIconCaption = angular.isDefined($scope.iconCaption);

	$scope.getItemUrl = function (view) {
		if (angular.isDefined($scope.href)) return $scope.href;
		if (!angular.isDefined(view)) return '';
		return '#' + view;
	};

	$scope.getItemTarget = function () {
		return angular.isDefined($scope.target) ? $scope.target : '_self';
	};
	$scope.$emit("renderNavItem");
}]).directive('navItem', ['ribbon', "$rootScope", function (ribbon, $root) {
	return {
		require: ['^navigation'],
		restrict: 'AE',
		controller: 'NavItemController',
		scope: {
			title: '@navTitle',
			view: '@',
			icon: '@',
			iconCaption: '@',
			href: '@',
			target: '@'
		},
		link: function link(scope, element, attrs, parentCtrls) {
			var navCtrl = parentCtrls[0],
			    navgroupCtrl = parentCtrls[1];
			if (attrs.view) {
				element.find("ul").remove();
			}
			scope.$watch('active', function (newVal, oldVal) {
				if (newVal) {
					navgroupCtrl && navgroupCtrl.setActive(true);
					$root.$broadcast("updateDocumentTitle", scope.title);
					scope.setBreadcrumb();
				} else {
					navgroupCtrl && navgroupCtrl.setActive(false);
				}
			});

			scope.openParents = scope.isActive(scope.view);
			scope.isChild = angular.isDefined(navgroupCtrl);

			scope.setBreadcrumb = function () {
				var crumbs = [];
				crumbs.push(scope.title);
				// get parent menus
				var test = element.parents('nav li').each(function () {
					var el = angular.element(this);
					var parent = el.find('.menu-item-parent:eq(0)');
					crumbs.push(parent.data('localize').trim());
					if (scope.openParents) {
						// open menu on first load
						parent.trigger('click');
					}
				});
				// this should be only fired upon first load so let's set this to false now
				scope.openParents = false;
				ribbon.updateBreadcrumb(crumbs);
			};

			element.on('click', 'a[href!="#"]', function () {
				if ($.root_.hasClass('mobile-view-activated')) {
					$.root_.removeClass('hidden-menu');
					$('html').removeClass("hidden-menu-mobile-lock");
				}
			});
		},
		transclude: true,
		replace: true,
		template: '\n\t\t\t<li data-ng-class="{active: isActive(view)}">\n\t\t\t\t<a href="{{ getItemUrl(view) }}" target="{{ getItemTarget() }}">\n\t\t\t\t\t<i data-ng-if="hasIcon" class="{{ icon }}"><em data-ng-if="hasIconCaption"> {{ iconCaption }} </em></i>\n\t\t\t\t\t<span ng-class="{\'menu-item-parent\': !isChild}" data-localize="{{ title }}"></span>\n\t\t\t\t</a>\n\t\t\t\t<ul data-ng-transclude=""></ul>\n\t\t\t</li>'
	};
}]);

// directives for activity
angular.module('app.activity', []).controller('ActivityController', ['$scope', '$http', function ($scope, $http) {
	var ctrl = this,
	    items = ctrl.items = $scope.items = [];

	ctrl.loadItem = function (loadedItem, callback) {
		angular.forEach(items, function (item) {
			if (item.active && item !== loadedItem) {
				item.active = false;
				//item.onDeselect();
			}
		});

		loadedItem.active = true;
		if (angular.isDefined(loadedItem.onLoad)) {
			loadedItem.onLoad(loadedItem);
		}

		$http.get(loadedItem.src).then(function (result) {
			var content = result.data;
			if (angular.isDefined(callback)) {
				callback(content);
			}
		});
	};

	ctrl.addItem = function (item) {
		items.push(item);
		if (!angular.isDefined(item.active)) {
			// set the default
			item.active = false;
		} else if (item.active) {
			ctrl.loadItem(item);
		}
	};

	ctrl.refresh = function (e) {
		var btn = angular.element(e.currentTarget);
		btn.button('loading');

		if (angular.isDefined($scope.onRefresh)) {
			$scope.onRefresh($scope, function () {
				btn.button('reset');
			});
		} else {
			btn.button('reset');
		}
	};
}]).directive('activity', function () {
	return {
		restrict: 'AE',
		replace: true,
		transclude: true,
		controller: 'ActivityController',
		scope: {
			onRefresh: '=onrefresh'
		},
		template: '<span data-ng-transclude=""></span>'
	};
}).directive('activityButton', function () {
	return {
		restrict: 'AE',
		require: '^activity',
		replace: true,
		transclude: true,
		controller: function controller($scope) {},
		scope: {
			icon: '@',
			total: '='
		},
		template: '\
				<span id="activity" class="activity-dropdown">\
					<i ng-class="icon"></i>\
					<b class="badge"> {{ total }} </b>\
				</span>',
		link: function link(scope, element, attrs, activityCtrl) {

			attrs.$observe('icon', function (value) {
				if (!angular.isDefined(value)) scope.icon = 'fa fa-user';
			});

			element.on('click', function (e) {
				var $this = $(this);

				if ($this.find('.badge').hasClass('bg-color-red')) {
					$this.find('.badge').removeClassPrefix('bg-color-');
					$this.find('.badge').text("0");
					// console.log("Ajax call for activity")
				}

				if (!$this.next('.ajax-dropdown').is(':visible')) {
					$this.next('.ajax-dropdown').fadeIn(150);
					$this.addClass('active');
				} else {
					$this.next('.ajax-dropdown').fadeOut(150);
					$this.removeClass('active');
				}

				var mytest = $this.next('.ajax-dropdown').find('.btn-group > .active > input').attr('id');

				e.preventDefault();
			});

			if (scope.total > 0) {
				var $badge = element.find('.badge');
				$badge.addClass("bg-color-red bounceIn animated");
			}
		}
	};
}).controller('ActivityContentController', ['$scope', function ($scope) {
	var ctrl = this;
	$scope.currentContent = '';
	ctrl.loadContent = function (content) {
		$scope.currentContent = content;
	};
}]).directive('activityContent', ['$compile', function ($compile) {
	return {
		restrict: 'AE',
		transclude: true,
		require: '^activity',
		replace: true,
		scope: {
			footer: '=?'
		},
		controller: 'ActivityContentController',
		template: '\
			<div class="ajax-dropdown">\
				<div class="btn-group btn-group-justified" data-toggle="buttons" data-ng-transclude=""></div>\
				<div class="ajax-notifications custom-scroll">\
					<div class="alert alert-transparent">\
						<h4>Click a button to show messages here</h4>\
						This blank page message helps protect your privacy, or you can show the first message here automatically.\
					</div>\
					<i class="fa fa-lock fa-4x fa-border"></i>\
				</div>\
				<span> {{ footer }}\
					<button type="button" data-loading-text="Loading..." data-ng-click="refresh($event)" class="btn btn-xs btn-default pull-right" data-activty-refresh-button="">\
					<i class="fa fa-refresh"></i>\
					</button>\
				</span>\
			</div>',
		link: function link(scope, element, attrs, activityCtrl) {
			scope.refresh = function (e) {
				activityCtrl.refresh(e);
			};

			scope.$watch('currentContent', function (newContent, oldContent) {
				if (newContent !== oldContent) {
					var el = element.find('.ajax-notifications').html(newContent);
					$compile(el)(scope);
				}
			});
		}
	};
}]).directive('activityItem', function () {
	return {
		restrict: 'AE',
		require: ['^activity', '^activityContent'],
		scope: {
			src: '=',
			onLoad: '=onload',
			active: '=?'
		},
		controller: function controller() {},
		transclude: true,
		replace: true,
		template: '\
			<label class="btn btn-default" data-ng-click="loadItem()" ng-class="{active: active}">\
				<input type="radio" name="activity">\
				<span data-ng-transclude=""></span>\
			</label>',
		link: function link(scope, element, attrs, parentCtrls) {
			var activityCtrl = parentCtrls[0],
			    contentCtrl = parentCtrls[1];

			scope.$watch('active', function (active) {
				if (active) {
					activityCtrl.loadItem(scope, function (content) {
						contentCtrl.loadContent(content);
					});
				}
			});
			activityCtrl.addItem(scope);

			scope.loadItem = function () {
				scope.active = true;
			};
		}
	};
});

angular.module('app.smartui', []).directive('widgetGrid', function () {
	return {
		restrict: 'AE',
		link: function link(scope, element, attrs) {
			scope.setup_widget_desktop = function () {
				if ($.fn.jarvisWidgets && $.enableJarvisWidgets) {
					element.jarvisWidgets({
						grid: 'article',
						widgets: '.jarviswidget',
						localStorage: true,
						deleteSettingsKey: '#deletesettingskey-options',
						settingsKeyLabel: 'Reset settings?',
						deletePositionKey: '#deletepositionkey-options',
						positionKeyLabel: 'Reset position?',
						sortable: true,
						buttonsHidden: false,
						// toggle button
						toggleButton: true,
						toggleClass: 'fa fa-minus | fa fa-plus',
						toggleSpeed: 200,
						onToggle: function onToggle() {},
						// delete btn
						deleteButton: true,
						deleteClass: 'fa fa-times',
						deleteSpeed: 200,
						onDelete: function onDelete() {},
						// edit btn
						editButton: true,
						editPlaceholder: '.jarviswidget-editbox',
						editClass: 'fa fa-cog | fa fa-save',
						editSpeed: 200,
						onEdit: function onEdit() {},
						// color button
						colorButton: true,
						// full screen
						fullscreenButton: true,
						fullscreenClass: 'fa fa-expand | fa fa-compress',
						fullscreenDiff: 3,
						onFullscreen: function onFullscreen() {},
						// custom btn
						customButton: false,
						customClass: 'folder-10 | next-10',
						customStart: function customStart() {
							alert('Hello you, this is a custom button...');
						},
						customEnd: function customEnd() {
							alert('bye, till next time...');
						},
						// order
						buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
						opacity: 1.0,
						dragHandle: '> header',
						placeholderClass: 'jarviswidget-placeholder',
						indicator: true,
						indicatorTime: 600,
						ajax: true,
						timestampPlaceholder: '.jarviswidget-timestamp',
						timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
						refreshButton: true,
						refreshButtonClass: 'fa fa-refresh',
						labelError: 'Sorry but there was a error:',
						labelUpdated: 'Last Update:',
						labelRefresh: 'Refresh',
						labelDelete: 'Delete widget:',
						afterLoad: function afterLoad() {},
						rtl: false, // best not to toggle this!
						onChange: function onChange() {},
						onSave: function onSave() {},
						ajaxnav: $.navAsAjax // declears how the localstorage should be saved (HTML or AJAX page)

					});
				}
			};

			scope.setup_widget_mobile = function () {
				if ($.enableMobileWidgets && $.enableJarvisWidgets) {
					scope.setup_widgets_desktop();
				}
			};

			if ($.device === "desktop") {
				scope.setup_widget_desktop();
			} else {
				scope.setup_widget_mobile();
			}
		}
	};
}).directive('widget', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		template: '<div class="jarviswidget" data-ng-transclude=""></div>'
	};
}).directive('widgetHeader', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		scope: {
			title: '@',
			icon: '@'
		},
		template: '\
			<header>\
				<span class="widget-icon"> <i data-ng-class="icon"></i> </span>\
				<h2>{{ title }}</h2>\
				<span data-ng-transclude></span>\
			</header>'
	};
}).directive('widgetToolbar', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		template: '<div class="widget-toolbar" data-ng-transclude=""></div>'
	};
}).directive('widgetEditbox', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		template: '<div class="jarviswidget-editbox" data-ng-transclude=""></div>'
	};
}).directive('widgetBody', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		template: '<div data-ng-transclude=""></div>'
	};
}).directive('widgetBodyToolbar', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		scope: {
			class: '@'
		},
		template: '<div class="widget-body-toolbar" data-ng-transclude=""></div>'
	};
}).directive('widgetContent', function () {
	return {
		restrict: 'AE',
		transclude: true,
		replace: true,
		template: '<div class="widget-body" data-ng-transclude=""></div>'
	};
}).directive("base64", ["$$$IMAGES", function ($$$IMAGES) {
	return {
		restrict: "AE",
		link: function link(scope, element, attrs) {
			element.attr("src", $$$IMAGES.get(attrs.key));
			scope.$on("localizeLanguageChanged", function () {
				element.attr("src", $$$IMAGES.get(attrs.key));
			});
		}
	};
}]).directive('textareaEmail', [function () {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function link($scope, iElm, iAttrs, controller) {
			var modelCtrl = controller;
			function validate(val) {
				var vals = Array.isArray(val) ? val : [val];
				var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
				var isvalide = vals.every(function (v) {
					return reg.test(v);
				});
				return isvalide;
			}
			function parser(value) {
				if (value) {
					return value.split('\n').reduce(function (arr, b) {
						if (b.trim().length) {
							arr.push(b);
						}
						return arr;
					}, []);
				} else {
					return [];
				}
			}
			function formatter(value) {
				return validate(value) ? value.join("\n") : undefined;
			}
			function viewChangeListener() {
				modelCtrl.$setValidity('email', validate(modelCtrl.$modelValue));
			}
			modelCtrl.$isEmpty = function (val) {
				if (Array.isArray(val) && val.length === 0) {
					return true;
				}
				if (!val) {
					return true;
				}
			};
			modelCtrl.$parsers.push(parser);
			modelCtrl.$formatters.push(formatter);
			modelCtrl.$viewChangeListeners.push(viewChangeListener);
		}
	};
}]).directive('schedulerInput', ['$rootScope', function ($rootScope) {
	return {
		require: "ngModel",
		link: function link(scope, element, attrs, ngModel) {
			$rootScope.$broadcast('matchInput', true);
			element.bind('keyup', function (value) {
				// var isValid = this.value.match(/^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/);
				var isValid = this.value.match(/^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/);
				$rootScope.$broadcast('matchInput', isValid);
			});
		}
	};
}]).service("formDate", [function () {
	this.format = function (date, fmt) {
		var o = {
			"M+": date.getMonth() + 1, //月份   
			"d+": date.getDate(), //日   
			"h+": date.getHours(), //小时   
			"m+": date.getMinutes(), //分   
			"s+": date.getSeconds(), //秒   
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度   
			"S": date.getMilliseconds() //毫秒   
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}return fmt;
	};
}]).service("customModal", ["$modal", "$rootScope", function ($modal, $root) {
	this.openModal = function (obj) {
		/**
   * [init 模态框配置]
   */
		var init = {
			title: obj.title, // 标题，必传
			delTips: obj.delTips, // 删除提示，必传
			key: obj.key ? obj.key : '', // 删除标志，一个页面可能有多个删除，可不传
			delete_rows: obj.delete_rows ? obj.delete_rows : [], // 可删除的数据，可不传，如清空操作
			delParm: obj.delParm ? obj.delParm : '', // 删除数据的名字key，可不传
			nodelete_rows: obj.nodelete_rows ? obj.nodelete_rows : [], // 不可删除的数据，可不传
			nodelTips: obj.nodelTips ? obj.nodelTips : "" // 不可删除提示，可不传
		};

		$modal.open({
			template: ["<section id='widget-grid' ><div class='modal-content'>", "<div class='modal-header'><a type='button' class='close' data-ng-click='close()'>", "<span aria-hidden='true'>×</span><span class='sr-only'>", "Close</span></a><h4 class='modal-title' id='mySmallModalLabel' data-localize=" + init.title + "></h4></div><div class='modal-body'>", "<form class='form-horizontal'>", "<p style='margin-bottom:20px;' data-localize='" + init.delTips + "' param1='{{deleteName}}'></p>", "<p style='margin-bottom:20px;' data-ng-if='" + init.nodelete_rows.length + "' data-localize='" + init.nodelTips + "' param1='{{nodeleteName}}'></p>", "<footer class='text-right'><a class='btn btn-primary' data-ng-click='ok()'  data-localize='确定'>确定", "</a><a class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'>取消", "</a></footer></form></div></div></section>"].join(''),
			controller: function controller($scope, $modalInstance) {
				$scope.deleteName = init.delete_rows.map(function (row) {
					return row[init.delParm];
				}).join(', ');
				$scope.nodeleteName = init.nodelete_rows.map(function (row) {
					return row[init.delParm];
				}).join(', ');
				$scope.ok = function () {
					$root.$broadcast("DELETE", init.key === '' ? init.delete_rows : { key: init.key, data: init.delete_rows });
					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).directive("treeSelectNodeParent", ["$compile", function ($compile) {
	return {
		restrict: 'EA',
		replace: true,
		scope: { users: '=', selecteduser: '=' },
		template: '<dd class="group" ng-repeat="item in users">\n\t\t\t\t\t<dl class="group">\n\t\t\t\t\t\t<dt class="group-title">{{item.dept_name}}</dt>\n\t\t\t\t\t\t<tree-select-node ng-repeat="node in item.children" data-selecteduser="selecteduser" data-node="node"></tree-select-node>\n\t\t\t\t\t</dl>\n\t\t\t\t  </dd>',
		controller: function controller($scope) {},
		link: function link(scope, element, attrs) {}
	};
}]).directive("treeSelectNode", ["$compile", function ($compile) {
	return {
		restrict: 'EA',
		replace: true,
		scope: { node: '=', selecteduser: '=' },
		template: '<dd></dd>',
		controller: function controller($scope) {
			$scope.selectUser = function (user) {
				$scope.$emit('selectCommonUser', user);
			};
		},
		link: function link(scope, element, attrs) {
			if (scope.node.children) {
				element.append('<dl class="group">' + '<dt class="group-title">{{node.dept_name}}</dt>' + '<tree-select-node ng-repeat="sub in node.children" data-selecteduser="selecteduser" data-nodes="node.children" data-node="sub"></tree-select-node>' + '</dl>');
			} else {
				element.append('<dd class="group-item" titile="{{selecteduser}}" url="{{ node }}" ng-class="{active:selecteduser.user_id === node.user_id}" ng-click="selectUser(node)">{{node.name}}({{node.real_name}})</dd>');
			}
			$compile(element.contents())(scope);
		}
	};
}]);

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi", []).factory("Task", ["$resource", "$Domain", function ($resource, $Domain) {
    return $resource($Domain + "/thor/home/tasklog", null, {
        query: { method: "GET", isArray: false },
        post: { method: "POST" },
        put: { method: "PUT" }
    });
}]).factory("VNC", ["$resource", "$Domain", function ($resource, $Domain) {
    return $resource($Domain + "/thor/instance/vnc/:id", { id: "@id" }, {
        loadISO: { method: "POST", url: $Domain + "/thor/image/loadISO" },
        save: { method: "POST", url: $Domain + "/thor/image/update_template" }
    });
}]).factory("loginResource", ["$resource", "$Domain", function ($resource, $Domain) {
    return $resource($Domain + "/thor/version", null, {
        query: { method: "GET" }
    });
}]).filter('lun_name', function () {
    return function (lun) {
        if (!angular.isUndefined(lun)) {
            lun.map(function (item) {
                item.value = item.vendor + " lun-" + item.lun + " " + item.size;
            });
        }
        return lun;
    };
}).filter('storage_type', function () {
    var type2str = {
        local: "本地磁盘",
        iscsi: 'iscsi 磁盘',
        netfs: '网络文件系统',
        fc: 'FC 光纤存储'
    };
    return function (type) {
        return type2str[type];
    };
}).filter('storage_status', function () {
    var stauts2str = {
        running: "正常",
        building: "准备中",
        error: '异常'
    };
    return function (stauts) {
        return stauts2str[stauts];
    };
}).filter('unsafe', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val + "");
    };
}).filter('join', function () {
    return function (val, slash) {
        return val.filter(function (d) {
            return d;
        }).join(slash);
    };
}).filter('network_type', function () {
    var type2str = {
        nat: 'NAT',
        bridge: '桥接',
        vlan: 'VLAN'
    };
    return function (val) {
        return type2str[val];
    };
}).filter('yesorno', function () {
    return function (val) {
        return val ? '是' : '否';
    };
}).filter('to_mb', function () {
    return function (val) {
        return (val / 1024 / 1024).toFixed(2);
    };
}).filter('reverse', function () {
    return function (input, searchText, searchName) {
        if (input && searchText) {
            var outPut = [];
            outPut = input.filter(function (item) {
                if (item[searchName].indexOf(searchText) > -1) return item;
            });
            return outPut;
        }
        return input;
    };
}).config(["$filterProvider", function ($filterProvider) {
    $filterProvider.register("paging", function () {
        return function (items, index, pageSize) {
            if (!angular.isArray(items)) {
                return items;
            }
            if (pageSize > 0 && index > 0) {
                var total = items.length;
                var totalPage = Math.ceil(total / pageSize);
                index = Math.min(totalPage, Math.max(1, index));
                return items.slice((index - 1) * pageSize, index * pageSize);
            }
            return items;
        };
    });
}]).directive("dialog", ["$modal", "$rootScope", "$$$I18N", function ($modal, $rootScope, $$$I18N) {
    return {
        restrict: "A",
        link: function link($scope, element, attrs) {
            element.click(function () {
                if (attrs.disabled) {
                    $.bigBox({
                        title: $$$I18N.get("INFOR_TIP"),
                        content: attrs.error
                    });
                } else {
                    var dialog = $modal.open({
                        templateUrl: "views/vdi/dialog/" + attrs.dialogUrl,
                        controller: attrs.dialog,
                        scope: $scope,
                        size: attrs.dialogSize
                    });
                    $scope.close = dialog.dismiss.bind(dialog);
                    window.___dialog = dialog;
                }
            });
        }
    };
}]).directive("widgetGrid", ["$filter", "$modal", function ($filter, $modal) {
    function getPosition(e, ele) {
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var cw = document.documentElement.clientWidth;
        var ch = document.documentElement.clientHeight;
        var sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        var sh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        var ow = ele.offsetWidth;
        var oh = ele.offsetHeight;
        return {
            x: Math.max(0, e.pageX + ow > sl + cw ? sl + cw - ow : e.pageX),
            y: Math.max(0, e.pageY + oh > st + ch ? st + ch - oh : e.pageY)
        };
    }
    return {
        restrict: "A",
        controller: function controller($scope) {
            this.getCurrentPage = function () {
                return Number($scope.currentPage) > 0 ? $scope.currentPage : 0;
            };
            this.getCurrentRows = function () {
                return $scope.getCurrentRows();
            };
            this.getPageSize = function () {
                return Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
            };
        },
        link: function link($scope, element, attrs) {
            var context_wrapper = element.find(".context_wrapper");
            context_wrapper.on("mousedown", function (e) {
                if (e.target === this) {
                    context_wrapper.hide();
                    element.find(".contextmenu_selected").removeClass("contextmenu_selected");
                }
            }).on("click", function () {
                context_wrapper.hide();
                element.find(".contextmenu_selected").removeClass("contextmenu_selected");
            });
            context_wrapper.hide();

            // $scope.searchText = "";
            //$scope.pagesize = 5;
            $scope.currentPage = 1;

            $scope.getCurrentRows = function () {
                return $filter("paging")($scope.getFilterRows(), $scope.currentPage, $scope.pagesize);
            };
            $scope.getFilterRows = function () {
                return $filter("filter")($scope.rows || [], $scope.searchText);
            };

            $scope.checkAll = function () {
                var rows = $scope.getCurrentRows();
                var _all = rows.length && rows.filter(function (item) {
                    return !item._ignore;
                }).length && rows.filter(function (item) {
                    return !item._ignore;
                }).every(function (row) {
                    return row._selected;
                });
                $scope.checkedAll = _all;
                return _all;
            };
            $scope.selectAllChange = function (checkAll) {
                var rows = $scope.getCurrentRows();
                rows.filter(function (item) {
                    return !item._ignore;
                }).forEach(function (row) {
                    row._selected = checkAll;
                });
                $scope.checkedAll = checkAll;
            };
            $scope.checkOne = function () {
                var rows = $scope.getCurrentRows();
                return rows.filter(function (item) {
                    return !item._ignore;
                }).some(function (row) {
                    return row._selected;
                });
            };
            $scope.sort = function (name, asc) {
                $scope.rows.sort(function (a, b) {
                    return (a[name] > b[name] ? 1 : -1) * (asc ? 1 : -1);
                });
            };
            $scope.pageSizeChange = $scope.pageChange = function () {
                $scope.rows.forEach(function (item, i) {
                    item._selected = false;
                });
            };
            $scope.currentItem = null;
            $scope.$on("contextmenu", function (e, item, de, handler) {
                $scope.currentItem = item;
                handler.addClass("contextmenu_selected");
                $scope.rows.forEach(function (item) {
                    item._selected = false;
                });
                item._selected = true;
                $scope.$apply();
                context_wrapper.fadeIn(200);
                var menu = element.find(".grid_context_menu");
                var offset = context_wrapper.offset();
                var pos = getPosition(de, menu[0]);
                menu.css({
                    top: pos.y - offset.top + "px",
                    left: pos.x - offset.left + "px"
                });
                $scope.rows.forEach(function (item) {
                    item._selected = false;
                });
                item._selected = true;
                $scope.$apply();
                e.stopPropagation();
                de.preventDefault();
            });
        }
    };
}]).directive("gridPagination", [function () {
    return {
        restrict: "A",
        require: ["^widgetGrid"],
        conroller: function conroller($scope) {},
        link: function link($scope, element, attrs, ctrls) {
            var grid = ctrls[0];
            $scope.getStart = function () {
                var current = grid.getCurrentPage();
                var pagesize = grid.getPageSize();
                return pagesize > 0 ? (current - 1) * pagesize + 1 : 0;
            };
            $scope.getEnd = function () {
                var current = $scope.currentPage;
                var pagesize = grid.getPageSize();
                var end = current * pagesize;
                var currentCount = $scope.getFilterRows().length;
                return end < currentCount ? end : currentCount;
            };
            $scope.getCurrentCount = function () {
                return $scope.getCurrentRows().length;
            };
        }
    };
}]).directive("ribbonTips", ["localize", "$route", "$location", "$interval", function (localize, $route, $location, $interval) {
    return {
        restrict: "A",
        link: function link($scope, element, attrs) {
            var timer, dereg;
            var fn_update_help_info = function fn_update_help_info() {
                var path = $location.$$path;
                if (/^\/resource\/network\/\d+\/?$/.test(path)) {
                    path = "/resource/network/:id";
                }
                if (/^\/desktop\/teach\/\d+\/?$/.test(path)) {
                    path = "/desktop/teach/:id";
                }
                var help_text = attrs.myTips ? localize.localizeText(attrs.myTips) : localize.localizeText(path);
                element.attr("data-content", help_text);
                if (help_text) {
                    element.parent().show();
                } else {
                    element.parent().hide();
                }
            };
            $scope.$on("$routeChangeSuccess", function () {
                fn_update_help_info();
            });
            if (localize.isReady()) {
                fn_update_help_info();
            }
            $scope.$on("localizeLanguageChanged", fn_update_help_info);
        }
    };
}]).directive("contextmenu", [function () {
    return {
        restrict: "A",
        link: function link($scope, element, attrs) {
            if (attrs.contextmenuDisabled !== "true") {
                element.bind("contextmenu", function (e) {
                    $scope.$emit(attrs.contextmenuEventName || "contextmenu", $scope.item, e, element);
                });
            }
        }
    };
}]).directive("wizard", [function () {
    return {
        restrict: "A",
        transclude: true,
        scope: {
            lastText: "@",
            btnUnable: "="
        },
        controller: function controller($scope, localize, $$$I18N) {
            var steps = $scope.steps = [];
            $scope.currentStep = null;
            $scope.moveWth = 0;
            var defaults = {
                prevBtnText: "上一步",
                nextBtnText: "下一步",
                doneBtnText: "完成"
            };
            $scope.$on("currentStepChange", function (e, stepIndex) {
                $scope.go(stepIndex);
            });
            $scope.select = function (step) {
                var index;
                steps.forEach(function (s, i) {
                    s.selected = s === step;
                    if (s.selected) {
                        index = i;
                    }
                });
                $scope.currentStep = step;
                ["prev", "next", "done"].forEach(function (s) {
                    var key = s + "BtnText";
                    $scope[key] = $$$I18N.get(step[key] || defaults[key]);
                });
                $scope.$emit("selectStepChange", { index: index, stepScope: step });
            };
            $scope.getCurrentIndex = function () {
                return steps.indexOf($scope.currentStep);
            };

            $scope.prev = function () {
                var index = $scope.getCurrentIndex();
                //var e = $scope.$emit(($scope.stepEventName || "WizardStep"), $scope.currentStep);
                var prev = steps[index - 1];
                prev && $scope.select(prev);
                $scope.moveWth = $scope.getMarginValue();
            };
            $scope.next = function () {
                var index = $scope.getCurrentIndex();
                $scope.currentStep.is_dirty = true;
                var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling);
                if ($scope.currentStep.done !== false) {
                    var next = steps[index + 1];
                    next && $scope.select(next);
                    $scope.moveWth = $scope.getMarginValue();
                };
            };
            $scope.go = function (index) {
                $scope.select(steps[index]);
                $scope.moveWth = $scope.getMarginValue();
            };
            $scope.showPrev = function () {
                return steps.indexOf($scope.currentStep) > 0 && $scope.currentStep.prevBtnText !== "";
            };
            $scope.isLast = function () {
                return steps.indexOf($scope.currentStep) >= steps.length - 1;
            };
            $scope.done = function () {
                var index = $scope.getCurrentIndex();
                $scope.currentStep.is_dirty = true;
                var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling);
                if ($scope.currentStep.done !== false) {
                    var next = steps[index + 1];
                    next && $scope.select(next);
                    $scope.$emit($scope.doneEventName || "WizardDone", steps, steps.map(function (step) {
                        return step.$$nextSibling;
                    }));
                }
            };
            this.addStep = function (step) {
                steps.push(step);
                if (steps.length === 1) {
                    $scope.select(step);
                }
            };
            this.jumpStep = function (index) {};
            this.removeStep = function (index) {};
            this.insertStep = function (step) {};
        },
        link: function link($scope, element, attrs) {
            $scope.getMarginValue = function () {
                var _idx = $scope.getCurrentIndex();
                var wizardWth = element.find('.wizard').outerWidth();
                var _wth = 60;
                for (var i = 0; i <= _idx + 1; i++) {
                    _wth += element.find(".steps>li").eq(i).outerWidth();
                }
                if (wizardWth - _wth < 0) {
                    return wizardWth - _wth;
                } else {
                    return 0;
                }
            };
            // if(attrs.disableNav !== "true") {
            //     element.find(".steps").delegate("li.complete","click",function(e){
            //         var _idx = $(this).index();
            //         $scope.go(_idx);
            //     });
            // }
        },
        template: "<div class=\"wizard\" style=\"margin-bottom:20px;\">\n            <ul class=\"steps\" style=\"margin-left:{{moveWth}}px\">\n                <li data-ng-repeat=\"step in steps\" data-target=\"#step{{ $index }}\" data-ng-class=\"{ active: getCurrentIndex() >= $index ,complete:getCurrentIndex() > $index }\">\n                    <span class=\"badge badge-info\">{{ $index + 1 }}</span><span localize=\"{{step.name}}\"></span><span class=\"chevron\"></span>\n                </li>\n            </ul>\n            <div class=\"actions\">\n                <button ng-show=\"!btnUnable\" type=\"button\" data-ng-if=\"showPrev()\" data-ng-click=\"prev()\" ng-disabled=\"currentStep.showLoading === true\" class=\"btn btn-sm btn-primary btn-prev\">\n                    <i class=\"fa fa-arrow-left\"></i><span ng-bind=\"prevBtnText\"></span>\n                </button>\n                <button ng-show=\"!btnUnable\" type=\"button\" data-ng-if=\"!isLast()\" data-ng-click=\"next()\" ng-disabled=\"currentStep.showLoading === true\" class=\"btn btn-sm btn-success btn-next\">\n                    <span ng-bind=\"nextBtnText\"></span> <i class=\"fa fa-arrow-right\"></i>\n                </button>\n                <button id='finish' ng-show=\"!btnUnable && isLast()\" type=\"button\" data-ng-click=\"done()\" ng-disabled=\"currentStep.showLoading === true\" class=\"btn btn-sm btn-success btn-next\">\n                    <span ng-bind=\"doneBtnText\"></span><i class=\"fa fa-check\" ></i>\n                </button>\n                <img ng-show=\"btnUnable\" src=\"img/loadingtext.gif\" width=\"24px\" height=\"24px\"/>\n                <img ng-show=\"currentStep.showLoading === true\" src=\"img/loadingtext.gif\" width=\"24px\" height=\"24px\"/>\n            </div>\n        </div>\n        <div class=\"step-content\">\n            <form data-ng-transclude class=\"form-horizontal\" id=\"fuelux-wizard\" method=\"post\" novalidate>\n            </form>\n        </div>\n        <div ng-show=\"currentStep.showLoading === true\" style=\"position: absolute;top:0;right:0;bottom:0;left:0;z-index:999;\"></div>"
    };
}]).directive("wizardStep", [function () {
    return {
        restrict: "A",
        require: "^wizard",
        transclude: true,
        replace: true,
        scope: {
            name: "@",
            prevBtnText: "@",
            nextBtnText: "@",
            doneBtnText: "@",
            testValid: "="
        },
        controller: function controller($scope) {},
        link: function link(scope, element, attrs, wizard) {
            wizard.addStep(scope);
        },
        template: "<div class=\"step-pane\" data-ng-class=\"{ active: selected }\" data-ng-show=\"selected\" data-ng-transclude></div>"
    };
}]).directive('areaTraffic', function ($interval, $http) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            options: "="
        },
        link: function link(scope, e, attrs) {
            Highcharts.setOptions({ //disable utc time
                global: {
                    useUTC: false
                }
            });
            function init_data() {
                // generate init data
                var data = [],
                    time = new Date().getTime(),
                    i;

                for (i = -40; i <= 0; i += 1) {
                    data.push({
                        x: time + i * scope.$parent.refresh_time,
                        y: 0
                    });
                }
                return data;
            }
            var hc_options = scope.options.options;
            hc_options.chart.renderTo = e[0];
            hc_options.yAxis.min = 0;
            angular.forEach(hc_options.series, function (s) {
                s.data = init_data();
            });

            var highcharts = new Highcharts.Chart(hc_options);

            function drawPoint(data) {
                var datetime = new Date().getTime();
                var hc_series = highcharts.series;

                scope.options.drawpoint(hc_series, data, datetime);
            }

            function reset_highcharts() {
                //reset highcharts
                highcharts.destroy();
                angular.forEach(hc_options.series, function (s) {
                    s.data = init_data();
                });
                highcharts = new Highcharts.Chart(hc_options);
            }

            scope.$watch('$parent.metric_data', function (newvalue) {
                if (newvalue) {
                    drawPoint(newvalue);
                }
            });

            scope.$watch('$parent.refresh_time', function (newvalue) {
                reset_highcharts();
            });

            scope.$watch('$parent.item', function (newvalue) {
                reset_highcharts();
            });
        }
    };
}).directive("monitorTree", [function () {
    return {
        restrict: "A",
        transclude: true,
        template: "<div class=\"portlet-title clearfix padding-5\">\n                <div class=\"pull-left\">\n                    <a href=\"javascript:\" id=\"collape\" class=\"btn btn-default btn-xs\"><i class=\"fa  icon-jj-Shrinkfrom\"></i> </a>\n                    <a href=\"javascript:\" id=\"open\" class=\"btn btn-default  btn-xs\"><i class=\"fa icon-jj-Open\"></i></a>\n                </div>\n                <div class=\"pull-right\"><a href=\"javascript:\"class=\"btn btn-default  btn-xs\" ng-init=\"ishow=false\" ng-click=\"ishow==true?ishow=false:ishow=true;open()\"><i class=\"fa fa-search\"></i></a></div> \n            </div>\n            <div class=\"search\" ng-show=\"ishow\"><input type=\"search\" localize=\"\u684C\u9762\u540D\" ng-model=\"searchText\"></div>\n            <div class=\"portlet-body fuelux monitor-tree\" data-ng-transclude></div>\n        ",
        link: function link(scope, element, attrs) {
            element.delegate('#open', 'click', function (event) {
                element.find(".parent").addClass('in');
            });
            element.delegate('#collape', 'click', function (event) {
                element.find(".parent").removeClass('in');
            });
            element.delegate(".tree-toggle", "click", function (event) {
                var parent = $(this).parent().parent(".parent");
                if (parent.hasClass('in')) {
                    parent.removeClass('in');
                } else {
                    parent.addClass("in");
                }
            });
            element.delegate(".tree-it", "click", function (event) {
                element.find("li").removeClass('active');
                $(this).parent("li").addClass('active');
            });
            scope.open = function () {
                element.find(".parent").addClass('in');
            };
        }
    };
}]).directive('ipPattern', function (ip_pattern) {

    return {
        require: ['ngModel', '?ngRequired'],
        link: function link(scope, elm, attrs, ctrls) {
            var ngmodelctl = ctrls[0];
            var ngrequiredctl = ctrls[1];

            ngmodelctl.$parsers.push(function (viewValue) {

                if (ip_pattern.test(viewValue) || !ngrequiredctl && !viewValue) {

                    ngmodelctl.$setValidity('ipcheck', true);
                    return viewValue;
                } else {

                    ngmodelctl.$setValidity('ipcheck', false);
                    return undefined;
                }
            });
        }
    };
}).directive("preventSpace", [function () {
    return {
        restrict: "A",
        link: function link(scope, element, attrs) {
            element.on("keypress", function (e) {
                if (e.keyCode === 32) {
                    e.preventDefault();
                }
            });
        }
    };
}]).directive("inputNumber", [function () {
    return {
        restrict: "AE",
        link: function link(scope, element, attrs) {
            var numKey = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
            var ctrlKey = [8, // backspace
            46, // delete
            37, // left arrow
            39 // right arrow
            ];
            element.on("keydown", function (e) {
                var code = e.which || e.keyCode;
                if (numKey.indexOf(code) > -1) {
                    var num = code < 60 ? code - 48 : code - 96;
                    var nextValue = this.value + num;
                    if (!attrs.max) {
                        return;
                    }
                    var max = attrs.max * 1;
                    if (!isNaN(max) && nextValue <= max) {
                        return;
                    }
                } else if (ctrlKey.indexOf(code) > -1) {
                    return;
                }
                e.preventDefault();
                return false;
            });
        }
    };
}])
// .directive("inputDot", [function(){
//     return {
//         restrict: "AE",
//         link: function(scope, element, attrs){
//             element.on("keydown",function(e){
//                 if(attrs.inputDot == 'true'){
//                    if(e.keyCode === 190 || e.keyCode === 110 || e.keyCode === 69){
//                         e.preventDefault();
//                    }
//                 }
//                 else{
//                     if(e.keyCode === 69){
//                         e.preventDefault();
//                     }
//                 }

//             });
//         }
//     };
// }])
.directive("formatIp", ["$compile", function ($compile) {
    return {
        restrict: "EA",
        require: "ngModel",
        scope: {
            start: "=",
            end: "="
        },
        link: function link(scope, element, attrs, ctrl) {
            var ngModelCtrl = ctrl;
            var required = attrs.ipRequired ? scope.$eval(attrs.ipRequired) : true;

            if (!ngModelCtrl) {
                return;
            };
            var CHECKTOOLS = {};

            CHECKTOOLS.checkIP = function (ip) {
                if (!ip) {
                    return false;
                }
                var parts = ip.split(".");
                //9029bug 0.0.0.0不合法IP
                var numre = /^(0|[1-9][0-9]*)$/;
                var i,
                    valid = true;
                if (parts.length !== 4) {
                    return false;
                }
                for (i = 0; i < 4; i++) {
                    if (numre.test(parts[i]) && parseInt(parts[i]) <= 255) {
                        continue;
                    } else {
                        valid = false;
                    }
                }
                valid = valid && ipformatNum(ip) > ipformatNum('1.0.0.0');
                return valid;
            };

            function ipformatNum(ip) {
                var arr = ip.split('.').map(function (item) {
                    return Number(item);
                });
                return arr[0] * Math.pow(256, 3) + arr[1] * Math.pow(256, 2) + arr[2] * Math.pow(256, 1) + arr[3];
            }

            CHECKTOOLS.ip2long = function (ip) {
                if (CHECKTOOLS.checkIP(ip)) {
                    var arr = ip.split('.').map(function (item) {
                        return Number(item);
                    });
                    return arr[0] * Math.pow(256, 3) + arr[1] * Math.pow(256, 2) + arr[2] * Math.pow(256, 1) + arr[3];
                }
            };
            CHECKTOOLS.checkRange = function (ip, s_ip, e_ip) {
                if (CHECKTOOLS.checkIP(ip), CHECKTOOLS.checkIP(s_ip) && CHECKTOOLS.checkIP(e_ip)) {
                    var s = CHECKTOOLS.ip2long(s_ip);
                    var e = CHECKTOOLS.ip2long(e_ip);
                    var c = CHECKTOOLS.ip2long(ip);
                    return c >= s && c <= e;
                } else {
                    return false;
                }
            };
            var popEl = angular.element("<div format-ip-wrap></div>");
            var $input = $compile(popEl)(scope);
            element.addClass("ng-hide");
            element.after($input);

            // model -- ui

            ngModelCtrl.$render = function () {
                var modelVal = ngModelCtrl.$modelValue;
                var modelValArr;
                try {
                    if (modelVal === null) {
                        modelValArr = [];
                        ngModelCtrl.$setPristine();
                    } else {
                        modelValArr = modelVal.split(".");
                    }
                    [1, 2, 3, 4].forEach(function (i, idx) {
                        scope["seg" + i] = modelValArr[idx] || "";
                    });
                } catch (err) {}
                // setValidate();
            };
            /*
            function setValidate(){
                var isValid;
                if(ngModelCtrl.$modelValue){
                    if(scope.start && scope.end){
                        isValid = CHECKTOOLS.checkRange(ngModelCtrl.$modelValue,scope.start,scope.end)
                    }else{
                        isValid = CHECKTOOLS.checkIP(ngModelCtrl.$modelValue);
                    }
                    ngModelCtrl.$setValidity("ip",isValid);
                }else{
                    ngModelCtrl.$setValidity("ip",true);
                }
            };
              // ui -- model
            $input.on("input",function(e){
                scope.$apply(function(){
                    var val = [1,2,3,4].map(function(i){ return scope["seg" + i] || ""; }).join(".");
                    var isNull = val.split(".").every(function(item){ return item.length===0 });
                    if(isNull){
                        ngModelCtrl.$setViewValue("");
                    }else{
                        ngModelCtrl.$setViewValue(val);
                    }
                    ngModelCtrl.$render();
                })
            });
              */

            scope.$watch("seg1 + '.' + seg2 + '.' + seg3 + '.' + seg4", function (ip) {
                var value = ngModelCtrl.$modelValue;
                if (ip === "...") {
                    if (value) {
                        ngModelCtrl.$setViewValue("");
                    }
                    if (!value || !required) {
                        return ngModelCtrl.$setValidity("ip", true);
                    }
                    ngModelCtrl.$setValidity("ip", false);
                } else {
                    var isValid = false;
                    if (scope.start && scope.end) {
                        isValid = CHECKTOOLS.checkRange(ip, scope.start, scope.end);
                    } else {
                        isValid = CHECKTOOLS.checkIP(ip);
                    }
                    ngModelCtrl.$setValidity("ip", isValid);
                    ngModelCtrl.$setViewValue(ip);
                }
            });
        }
    };
}]).directive("formatIpWrap", function () {
    return {
        restrict: "AE",
        replace: true,
        template: "<span role=\"ipgroup\"><input type=\"text\" ng-model=\"seg1\"><span class=\"dot\">.</span><input type=\"text\" ng-model=\"seg2\"><span class=\"dot\">.</span><input type=\"text\" ng-model=\"seg3\"><span class=\"dot\">.</span><input type=\"text\" ng-model=\"seg4\"></span>",
        link: function link(scope, element, attrs) {
            element.on("keydown", "input", function (event) {
                switch (event.keyCode) {
                    case 110:
                    case 190:
                        var nextEles = $(this).nextAll("input");
                        nextEles.length && nextEles.eq(0).focus();
                        event.preventDefault();
                        break;
                    case 8:
                        if (!$(this).val()) {
                            $(this).prevAll("input").length && $(this).prevAll("input").eq(0).focus();
                        }
                        break;
                    case 37:
                        if (this.selectionStart === 0) {
                            $(this).prevAll("input").length && $(this).prevAll("input").eq(0).focus();
                        };
                        break;
                    case 39:
                        if (this.selectionStart === $(this).val().length) {
                            $(this).nextAll("input").length && $(this).nextAll("input").eq(0).focus();
                        }
                        break;
                    case 32:
                    case 229:
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                }
            });
            element.on("keypress", "input", function (e) {
                if (e.keyCode < 48 || e.keyCode > 57) {
                    e.preventDefault();
                }
                if ($(this).val().length > 2 && this.selectionStart === this.selectionEnd) {
                    e.preventDefault();
                }
            });
            element.on("paste", function (e) {
                e.preventDefault();
            });
            element.on("focus", "input", function (e) {
                element.addClass("focus");
            });
            element.on("blur", "input", function (e) {
                element.removeClass("focus");
            });
        }
    };
}).directive("treeNodeParent", ["$compile", function ($compile) {
    return {
        restrict: 'EA',
        replace: true,
        scope: { users: '=', filtertext: '=' },
        template: '<ul role="tree" class="menu menu-tree" ng-repeat="item in getUsers()">' + '<div class="menu_header">' + '<span class="fa icon-jj"></span>' + '<span class="menu-name">{{item.dept_name}}</span>' + '<span class="pull-right fa icon-jj-add" data-ng-click="add_selected(item);$event.stopPropagation()"></span>' + '</div>' + '<div class="menu_body">' + '<tree-node ng-repeat="node in item.children" data-nodes="item.children" data-node="node"></tree-node>' + '</div>' + '</ul>',
        controller: function controller($scope) {
            var lastFilter;
            var lastFiltedResult;
            $scope.add_selected = function (children) {
                $scope.$emit('add_selected', children);
            };

            $scope.getUsers = function () {
                var text = $scope.filtertext || "";
                var users = $scope.users;
                text = text.trim();
                if (!text) {
                    return users;
                }
                if (text !== lastFilter) {
                    lastFilter = text;
                    lastFiltedResult = filterUser(angular.copy(users), text);
                }
                return lastFiltedResult;
            };

            function filterUser(users, text) {
                return users.filter(function (user) {
                    if (user.children) {
                        user.children = filterUser(user.children, text);
                        return user.children.length > 0;
                    } else {
                        return user.user_name.indexOf(text) > -1 || user.real_name.indexOf(text) > -1;
                    }
                });
            }
        },
        link: function link(scope, element, attrs) {}
    };
}]).directive("treeNode", ["$compile", function ($compile) {
    return {
        restrict: 'EA',
        replace: true,
        scope: { node: '=', nodes: '=' },
        template: '<div></div>',
        controller: function controller($scope) {
            $scope.add_selected = function (children) {
                $scope.$emit('add_selected', children);
            };
            $scope.add_select_rows = function ($event, node, nodes) {
                $scope.$emit('add_select_rows', $event, node, nodes);
            };
        },
        link: function link(scope, element, attrs) {
            if (scope.node.children) {
                element.append('<ul role="group" class="menu menu-tree">' + '<div class="menu_header">' + '<span class="fa icon-jj"></span>' + '<span class="menu-name">{{node.dept_name}}</span>' + '<span class="pull-right fa icon-jj-add" data-ng-click="add_selected(node);$event.stopPropagation()"></span>' + '</div>' + '<div class="menu_body">' + '<tree-node ng-repeat="sub in node.children" data-nodes="node.children" data-node="sub"></tree-node>' + '</div>' + '</ul>');
            } else {
                element.append('<li class="menuitem" ng-click="add_select_rows($event,node,nodes)" ng-dblclick="add_selected(node)">' + '<span class="text-overflow text-overflow-half">{{node.name}}</span>' + '<span class="text-overflow text-overflow-half">{{node.real_name}}</span>' + '</li>');
            }
            $compile(element.contents())(scope);
        }
    };
}]).directive("uiMenuList", ["Admin", "User", "Domain", "$q", "$$$I18N", function (APIadmin, APIuser, APIdomain, $q, $$$I18N) {
    return {
        restrict: "AE",
        scope: {
            selected: "=menuListData"
            // domain:"=menuListDomain"
        },
        templateUrl: "includes/userMenu.html",
        controller: function controller($scope) {
            $scope.expandedNodes = [];
            $scope._users = [];
            $scope.selected = $scope.selected || [];
            $scope.seRows = [];
            $scope.rmRows = [];
            $scope.common_users = [];
            function formatData(d, name) {
                iteration(d, name);
                return d;
            }
            function iteration(data, childName, list) {
                for (var i = 0; i < data.length; i++) {
                    $scope.expandedNodes.push(data[i]);
                    if (data[i][childName] && data[i][childName].length) {
                        var len = iteration(data[i][childName], childName);
                        if (len === 0) {
                            data[i] = undefined;
                        }
                    }
                    if (!data[i]) {
                        continue;
                    }
                    if (data[i].users && data[i].users.length > 0) {
                        data[i].users.map(function (user) {
                            user.name = user.name || user.user_name;
                            user._is_last = true;
                            return user;
                        });
                        data[i][childName] = data[i].users;
                    }
                    if (data[i][childName] && data[i][childName].length === 0) {
                        data[i] = undefined;
                    }
                }
                while (data.length > 0) {
                    // 如果有数组元素为空，每次删除一个
                    var oldlen = data.length;
                    for (var i = 0; i < oldlen; i++) {
                        if (data[i] === undefined) {
                            data.splice(i, 1);
                            break;
                        }
                    }
                    if (oldlen === data.length) {
                        break;
                    }
                }

                return data.length;
            }
            function removeNoChildrenDeparts(data) {
                data = data.filter(noUserFilter);
                data.forEach(walk);
                return data;
                function walk(node) {
                    if (!node.dept_id) {
                        return;
                    }
                    // 用户上级是没有 children 的
                    if (node.children) {
                        node.children = node.children.filter(noUserFilter);
                        node.children.forEach(walk);
                    }
                }
                function noUserFilter(node) {
                    if (node.dept_id && !node.children && node.users.length === 0) {
                        return false;
                    }
                    return true;
                }
            }
            function get_admin() {
                var deferred = $q.defer();
                APIadmin.query(function (res) {
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            function get_user() {
                var deferred = $q.defer();
                APIuser.query_tree(function (res) {
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            function get_domain() {
                var deferred = $q.defer();
                APIdomain.list(function (res) {
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            $q.all([get_admin(), get_user(), get_domain()]).then(function (arr) {
                $scope._users = [{
                    typeName: $$$I18N.get("管理用户"),
                    userData: arr[0].users
                }];
                $scope.domain_users = arr[2].result.map(function (res) {
                    res._name = $$$I18N.get("域") + "(" + res.name + ")";
                    return res;
                });
                $scope.common_users = formatData(removeNoChildrenDeparts(arr[1].result), "children");
                console.log($scope.common_users);
            });
            function getLastLevelNodes(obj_levels, arrays) {
                if (obj_levels.children) {
                    obj_levels.children.forEach(function (item) {
                        getLastLevelNodes(item, arrays);
                    });
                } else {
                    arrays.push(obj_levels);
                }
            }

            $scope.$on('add_selected', function (e, levels) {
                var arrays = [];
                getLastLevelNodes(levels, arrays);
                $scope.add_selected(arrays);
            });
            $scope.$on('add_select_rows', function (e, $event, node, nodes) {
                console.log(555555, $event, node, nodes);
                $scope.add_select_rows($event, node, nodes);
            });
            $scope.add_selected = function (items) {
                var rows = items instanceof Array ? items : [items];
                rows.forEach(function (i) {
                    if ($scope.selected.indexOf(i) === -1) {
                        $scope.selected.push(i);
                    }
                });
            };
            $scope.remove_selected = function (items) {
                var rows = items instanceof Array ? items : [items];
                rows.forEach(function (i) {
                    $scope.selected.splice($scope.selected.indexOf(i), 1);
                });
                $scope.rmRows = [];
            };
            var lastRow2 = null;
            $scope.add_select_rows = function (e, item, items) {
                var idx = $scope.seRows.indexOf(item);
                if (e.ctrlKey) {
                    idx === -1 ? $scope.seRows.push(item) : $scope.seRows.splice(idx, 1);
                    lastRow2 = item;
                } else if (e.shiftKey) {
                    var begin_idx = items.indexOf(lastRow2);
                    var end_idx = items.indexOf(item);
                    if (begin_idx === -1) {
                        lastRow2 = item;
                        $scope.seRows = [item];
                    } else {
                        $scope.seRows = items.slice(Math.min(begin_idx, end_idx), Math.max(begin_idx, end_idx) + 1);
                        console.log(1111111, $scope.seRows);
                    }
                } else {
                    $scope.seRows.splice(0, $scope.seRows.length, item);
                    lastRow2 = item;
                }
            };
            var lastRow = null;
            $scope.add_remove_rows = function (e, item) {
                var idx = $scope.rmRows.indexOf(item);
                if (e.ctrlKey) {
                    idx === -1 ? $scope.rmRows.push(item) : $scope.rmRows.splice(idx, 1);
                    lastRow = item;
                } else if (e.shiftKey) {
                    var begin_idx = $scope.selected.indexOf(lastRow);
                    var end_idx = $scope.selected.indexOf(item);
                    if (begin_idx !== -1 && end_idx !== -1) {
                        $scope.rmRows = $scope.selected.slice(Math.min(begin_idx, end_idx), Math.max(begin_idx, end_idx) + 1);
                    } else {
                        $scope.rmRows = [item];
                        lastRow = item;
                    }
                } else {
                    $scope.rmRows.splice(0, $scope.rmRows.length, item);
                    lastRow = item;
                }
            };
            $scope.ltor = function () {
                $scope.add_selected($scope.seRows);
            };
            $scope.rtol = function () {
                $scope.remove_selected($scope.rmRows);
            };
        },
        link: function link(scope, element, attrs) {
            var last = null;
            element.on("keyup", 'input[ng-model="searchText"]', function (e) {
                $(".menu_header").addClass("open");
            });
            element.on("click", ".menu_header", function (e) {
                $(this).toggleClass("open");
            });
            element.on("click", ".menuitem", function (e) {
                var ele = $(this);
                var menuItems = ele.parent().parent(".menu_body").find(".menuitem");
                var allMenuItems = ele.parents(".menus").find(".menuitem");
                if (e.ctrlKey) {
                    ele.hasClass("itemActive") ? ele.removeClass("itemActive") : ele.addClass("itemActive");
                    last = ele;
                } else if (e.shiftKey) {
                    var begin_idx = [].indexOf.apply(menuItems, last);
                    var end_idx = [].indexOf.apply(menuItems, ele);
                    allMenuItems.removeClass("itemActive");
                    if (begin_idx !== -1 && end_idx !== -1) {
                        for (var i = 0; i < menuItems.length; i++) {
                            if (i > Math.max(begin_idx, end_idx) || i < Math.min(begin_idx, end_idx)) {
                                menuItems.eq(i).removeClass("itemActive");
                            } else {
                                menuItems.eq(i).addClass("itemActive");
                            }
                        }
                    } else {
                        ele.addClass("itemActive");
                        last = ele;
                    }
                } else {
                    allMenuItems.removeClass("itemActive");
                    ele.addClass("itemActive");
                    last = ele;
                }
            });
        }
    };
}]).directive("uiInputNumber", ["$http", "$compile", "$templateCache", function ($http, $compile, $templateCache) {
    return {
        restrict: "AE",
        scope: {
            step: "@",
            max: "@",
            userNumber: "=ngModel",
            min: "@"
        },
        priority: 2,
        require: "ngModel",
        controller: function controller($scope) {},
        link: function link(scope, element, attrs, ctrl) {

            scope.addStep = Number(scope.step) || 1;
            scope.addMax = Number(scope.max) || null;
            scope.addMin = Number(scope.min) || null;

            var is_dot = String(Number(scope.step)).indexOf(".") === -1 ? false : true;

            var modelCtrl = ctrl;
            var temp = $compile($("<div ui-input-number-wrapper></div>")[0])(scope);
            element.hide();
            element.after(temp);

            var numKey = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
            var ctrKey = [8, 9, 13, 35, 36, 37, 38, 39, 40, 45, 46, 144, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 110, 190];
            scope.keydown = function (e) {
                var _code = e.keyCode;
                var _valsplit = e.target.value.split(".");

                if (numKey.indexOf(_code) === -1 && ctrKey.indexOf(_code) === -1) {
                    e.preventDefault();
                }
                // 小数点后只能输入一位
                if (numKey.indexOf(_code) > -1 && _valsplit.length > 1 && _valsplit[1].length > 0 && e.target.selectionStart > e.target.value.indexOf(".")) {
                    e.preventDefault();
                }
                // 屏蔽小数点
                if (_code === 110 || _code === 190) {
                    if (!is_dot) {
                        e.preventDefault();
                    } else {
                        if (e.target.value.indexOf(".") !== -1) {
                            e.preventDefault();
                        }
                    }
                }
                // 键盘上键加法
                if (_code === 38) {
                    e.preventDefault();
                    scope.add(scope.addStep);
                    scope.round();
                }
                // 键盘下键减法
                if (_code === 40) {
                    e.preventDefault();
                    scope.add(-scope.addStep);
                    scope.round();
                }
            };
            scope.round = function () {
                scope.userNumber = is_dot ? Math.round(Number(scope.userNumber) * 2) / 2 : Math.round(scope.userNumber);
            };

            modelCtrl.$render = function () {
                scope.setValidation();
            };
            scope.setValidation = function () {
                var newval = modelCtrl.$modelValue;
                var exp = /^-?([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*|0?\.?0+|0)$/;
                if (exp.test(newval)) {
                    if (Math.abs(scope.addMax) >= 0 && newval > scope.addMax || Math.abs(scope.addMin) >= 0 && newval < scope.addMin) {
                        modelCtrl.$setValidity("number", false);
                    } else {
                        modelCtrl.$setValidity("number", true);
                    }
                } else {
                    if (newval) {
                        modelCtrl.$setValidity("number", false);
                    } else {
                        modelCtrl.$setValidity("number", true);
                    }
                }
            };
            scope.add = function (num) {
                scope.userNumber = Number(scope.userNumber) ? Number(scope.userNumber) + Number(num) : Number(num);
                scope.setValidation();
            };
        }
    };
}]).directive("uiInputNumberWrapper", [function () {
    return {
        restrict: "A",
        replace: true,
        templateUrl: "./views/vdi/common/input-number-temp.html",
        link: function link(scope, element) {}
    };
}]).directive("uiInputNumberFormatter", [function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function link(scope, element, attrs, ctrl) {
            var exp = /^-?([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*|0?\.?0+|0)$/;

            ctrl.$parsers.push(function (value) {
                if (exp.test(value)) {
                    return Number(value);
                }
            });
            ctrl.$formatters.push(function (value) {

                if (exp.test(value)) {
                    return Number(value);
                }
            });
        }
    };
}]).directive("uiWebUpload", ["$http", "$rootScope", "$$$I18N", "$Domain", function ($http, $rootScope, $$$I18N, $Domain) {
    var org = XMLHttpRequest;
    var org_open = org.prototype.open;
    var allowUpload = window.FormData && typeof window.FormData === "function";
    $rootScope.uploadPool = $rootScope.uploadPool || {};
    return {
        restrict: "A",
        templateUrl: function templateUrl(ele, attrs) {
            if (attrs.templateUrl) {
                return attrs.templateUrl;
            }
            return "views/vdi/common/ui-web-upload.html";
        },
        scope: {
            config: "=uiUploadConfig",
            finishHandel: "&"
        },
        controller: ["$scope", function (scope) {
            scope.$on("progress", function (e, size) {
                if (size.id === scope.upload_id) {
                    scope.progressName = size.name;
                    scope.isUploading = true;
                    var percent = size.loaded / size.total * 100;
                    if (isNaN(percent)) {
                        percent = 0;
                    }
                    scope.progressPercent = percent.toFixed(2) + "%";
                    if (scope.progressPercent === "100.00%") {
                        scope.isUploading = false;
                    }
                    // 初始化页面上传不更新问题
                    scope.$apply();
                }
            });
            scope.allowUpload = allowUpload;
            scope.uploadISOSize = null;
        }],
        link: function link(scope, element, attrs) {
            scope.upload_id = attrs.uiWebUpload;
            scope.btnName = $$$I18N.get(attrs.uiUploadBtnName);
            scope.$on("localizeLanguageChanged", function () {
                // 重新apply数据才会更新视图，加定时器，调用apply才不会报错
                setTimeout(function () {
                    scope.btnName = $$$I18N.get(attrs.uiUploadBtnName);
                    scope.$apply();
                });
            });

            // 绑定一个测试提交，如果条件为 true 则按钮可点击，否则不可点击
            // 这种方式需要父 scope 配合
            if (attrs.uiWebUploadTest) {
                var degfn = scope.$parent.$watch(attrs.uiWebUploadTest, function (v) {
                    scope.disableTest = v;
                });
                scope.$on("$destroy", degfn);
                scope.disableTest = false;
            } else {
                scope.disableTest = true;
            }

            var filetype, url;
            var form = element.find("form");
            form.attr("action", url);
            function checkConfig(file, config) {
                var filetype = attrs.uiUploadType;
                var maxSize = attrs.uiUploadLimit;
                var url = attrs.uiUploadUrl;

                if (!url) {
                    throw new Error("no url config");
                    return false;
                }
                var typematch = true;
                if (filetype && file) {
                    typematch = new RegExp("\\.(" + filetype + ")$").test(file.name);
                    if (!typematch) {
                        $.bigBox({
                            title: $$$I18N.get("INFOR_TIP"),
                            content: $$$I18N.get("不是一个可接受的文件类型"),
                            icon: "fa fa-warning shake animated",
                            timeout: 6000
                        });
                        return false;
                    }
                }

                if (maxSize) {
                    maxSize = parseInt(maxSize);
                    if (isNaN(maxSize)) {
                        return console.error("invalid upload limit:", attrs.uiUploadLimit);
                    }
                    if (file.size > maxSize * Math.pow(2, 30)) {
                        $.bigBox({
                            title: $$$I18N.get("INFOR_TIP"),
                            content: $$$I18N.get("超出文件大小限制") + "(" + maxSize + "G)",
                            icon: "fa fa-warning shake animated",
                            timeout: 6000
                        });
                        return false;
                    }
                }
                if (file.size === 0) {
                    $.bigBox({
                        title: $$$I18N.get("INFOR_TIP"),
                        content: $$$I18N.get("文件为空"),
                        icon: "fa fa-warning shake animated",
                        timeout: 6000
                    });
                    return false;
                } else {
                    return true;
                }
            }
            function clearDOM() {
                var input = element.find("input[type=file]");
                input.after(input.clone(true).val(''));
                input.remove();
                scope.isUploading = false;
                scope.progressSize = 0;
            }
            function finish() {
                $rootScope.uploadPool[attrs.uiWebUpload] = undefined;
                delete $rootScope.uploadPool[attrs.uiWebUpload];
            }
            function success(res) {
                if (typeof scope.finishHandel === "function") {
                    scope.finishHandel({ response: res });
                }
            }
            element.find("input[type=file]").on("change", function (e) {
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                // var conf = scope.config;
                var isValid = checkConfig(file);

                if (isValid) {
                    // $.bigBox({
                    //  title : $$$I18N.get("INFOR_TIP"),
                    //  content : $$$I18N.get("INFOR_UPISO"),
                    //  iconSmall : "fa fa-warning shake animated",
                    //  timeout : 5000
                    // });

                    var data = new FormData();
                    // 允许绑定额外的参数
                    if (attrs.uiWebUploadParams) {
                        $.each(scope.$eval(attrs.uiWebUploadParams), function (k, v) {
                            data.append(k, v);
                        });
                    }
                    data.append(attrs.uiWebUploadName || e.target.name, file);
                    scope.progressName = file.name;
                    scope.progressSize = "(" + (file.size / Math.pow(2, 20)).toFixed(2) + "M)";

                    $http.post($Domain + attrs.uiUploadUrl, data, {
                        transformRequest: function transformRequest(config) {
                            window.XMLHttpRequest = function (a, b, c, e) {
                                window.XMLHttpRequest = org;
                                var xhr = new org(a, b, c, e);
                                $rootScope.uploadPool[attrs.uiWebUpload] = xhr;
                                xhr.open = function (q, w, e, r, t, y) {
                                    xhr.open = undefined;
                                    delete xhr.open;
                                    if (xhr.upload) {
                                        xhr.upload.addEventListener("progress", function (e) {
                                            $rootScope.$broadcast("progress", {
                                                id: attrs.uiWebUpload,
                                                name: file.name,
                                                loaded: e.loaded,
                                                position: e.position,
                                                total: e.total,
                                                totalSize: e.totalSize
                                            });
                                        });
                                        xhr.addEventListener("abort", finish);
                                    }
                                    return org_open.call(xhr, q, w, e, r, t, y);
                                };
                                return xhr;
                            };
                            return config;
                        },
                        headers: { "Content-Type": undefined }
                    }).then(function (res) {
                        clearDOM();
                        finish(res);
                        success(res);
                        $rootScope.$broadcast("finishUpload", true, file.name);
                    }, function () {
                        clearDOM();
                        finish();
                    });
                }
            });

            element.find("button[type='button']").on("click", function (e) {
                $(this).prev("input[type=file]").click();
            });
            if (attrs.btnClass) {
                element.find("button[type='button']").removeClass("btn-primary").addClass(attrs.btnClass);
            }
            if (attrs.iconClass) {
                element.find(".icon").removeClass("icon-jj-Upload").addClass(attrs.iconClass);
            }

            element.find("#abortBtn").on("click", function (e) {
                var xhr = $rootScope.uploadPool[attrs.uiWebUpload];
                xhr && xhr.abort();
                clearDOM();
                scope.$apply();
            });
        }
    };
}]).service("warnBox", [function () {
    this.warn = function (content, id, callback) {
        if (!$("#warnBox").length) {
            $("body").append("<div id='warnBox'></div>");
        } else {
            $("#warnBox").show();
        }
        $("body #warnBox").append("<div class='box warnBox" + id + "'><i class='fa fa-bell'></i><div class='content'><div class='btn-close'><span>×</span></div><p class='detail' title=" + content + ">" + content + "</p></div></div>");
        if ($("body .warnBox" + id + " .detail").height() > 38) {
            $("body .warnBox" + id + " .detail").addClass('highHeight');
        }
        $("#warnBox .warnBox" + id + " .btn-close").click(function (e) {
            callback(id);
        });
        setTimeout(function () {
            if ($("#warnBox .warnBox" + id + "")) {
                callback(id);
            }
        }, 30000);
    }, this.close = function (id) {
        $("body .box.warnBox" + id + "").remove();
        if (!$("#warnBox").children().length) {
            $("#warnBox").hide();
        } else {
            $("#warnBox").show();
        }
    };
}]).controller("TaskListController", ["$scope", "Task", "$location", "$$$I18N", "UserRole", "$rootScope", "warnBox", function ($scope, task, $location, $$$I18N, UserRole, $rootScope, warnBox) {
    $scope.toggleTaskList = function () {
        $("body").toggleClass("show_prog");
    };
    var user = void 0;
    var taskTimer = null;
    $scope.$on("NOAUTH", function () {
        user = null;
        clearTimeout(taskTimer);
    });
    $scope.$on("STOPLOG", function () {
        clearTimeout(taskTimer);
    });
    $scope.$on("AUTHED", function () {
        user = UserRole.currentUser;
        schedule();
    });
    if (UserRole.currentUser) {
        user = UserRole.currentUser;
        schedule();
    }
    $scope.rows = [];
    var data = {};
    $scope.$on("instanceIDS", function ($event, ids) {
        data.instances = ids;
    });
    $scope.$on("imageIDS", function ($event, ids) {
        data.images = ids;
    });
    $scope.$on("clientIDS", function ($event, ids) {
        data.clients = ids;
    });
    $scope.$on('modeIDS', function ($event, ids) {
        data.modes = ids;
    });
    $scope.$on('nodes', function ($event, ids) {
        data.nodes = ids;
    });
    $scope.$on('manageNetworkIDS', function ($event, ids) {
        data.manage_networks = ids;
    });
    $scope.$on('personpools', function ($event, ids) {
        data.personpools = ids;
    });
    var lists = [],
        flag = false;
    function schedule() {
        var postData = data && Object.keys(data).map(function (key) {
            // if(key !== "clients"){
            return {
                key: key,
                ids: data[key]
            };
            // }
            // else{
            //     return {
            //         key: key,
            //         ids: []
            //     };    
            // }
        });
        task.post(postData, function (res) {
            $scope.rows = res.results.tasks.filter(function (item) {
                return user.real_name === item.user;
            });

            Object.keys(res.results).forEach(function (key) {
                if (key !== "tasks") {
                    $scope.$root && $scope.$root.$broadcast(key + "RowsUpdate", res.results[key]);
                }
            });
            for (var i in res.results.notifies) {
                var item = res.results.notifies[i],
                    color = '#004d60',
                    content;
                if (lists[item.id] == undefined) {
                    lists[item.id] = item;
                    if (item.waringtype === 0) {
                        warnBox.warn(item.content, item.id, function (ID) {
                            warnBox.close(ID);
                            task.put({ notify_id: ID }, function (res) {});
                        });
                    } else {
                        if (item.waringtype === 1) {
                            color = "#004d60";
                            content = $$$I18N.get(item.name) + ' (' + item.target + ')';
                        } else {
                            color = "#C46A69";
                            content = $$$I18N.get(item.name) + ' (' + item.target + ')';
                        }
                        $.bigBox({
                            title: $$$I18N.get('waringtype' + item.waringtype),
                            content: content,
                            color: color,
                            timeout: 3000
                        }, function () {
                            task.put({ notify_id: item.id }, function (res) {});
                        });
                    }
                }
            }
            taskTimer = setTimeout(schedule, 3000);
        }, function () {
            taskTimer = setTimeout(schedule, 10000);
        });
        for (var k in data) {
            data[k] = undefined;
            delete data[k];
        }
    }
}]).controller("pageHeaderController", ["$scope", "UserAuth", "Task", "$location", "$$$I18N", "UserRole", "desktopHelpBox", function ($scope, Auth, task, $location, $$$I18N, UserRole, desktopHelpBox) {
    $scope.logout = function () {
        Auth.logout();
        desktopHelpBox.close();
    };
    $scope.$on("NOAUTH", function () {
        desktopHelpBox.close();
    });
    $scope.$on("DMS", function (e, dms) {
        $scope.dmsURL = dms;
        $$$storage.setSessionStorage('DMS', dms);
    });
    $scope.dmsURL = $$$storage.getSessionStorage('DMS') || 'nodms';
}]).controller("LogoController", ["$scope", "settings", "$Domain", "$$$version", function ($scope, settings, $Domain, $$$version) {
    $scope.domain = $Domain;
    $scope.version = $$$version;
    $scope.languages = settings.languages;
    $scope.currentLang = settings.currentLang;
}]).controller("SkinController", ["$scope", function ($scope) {
    $scope.changeSkin = function (theme) {
        $scope.$root.$broadcast("changeSkin", theme);
    };
}]).controller("userLoginInfoController", ["$scope", "UserRole", function ($scope, Role) {
    $scope.loginUser = Role.currentUser;
    $scope.$on("AUTHED", function (name, userInfo) {
        $scope.loginUser = userInfo;
    });
    $scope.$on("NOAUTH", function () {
        $scope.loginUser = null;
    });
}]).controller("AlarmController", ["$scope", "$modal", "SystemAlarm", "AlarmHistory", function ($scope, $modal, alarm, AlarmHistory) {
    $scope.isOpen = false;
    $scope.open = function () {
        $scope.isOpen = true;
    };
    $scope.close = function (e) {
        if (e) e.stopPropagation();
        $scope.isOpen = false;
    };
    // function findDif(oldArray, newArray, difAttr){
    //     if(newArray.length){
    //         var length = oldArray.length>=newArray.length?oldArray.length:newArray.length;
    //         var difs = [];
    //         for(var i=0; i<length; i++){
    //             if(newArray[i]){
    //                 var different = oldArray.filter(function(item){ return item[difAttr] == newArray[i][difAttr] })[0];
    //                 if(!different){ difs.push(newArray[i]) };
    //             }
    //         }
    //         return difs;
    //     }else{ return []; }
    // };

    // var oldAlarms = [];
    $scope.$on("alarmsRowsUpdate", function ($event, data) {
        $scope.alarms = data;
        // if(!$scope.isOpen){
        //     var unreads = [];
        //     data.forEach(function(item){
        //         if(!item.is_read){ unreads.push(item) }
        //     })
        //     if(unreads.length){
        //         $scope.open();
        //         setTimeout(function(){
        //             $scope.close();
        //         }, 30000)
        //     }
        // }

        // var difs = findDif(oldAlarms, data, 'id');
        // if(!$scope.isOpen && difs.length){
        //     oldAlarms = data;
        //     $scope.open();
        //     setTimeout(function(){
        //         $scope.close();
        //     }, 30000)
        // }
    });
    $scope.delete = function () {
        AlarmHistory.setRead({ ids: $scope.alarms.map(function (item) {
                return item.id;
            }) }, function (res) {
            $scope.alarms = [];
            $scope.isOpen = false;
        });
    };
}]).filter("interfaceFilter", [function () {
    return function (data, idx, nets) {
        var invalidArr = [];
        nets.forEach(function (n, i) {
            if (i !== idx && n._data_dev && n._data_dev._dev) {
                invalidArr.push(n._data_dev._dev);
            }
        });
        return data.filter(function (d) {
            if (invalidArr.indexOf(d._dev) === -1) {
                return true;
            }
            return false;
        });
    };
}]);

/***/ })

/******/ });
//# sourceMappingURL=init.map