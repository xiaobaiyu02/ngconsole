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
/******/ 	return __webpack_require__(__webpack_require__.s = 176);
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

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.user", []).constant('$$$UserRoles', "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About").factory("UserRole", ["$$$UserRoles", "NavigatorLink", "$rootScope", "$$$UserRoles", "User", function (roles, navigators, $root, $$$UserRoles, User) {
	var lastSessionPromise = void 0;
	var lastRequestTime = 0;
	var role = {
		getNavigator: function getNavigator(roles) {
			if ($$$storage.getSessionStorage("lang_code") == 'pc') navigators = navigators.filter(function (item) {
				return item.key !== 'Timetable';
			});
			return navigators.reduce(function (userNavigators, role) {
				if (roles.indexOf(role.key) > -1) {
					var role_copy = JSON.parse(JSON.stringify(role));
					userNavigators.push(role_copy);
					if (role.sublist && role.sublist.length) {

						role_copy.sublist = role.sublist.filter(function (role) {
							return roles.indexOf(role.key) > -1;
						});
					}
				}
				return userNavigators;
			}, []);
		},

		get currentUser() {
			var hasCache = !!$$$storage.getSessionStorage("loginInfo");
			if (hasCache && Date.now() - lastRequestTime > 1000 * 60 * 5) {
				this.refreshSession();
			}

			if (hasCache) {
				return JSON.parse($$$storage.getSessionStorage("loginInfo"));
			}
			$root.$broadcast("NOAUTH");
			return null;
		},
		get logined() {
			return Boolean($$$storage.getSessionStorage("loginInfo"));
		},
		get currentUserRoles() {
			var user = role.currentUser;
			return user && user.keys ? user.keys.split(",").map(function (r) {
				return r.trim();
			}) : [];
		},
		get isOwner() {
			var user = role.currentUser;
			return user && user.keys && user.keys === $$$UserRoles ? true : false;
		},
		get currentNavigator() {
			return role.getNavigator(role.currentUserRoles);
		},
		get currentSession() {
			return lastSessionPromise;
		},
		isAllowFilter: function (_isAllowFilter) {
			function isAllowFilter(_x) {
				return _isAllowFilter.apply(this, arguments);
			}

			isAllowFilter.toString = function () {
				return _isAllowFilter.toString();
			};

			return isAllowFilter;
		}(function (role) {
			if (role.sublist && role.sublist.length) {
				role.sublist.filter(isAllowFilter, this);
			}
			return this.indexOf(role.key) > -1;
		}),
		refreshSession: function refreshSession() {
			lastSessionPromise = User.session({ user_id: $$$storage.getSessionStorage("userId") }).$promise;
			lastSessionPromise.then(function (res) {
				var oldInfo = JSON.parse($$$storage.getSessionStorage("loginInfo")) || {};
				// test--
				// res.user.keys = "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About";
				Object.keys(res.user).forEach(function (key) {
					oldInfo[key] = res.user[key];
				});
				$$$storage.setSessionStorage('loginInfo', JSON.stringify(oldInfo));
				$$$storage.setSessionStorage('power', res.user.keys);
			});
			lastRequestTime = Date.now();
			return lastSessionPromise;
		}
	};
	return role;
}])

/* 用户 */
.factory("Roles", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/user/permissions", null, {
		query: { method: "GET", url: $Domain + "/thor/user/permissions", isArray: false },
		update: { method: "PUT", url: $Domain + "/thor/user/permissions" }
	});
}]).factory("Admin", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/user/manager", null, {
		query: { method: "GET", url: $Domain + "/thor/user/manager", isArray: false },
		update: { method: "PUT", url: $Domain + "/thor/user/manager" }
	});
}])
// .factory("User", ["$resource", "$Domain", function(res, $Domain){
// 	return res($Domain + "/thor/user/common", null, {
// 		query:
// 			{ method: "GET", url: $Domain + "/thor/user/common", isArray: false},
// 		update: 
// 			{method: "PUT", url: $Domain + "/thor/user/common" },
// 		session: {method: "POST", url: $Domain + "/thor/user/session"}
// 	});
// }])
.factory("User", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/user/common", null, {
		query: { method: "GET", url: $Domain + "/thor/user/common", isArray: false },
		edit: { method: "PATCH", url: $Domain + "/thor/user/common/:id", params: { "id": "@id" }, isArray: false },
		move: { method: "PATCH", url: $Domain + "/thor/user/common/move" },
		query_tree: { method: "GET", url: $Domain + "/thor/user/common/tree" },
		session: { method: "POST", url: $Domain + "/thor/user/session" }
	});
}])
/**
 * [description 部门]
 */
.factory("Depart", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/user/departments", null, {
		query: { method: "GET", url: $Domain + "/thor/user/departments", isArray: false },
		add: { method: "POST", url: $Domain + "/thor/user/departments" },
		update: { method: "PATCH", url: $Domain + "/thor/user/departments/:id", params: { "id": "@id" }, isArray: false },
		delete: { method: "DELETE", url: $Domain + "/thor/user/departments/:id", params: { "id": "@id" }, isArray: false }
	});
}]).factory("Server", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/user/server", null, {
		// 读取域列表
		query: { method: "GET", url: $Domain + "/thor/user/server" },
		get: { method: "GET", url: $Domain + "/thor/user/info/:id", params: { "id": "@id" }, isArray: false },
		// 修改域基本信息
		update: { method: "PUT", url: $Domain + "/thor/user/server" },
		//新增域
		create: { method: "POST", url: $Domain + "/thor/user/server" },
		"delete": { method: "DELETE", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" }, isArray: false },
		listDomain: { method: "GET", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" } },

		// 指定教学桌面设置域
		"domain_set_scene": { method: "POST", url: $Domain + "/thor/pool/mode/:id/change_domain", params: { "id": "@id" } },
		//个人桌面设置域
		"domain_set_person": { method: "POST", url: $Domain + "/thor/instances/change_domain" }
	});
}]).factory("Domain", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/user/domain/:id", { "id": "@id" }, {
		// 域用户列表
		list: { method: "GET", url: $Domain + "/thor/user/get_users" },
		// 查看特定域的用户信息
		query: { method: "GET", url: $Domain + "/thor/user/domain/:id", params: { "id": "@id" } },
		asycing: { method: "POST", url: $Domain + "/thor/user/domain/:id", params: { "auto": "@auto" }, isArray: false },
		get: { method: "GET", url: $Domain + "/thor/user/domain/:id/ous", params: { "id": "@id" } },
		delete: { method: "DELETE", url: $Domain + "/thor/user/common", isArray: false }
	});
}]).controller("vdiUserAdminManageController", ["$scope", "Admin", "$modal", "UserRole", "$$$I18N", function ($scope, UseradminList, $modal, UserRole, $$$I18N) {
	var user = UserRole.currentUser;
	if (!user) {
		return;
	}
	$scope.rows = [];
	// $scope.allRows = [];
	$scope.loading = true;
	$scope.owner = UserRole.isOwner;
	$scope.loginName = user.name;

	UseradminList.query(function (res) {
		if (!$scope.owner) {
			$scope.rows = res.users.filter(function (item) {
				return item.name == $scope.loginName;
			});
		} else {
			$scope.rows = res.users;
		}
		$scope.loading = false;
		var _ip;
		$scope.rows.forEach(function (row) {
			if (row.last_login !== null) {
				_ip = row.last_login.split(".");
				row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + _ip[3] / 1000;
			} else {
				_ip = null;
				row._ip = null;
			}
		});
		// angular.copy($scope.rows,$scope.allRows);
	});

	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('admin_pagesize')) || 30;
	$scope.$watch("pagesize", function (newvalue) {
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('admin_pagesize', newvalue ? newvalue : 0);
	});

	// $scope.updateData = function(text){
	// 	$scope.rows = $scope.allRows.filter(function(row){
	// 		row._selected = false;
	// 		if(text){
	// 			return row.name.indexOf(text) !== -1;
	// 		}
	// 		return true;
	// 	});
	// };

	$scope.sortIP = function (order) {
		$scope.rows.sort(function (a, b) {
			return a._ip > b._ip ? 1 : -1;
		});
		if (order) {
			$scope.rows.reverse();
		}
	};

	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && !row._ignore;
		});
		var nodelete_rows = selected_rows.filter(function (row) {
			return row.instance_num != 0;
		});
		var delete_rows = selected_rows.filter(function (row) {
			return row.instance_num == 0;
		});
		var rows = $scope.rows;
		if (delete_rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("ADMIN_TIP"),
				timeout: 6000
			});
		} else $modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.nodelete_rows = nodelete_rows;
				$scope.name = delete_rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.nodeleteName = nodelete_rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					UseradminList.delete({
						ids: delete_rows.map(function (row) {
							return row.id;
						})
					}, function (res) {
						delete_rows.forEach(function (item) {
							var index = rows.indexOf(item);
							rows.splice(index, 1);
						});
						$modalInstance.close();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("vdiUserCommonManageController", ["$scope", "User", "$modal", "$http", "$$$MSG", "$$$I18N", "$Domain", "$timeout", "customModal", "Depart", "User", "UserRole", "$location", function ($scope, UsercommonList, $modal, $http, $$$MSG, $$$I18N, $Domain, $timeout, customModal, Depart, User, UserRole, $location) {
	var _scope = $scope;
	$scope.rows = [];
	var WIDTH = $$$I18N.get("GOD_VERSION") == "cloudClassEn" || $$$I18N.get("GOD_VERSION") == "korean" ? 66 : 50;
	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('common_pagesize')) || 30;
	$scope.$watch("pagesize", function (newvalue) {
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('common_pagesize', newvalue ? newvalue : 0);
	});
	$scope.domain = $Domain;
	/**
  * [sortIP IP排序]
  */
	$scope.sortIP = function (order) {
		$scope.rows.sort(function (a, b) {
			return a._ip > b._ip ? 1 : -1;
		});
		if (order) {
			$scope.rows.reverse();
		}
	};

	// 组合json数据
	function setData(data, index) {
		data.filter(function (item) {
			return item.full_path_map.length == index;
		}).forEach(function (item) {
			var children = data.filter(function (d) {
				return d.parent == item.id;
			});
			item.children = children;
		});
	}
	function setTreeData(DATA) {
		DATA.forEach(function (item) {
			item.full_path_map = item.full_path.split('/');
		});
		DATA.sort(function (a, b) {
			return a.full_path_map.length > b.full_path_map.length ? -1 : 1;
		});
		for (var i = 1; i < DATA[0].full_path_map.length; i++) {
			setData(DATA, i);
		}
		return [DATA[DATA.length - 1]];
	};
	// 初始化树状图
	function treeOptFun(arg, flag) {
		arg.opts = {};
		arg.treedata = newData;
		arg.expandnodes = DATA;
		arg.selected = arg.treedata[0] ? arg.treedata[0] : null;
		if (arg.selected) {
			arg.selected._selected = true;
		}
		arg.showSelected = function (node, selected) {
			node._selected = selected;
			arg.selected = node;
			if (arg.selected._selected && flag) {
				$scope.queryCommon(arg.selected.id);
			}
		};
	};
	var DATA = [],
	    newData = [];
	treeOptFun($scope, true);

	$scope.islastGroup = function () {
		return $scope.selected && !DATA.filter(function (item) {
			return item.id !== $scope.selected.id;
		}).filter(function (item) {
			return (item.full_path + '/').indexOf($scope.selected.full_path + '/') > -1;
		}).length;
	};
	$scope.queryCommon = function (departId) {
		$scope.user_loading = true;
		$scope.rows = [];
		UsercommonList.query({ department: departId ? departId : undefined }, function (users) {
			$scope.user_loading = false;
			$scope.rows = users.result;
			// $scope.rows.forEach(function(item){ item.department_desc = $scope.selected.full_path });
			var _ip;
			$scope.rows.forEach(function (row) {
				if (row.last_login !== null) {
					_ip = row.last_login.split(".");
					row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + _ip[3] / 1000;
				} else {
					_ip = null;
					row._ip = null;
				}
			});
			console.log(777, $scope.rows);
		}, function () {
			$scope.user_loading = false;
		});
	};
	$scope.treedata_loading = true;
	$scope.queryDepart = function () {
		Depart.query(function (res) {
			$scope.treedata_loading = false;
			DATA = res.result;
			$scope.treedata = newData = DATA.length ? setTreeData(DATA) : [];
			$scope.treedata[0].children && $scope.treedata[0].children.sort(function (a, b) {
				return a.name > b.name ? -1 : 1;
			});
			$scope.expandnodes = DATA;
			var selected = {};
			if ($scope.selected) {
				var _selected = DATA.filter(function (item) {
					return item.id == $scope.selected.id;
				})[0];
				selected = _selected ? _selected : newData[0];
			} else {
				selected = newData[0];
			}
			$scope.selected = selected;
			if ($scope.selected) {
				$scope.selected._selected = true;
				$scope.queryCommon($scope.selected.id);
			}
		}, function (err) {
			$scope.treedata_loading = false;
		});
	};
	if ($location.$$search.depart) $scope.selected = { id: Number($location.$$search.depart) };
	if ($location.$$search.username) $scope.searchText = decodeURIComponent($location.$$search.username);

	$scope.queryDepart();

	/**
  * [addDepartment 添加部门]
  */
	$scope.addDepartment = function () {
		$modal.open({
			templateUrl: "views/vdi/dialog/user/user_common_department_add.html",
			size: DATA.length ? "md" : 'sm',
			controller: function controller($scope, $modalInstance) {
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				treeOptFun($scope);
				$scope.selected = null;
				$scope.ok = function () {
					Depart.add({
						name: this.name,
						parent: this.selected ? this.selected.id : 1
					}, function (res) {
						$modalInstance.close();
						_scope.queryDepart();
					}, function () {});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	/**
  * [deleteDpartment 删除部门]
  */
	$scope.deleteDpartment = function () {
		var modalOptions = {
			key: "CommonDepartDel",
			title: "删除用户组",
			delTips: "USER_TIPGROUP3",
			delete_rows: [$scope.selected],
			delParm: 'name'
		};
		customModal.openModal(modalOptions);
	};
	/**
  * [delete 列表删除用户]
  */
	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var nodelete_rows = selected_rows.filter(function (row) {
			return row.instance_num != 0;
		});
		var delete_rows = selected_rows.filter(function (row) {
			return row.instance_num == 0;
		});

		if (delete_rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("ADMIN_TIP"),
				timeout: 6000
			});
		} else {
			var modalOptions = {
				key: "CommonUserDel",
				title: "删除用户",
				delTips: "USER_TIPGROUP1",
				delete_rows: delete_rows,
				delParm: 'name',
				nodelete_rows: nodelete_rows,
				nodelTips: "USER_TIPGROUP4"
			};
			customModal.openModal(modalOptions);
		}
	};

	$scope.$on('DELETE', function (e, val) {
		if (val) {
			// 删除部门
			if (val.key == 'CommonDepartDel') {
				Depart.delete({
					id: val.data[0].id
				}, function (res) {
					$scope.queryDepart();
				}, function () {});
			}
			//删除部门用户
			if (val.key == 'CommonUserDel') {
				UsercommonList.delete({
					id: val.data.map(function (row) {
						return row.id;
					})
				}, function (res) {
					$scope.queryDepart();
				});
			}
		}
	});
	/**
  * [modifyInfo 修改部门名称]
  */
	$scope.modifyInfo = function (node) {
		var obj = node ? node : $scope.selected;
		$modal.open({
			templateUrl: "views/vdi/dialog/user/user_common_department_modify.html",
			size: "sm",
			controller: function controller($scope, $modalInstance) {
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				$scope.name = obj.name;
				$scope.ok = function () {
					Depart.update({
						id: obj.id,
						name: this.name
					}, function (res) {
						_scope.queryDepart();
					}, function () {});
					$modalInstance.close();
				};

				$scope.close = function () {
					$modalInstance.close();
				};
			}
		});
	};
	/**
  * [moveTo 用户移动至部门]
  */
	$scope.moveTo = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			templateUrl: "views/vdi/dialog/user/user_common_moveTo.html",
			size: "md",
			draggable: true,
			controller: function controller($scope, $modalInstance) {
				treeOptFun($scope);
				$scope.opts.isSelectable = function (node) {
					return !DATA.filter(function (item) {
						return item.id !== node.id;
					}).filter(function (item) {
						return (item.full_path + '/').indexOf(node.full_path + '/') > -1;
					}).length;
				};
				$scope.selected = null;
				$scope.ok = function () {
					User.move({
						id: selected_rows.map(function (item) {
							return item.id;
						}),
						department: this.selected.id
					}, function (res) {
						_scope.queryDepart();
					});
					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
				//勾选的人员姓名
				$scope.selectedPerson = selected_rows.map(function (item, index, arr) {
					return item.name;
				}).join('，');
			}
		});
	};
	/**
  * [description uploadify上传文件]
  */
	var encodeHTML = function encodeHTML(txt, con) {
		con = con || document.createElement("div");
		while (con.firstChild) {
			con.removeChild(con.firstChild);
		}
		return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
	};
	var format = function format(tmpl) {
		var data = Array.prototype.slice.call(arguments, 0);
		return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function (match, param) {
			if (data[param]) {
				return encodeHTML(data[param]);
			}
			return match;
		}) : "";
	};

	$scope.finishUpload = function (response) {
		$scope.queryDepart();
	};

	$scope.$on("UploadError", function (e, suc, errorData) {
		var errorMsg = errorData.code == 17041 ? $$$MSG.get(errorData.code) + errorData.detail : $$$MSG.get(errorData.code);
		$.bigBox({
			title: $$$MSG.get("PAI_CODE") + errorData.code,
			content: errorMsg,
			color: "#C46A69",
			icon: "fa fa-warning shake animated",
			timeout: 6000
		});
	});
}]).controller("vdiUserDomainController", ["$scope", "$modal", "Server", function ($scope, $modal, Server) {
	$scope.loading = true;
	$scope.rows = [];

	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading = false;

	Server.query(function (response) {
		$scope.rows = response.servers;
	}, function () {
		//console.log(arguments);
	});

	var _scope = $scope;
	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var rows = $scope.rows;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除域控制器'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.name = selected_rows.map(function (row) {
					return row.host;
				}).join(', ');
				$scope.ok = function () {
					Server.delete({
						ids: selected_rows.map(function (row) {
							return row.id;
						})
					}, function (res) {
						Server.query(function (response) {
							_scope.rows = response.servers;
						});
						$modalInstance.close();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("vdiUserDomainListController", ["$scope", "$modal", "Domain", "User", "$routeParams", "$$$I18N", function ($scope, $modal, Domain, User, $routeParams, $$$I18N) {
	$scope.loading = true;
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["用户", "域用户", "域用户列表"]);

	// location.replace("#/user/domain/");
	$scope.domainId = location.hash.match(/\d+$/) ? parseInt(location.hash.match(/\d+$/)[0]) : $routeParams.id;
	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading = false;
	$scope.rows = [];
	$scope.oneKeySycing = function () {
		Domain.asycing({ "auto": 1, "id": $scope.domainId }, function (response) {
			angular.forEach(response.result, function (item, index) {
				var i;
				for (i = 0; i < $scope.rows.length; i++) {
					if (item.id == $scope.rows[i]) {
						$scope.rows[i] = item;
					}
				}
				if (i >= $scope.rows.length) {
					$scope.rows.push(item);
				}
				//$scope.rows.push(item);
			});
		});
	};

	var _scope = $scope;
	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var nodelete_rows = selected_rows.filter(function (row) {
			return row.instance_num != 0;
		});
		var delete_rows = selected_rows.filter(function (row) {
			return row.instance_num == 0;
		});
		var rows = $scope.rows;

		if (delete_rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("ADMIN_TIP"),
				timeout: 6000
			});
		} else $modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;word-break: break-all;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.nodelete_rows = nodelete_rows;
				$scope.name = delete_rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.nodeleteName = nodelete_rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					User.delete({
						ids: delete_rows.map(function (row) {
							return row.id;
						})
					}, function (res) {
						delete_rows.forEach(function (item) {
							var index = rows.indexOf(item);
							rows.splice(index, 1);
						});
						$modalInstance.close();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	Domain.query({ "id": $scope.domainId }, function (response) {
		$scope.rows = response.users;
	}, function () {});
}]).controller("vdiUserRoleManageController", ["$scope", "$modal", "Roles", "$$$UserRoles", "$$$I18N", function ($scope, $modal, roles, $$$UserRoles, $$$I18N) {
	$scope.rows = [];var _controllerScope = $scope;$scope.loading = true;
	// $scope.allRows = [];
	$scope.powers = $$$UserRoles;
	roles.query(function (res) {
		$scope.rows = res.result.sort(function (a, b) {
			if (a.name === 'Administrator') {
				return -1;
			} else if (b.name === 'Administrator') {
				return 1;
			}
			return 0;
		});
		$scope.loading = false;
		// angular.copy($scope.rows,$scope.allRows);
	});

	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('role_pagesize')) || 30;
	$scope.$watch("pagesize", function (newvalue) {
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('role_pagesize', newvalue ? newvalue : 0);
	});

	// $scope.updateData = function(text){
	// 	$scope.rows = $scope.allRows.filter(function(row){
	// 		row._selected = false;
	// 		if(text){
	// 			return row.name.indexOf(text) !== -1;
	// 		}
	// 		return true;
	// 	});
	// };

	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && !row._ignore;
		});
		var nodelete_rows = selected_rows.filter(function (row) {
			return row.user_num != 0;
		});
		var delete_rows = selected_rows.filter(function (row) {
			return row.user_num == 0;
		});
		var rows = $scope.rows;

		if (delete_rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("ROEL_TIP"),
				timeout: 6000
			});
		} else $modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除角色'>" + "删除角色</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ROLES1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='DELETE_ROLES2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.nodelete_rows = nodelete_rows;
				$scope.name = delete_rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.nodeleteName = nodelete_rows.map(function (row) {
					return row.name;
				}).join(', ');

				$scope.ok = function () {
					roles.delete({
						ids: delete_rows.map(function (row) {
							return row.id;
						})
					}, function (res) {
						delete_rows.forEach(function (item) {
							var index = rows.indexOf(item);
							rows.splice(index, 1);
						});
						$modalInstance.close();
					});
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("addUserRoleDialog", ["$scope", "$modalInstance", "Roles", "$$$I18N", "NavigatorLink", function ($scope, $modalInstance, role, $$$I18N, navigators) {
	$scope.checked = true;$scope.roles = [];
	navigators.forEach(function (item) {
		if (item.sublist) {
			$scope.roles.push(item);
			item.sublist.forEach(function (data) {
				if (data.key !== "Role_Manage") $scope.roles.push(data);
			});
		} else $scope.roles.push(item);
	});
	$scope.roles.forEach(function (item) {
		item._selected = $scope.checked;
		item._slide = false;
		item._arrow = "up";
	});
	$scope.selectAll = function () {
		$scope.checked = !$scope.checked;
		if ($scope.checked) {
			$scope.roles.forEach(function (item) {
				if (item.key != "Administrator" && item.key != "User" && item.key != "Summary") item._selected = true;
			});
		} else {
			$scope.roles.forEach(function (item) {
				if (item.key != "Administrator" && item.key != "User" && item.key != "Summary") item._selected = false;
			});
		}
	};
	$scope.slide = function (name, checked) {
		var fatheritem = $scope.roles.filter(function (item) {
			return item.key === name;
		})[0];
		var subitem = $scope.roles.filter(function (item) {
			return item.belong === name;
		});
		if (checked) {
			fatheritem._arrow = "down";
			subitem.forEach(function (item) {
				item._slide = true;
			});
		} else {
			fatheritem._arrow = "up";
			subitem.forEach(function (item) {
				item._slide = false;
			});
		}
	};
	$scope.select = function (name) {
		var checked = $scope.roles.filter(function (item) {
			return item.key === name;
		})[0]._selected;
		var subitem = $scope.roles.filter(function (item) {
			return item.belong === name;
		});
		if (!checked) {
			subitem.forEach(function (item) {
				item._selected = true;
			});
		} else {
			subitem.forEach(function (item) {
				item._selected = false;
			});
		}
		var length = $scope.roles.filter(function (item) {
			return item._selected;
		}).length;
		if (length + 1 == $scope.roles.length) {
			$scope.checked = true;
		} else $scope.checked = false;
	};
	$scope.set = function (name) {
		var allchecked = false;
		$scope.roles.filter(function (item) {
			return item.belong === name;
		}).forEach(function (item) {
			if (item._selected == true) {
				allchecked = true;
			}
		});
		var fatheritem = $scope.roles.filter(function (item) {
			return item.key === name;
		})[0];
		if (fatheritem) {
			if (!allchecked) fatheritem._selected = false;else {
				fatheritem._selected = true;
			}
		}
		var length = $scope.roles.filter(function (item) {
			return item._selected;
		}).length;
		if (length == $scope.roles.length) {
			$scope.checked = true;
		} else $scope.checked = false;
	};

	$scope.min_namelength = 2;$scope.max_namelength = 20;

	$scope.ok = function () {
		var _this = this;
		var roles = this.roles.filter(function (item) {
			return item._selected == true;
		}).map(function (item) {
			return item.key;
		});
		if (roles.length) {
			role.save({
				"name": this.data.name,
				"desc": this.data.desc,
				"keys": roles.toString()
			}, function (data) {
				$scope.rows.push({
					id: data.id,
					name: data.name,
					desc: data.desc,
					user_num: data.user_num,
					redactor: data.redactor,
					updated_time: data.updated_time,
					access_key: data.access_key
				});
				$modalInstance.close();
			});
		} else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("PERMISSION_TIP"),
				timeout: 6000
			});
		}
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("editUserRoleDialog", ["$scope", "$modalInstance", "Roles", "$$$I18N", "UserRole", "NavigatorLink", function ($scope, $modalInstance, role, $$$I18N, UserRole, navigators) {
	var user = UserRole.currentUser;
	if (!user) {
		return;
	}
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.data = {};
	$scope.master = {};

	var item = $scope.item || $scope.currentItem;
	var roles = [];
	navigators.forEach(function (item) {
		if (item.sublist) {
			roles.push(item);
			item.sublist.forEach(function (data) {
				if (data.key !== "Role_Manage") roles.push(data);
			});
		} else roles.push(item);
	});
	item.roles = roles;
	var access_roles = item.access_key.split(",");
	item.roles.forEach(function (item) {
		item._selected = false;
		item._slide = false;
		item._arrow = "up";
	});
	access_roles.forEach(function (role) {
		item.roles.forEach(function (item) {
			if (item.key === role) item._selected = true;
		});
	});
	$scope.data = angular.copy(item);

	if ($scope.data.roles.filter(function (item) {
		return item._selected === true;
	}).length === $scope.data.roles.length) {
		$scope.checked = true;
	} else $scope.checked = false;

	$scope.selectAll = function () {
		$scope.checked = !$scope.checked;
		if ($scope.checked) {
			$scope.data.roles.forEach(function (item) {
				if (item.key != "Administrator" && item.key != "User" && item.key != "Summary") item._selected = true;
			});
		} else {
			$scope.data.roles.forEach(function (item) {
				if (item.key != "Administrator" && item.key != "User" && item.key != "Summary") item._selected = false;
			});
		}
	};
	$scope.slide = function (name, checked) {
		var fatheritem = $scope.data.roles.filter(function (item) {
			return item.key === name;
		})[0];
		var subitem = $scope.data.roles.filter(function (item) {
			return item.belong === name;
		});
		if (checked) {
			fatheritem._arrow = "down";
			subitem.forEach(function (item) {
				item._slide = true;
			});
		} else {
			fatheritem._arrow = "up";
			subitem.forEach(function (item) {
				item._slide = false;
			});
		}
	};
	$scope.select = function (name) {
		var checked = $scope.data.roles.filter(function (item) {
			return item.key === name;
		})[0]._selected;
		var subitem = $scope.data.roles.filter(function (item) {
			return item.belong === name;
		});
		if (!checked) {
			subitem.forEach(function (item) {
				item._selected = true;
			});
		} else {
			subitem.forEach(function (item) {
				item._selected = false;
			});
		}
		var length = $scope.data.roles.filter(function (item) {
			return item._selected;
		}).length;
		if (length + 1 == $scope.data.roles.length) {
			$scope.checked = true;
		} else $scope.checked = false;
	};
	$scope.set = function (name) {
		var allchecked = false;
		$scope.data.roles.filter(function (item) {
			return item.belong === name;
		}).forEach(function (item) {
			if (item._selected == true) {
				allchecked = true;
			}
		});
		var fatheritem = $scope.data.roles.filter(function (item) {
			return item.key === name;
		})[0];
		if (fatheritem) {
			if (!allchecked) fatheritem._selected = false;else {
				fatheritem._selected = true;
			}
		}
		var length = $scope.data.roles.filter(function (item) {
			return item._selected;
		}).length;
		if (length == $scope.data.roles.length) {
			$scope.checked = true;
		} else $scope.checked = false;
	};

	$scope.ok = function () {
		var _this = this;
		var roles = this.data.roles.filter(function (item) {
			return item._selected == true;
		}).map(function (item) {
			return item.key;
		});
		if (roles.length) {
			role.update({
				"id": this.data.id,
				"name": this.data.name,
				"desc": this.data.desc,
				"keys": roles.toString()
			}, function (data) {
				var POWER = item.access_key;
				item.name = data.name;
				item.desc = data.desc;
				item.access_key = data.access_key;
				item.redactor = data.redactor;
				item.updated_time = data.updated_time;
				item.user_num = data.user_num;
				$modalInstance.close();
				if (_this.data.id === user.permission && item.access_key != POWER) {
					$$$storage.setSessionStorage('power', roles.toString());
					location.reload();
				}
			});
		} else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("PERMISSION_TIP"),
				timeout: 6000
			});
		}
	};
	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};
	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
		if ($scope.data.roles.filter(function (item) {
			return item._selected === true;
		}).length === $scope.data.roles.length) {
			$scope.checked = true;
		} else $scope.checked = false;
	};
}]).controller("addUserAdminDialog", ["$scope", "$modalInstance", "Admin", "SchoolRoom", "Roles", "$$$I18N", function ($scope, $modalInstance, admin, schoolroom, role, $$$I18N) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope._ischeckAll = true;
	$scope.data = {
		sex: 'true'
	};
	$scope.master = { sex: 'true' };

	$scope.schoolroom_loading = true;
	schoolroom.querywithSimple(function (res) {
		$scope.schoolroom_loading = false;
		$scope.data.schoolrooms = res.pools_;
		$scope.data.schoolrooms.forEach(function (item) {
			item._selected = true;
		});
	});
	role.query(function (res) {
		$scope.roles = res.result;
		// $scope.data.role = res.result.filter(function(item){ return item.name==="Administrator" })[0];
	});
	$scope.DISABLED = false;
	$scope.changeRole = function (role) {
		if ($scope.data.role && $scope.data.role.name == "Administrator") {
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
		} else {
			$scope.DISABLED = false;
		}
	};
	$scope.checkAll = function (scope) {
		if (scope._ischeckAll) {
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = true;
			});
		} else {
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function (scope) {
		var schoolrooms = $scope.data.schoolrooms.filter(function (p) {
			return p._selected;
		});
		if (schoolrooms.length === $scope.data.schoolrooms.length) {
			scope._ischeckAll = true;
		} else {
			scope._ischeckAll = false;
		}
	};

	$scope.reset = function () {
		$scope.data = angular.copy($scope.master);
	};
	$scope.isUnchanged = function () {
		return angular.equals($scope.master, $scope.data);
	};
	$scope.ok = function () {
		var pools = $scope.data.schoolrooms.filter(function (item) {
			if (item._selected) return item;
		}).map(function (item) {
			return item.id;
		});
		if (pools.length) admin.save({
			name: $scope.data.name,
			real_name: $scope.data.real_name,
			sex: $scope.data.sex,
			permission: $scope.data.role.id,
			password: $scope.data.password,
			passwordConfirm: $scope.data.passwordConfirm,
			email: $scope.data.email,
			contact: $scope.data.contact,
			pools: pools
		}, function (data) {
			data.result.instance_num = 0;
			$scope.rows.push(data.result);
			$modalInstance.close();
		});else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("POOL_TIP"),
				timeout: 6000
			});
		}
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("editUserAdminDialog", ["$scope", "$modalInstance", "Admin", "SchoolRoom", "Roles", "$$$UserRoles", "$$$I18N", "UserRole", function ($scope, $modalInstance, admin, schoolroom, role, $$$UserRoles, $$$I18N, UserRole) {
	var user = UserRole.currentUser;
	if (!user) {
		return;
	}
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.owner = UserRole.isOwner;

	$scope.master = {};
	$scope.data = {};

	var item = $scope.item || $scope.currentItem;
	$scope.schoolroom_loading = true;
	schoolroom.querywithSimple(function (res) {
		$scope.schoolroom_loading = false;
		item.schoolrooms = res.pools_;
		var i = 0;
		item.schoolrooms.forEach(function (sch) {
			item.pool.forEach(function (id) {
				if (sch.id === id) {
					sch._selected = true;
					i++;
				}
			});
		});
		if (i == item.schoolrooms.length) {
			$scope._ischeckAll = true;
		}
		role.query(function (res) {
			item.roles = res.result;
			var myrole = res.result.filter(function (role) {
				return role.name === item.permission;
			})[0];
			// if(myrole)
			item.myrole = res.result.filter(function (role) {
				return role.name === item.permission;
			})[0];
			// else
			// 	item.myrole = res.result[0];
			$scope.data = angular.copy(item);
		});
	});
	if (!$scope.owner) $scope.DISABLED = true;
	$scope.changeRole = function (role) {
		if ($scope.data.myrole && $scope.data.myrole.name == "Administrator") {
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
		} else {
			$scope.data.schoolrooms.forEach(function (item) {
				item._selected = false;
			});
			item.pool.forEach(function (schoolroom_id) {
				$scope.data.schoolrooms.forEach(function (item) {
					if (item.id === schoolroom_id) {
						item._selected = true;
					}
				});
			});
			if ($scope.data.schoolrooms.filter(function (item) {
				return item._selected == true;
			}).length == $scope.data.schoolrooms.length) role._ischeckAll = true;else role._ischeckAll = false;

			$scope.DISABLED = false;
		}
	};
	$scope.checkAll = function (scope) {
		if (scope._ischeckAll) {
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = true;
			});
		} else {
			$scope.data.schoolrooms.map(function (schoolroom) {
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function (scope) {
		var schoolrooms = $scope.data.schoolrooms.filter(function (p) {
			return p._selected;
		});
		if (schoolrooms.length === $scope.data.schoolrooms.length) {
			scope._ischeckAll = true;
		} else {
			scope._ischeckAll = false;
		}
	};

	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};
	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
		if ($scope.data.schoolrooms.filter(function (item) {
			return item._selected === true;
		}).length === $scope.data.schoolrooms.length) {
			$scope.$$childTail._ischeckAll = true;
		} else {
			console.log($scope);$scope.$$childTail._ischeckAll = false;
		}
	};

	$scope.edit = function () {
		var user_id = this.data.id;
		var pools = this.data.schoolrooms.filter(function (item) {
			if (item._selected) return item;
		}).map(function (item) {
			return item.id;
		});
		if (pools.length) admin.update({
			id: this.data.id,
			contact: this.data.contact,
			email: this.data.email,
			name: this.data.name,
			real_name: this.data.real_name,
			sex: this.data.sex,
			password: this.data.password,
			pools: pools,
			permission: this.data.myrole.id

		}, function (res) {
			var PERMISSION = item.permission;
			item.name = res.result.name;
			item.real_name = res.result.real_name;
			item.sex = res.result.sex;
			item.email = res.result.email;
			item.contact = res.result.contact;
			item.pool = res.result.pool;
			item.permission = res.name;
			if (user_id === user.id) {
				$$$storage.setSessionStorage('power', $scope.data.roles.filter(function (item) {
					return item.name === res.name;
				})[0].access_key);
				var logInfor = UserRole.currentUser;
				logInfor.keys = $$$storage.getSessionStorage("power");
				logInfor.pool = res.result.pool;
				$$$storage.setSessionStorage("loginInfo", JSON.stringify(logInfor));
				if (item.permission != PERMISSION) {
					location.reload();
				}
			}
			$modalInstance.close();
		}, function () {});else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("POOL_TIP"),
				timeout: 6000
			});
		}
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("addUserCommonDialog", ["$scope", "$modalInstance", "User", "UserRole", function ($scope, $modalInstance, user, Role) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.data = {
		sex: 'true',
		role: '2',
		department: $scope.selected.id,
		redactor: Role.currentUser.name

	};
	$scope.master = { sex: 'true', role_desc: '教师' };

	$scope.reset = function () {
		$scope.data = angular.copy($scope.master);
	};
	$scope.isUnchanged = function () {
		return angular.equals($scope.master, $scope.data);
	};

	$scope.ok = function () {
		console.log(666666666, $scope.data);
		user.save($scope.data, function (data) {
			$scope.queryDepart();
			$modalInstance.close();
		});
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("editUserCommonDialog", ["$scope", "$modalInstance", "User", function ($scope, $modalInstance, user) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};
	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function () {
		user.edit({
			id: this.data.id,
			contact: this.data.contact,
			email: this.data.email,
			name: this.data.name,
			real_name: this.data.real_name,
			sex: this.data.sex,
			password: this.data.password,
			passwordConfirm: this.data.password,
			desc: this.data.desc
		}, function (res) {
			$scope.queryDepart();
			$modalInstance.close();
		}, function () {});
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("addUserDomainDialog", ["$scope", "$modalInstance", "Server", function ($scope, $modalInstance, Server) {
	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};

	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem || {});
	};

	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.ok = function () {
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		Server.create($scope.data, function (response) {
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			$scope.rows.unshift(response.result[0]);
			$modalInstance.close();
		}, function () {
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
	};

	$scope.data = { "user": "", "passwd": "" };
}]).controller("editUserDomainDialog", ["$scope", "$modalInstance", "Server", function ($scope, $modalInstance, Server) {
	var item = $scope.item || $scope.currentItem || {};
	$scope.data = angular.copy(item);
	Server.get({ "id": item.id }, function (response) {
		var data = response;
		angular.forEach(data, function (value, key) {
			item[key] = data[key];
		});
	}, function () {});

	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};

	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem || {});
	};

	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.ok = function () {
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		Server.update($scope.data, function (response) {
			var data = response.result[0];
			angular.forEach(data, function (value, key) {
				item[key] = data[key];
			});
			$modalInstance.close();
		}, function () {
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
	};
}]).controller("userDoaminAscingDialog", ["$scope", "$modalInstance", "Domain", function ($scope, $modalInstance, Domain) {
	var domainId = parseInt(location.hash.match(/\d+$/)[0]);
	$scope.selected = [];

	Domain.get({ id: domainId }, function (response) {
		$scope.status = 'completed';
		$scope.ous = response.ous;
	}, function () {
		$scope.status = 'completed';
	});

	$scope.ok = function () {
		Domain.asycing({
			id: domainId,
			auto: 0,
			ous: $scope.selected.map(function (item) {
				return item.base_dn;
			})
		}, function (response) {
			response.result.map(function (item) {
				var len = $scope.rows.length,
				    i;
				for (i = 0; i < len; i++) {
					if (item.id == $scope.rows[i].id) {
						$scope.rows[i] = item;
					}
				}
				if (i >= len) {
					$scope.rows.push(item);
				}
			});
			$modalInstance.close();
		}, function () {});
	};

	$scope.select_row = function (item) {
		item._selected = true;
	};
	$scope.select = function (item) {
		if (item) {
			if ($scope.selected.filter(function (d) {
				return d.fullname == item.fullname;
			}).length == 0) $scope.selected.push(item);
		} else {
			$scope.ous.filter(function (item) {
				return item._selected;
			}).forEach(function (d) {
				if ($scope.selected.filter(function (data) {
					return data.fullname == d.fullname;
				}).length == 0) $scope.selected.push(d);
			});
		}
	};
	$scope.removeSelected = function (_item) {
		var index;
		if (!_item) {
			return false;
		}
		index = $scope.selected.indexOf(_item);
		if (index > -1) {
			$scope.selected.splice(index, 1);
		}
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).constant("NavigatorLink", [{
	"key": "Summary",
	"value": "概要",
	"is_group": true,
	icon: "icon-jj-home",
	"url": "/summary"
}, {
	"key": "Resource",
	"value": "资源",
	icon: "icon-jj-cloud",
	"is_group": true,
	"sublist": [{
		"key": "Console",
		"value": "主控管理",
		"is_group": false,
		"belong": "Resource",
		"url": "/resource/console"
	}, {
		"key": "Pool",
		"value": "资源池管理",
		"is_group": false,
		"belong": "Resource",
		"url": "/resource/pool"
	}, {
		"key": "Storage",
		"value": "存储管理",
		"is_group": false,
		"belong": "Resource",
		"url": "/resource/storage"
	}]
}, {
	"key": "Network",
	"value": "网络",
	"is_group": true,
	icon: "icon-jj-017",
	"sublist": [{
		"key": "ManageNetwork",
		"value": "管理网络",
		"is_group": false,
		"belong": "Network",
		"url": "/network/manageNetwork"
	}, {
		"key": "VirtualSwitch",
		"value": "分布式虚拟交换机",
		"is_group": false,
		"belong": "Network",
		"url": "/network/virtualSwitch"
	}, {
		"key": "DataNetwork",
		"value": "数据网络",
		"is_group": false,
		"belong": "Network",
		"url": "/network/dataNetwork"
	}, {
		"key": "DHCP",
		"value": "DHCP",
		"is_group": false,
		"belong": "Network",
		"url": "/network/dhcp"
	}]
}, {
	"key": "Desktop",
	"value": "桌面",
	"is_group": true,
	icon: "icon-jj-pc",
	"sublist": [{
		"key": "Teaching_desktop",
		"value": "教学桌面",
		"is_group": false,
		"belong": "Desktop",
		"url": "/desktop/scene"
	}, {
		"key": "Personal_desktop",
		"value": "个人桌面",
		"is_group": false,
		"belong": "Desktop",
		"url": "/desktop/personal"
	}, {
		"key": "Personal_desktop_pool",
		"value": "个人桌面池",
		"is_group": false,
		"belong": "Desktop",
		"url": "/desktop/pool"
	}]
}, {
	"key": "Template",
	"value": "模板",
	icon: "icon-jj-Template",
	"is_group": true,
	"sublist": [{
		"key": "Teaching_template",
		"value": "教学模板",
		"is_group": false,
		"belong": "Template",
		"url": "/template/teach"
	}, {
		"key": "Personal_template",
		"value": "个人模板",
		"is_group": false,
		"belong": "Template",
		"url": "/template/personal"
	}, {
		"key": "Hardware_template",
		"value": "硬件模板",
		"is_group": false,
		"belong": "Template",
		"url": "/template/hardware"
	}]
}, {
	"key": "Terminal",
	"value": "终端",
	icon: "icon-jj-Terminal",
	"is_group": true,
	"sublist": [{
		"key": "Classroom",
		"value": "教室管理",
		"is_group": false,
		"belong": "Terminal",
		"url": "/terminal/schoolroom"
	}, {
		"key": "Terminal_Manage",
		"value": "终端管理",
		"is_group": false,
		"belong": "Terminal",
		"url": "/terminal/client"
	}]
}, {
	"key": "User",
	"value": "用户",
	icon: "icon-jj-men",
	"is_group": true,
	"sublist": [{
		"key": "Role_Manage",
		"value": "角色管理",
		"is_group": false,
		"belong": "User",
		"url": "/user/role"
	}, {
		"key": "Administrator",
		"value": "管理用户",
		"is_group": false,
		"belong": "User",
		"url": "/user/admin"
	}, {
		"key": "Common_user",
		"value": "普通用户",
		"is_group": false,
		"belong": "User",
		"url": "/user/common"
	}, {
		"key": "Domain_user",
		"value": "域用户",
		"is_group": false,
		"belong": "User",
		"url": "/user/domain"
	}]
}, {
	"key": "Monitor",
	"value": "监控",
	"is_group": true,
	icon: "icon-jj-Monitor",
	"sublist": [{
		"key": "Host_monitoring",
		"value": "主机监控",
		"is_group": false,
		"belong": "Monitor",
		"url": "/monitor/host"
	}, {
		"key": "Desktop_monitoring",
		"value": "桌面监控",
		"is_group": false,
		"belong": "Monitor",
		"url": "/monitor/desktop"
	}, {
		"key": "Alarm_information",
		"value": "告警信息",
		"is_group": false,
		"belong": "Monitor",
		"url": "/monitor/alarm"
	}, {
		"key": "Alarm_policy",
		"value": "告警策略",
		"is_group": false,
		"belong": "Monitor",
		"url": "/monitor/policy"
	}]
}, {
	"key": "Timetable",
	"value": "排课",
	"is_group": true,
	icon: "icon-jj-paike",
	"sublist": [{
		"key": "Course_list",
		"value": "课程列表",
		"is_group": false,
		"belong": "Timetable",
		"url": "/scheduler/view"
	}]
}, {
	"key": "Plan",
	"value": "计划任务",
	"is_group": true,
	icon: "icon-jj-012",
	"sublist": [{
		"key": "Timer_switch",
		"value": "定时开关机",
		"is_group": false,
		"belong": "Plan",
		"url": "/plan/switch"
	}, {
		"key": "Host_switch",
		"value": "主机定时开关机",
		"is_group": false,
		"belong": "Plan",
		"url": "/plan/hostSwitch"
	}]
}, {
	"key": "HA",
	"value": "高可用性",
	"is_group": true,
	icon: "icon-jj-001",
	"sublist": [{
		"key": "desktop_ha",
		"value": "桌面HA",
		"is_group": false,
		"belong": "HA",
		"url": "/HA/desktop"
	}]
}, {
	"key": "System",
	"value": "系统",
	"is_group": true,
	icon: "icon-jj-Setup",
	"sublist": [{
		"key": "System_deploy",
		"value": "快速部署",
		"is_group": false,
		"belong": "System",
		"url": "/system/deploy"
	}, {
		"key": "System_desktop",
		"value": "系统桌面",
		"is_group": false,
		"belong": "System",
		"url": "/system/desktop"
	}, {
		"key": "System_ISO",
		"value": "系统 ISO",
		"is_group": false,
		"belong": "System",
		"url": "/system/iso"
	}, {
		"key": "USB_redirection",
		"value": "USB 重定向",
		"is_group": false,
		"belong": "System",
		"url": "/system/usb"
	}, {
		"key": "USB_through",
		"value": "USB 透传",
		"is_group": false,
		"belong": "System",
		"url": "/system/through"
	}, {
		"key": "AutoSnapshot",
		"value": "自动快照",
		"is_group": false,
		"belong": "System",
		"url": "/system/snapshot"
	}, {
		"key": "System_set",
		"value": "系统设置",
		"is_group": false,
		"belong": "System",
		"url": "/system/set"
	},
	// {
	// 	"key": "USB_device",
	// 	"value": "主机 USB 设备",
	// 	"is_group": false,
	// 	"belong": "System",
	// 	"url": "/system/device"
	// },
	{
		"key": "System_backup",
		"value": "系统备份",
		"is_group": false,
		"belong": "System",
		"url": "/system/backup"
	}, {
		"key": "System_upgrade",
		"value": "系统升级",
		"is_group": false,
		"belong": "System",
		"url": "/system/upgrade"
	}, {
		"key": "Operation_log",
		"value": "操作日志",
		"is_group": false,
		"belong": "System",
		"url": "/system/logs"
		// {
		// 	"key": "End_log",
		// 	"value": "后台日志",
		// 	"is_group": false,
		// 	"belong": "System",
		// 	"url": "/system/endlogs"
		// }
	}]
}, {
	"key": "About",
	"value": "关于",
	icon: "icon-jj-about-1",
	"is_group": true,
	"url": "/about"
}]);

/***/ }),

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.desktop", [])

/* 场景 */
.factory("Scene", ["$resource", function ($resource) {
	return $resource("/thor/pool/modes", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" },
		get: { method: "GET", url: "/thor/pool/mode/:id", params: { id: "@id" } },
		update: { method: "POST", url: "/thor/pool/mode/:id", params: { id: "@id" } },
		active: { method: "PUT", url: "/thor/pool/mode/:id", params: { id: "@id" } },
		powerOn: { method: "POST", url: "/thor/pool/mode/action" },
		powerOff: { method: "POST", url: "/thor/pool/mode/action" },
		forcePowerOff: { method: "POST", url: "/thor/pool/mode/action" },
		haConfig: { method: "GET", url: "/thor/pool/mode/haConfig/:id", params: { id: "@id" } },
		sort: { method: "POST", url: "/thor/pool/modes/order" }

	});
}])
/*教学桌面 */
.factory("TeachDesktop", ["$resource", function ($resource) {
	return $resource("/thor/instance/mode/:id", { id: "@id" }, {
		query: { method: "GET", isArray: false },
		delete: { method: "DELETE", url: "/thor/instances" },
		reset: { method: "POST", url: "/thor/instance/mode/reset" },
		save: { method: "POST" },
		get: { method: "GET", url: "/thor/instance/:id", params: { id: "@id" }, isArray: false },
		start: { method: "POST", url: "/thor/instances/starts" },
		shutdown: { method: "POST", url: "/thor/instances/shutdowns" },
		pause: { method: "POST", url: "/thor/instances/pause" },
		resume: { method: "POST", url: "/thor/instances/unpause" },
		reboots: { method: "POST", url: "/thor/instances/reboots" },
		screenshot: { method: "POST", url: "/thor/instances/screenshot" },
		rename: { method: "POST", url: "/thor/pool/mode/instance/rename" }
	});
}])
/*个人桌面 */
.factory("PersonDesktop", ["$resource", function ($resource) {
	return $resource("/thor/instance/:id", { id: "@id" }, {
		query: { method: "GET", url: "/thor/instances", isArray: false },
		delete: { method: "DELETE", url: "/thor/instances" },
		save: { method: "POST", url: "/thor/instance" },
		get: { method: "GET", isArray: false },
		update: { method: "PUT" },
		start: { method: "POST", url: "/thor/instance/starts" },
		shutdown: { method: "POST", url: "/thor/instance/shutdowns" },
		pause: { method: "POST", url: "/thor/instance/pause" },
		resume: { method: "POST", url: "/thor/instance/unpause" },
		reboot: { method: "POST", url: "/thor/instance/reboots" },
		migrate: { method: "post", url: "/thor/instance/livemigration/:id", params: { "id": "@id" } },
		screenshot: { method: "POST", url: "/thor/instances/screenshot/:id", params: { "id": "@id" } },
		saveAsTemplate: { method: "POST", url: "/thor/instance/saveTemplate" },
		//移动至
		moveHostList: { method: "GET", url: "/thor/ha/instance/move" },
		moveTo: { method: "POST", url: "/thor/ha/instance/move" },
		//获取无源数据盘
		list_passive_disk: { method: "GET", url: "/thor/list_passive_volume" },
		//获取桌面详情信息
		list_detail: { method: "GET", url: "/thor/get_instance_details/:id", params: { "id": "@id" } },
		// 个人模板获取有哪些个人桌面会更新
		update_instance: { method: "GET", url: "/thor/instance/image/:id", params: { "id": "@id" } },
		check_can_migrate_host: { method: "POST", url: "/thor/check_can_migrate_host" },
		share_servers: { method: "GET", url: "/thor/share/servers" }
	});
}])
/*个人桌面池*/
.factory('DeskPool', ['$resource', function ($resource) {
	return $resource("/thor/instances/pool/:id", { id: "@id" }, {
		query: { method: "GET", isArray: false },
		delete: { method: "DELETE", url: "/thor/instances/pool" },
		save: { method: "POST", url: "/thor/instances/pool" },
		get: { method: "GET", isArray: false },
		update: { method: "PUT", url: "/thor/instance/pool/:id", params: { "id": "@id" } },
		start: { method: "POST", url: "/thor/instances/pool/action" },
		shutdown: { method: "POST", url: "/thor/instances/pool/action" },
		pause: { method: "POST", url: "/thor/instances/pool/pause" },
		resume: { method: "POST", url: "/thor/instances/pool/unpause" },
		reboot: { method: "POST", url: "/thor/instances/pool/reboots" },
		migrate: { method: "post", url: "/thor/instances/livemigration/:id", params: { "id": "@id" } },
		screenshot: { method: "POST", url: "/thor/instances/screenshot/:id", params: { "id": "@id" } },
		saveAsTemplate: { method: "POST", url: "/thor/instances/saveTemplate" },
		//移动至
		moveHostList: { method: "GET", url: "/thor/ha/instances/pool/move" },
		moveTo: { method: "POST", url: "/thor/ha/instances/move" },
		//获取无源数据盘
		list_passive_disk: { method: "GET", url: "/thor/list_passive_volume" },
		//获取桌面详情信息
		list_detail: { method: "GET", url: "/thor/get_instance_details/:id", params: { "id": "@id" } },
		// 个人模板获取有哪些个人桌面会更新
		update_instance: { method: "GET", url: "/thor/instances/image/:id", params: { "id": "@id" } }
	});
}])
/*个人桌面池详情*/
.factory("DeskPoolSecond", ["$resource", function ($resource) {
	return $resource("/thor/instances/pool", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" },
		get: { method: "GET", url: "/thor/instance/pool/:id", params: { id: "@id" } },
		update: { method: "POST", url: "/thor/instance/pool/:id", params: { id: "@id" } },
		active: { method: "PUT", url: "/thor/instance/pool/:id", params: { id: "@id" } },
		start: { method: "POST", url: "/thor/instance/starts" },
		shutdown: { method: "POST", url: "/thor/instance/shutdowns" },
		pause: { method: "POST", url: "/thor/instance/pause" },
		resume: { method: "POST", url: "/thor/instance/unpause" },
		reboots: { method: "POST", url: "/thor/instance/reboots" },
		moveHostList: { method: "GET", url: "/thor/ha/instance/move" },
		moveTo: { method: "POST", url: "/thor/ha/instance/move" }
	});
}])
//教学桌面--桌面修改
.factory("SenceAlter", ["$resource", function ($resource) {
	var res = $resource("/thor/pool/mode/new", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" }
	});
	return res;
}])

/* 教学、个人公用 */
.factory("VMCommon", ["$resource", function ($resource) {
	var base_url = "/thor/instance";
	return $resource(base_url, { id: "@id" }, {
		start: { method: "POST", url: base_url + "/starts" },
		shutdowns: { method: "POST", url: base_url + "/shutdowns" },
		pause: { method: "POST", url: base_url + "/pause" },
		resume: { method: "POST", url: base_url + "/unpause" },
		reboots: { method: "POST", url: base_url + "/reboots" },
		screenshot: { method: "POST", url: base_url + "/screenshot" },
		// 列出桌面快照
		list_snapshot: { method: "GET", url: base_url + "/snapshot" },
		// 创建快照
		take_snapshot: { method: "POST", url: base_url + "/snapshot" },
		restore_snapshot: { method: "POST", url: base_url + "/snapshot" },
		delete_snapshot: { method: "DELETE", url: base_url + "/snapshot" },
		// 获取在线迁移主机
		get_live_move_hosts: { method: "GET", url: "/thor/ha/instance/live/move" },
		//在线迁移
		live_move: { method: "POST", url: "/thor/ha/instance/live/move" },
		list_template: { method: "GET", url: "/thor/image/simple/:type", params: { "type": "@type" } }
	});
}])
// 筛选出选中的元素。若field参数存在，算出所有选中元素field字段的累计值
.filter('selectedFilter', function () {
	return function (list, field) {
		if (list) {
			if (field) {
				var _list = list.filter(function (item) {
					return item._selected;
				}).map(function (item) {
					return item[field];
				});
				return _list.length ? _list.reduce(function (a, b) {
					return a + b;
				}) : 0;
			} else {
				return list.filter(function (item) {
					return item._selected;
				});
			}
		}
	};
})
// 个人桌面列表控制器
.controller("vdiDesktopPersonalListController", ["$scope", "$modal", "PersonDesktop", "VMCommon", "$interval", "$filter", "PersonTemplate", "$$$os_types", "$$$I18N", "Server", "UserRole", "$location", "$q", "Admin", "User", "Depart", "TreeInstances", function ($scope, $modal, person_desktop, vm, $interval, $filter, tmpl, $$$os_types, $$$I18N, Server, UserRole, $location, $q, Admin, UsercommonList, Depart, TreeInstances) {
	var hasTerminalpermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Terminal';
	}).length;
	var hasTerminalManagepermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Terminal_Manage';
	}).length;
	var hasClassroompermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Classroom';
	}).length;
	$scope.linkTerminal = hasTerminalpermission && hasTerminalManagepermission && hasClassroompermission ? true : false;
	$scope.inCurrentUserPool = function (pool) {
		if ($$$storage.getSessionStorage("loginInfo")) return JSON.parse($$$storage.getSessionStorage("loginInfo")).pool.indexOf(pool) > -1;
	};

	if ($location.$$search.name) $scope.searchText = decodeURIComponent($location.$$search.name);

	$interval(function () {
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (item.task_state) {
				item.other_status = 'other';
			} else {
				item.other_status = 'certain';
			}
			if (item.status == 'updating' || item.status == 'making') {
				item._ignore = true;
			} else {
				item._ignore = false;
			}
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
		// $scope.updateData("", $scope.select, $scope.depart);
	});
	$scope.getObjLength = function (obj) {
		try {
			return Object.keys(obj).length;
		} catch (err) {
			return 0;
		}
	};

	$scope.depart = { name: '全部', id: -1, full_path: 'root' };
	$scope.refresh = function () {
		var _s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $scope;

		_s.depart = $$$storage.getSessionStorage('depart') ? JSON.parse($$$storage.getSessionStorage('depart')) : $scope.depart;
		person_desktop.query(function (res) {
			// _s.rows = _s.select==''?res.result:res.result.filter(function(item){ return item.status == _s.select });
			res.result.forEach(function (desk) {
				if (desk.user_group == "") {
					desk.user_group = $$$I18N.get("管理用户");
				}
				if (desk.task_state) {
					desk.other_status = 'other';
				} else {
					desk.other_status = 'certain';
				}
				if (desk.status == 'updating' || desk.status == 'making') {
					desk._ignore = true;
				} else {
					desk._ignore = false;
				}
			});
			_s.allRows = res.result;
			_s.updateData("", _s.select, _s.depart);
			_s.rows.forEach(function (row) {
				var os = $$$os_types.filter(function (item) {
					return item.key === row.os_type;
				})[0];
				os && os.icon && (row.icon = os.icon);
				row.detailData = {};
			});
			_s.loading = false;
		});
	};
	$scope.getDetail = function (it) {
		$scope.loading_detail = true;
		person_desktop.list_detail({ id: it.id }, function (res) {
			it.detailData = res.result;
		}).$promise.finally(function () {
			$scope.loading_detail = false;
		});
	};
	$scope.expand = function (row) {
		$scope.rows.forEach(function (r) {
			if (row.id === r.id) {
				r._expand = !row._expand;
				if (r._expand) {
					$scope.getDetail(row);
				}
			} else {
				r._expand = false;
			}
		});
	};
	$scope.pagesize = Number($$$storage.getSessionStorage('personl_pagesize')) || 30;
	$scope.currentPage = 1;
	$scope.$watch("pagesize", function (newvalue) {
		$$$storage.setSessionStorage('personl_pagesize', newvalue);
	});
	$scope.loading = true;
	$scope.rows = [];
	$scope.refresh();
	$scope.openAddDomainDialog = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.is_domain_user && !row.ad_server_name;
		});
		if (rows.length === 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalDomain_TIP1"),
				timeout: 6000
			});
			return;
		}
		var modal = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/add_server.html",
			controller: "personalAddServerDialog",
			resolve: { param: function param() {
					return angular.copy(rows);
				} }
		});
		modal.result.then(function (res) {
			$scope.refresh();
		});
	};
	$scope.personExitDomain = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.ad_server_name;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalDomain_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='退域'>" + "退域</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='DOMAIN_EXIT_TIP'>所选桌面在下一次开机时，将自动执行退域的操作，是否确定？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						Server.domain_set_person({
							instance_ids: rows.map(function (row) {
								return row.id;
							}),
							has_domain: false
						}, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.updateData = function (text, select, depart) {
		$$$storage.setSessionStorage('depart', JSON.stringify(depart));
		$scope.rows = $scope.allRows.filter(function (row) {
			row._selected = false;
			if (select) {
				if (text && text.trim()) {
					return row.status === select || row.other_status === select;
				}
				return row.status === select || row.other_status === select;
			}
			return true;
		});
		var ids = [];
		if (depart.type == 'common') {
			$scope.rows = $scope.rows.filter(function (it) {
				return it.user_group.indexOf(depart.dept_name) > -1;
			});
		} else if (depart.type == 'domain') {
			$scope.rows = $scope.rows.filter(function (it) {
				return it.user_group === depart.domain_name;
			});
		} else if (depart.type == 'admin') {
			$scope.rows = $scope.rows.filter(function (it) {
				return it.user === depart.name;
			});
		} else if (depart.type == 'adminAll') {
			$scope.rows = $scope.rows.filter(function (it) {
				return it.user_group == $$$I18N.get("管理用户");
			});
		}
	};

	var _controllerScope = $scope;
	/**
 * [selectMode 部门域选择]
 */
	$scope.selectMode = function () {
		$modal.open({
			templateUrl: "views/vdi/dialog/desktop/personal_user_group.html",
			size: 'sm-md',
			controller: function controller($scope, $modalInstance) {
				function formatData(d, name) {
					iteration(d, name);
					return d;
				}
				function iteration(data, childName) {
					for (var i = 0; i < data.length; i++) {
						data[i]['type'] = 'common';
						data[i]['name'] = data[i]['dept_name'];
						$scope.expandnodes.push(data[i]);
						if (data[i][childName] && data[i][childName].length) {
							var len = iteration(data[i][childName], childName);
							if (len === 0) {
								data[i] = undefined;
							}
						}
						if (data[i][childName] && data[i][childName].length === 0) {
							data[i] = undefined;
						}
					}
					for (i = 0; i < data.length; i++) {
						if (data[i] === undefined) {
							data.splice(i, 1);
						}
					}
					return data.length;
				}
				function getAdminNum(rows) {
					return rows.reduce(function (count, item) {
						return count + item.desktop_num;
					}, 0);
				}
				$scope.loading = true;
				TreeInstances.query(function (res) {
					$scope.loading = false;
					res.result.forEach(function (item) {
						if (item.dept_name) {
							item.name = item.dept_name;
						} else if (item.domain_name) {
							item.name = item.domain_name;
						} else {}
					});
					$scope.expandnodes = [];
					var adminData = res.result.filter(function (item) {
						return item.type == 'admin';
					});
					var admins = [{ name: $$$I18N.get("管理用户"), type: 'adminAll', children: adminData, desktop_num: getAdminNum(adminData) }];
					var domains = res.result.filter(function (item) {
						return item.type == 'domain';
					});
					var commons = res.result.filter(function (item) {
						return item.type == 'common';
					});
					commons = formatData(commons, "children", $scope.expandnodes);
					var all = [{ id: -1, name: $$$I18N.get("全部"), children: admins.concat(commons).concat(domains) }];
					$scope.treedata = all;
					$scope.expandnodes = $scope.expandnodes.concat(admins).concat(adminData).concat(domains).concat(all);
					$scope.selected = $scope.expandnodes.filter(function (item) {
						return item.name == _controllerScope.depart.name;
					})[0];
					$scope.selected._selected = true;
					$scope.showSelected = function (node, selected) {
						node._selected = selected;
						$scope.selected = node;
					};
				});
				$scope.ok = function () {
					_controllerScope.depart = $scope.selected && $scope.selected._selected ? $scope.selected : { name: $$$I18N.get("全部"), id: -1, full_path: 'root' };
					_controllerScope.updateData(_controllerScope.searchText, _controllerScope.select, _controllerScope.depart);
					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
			}
		});
	};
	/**
 * [selectMode 部门域选择]_____end
 */

	$scope.start = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout: 6000
			});
		} else {
			vm.start({ instance_ids: rows.map(function (row) {
					return row.instance_id;
				}) }, function () {
				$scope.refresh();
			});
		}
	};

	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						vm.shutdowns({ instance_ids: rows.map(function (row) {
								row._selected = false;
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.shutdowns({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.restart = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>" + "桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.reboots({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.pause = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'running' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>" + "桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.pause({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.resume = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'paused' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>" + "桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.resume({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.hasPausedStatus = function () {
		var flag = false;
		var _selected = $scope.rows.filter(function (row) {
			return row._selected;
		});
		var _hasPaused = _selected.filter(function (row) {
			return row.status == 'paused';
		});
		if (_hasPaused.length == _selected.length) {
			flag = true;
		}
		return flag;
	};
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status !== 'paused';
		});
		var is_running = rows.some(function (row) {
			return row.status == 'running' && !row.task_state;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>" + "桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><div ng-show='has_data_disk' style='margin-bottom:20px;'><label class='checkbox-inline'><input class='checkbox' ng-model='delete_disk' type='checkbox'/><span  localize='删除数据盘'>删除数据盘</span></label></div><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.is_run = is_running;
				$scope.delete_disk = true;
				$scope.has_data_disk = rows.some(function (d) {
					return d.local_gb;
				});
				$scope.ok = function () {
					$modalInstance.close();
					person_desktop.delete({
						instance_ids: rows.map(function (row) {
							return row.instance_id;
						}),
						force_delete_data: this.delete_disk
					}, function (data) {
						_controllerScope.refresh();
					}, function (error) {
						_controllerScope.refresh();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.moveto = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var can_migrate_rows = rows.filter(function (item) {
			return item.virtual_type === 'kvm' && item.status == 'shutdown' && !item.task_state;
		});
		if (!can_migrate_rows.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("DESKTOP_MOVE_TIP1"),
				timeout: 6000
			});
		} else {
			var can_migrate_host = [];
			$scope.moveto_loading = true;
			person_desktop.check_can_migrate_host({ instance_ids: can_migrate_rows.map(function (item) {
					return item.id;
				}) }, function (res) {
				for (var i in res.result) {
					can_migrate_host.push({ id: i, value: res.result[i] });
				};
				can_migrate_host = can_migrate_host.filter(function (item) {
					return item.value;
				});
				$scope.moveto_loading = false;
				if (!can_migrate_host.length) {
					$.bigBox({
						title: $$$I18N.get("INFOR_TIP"),
						content: $$$I18N.get("DESKTOP_MOVE_TIP1"),
						timeout: 6000
					});
					return;
				}
				$modal.open({
					template: "<section id='widget-grid'>\n\t\t\t\t\t\t\t<div class='modal-content'>\n\t\t\t\t\t\t\t\t<div class='modal-header'>\n\t\t\t\t\t\t\t\t\t<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>\xD7</span><span class='sr-only'>Close</span></button>\n\t\t\t\t\t\t\t\t\t<h4 class='modal-title' id='mySmallModalLabel' localize='\u684C\u9762\u79FB\u52A8'>\u684C\u9762\u79FB\u52A8</h4>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class='modal-body'>\n\t\t\t\t\t\t\t\t\t<form class='form-horizontal' novalidate name='movetoForm'>\n\t\t\t\t\t\t\t\t\t\t<div class='form-group'>\n\t\t\t\t\t\t\t\t\t\t\t<label class='control-label col-xs-4' localize='\u9009\u62E9\u76EE\u6807\u4E3B\u673A'>\u9009\u62E9\u76EE\u6807\u4E3B\u673A</label>\n\t\t\t\t\t\t\t\t\t\t\t<div class='col-xs-4'>\n\t\t\t\t\t\t\t\t\t\t\t\t<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<option value=\"\" localize=\"--\u8BF7\u9009\u62E9--\"> --\u8BF7\u9009\u62E9-- </option>\n\t\t\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<img style=\"position: relative;top: 3px\" ng-if=\"hosts_loading\" width=\"24\" height=\"24\" src=\"img/HLloading.gif\">\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>\n\t\t\t\t\t\t\t\t\t\t<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='\u786E\u5B9A' ng-disabled='movetoForm.$invalid'>\u786E\u5B9A</button>\n\t\t\t\t\t\t\t\t\t\t<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='\u53D6\u6D88'>\u53D6\u6D88</button></footer>\n\t\t\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</section>",
					controller: function controller($scope, $modalInstance) {
						$scope.hosts = [];
						$scope.hosts_loading = true;
						person_desktop.moveHostList({ instance_ids: rows.map(function (item) {
								return item.id;
							}) }, function (res) {
							$scope.hosts = res.result;
							$scope.host = $scope.hosts[0];
							$scope.hosts_loading = false;
						});

						$scope.ok = function () {
							var _this = this;
							$scope.loading = true;
							person_desktop.moveTo({ instance_ids: can_migrate_host.map(function (item) {
									return item.id;
								}), host: _this.host }, function () {
								$modalInstance.close();
								$.bigBox({
									title: $$$I18N.get("INFOR_TIP"),
									content: $$$I18N.get("桌面移动成功"),
									timeout: 6000
								});
							}).$promise.finally(function () {
								$scope.loading = false;
							});
						}, $scope.close = function () {
							$modalInstance.close();
						};
					},
					size: "md"
				});
			});
		}
	};
	$scope.migration = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status === 'running' && !row.task_state;
		});
		if (!rows.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("DESKTOP_MOVE_TIP2"),
				timeout: 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'>\n\t\t\t\t\t<div class='modal-content'>\n\t\t\t\t\t\t<div class='modal-header'>\n\t\t\t\t\t\t\t<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>\xD7</span><span class='sr-only'>Close</span></button>\n\t\t\t\t\t\t\t<h4 class='modal-title' id='mySmallModalLabel' localize='\u52A8\u6001\u8FC1\u79FB'></h4>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class='modal-body'>\n\t\t\t\t\t\t\t<form class='form-horizontal' novalidate name='movetoForm'>\n\t\t\t\t\t\t\t\t<div class='form-group'>\n\t\t\t\t\t\t\t\t\t<label class='control-label col-xs-4' localize='\u9009\u62E9\u76EE\u6807\u4E3B\u673A'>\u9009\u62E9\u76EE\u6807\u4E3B\u673A</label>\n\t\t\t\t\t\t\t\t\t\t<div class='col-xs-4'>\n\t\t\t\t\t\t\t\t\t\t\t<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>\n\t\t\t\t\t\t\t\t\t\t\t\t<option value=\"\" localize=\"--\u8BF7\u9009\u62E9--\">\u8BF7\u9009\u62E9</option>\n\t\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<img style=\"position: relative;top: 3px\" ng-if=\"hosts_loading\" width=\"24\" height=\"24\" src=\"img/HLloading.gif\">\n\t\t\t\t\t\t\t\t\t\t<a style=\"position: relative;top: 5px;\" ng-if=\"!hosts_loading && !hosts.length\" class=\"mypopover\" htmlpopover='{{migrationTip}}'><i class=\"fa fa-question-circle\"></i></a>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<footer class='text-right'>\n\t\t\t\t\t\t\t\t\t\t<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>\n\t\t\t\t\t\t\t\t\t\t<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='\u786E\u5B9A' ng-disabled='movetoForm.$invalid'>\u786E\u5B9A</button>\n\t\t\t\t\t\t\t\t\t\t<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='\u53D6\u6D88'>\u53D6\u6D88</button>\n\t\t\t\t\t\t\t\t\t</footer>\n\t\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</section>",
			controller: function controller($scope, $modalInstance) {
				$scope.hosts = [];
				$scope.hosts_loading = true;
				$scope.migrationTip = $$$I18N.get('migrationTip');
				vm.get_live_move_hosts({ instance_ids: rows.map(function (item) {
						return item.id;
					}) }, function (res) {
					$scope.hosts = res.result;
					$scope.host = $scope.hosts[0];
					$scope.hosts_loading = false;
				});
				$scope.ok = function () {
					var _this = this;
					$scope.loading = true;
					vm.live_move({
						instance_ids: rows.map(function (item) {
							return item.id;
						}),
						host: _this.host
					}, function () {
						$modalInstance.close();
						$.bigBox({
							title: $$$I18N.get("INFOR_TIP"),
							content: $$$I18N.get("桌面迁移成功"),
							timeout: 6000
						});
					}).$promise.finally(function () {
						$scope.loading = false;
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "md"
		});
	};
	$scope.view = function (item) {
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
	$scope.viewStorage = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/desktop/view_storage.html",
			controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
				person_desktop.list_detail({ id: item.id }, function (res) {
					$scope.data = res.result;
					$scope.data.hostname = item.hostname;
				});
				$scope.close = function () {
					$modalInstance.close();
				};
			}]
		});
	};
}]).controller("vdiDesktopTeachListController", ["$scope", "$route", "$modal", "$routeParams", "TeachDesktop", "PersonDesktop", "VMCommon", "$interval", "$filter", "$$$I18N", "UserRole", "$location", function ($scope, $route, $modal, $routeParams, teach_desktop, person_desktop, vm, $interval, $filter, $$$I18N, UserRole, $location) {
	if ($location.$$search.name) $scope.searchText = decodeURIComponent($location.$$search.name);

	var user = UserRole.currentUser;
	if (!user) {
		return;
	}
	$scope.rows = [];
	$scope.loading = true;
	$scope.refresh = getList;
	$interval(function () {
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.$root && $scope.rows && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (item.task_state) {
				item.other_status = 'other';
			} else {
				item.other_status = 'certain';
			}
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
		// $scope.updateData($scope.searchText, $scope.select);
	});

	var _controllerScope = $scope;
	var _id = $route.current.params.id;
	function getList() {
		teach_desktop.query({ id: _id }, function (res) {
			res.result.forEach(function (desk) {
				if (desk.task_state) {
					desk.other_status = 'other';
				} else {
					desk.other_status = 'certain';
				}
			});
			_controllerScope.rows = res.result.sort(function (a, b) {
				var _numa, _numb;
				var get_num = function get_num(tar) {
					for (var i = tar.length - 1; i--; i >= 0) {
						if (!Number(tar[i])) {
							return Number(tar.substring(i + 1, tar.length));
						}
					}
				};
				_numa = get_num(a.display_name);
				_numb = get_num(b.display_name);
				return (_numa - _numb) * (false ? -1 : 1);
			});
			_controllerScope.allRows = res.result;
			_controllerScope.res = res;
			_controllerScope.loading = false;
			_controllerScope.$root && $scope.$root.$broadcast("navItemSelected", ["桌面", "教学桌面", res.mode_name]);
		}, function (error) {
			location.replace("#desktop/scene/");
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("NOEXSIT_SECNE_TIP"),
				timeout: 6000
			});
		});
	}
	getList();
	$scope.refresh = getList;
	$scope.pagesize = parseInt($$$storage.getSessionStorage('teach_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize", function (newvalue) {
		if (newvalue) {
			$$$storage.setSessionStorage('teach_pagesize', newvalue);
		}
	});
	// $scope.$watch("select",function(newvalue){
	// 	if(newvalue && $scope.allRows){
	// 		$scope.rows = $scope.allRows.filter(function(item){ return item.status == newvalue});
	// 		$$$storage.setSessionStorage('status', newvalue);
	// 	}
	// });	
	$scope.updateData = function (text, select) {
		$scope.rows = $scope.allRows.filter(function (row) {
			row._selected = false;
			if (select) {
				if (text && text.trim()) {
					return row.status === select || row.other_status === select;
				}
				return row.status === select || row.other_status === select;
			}
			return true;
		});
	};
	$scope.sortDesktopName = function (name, bool) {
		$scope.rows.sort(function (a, b) {
			var _numa, _numb;
			var get_num = function get_num(tar) {
				for (var i = tar.length - 1; i--; i >= 0) {
					if (!Number(tar[i])) {
						return Number(tar.substring(i + 1, tar.length));
					}
				}
			};
			_numa = get_num(a[name]);
			_numb = get_num(b[name]);
			return (_numa - _numb) * (bool ? -1 : 1);
		});
	};

	$scope.start = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP1"),
				timeout: 6000
			});
		} else {
			rows.map(function (row) {
				row._selected = false;
			});
			vm.start({ instance_ids: rows.map(function (row) {
					return row.instance_id;
				}) }, function () {
				_controllerScope.refresh();
			});
		}
	};

	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.shutdowns({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP3"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.shutdowns({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.restart = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP4"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>" + "桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.reboots({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.pause = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'running' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP5"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>" + "桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.pause({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.resume = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'paused' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP6"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>" + "桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
						});
						vm.resume({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.reset = function (item) {
		var row = item;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重置'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定重置桌面吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					teach_desktop.reset({ instance_id: row.instance_id }, function (data) {
						$.bigBox({
							title: $$$I18N.get("操作结果"),
							content: $$$I18N.get("重置成功"),
							timeout: 5000
						});
						_controllerScope.refresh();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.alter = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/desktop/teach_alter.html",
			controller: function controller($scope, $modalInstance) {
				$scope.vm_hostname = item.vm_hostname;
				$scope.post = function () {
					var _this = this;
					teach_desktop.rename({
						'instance_ids': [item.id],
						'instance_name': _this.vm_hostname
					}, function () {
						$modalInstance.close();
						_controllerScope.refresh();
					});
				};
				$scope.close = function () {
					$modalInstance.dismiss();
				};
			}
		});
	};
	$scope.rename = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (r) {
			return r._selected && r.status == "shutdown" && !r.task_state;
		});
		if (rows.length) {
			$modal.open({
				templateUrl: "views/vdi/dialog/desktop/teach_rename.html",
				controller: function controller($scope, $modalInstance) {
					$scope.addZero = function (len, str_begin, str_end) {
						if (str_end && str_begin) {
							var end_len = str_end.toString().length;
							if (end_len < len) {
								return str_begin + new Array(len - end_len + 1).join("0") + str_end;
							} else {
								return str_begin + str_end;
							}
						}
					};
					$scope.ok = function () {
						var _this = this;
						teach_desktop.rename({
							'instance_ids': rows.map(function (row) {
								return row.instance_id;
							}),
							'hostname_type': _this.hostNameType,
							'hostname_prefix': _this.hostNamePre,
							'hostname_beginwith': _this.hostNameBegin
						}, function () {
							$modalInstance.close();
							_controllerScope.refresh();
						});
					};
					$scope.close = function () {
						$modalInstance.dismiss();
					};
				}
			});
		} else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopTeachList_TIP7"),
				timeout: 6000
			});
		}
	};
	$scope.view = function (item) {
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
	$scope.moveto = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var can_migrate_rows = rows.filter(function (item) {
			return item.virtual_type === 'kvm' && item.status == 'shutdown' && !item.task_state;
		});
		if (!can_migrate_rows.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("DESKTOP_MOVE_TIP1"),
				timeout: 6000
			});
		} else {
			var can_migrate_host = [];
			$scope.moveto_loading = true;
			person_desktop.check_can_migrate_host({ instance_ids: can_migrate_rows.map(function (item) {
					return item.id;
				}) }, function (res) {
				var datas = [];
				for (var i in res.result) {
					can_migrate_host.push({ id: i, value: res.result[i] });
				};
				can_migrate_host = can_migrate_host.filter(function (item) {
					return item.value;
				});
				$scope.moveto_loading = false;
				if (!can_migrate_host.length) {
					$.bigBox({
						title: $$$I18N.get("INFOR_TIP"),
						content: $$$I18N.get("DESKTOP_MOVE_TIP1"),
						timeout: 6000
					});
					return;
				}
				$modal.open({
					template: "<section id='widget-grid'>\n\t\t\t\t\t\t\t<div class='modal-content'>\n\t\t\t\t\t\t\t\t<div class='modal-header'>\n\t\t\t\t\t\t\t\t\t<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>\xD7</span><span class='sr-only'>Close</span></button>\n\t\t\t\t\t\t\t\t\t<h4 class='modal-title' id='mySmallModalLabel' localize='\u684C\u9762\u79FB\u52A8'>\u684C\u9762\u79FB\u52A8</h4>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class='modal-body'>\n\t\t\t\t\t\t\t\t\t<form class='form-horizontal' name='movetoForm' novalidate>\n\t\t\t\t\t\t\t\t\t\t<div class='form-group'>\n\t\t\t\t\t\t\t\t\t\t\t<label class='control-label col-xs-4' localize='\u9009\u62E9\u76EE\u6807\u4E3B\u673A'>\u9009\u62E9\u76EE\u6807\u4E3B\u673A</label>\n\t\t\t\t\t\t\t\t\t\t\t<div class='col-xs-4'>\n\t\t\t\t\t\t\t\t\t\t\t\t<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<option value=\"\" localize='--\u8BF7\u9009\u62E9--'></option>\n\t\t\t\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<img style=\"position: relative;top: 3px\" ng-if=\"hosts_loading\" width=\"24\" height=\"24\" src=\"img/HLloading.gif\">\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<footer class='text-right'>\n\t\t\t\t\t\t\t\t\t\t\t<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>\n\t\t\t\t\t\t\t\t\t\t\t<button class='btn btn-primary' data-ng-click='ok()' ng-if='!loading' localize='\u786E\u5B9A' ng-disabled='movetoForm.$invalid'>\u786E\u5B9A</button>\n\t\t\t\t\t\t\t\t\t\t\t<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='\u53D6\u6D88'>\u53D6\u6D88</button>\n\t\t\t\t\t\t\t\t\t\t</footer>\n\t\t\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</section>",
					controller: function controller($scope, $modalInstance) {
						$scope.hosts = [];
						$scope.hosts_loading = true;
						person_desktop.moveHostList({ instance_ids: rows.map(function (item) {
								return item.id;
							}) }, function (res) {
							$scope.hosts = res.result;
							$scope.host = $scope.hosts[0];
							$scope.hosts_loading = false;
						});
						$scope.ok = function () {
							var _this = this;
							$scope.loading = true;
							person_desktop.moveTo({ instance_ids: can_migrate_host.map(function (item) {
									return item.id;
								}), host: _this.host }, function () {
								$modalInstance.close();
								$.bigBox({
									title: $$$I18N.get("INFOR_TIP"),
									content: $$$I18N.get("桌面移动成功"),
									timeout: 6000
								});
							}).$promise.finally(function () {
								$scope.loading = false;
							});
						}, $scope.close = function () {
							$modalInstance.close();
						};
					},
					size: "md"
				});
			});
		}
	};
	$scope.migration = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status === 'running' && !row.task_state;
		});
		if (!rows.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("DESKTOP_MOVE_TIP2"),
				timeout: 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'>\n\t\t\t\t<div class='modal-content'>\n\t\t\t\t\t<div class='modal-header'>\n\t\t\t\t\t\t<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>\xD7</span><span class='sr-only'>Close</span></button>\n\t\t\t\t\t\t<h4 class='modal-title' id='mySmallModalLabel' localize='\u52A8\u6001\u8FC1\u79FB'></h4>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class='modal-body'>\n\t\t\t\t\t\t<form class='form-horizontal' novalidate name='movetoForm'>\n\t\t\t\t\t\t\t<div class='form-group'><label class='control-label col-xs-4' localize='\u9009\u62E9\u76EE\u6807\u4E3B\u673A'>\u9009\u62E9\u76EE\u6807\u4E3B\u673A</label>\n\t\t\t\t\t\t\t\t<div class='col-xs-4'>\n\t\t\t\t\t\t\t\t\t<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>\n\t\t\t\t\t\t\t\t\t\t<option value=\"\" localize=\"--\u8BF7\u9009\u62E9--\">\u8BF7\u9009\u62E9</option>\n\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<img style=\"position: relative;top: 3px\" ng-if=\"hosts_loading\" width=\"24\" height=\"24\" src=\"img/HLloading.gif\">\n\t\t\t\t\t\t\t\t<a style=\"position: relative;top: 5px;\" ng-if=\"!hosts_loading && !hosts.length\" class=\"mypopover\" htmlpopover='{{migrationTip}}'><i class=\"fa fa-question-circle\"></i></a>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<footer class='text-right'>\n\t\t\t\t\t\t\t\t<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>\n\t\t\t\t\t\t\t\t<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='\u786E\u5B9A' ng-disabled='movetoForm.$invalid'>\u786E\u5B9A</button>\n\t\t\t\t\t\t\t\t<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='\u53D6\u6D88'>\u53D6\u6D88</button>\n\t\t\t\t\t\t\t</footer>\n\t\t\t\t\t\t</form>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</section>",
			controller: function controller($scope, $modalInstance) {
				$scope.hosts = [];
				$scope.hosts_loading = true;
				$scope.migrationTip = $$$I18N.get('migrationTip');
				vm.get_live_move_hosts({ instance_ids: rows.map(function (item) {
						return item.id;
					}) }, function (res) {
					$scope.hosts = res.result;
					$scope.host = $scope.hosts[0];
					$scope.hosts_loading = false;
				});
				$scope.ok = function () {
					var _this = this;
					$scope.loading = true;
					vm.live_move({
						instance_ids: rows.map(function (item) {
							return item.id;
						}),
						host: _this.host
					}, function () {
						$modalInstance.close();
						$.bigBox({
							title: $$$I18N.get("INFOR_TIP"),
							content: $$$I18N.get("桌面迁移成功"),
							timeout: 6000
						});
					}).$promise.finally(function () {
						$scope.loading = false;
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "md"
		});
	};
	$scope.viewStorage = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/desktop/view_storage.html",
			controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
				$scope.loading = true;
				person_desktop.list_detail({ id: item.id }, function (res) {
					$scope.data = res.result;
					$scope.data.hostname = item.hostname;
				}).$promise.finally(function () {
					$scope.loading = false;
				});
				$scope.close = function () {
					$modalInstance.close();
				};
			}]
		});
	};
}]).controller("vdiDesktopSceneListController", ["$scope", "$modal", "Scene", "$filter", "TeachTemplate", "SchoolRoom", "$$$I18N", "UserRole", "$interval", "$q", "Server", function ($scope, $modal, scene, $filter, template, SchoolRoom, $$$I18N, UserRole, $interval, $q, Server) {
	$interval(function () {
		$scope.rows && $scope.$root && $scope.$root.$broadcast("modeIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("modesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (item.status == 'updating' || item.status == 'making') {
				item._ignore = true;
			} else {
				item._ignore = false;
			}
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	var user = UserRole.currentUser;
	if (user === null) {
		return;
	}
	$scope.loading = true;
	$scope.searchText = "";
	$scope.selectLoading = true;
	$scope.rows = [];
	$scope.allRows = [];
	$scope.refresh = getList;
	$scope.classrooms = [];

	var _controllerScope = $scope;
	var _loginPool = user.pool;
	var _loginClassroom = $$$storage.getSessionStorage('classroom');

	getList();

	function getList() {
		$q.all([UserRole.refreshSession(), SchoolRoom.query().$promise, scene.query().$promise]).then(function (arr) {
			var userId = user.id;
			var session = arr[0];
			// filter by user
			var schoolrooms = arr[1].pools_.filter(function (item) {
				return item.user_ids.some(function (id) {
					return id === userId;
				});
			});
			var ownedIds = session.user.pool;
			// filter by schoolroom id
			schoolrooms = schoolrooms.filter(function (item) {
				return ownedIds.indexOf(item.id) > -1;
			});
			var cachedPoolId = $$$storage.getSessionStorage('scene_page_classroom') * 1 || null;
			if (cachedPoolId && ownedIds.indexOf(cachedPoolId) > -1 && !_controllerScope.select) {
				_controllerScope.select = cachedPoolId;
			}
			_controllerScope.classrooms = schoolrooms;
			// 处理场景数据
			var sceneData = arr[2];
			// 2017-08-18: 根据时间降序
			sceneData.modes.sort(function (a, b) {
				return a.created_at > b.created_at ? -1 : 1;
			});
			sceneData.modes.forEach(function (item) {
				if (item.status == 'updating' || item.status == 'making') {
					item._ignore = true;
				} else {
					item._ignore = false;
				}
			});
			_controllerScope.allRows = sceneData.modes;
			// 过滤当前教室对应场景
			_controllerScope.updateData("", _controllerScope.select);
		}).finally(function () {
			_controllerScope.selectLoading = false;
			_controllerScope.loading = false;
		});
	}
	$scope.refresh = getList;

	function getRealTimeRows() {
		var filterPages = $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize);
		var filterPagesAndSeatches = $filter("filter")(filterPages, $scope.searchText);
		return filterPagesAndSeatches;
	}
	$scope.getTotalCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.instances_count;
		}, 0);
	};

	$scope.getRunningCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.running_count;
		}, 0);
	};

	$scope.getShutdownCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.shutdown_count;
		}, 0);
	};
	$scope.getPausedCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.paused_count;
		}, 0);
	};
	$scope.getNostateCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.nostate_count;
		}, 0);
	};
	$scope.getErrorCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.error_count;
		}, 0);
	};
	$scope.getOtherCount = function (rows) {
		return getRealTimeRows().reduce(function (count, item) {
			return count + item.other_count;
		}, 0);
	};

	$scope.cacheValue = function (v) {
		$$$storage.setSessionStorage('scene_page_classroom', v);
	};

	$scope.updateData = function (text, pid) {
		if (pid) {
			$scope.rows = $scope.allRows.filter(function (row) {
				return row.pool === pid;
			});
		} else {
			var _rows = [];
			$scope.allRows.forEach(function (item) {
				var isInClassrooms = _controllerScope.classrooms.filter(function (room) {
					return room.id === item.pool;
				}).length;
				if (isInClassrooms) {
					_rows.push(item);
				}
			});
			$scope.rows = _rows;
		}
	};

	$scope.pagesize = parseInt($$$storage.getSessionStorage('scene_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize", function (newvalue) {
		newvalue && $$$storage.setSessionStorage('scene_pagesize', newvalue);
	});

	$scope.openAddDomainDialog = function (item) {
		var modal = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/add_server.html",
			controller: "sceneAddServerDialog",
			resolve: { param: function param() {
					return angular.copy(item);
				} }
		});
		modal.result.then(function (res) {
			getList();
		});
	};
	$scope.sceneExitServerDialog = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='退域'>" + "退域</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='DOMAIN_EXIT_TIP2'>该场景下的所有桌面在下一次开机时，将自动执行退域的操作，是否确定？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					Server.domain_set_scene({
						id: item.id,
						has_domain: false
					}, function () {
						_controllerScope.refresh();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	$scope.start = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.shutdown_count <= row.instances_count && row.status !== "making" && row.status !== "updating" && row.status !== "setting-recoverable" && row.status !== 'recovering';
		});
		var flag = rows.some(function (it) {
			return it.shutdown_count > 0;
		});
		if (rows.length && !flag) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout: 6000
			});
			return;
		}
		scene.powerOn({ ids: rows.map(function (row) {
				return row.id;
			}), action: "power-on" }, function () {
			// rows.forEach(function(row){
			// row.running_count = row.instances_count;
			// row._selected = false;
			// });
		});
	};
	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.running_count > 0 && row.status !== "updating" && row.status !== "setting-recoverable";
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout: 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定强制关闭场景吗'>确定强制关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					scene.forcePowerOff({ ids: rows.map(function (row) {
							return row.id;
						}),
						action: "force-power-off" }, function () {
						rows.forEach(function (row) {
							row.running_count = 0;
							// row._selected = false;
						});
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.running_count > 0 && row.status !== "updating" && row.status !== "setting-recoverable";
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout: 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭场景吗'>确定自然关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					scene.powerOff({ ids: rows.map(function (row) {
							return row.id;
						}), action: "power-off" }, function () {
						rows.forEach(function (row) {
							row.running_count = 0;
							// row._selected = false;
						});
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.active = function (id, event) {
		var _this = this;

		if (_this.item.active) {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='取消场景激活'>" + "取消场景激活</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='SCENE_CANCEL_COMFIRM'>取消激活该场景会同时关闭该场景内的所有桌面，是否确定?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						_this.item.active_loadding = true;
						scene.active({ id: id }, function (res) {
							_this.item.active = _this.item.active ? false : true;
						}).$promise.finally(function () {
							_this.item.active_loadding = false;
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		} else {
			_this.item.active_loadding = true;
			scene.active({ id: id }, function (res) {
				_this.item.active = _this.item.active ? false : true;
			}).$promise.finally(function () {
				_this.item.active_loadding = false;
			});
		}
	};
	$scope.sortScene = function () {
		var modal = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/scene_sort.html",
			controller: "sortSceneDialog",
			resolve: { param: function param() {
					return { scenes: angular.copy(_controllerScope.rows), schoolroom: angular.copy(_controllerScope.select) };
				} }
		});
		modal.result.then(function (res) {
			getList();
		});
	};
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && !row.active;
		});
		var has_running = rows.some(function (row) {
			return row.running_count;
		});
		var has_active = $scope.rows.some(function (row) {
			return row._selected && row.active;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopSceneList_TIP1"),
				timeout: 6000
			});
		} else {
			if (has_active) {
				$.bigBox({
					title: $$$I18N.get("INFOR_TIP"),
					content: $$$I18N.get("只有未激活状态下的场景才能被删除"),
					timeout: 6000
				});
			}
			$modal.open({
				template: "<section id='widget-grid'>" + " <div class='modal-content'>" + "  <div class='modal-header'>" + "   <button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>" + "   <h4 class='modal-title' id='mySmallModalLabel' localize='删除场景'></h4>" + "  </div>" + "  <div class='modal-body'>" + "   <form class='form-horizontal'>" + "    <p ng-show='has_run' style='margin-bottom:10px;' localize='存在未关机的桌面,仍然删除场景吗'></p>" + "    <p ng-show='!has_run' style='margin-bottom:10px;' localize='删除场景无法恢复，确定删除场景吗'></p>" + "    <footer class='text-right'>" + "     <button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button>" + "     <button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>" + "    </footer>" + "   </form>" + "  </div>" + " </div>" + "</section>",

				controller: function controller($scope, $modalInstance) {
					$scope.has_active = has_active;
					$scope.has_run = has_running;
					$scope.ok = function () {
						$modalInstance.close();
						scene.delete({ ids: rows.map(function (row) {
								return row.id;
							}), action: "delete" }, function () {
							getList();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.restartScene = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.running_count > 0 && row.status !== "making" && row.status !== "updating" && row.status !== "setting-recoverable" && row.status !== 'recovering';
		});
		if (!rows.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP7"),
				timeout: 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>" + "场景桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启场景下的桌面吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					rows.map(function (row) {
						row._selected = false;
					});
					scene.reboots({ ids: rows.map(function (row) {
							return row.id;
						}) }, function () {
						getList();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("newSceneDialog", ["$scope", "$modalInstance", "Host", "Scene", "SchoolRoom", "Network", "TeachTemplate", "HardwareTemplate", "TeachDesktop", "Server", "$$$I18N", "$$$MSG", "UserRole", "$filter", "ResourcePool", "$modal", "VMCommon", "PersonDesktop", function ($scope, $modalInstance, host, scene, schoolroom, net, teach, hardwares, list, server, $$$I18N, $$$MSG, UserRole, $filter, ResourcePool, $modal, vm, PersonDesktop) {
	var user = UserRole.currentUser;
	if (!user) {
		return;
	}

	$scope.regXP = /WindowsXP|WindowsXP_64/;
	$scope.reg = /windows\s*(7|8|10)/i;
	$scope.regWin = /Windows/;
	// 第一步
	$scope.step1 = {};
	$scope.classrooms = angular.copy($scope.$parent.classrooms);
	$scope.step1.classroom = $scope.classrooms[0];

	server.query(function (data) {
		$scope.domains = data.servers;
	});

	ResourcePool.query(function (res) {
		$scope.resources = res.result.filter(function (item) {
			return item.hosts.length > 0;
		});
		$scope.step1.resource = $scope.resources[0];
		$scope.resource_update();
	});
	$scope.resource_update = function () {
		$scope.get_teach_template();
	};

	$scope.get_teach_template = function () {
		$scope.allImages = [];
		$scope.templateNum = undefined;
		$scope.step1.image = undefined;
		$scope.loading_template = true;
		vm.list_template({ type: 1, virtual_type: $scope.step1.resource.type, rbd_enabled: $scope.step1.resource.rbd_enabled }, function (data) {
			$scope.loading_template = false;
			$scope.winTable = data.win_images.filter(function (item) {
				return item.status == "alive";
			});
			$scope.linTable = data.linux_images.filter(function (item) {
				return item.status == "alive";
			});
			$scope.otherTable = data.other_images.filter(function (item) {
				return item.status == "alive";
			});
			$scope.image = $scope.winTable[0];
			$scope.allImages = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
			$scope.templateNum = $scope.allImages.length;
			$scope.step1.image = $scope.allImages[0];
		});
	};
	// 第二步
	$scope.step2 = {};
	$scope.step2.loading_server = true;
	PersonDesktop.share_servers(function (res) {
		$scope.step2.loading_server = false;
		var servers = [];
		res.servers.forEach(function (server) {
			server.nets.forEach(function (net) {
				servers.push({ id: server.id, net: { ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id } });
			});
		});
		$scope.share_servers = servers;
		$scope.step2.share_server = $scope.share_servers[0];
	});
	$scope.updateHardware = function () {
		var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
		var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
		var is_win = $scope.regWin.test($scope.step1.image.os_type);
		$scope.step2.usb_version = "2.0";
		if (is_win7UP) {
			$scope.step2.usb_redir = true;
			$scope.step2.usb_version = "3.0";
		} else if (is_winXP) {
			$scope.step2.usb_redir = true;
		} else {
			// $scope.step2.usb_redir = false;
		}
		$scope.step2.usb3_disabled = !is_win7UP ? true : false;
		$scope.step2.isWin = is_win;
	};
	// 第三步
	$scope.step3 = {};
	$scope.step3.desktopNum2 = 0;
	$scope.get_host = function () {
		$scope.hosts = undefined;
		$scope.loading_host = true;
		$scope.step3.is_all = undefined;
		$scope.step3.desktopNum = undefined;
		// $scope.bodyForm3.$setPristine();
		if ($scope.step1.resource.type == 'hyper-v') {
			host.query_gpu_agent({
				id: $scope.step1.resource.id,
				network_id: $scope.step1.classroom.network_id,
				enable_gpu: $scope.step2.has_gpu
			}, function (data) {
				$scope.hosts = data.hosts_list.map(function (item) {
					if (item.disabled_tips !== '') {
						item.disabled_desc = $$$I18N.get(item.disabled_tips);
					}
					return item;
				});
			}).$promise.finally(function () {
				$scope.loading_host = false;
			});
		} else {
			host.query_agent({
				id: $scope.step1.resource.id,
				network_id: $scope.step1.classroom.network_id,
				enable_gpu: $scope.step2.gpu_auto_assignment
			}, function (data) {
				$scope.hosts = data.hosts_list.filter(function (h) {
					return h.status === 'active';
				});
			}).$promise.finally(function () {
				$scope.loading_host = false;
			});
		}
	};
	var host_storages = {};
	$scope.openMoreDialog = function () {
		var _hostids = $scope.hosts.filter(function (h) {
			return h._selected;
		}).map(function (h) {
			return h.storage_uuid;
		});
		var moreDialog = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/host_config.html",
			controller: "hostConfigDialog",
			resolve: { param: function param() {
					return {
						"phostids": angular.copy(_hostids),
						"pstore": host_storages
					};
				} }
		});
	};
	// 第四步
	$scope.step4 = {};
	$scope.selectAllHost = function (bool) {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		_hosts.map(function (item) {
			item._selected = bool;
			return item;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.selectOneHost = function () {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		$scope.step3.is_all = _hosts.every(function (item) {
			return item._selected === true;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.getDesktopNumber2 = function () {
		var _lis = angular.copy($scope.hosts.filter(function (item) {
			return item.instance_num > 0;
		}));
		if (_lis.length > 0) {
			$scope.step3.desktopNum2 = _lis.reduce(function (a, b) {
				a.instance_num += b.instance_num;
				return a;
			}).instance_num;
		} else {
			$scope.step3.desktopNum2 = 0;
		}
	};

	$scope.clearRDP = function (scope) {
		scope.RDP = false;
		$scope.userNameType = 1;
		$scope.userNamePre = "K";
		$scope.userNameBegin = 1;
	};
	$scope.clearDomain = function (scope) {
		if (scope.has_domain) {
			scope.domain = $scope.domains[0];
		} else {
			scope.domain = null;
		}
	};
	$scope.addZero = function (len, str_begin, str_end) {
		if (str_end && str_begin) {
			var end_len = str_end.toString().length;
			if (end_len < len) {
				return str_begin + new Array(len - end_len + 1).join("0") + str_end;
			} else {
				return str_begin + str_end;
			}
		}
	};
	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.$on("WizardStep_0", function (e, step, scope) {
		setTimeout(function () {
			$("[rel=popover-hover]").popover({
				trigger: "hover"
			});
		});
		var sameSceneName = $scope.rows.filter(function (item) {
			return item.name == $scope.step1.sceneName;
		}).length;
		scope.error = step.is_dirty;
		step.done = scope.bodyForm1.$valid && !sameSceneName;
		if (sameSceneName) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("SAME_SCENE_NAME"),
				timeout: 6000
			});
		}
		if (step.done && !sameSceneName) {
			hardwares.filter({
				"system_gb": $scope.step1.image.system_alloc_disk,
				"local_gb": $scope.step1.image.data_alloc_disk,
				"local_gb1": $scope.step1.image.data_alloc_disk_2
			}, function (data) {
				$scope.hardwareList = data.result.map(function (data) {
					data.memory_mb = data.memory_mb / 1024;
					return data;
				});
				$scope.step2.hardware = $scope.hardwareList[0];
				$scope.updateHardware();
			});
		}
	});
	$scope.$on("WizardStep_1", function (e, step, scope) {
		$scope.get_host();
		scope.error = step.is_dirty;
		step.done = scope.bodyForm2.$valid;
	});
	$scope.$on("WizardStep_2", function (e, step, scope) {
		if ($scope.step1.resource.type == 'hyper-v') {
			$scope.step4.MORE = true;
			$scope.step4.RDP = true;
		} else {
			$scope.step4.MORE = false;
			$scope.step4.RDP = false;
		}
		scope.error = step.is_dirty;
		if ($scope.step3.hostType == 0) {
			step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts, 'max_instance');
		}
		if ($scope.step3.hostType == 1) {
			step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
		}
	});
	$scope.$on("WizardStep_3", function (e, step, scope) {
		scope.error = step.is_dirty;
		step.done = scope.bodyForm4.$valid;
	});
	$scope.$on("WizardDone", function (e, steps, scopes) {
		var regWin10 = /Windows10/;
		var postData = {};
		postData.name = $scope.step1.sceneName;
		postData.image_id = $scope.step1.image.id;
		postData.pool = $scope.step1.classroom.id;
		postData.resource_pool_uuid = $scope.step1.resource.uuid;
		if ($scope.step1.domain) {
			postData.domain = $scope.step1.domain.id;
		}
		if ($scope.step1.resource.type === "hyper-v") postData.enable_gpu = $scope.step2.has_gpu;
		if ($scope.step1.resource.type === "kvm") {
			postData.gpu_auto_assignment = $scope.step2.gpu_auto_assignment;
			if (regWin10.test($scope.step1.image.os_type)) {
				postData.firmware_type = 'uefi';
			}
		}
		postData.instance_type = $scope.step2.hardware.id;
		postData.usb_redir = $scope.step2.usb_redir;
		postData.usb_version = $scope.step2.usb_redir && $scope.step1.resource.type == 'kvm' ? $scope.step2.usb_version : null;
		postData.rollback = Number($scope.step2.rollback);
		postData.data_rollback = $scope.step2.hardware.local_gb > 1 ? Number($scope.step2.data_rollback) : undefined;
		if (postData.rollback === 2) {
			postData.rollback_weekday = $scope.step2.rollback_weekday;
		}
		if (postData.rollback === 3) {
			postData.rollback_monthday = $scope.step2.rollback_monthday;
		}
		if (postData.data_rollback === 2) {
			postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;
		}
		if (postData.data_rollback === 3) {
			postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;
		}

		if ($scope.step3.hostType == 0) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item._selected;
			}).map(function (item) {
				return { "uuid": item.id };
			});
			postData.instance_max = $scope.step3.desktopNum;
		}
		if ($scope.step3.hostType == 1) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item.instance_num > 0;
			}).map(function (item) {
				return { "uuid": item.id, "vm_count": item.instance_num };
			});
			postData.instance_max = $scope.step3.desktopNum2;
		}
		postData.servers_storage = Object.keys(host_storages).map(function (key) {
			var host = host_storages[key];
			return {
				uuid: host.id,
				image_storage_capacity: host.image_storage_capacity,
				image_storage_performance: host.image_storage_performance,
				storage_capacity: host.storage_capacity,
				storage_performance: host.storage_performance
			};
		});
		postData.hostname_type = Number($scope.step4.hostNameType);
		postData.hostname_prefix = $scope.step4.hostNamePre;
		postData.hostname_beginwith = $scope.step4.hostNameBegin;
		if ($scope.step1.resource.type === "kvm") {
			postData.is_exam = $scope.step4.RDP;
			if ($scope.step4.MORE) {
				postData.username_type = $scope.step4.userNameType;
				postData.username_prefix = $scope.step4.userNamePre;
				postData.username_beginwith = $scope.step4.userNameBegin;
			}
		}
		if ($scope.step1.resource.type === "hyper-v") {
			postData.is_exam = true;
		}
		postData.enable_share = $scope.step2.enable_share;
		if ($scope.step2.enable_share) {
			postData.share_server_ip = $scope.step2.share_server.net.ip_address;
			postData.share_server_id = $scope.step2.share_server.id;
		}
		postData.expand_enabled = $scope.step2.expand_enabled;
		$scope.submitting = true;
		scene.save(postData, function (res) {
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function () {
			$scope.submitting = false;
		});
	});
}]).controller("alterSceneDialog", ["$scope", "$modalInstance", "SchoolRoom", "Scene", "Host", "Server", "PersonDesktop", function ($scope, $modalInstance, schoolroom, scene, host, server, personDesktop) {
	$scope.need_ha = false;
	var selectedServer, raw_need_ha;
	$scope.rollbackChange = function (value) {
		if (value != "1") {
			$scope.need_ha = false;
		} else {
			if (selectedServer && selectedServer.length > 0) {
				$scope.need_ha = angular.copy(raw_need_ha);
				$scope.servers = selectedServer;
			}
		}
	};
	$scope.name = $scope.currentItem.name;
	$scope.desktopNum = $scope.currentItem.instance_max;
	$scope.min_instances = $scope.currentItem.instance_max;
	$scope.rollback = $scope.currentItem.rollback;
	$scope.rollback_monthday = $scope.currentItem.rollback_monthday ? $scope.currentItem.rollback_monthday : "1";
	$scope.rollback_weekday = $scope.currentItem.rollback_weekday ? $scope.currentItem.rollback_weekday : "1";

	$scope.disk_type = $scope.currentItem.disk_type;
	$scope.local_gb = $scope.currentItem.local_gb;
	$scope.data_rollback = $scope.currentItem.data_rollback;
	$scope.data_rollback_monthday = $scope.currentItem.data_rollback_monthday || "1";
	$scope.data_rollback_weekday = $scope.currentItem.data_rollback_weekday || "1";

	$scope.usb_redir = $scope.currentItem.usb_redir;
	$scope.usb3_disabled = !$scope.currentItem.usb3_editable;
	$scope.usb_version = $scope.currentItem.usb_version || "2.0";

	$scope.running_count = $scope.currentItem.running_count;
	$scope.has_domain = $scope.currentItem.has_domain || false;
	$scope.domain = $scope.currentItem.domain;
	$scope.need_ha = false;
	// $scope.enable_gpu = $scope.currentItem.enable_gpu;
	$scope.enable_share = $scope.currentItem.enable_share;
	$scope.share_server_ip = $scope.currentItem.share_server_ip;
	$scope.loading_server = true;
	personDesktop.share_servers(function (res) {
		$scope.loading_server = false;
		var servers = [];
		res.servers.forEach(function (server) {
			server.nets.forEach(function (net) {
				servers.push({ id: server.id, net: { ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id } });
			});
		});
		$scope.share_servers = servers;
		if ($scope.enable_share) {
			$scope.share_server = $scope.share_servers.filter(function (item) {
				return item.net.ip_address == $scope.share_server_ip;
			})[0];
		} else {
			$scope.share_server = $scope.share_servers[0];
		}
	});
	$scope.is_windows = $scope.currentItem.is_windows;
	$scope.expand_enabled = $scope.currentItem.expand_enabled;
	$scope.ok = function () {
		var _rollback = parseInt(this.rollback);
		var _data_rollback = parseInt(this.data_rollback) >= 0 ? Number(this.data_rollback) : undefined;
		var item = {};
		item.id = $scope.currentItem.id;
		item.pool = $scope.currentItem.pool;
		item.name = this.name;
		item.instance_max = $scope.currentItem.instance_max;
		item.rollback = _rollback;
		item.rollback_monthday = _rollback == 3 ? this.rollback_monthday : undefined;
		item.rollback_weekday = _rollback == 2 ? this.rollback_weekday : undefined;
		item.data_rollback = _data_rollback;
		item.data_rollback_monthday = _data_rollback === 3 ? this.data_rollback_monthday : undefined;
		item.data_rollback_weekday = _data_rollback === 2 ? this.data_rollback_weekday : undefined;
		item.usb_redir = this.usb_redir;
		item.usb_version = item.usb_redir && $scope.currentItem.virtual_type == 'kvm' ? this.usb_version : null;
		item.has_domain = this.has_domain;
		// if($scope.currentItem.virtual_type === 'hyper-v')
		// 	item.enable_gpu			   = this.enable_gpu;
		item.domain = this.domain;
		item.need_ha = item.rollback == 1 && this.need_ha;
		item.enable_share = this.enable_share;
		item.share_server_ip = this.enable_share ? this.share_server.net.ip_address : undefined;
		item.share_server_id = this.enable_share ? this.share_server.id : undefined;
		item.expand_enabled = this.expand_enabled;
		if (item.rollback == 1 && item.need_ha) {
			item.server_ids = $scope.servers.filter(function (value) {
				return value._selected;
			}).map(function (value) {
				return value.id;
			});
			if (item.server_ids < 1) {
				return false;
			}
			item.server_ids = item.server_ids.join(',');
		}
		$scope.loading = true;
		scene.update(item, function () {
			$modalInstance.close();
			$scope.refresh();
		}, function () {
			$scope.refresh();
		}).$promise.finally(function (res) {
			$scope.loading = false;
		});
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller('sortSceneDialog', ['$scope', 'param', '$modalInstance', 'Scene', function ($scope, param, $modalInstance, Scene) {

	$scope.schoolroom = param.schoolroom;
	$scope.scenes = param.scenes;
	$scope.auto_scene = $scope.scenes.filter(function (s) {
		return s.is_auto;
	})[0];
	// $scope.is_auto_enter = $scope.auto_scene ? true: false;
	function move(num) {
		var cur = $scope.scenes.filter(function (item) {
			return item._actived;
		})[0];
		var cur_idx = $scope.scenes.indexOf(cur);
		var pre_idx = null;
		if (cur_idx + num < 0) {
			pre_idx = $scope.scenes.length - 1;
		} else if (cur_idx + num > $scope.scenes.length - 1) {
			pre_idx = 0;
		} else {
			pre_idx = cur_idx + num;
		}
		var t = $scope.scenes.splice(cur_idx, 1)[0];
		$scope.scenes.splice(pre_idx, 0, t);
	};
	$scope.up = function () {
		move(-1);
	};
	$scope.down = function () {
		move(1);
	};

	$scope.select = function (item) {
		$scope.scenes.map(function (i) {
			if (i.id === item.id) {
				i._actived = true;
				return i;
			}
			i._actived = false;
			return i;
		});
	};
	$scope.ok = function () {
		var _this = this;
		var postData = $scope.scenes.map(function (s, idx) {
			var _item = {
				order: idx + 1,
				name: s.name,
				id: s.id,
				is_auto: Boolean(_this.auto_scene && _this.auto_scene.id === s.id)
			};
			return _item;
		});
		Scene.sort({ order_data: postData }, function () {
			$modalInstance.close();
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller("newPersonDialog", ["$scope", "$modalInstance", "Host", "Network", "HardwareTemplate", "PersonTemplate", "User", "Admin", "Domain", "PersonDesktop", "Server", "$$$I18N", "$$$MSG", "ResourcePool", "$filter", "$modal", "VMCommon", "checkIP", function ($scope, $modalInstance, host, networks, hardwares, images, user, admin, domain, Person, server, $$$I18N, $$$MSG, ResourcePool, $filter, $modal, vm, checkIP) {
	$scope.desktopNum = 1;
	$scope.max_instance = 0;
	$scope.host_loading = true;
	$scope.regXP = /WindowsXP|WindowsXP_64/;
	$scope.reg = /(windows\s*7|8|10)/i;
	$scope.regWin = /Windows/;
	// 第一步
	$scope.step1 = {};
	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	$scope.get_subnet = function (network) {
		if (network.subnets.length) {
			networks.query_sub({
				id: network.id
			}, function (res) {
				$scope.subnetworks = res.result.map(function (n) {
					n._desc = n.start_ip ? n.name + " (" + n.start_ip + " - " + n.end_ip + ") " : n.name;
					return n;
				});
				$scope.step1.subnetwork = $scope.subnetworks[0];
				$scope.clearBindIp();
			});
		} else {
			$scope.subnetworks = [];
			$scope.step1.subnetwork = null;
			$scope.clearBindIp();
		}
	};
	networks.query(function (data) {
		// $scope.networks = data.networks.filter(function(n){ return n.subnets.length > 0});
		$scope.networks = data.networks;
		if ($scope.networks.length) {
			$scope.step1.network = $scope.networks[0];
			$scope.get_subnet($scope.step1.network);
		}
	});
	ResourcePool.query(function (res) {
		$scope.resources = res.result.filter(function (item) {
			return item.hosts.length > 0;
		});
		$scope.step1.resource = $scope.resources[0];
		$scope.resource_update();
	});
	$scope.resource_update = function () {
		$scope.get_personal_template();
	};
	$scope.get_personal_template = function () {
		$scope.templates = [];
		$scope.templateNum = undefined;
		$scope.step1.image = undefined;
		$scope.loading_template = true;
		vm.list_template({ type: 2, virtual_type: $scope.step1.resource.type, rbd_enabled: $scope.step1.resource.rbd_enabled }, function (data) {
			$scope.loading_template = false;
			$scope.winTable = data.win_images.filter(function (item) {
				return item.status === "alive";
			});

			$scope.linTable = data.linux_images.filter(function (item) {
				return item.status === "alive";
			});
			$scope.otherTable = data.other_images.filter(function (item) {
				return item.status === "alive";
			});
			$scope.templates = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
			$scope.templateNum = $scope.templates.length;
			$scope.step1.image = $scope.templates[0];
		});
	};
	$scope.clearBindIp = function () {
		if ($scope.step1.subnetwork) {
			$scope.IPmodes = $scope.IPmodes2;
		} else {
			$scope.IPmodes = $scope.IPmodes1;
		}
		$scope.step1.IPmode = $scope.IPmodes[0];
		$scope.step1.ip = null;
	};
	// 第二步
	$scope.step2 = {};
	$scope.step2.loading_server = true;
	Person.share_servers(function (res) {
		$scope.step2.loading_server = false;
		var servers = [];
		res.servers.forEach(function (server) {
			server.nets.forEach(function (net) {
				servers.push({ id: server.id, net: { ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id } });
			});
		});
		$scope.share_servers = servers;
		$scope.step2.share_server = $scope.share_servers[0];
	});
	$scope.updateHardware = function () {
		var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
		var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
		var is_win = $scope.regWin.test($scope.step1.image.os_type);
		$scope.step2.usb_version = "2.0";
		if (is_win7UP) {
			$scope.step2.usb_redir = true;
			$scope.step2.usb_version = "3.0";
		} else if (is_winXP) {
			$scope.step2.usb_redir = true;
		} else {
			// $scope.step2.usb_redir = false;
		}
		$scope.step2.usb3_disabled = !is_win7UP ? true : false;
		$scope.step2.isWin = is_win;
	};
	// 第三步
	$scope.step3 = {};
	$scope.step3.desktopNum2 = 0;
	$scope.get_host = function () {
		var uuid = $scope.step1.resource.uuid;
		var netid = $scope.step1.network.id;
		var is_gpu = $scope.step2.has_gpu;
		$scope.host_loadding = true;
		$scope.step3.is_all = undefined;
		$scope.hosts = undefined;
		if ($scope.step1.resource.type == 'hyper-v') {
			host.query_gpu_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: is_gpu
			}, function (data) {
				$scope.host_loadding = false;
				$scope.hosts = data.hosts_list.map(function (item) {
					if (item.disabled_tips !== '') {
						item.disabled_desc = $$$I18N.get(item.disabled_tips);
					}
					return item;
				});
			});
		} else {
			host.query_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: $scope.step2.gpu_auto_assignment
			}, function (res) {
				$scope.host_loadding = false;
				$scope.hosts = res.hosts_list.filter(function (h) {
					return h.status === 'active';
				});
			});
		}
	};

	var host_storages = {};
	$scope.openMoreDialog = function () {
		var _hostids;
		if ($scope.step3.hostType == '0') {
			_hostids = $scope.hosts.filter(function (h) {
				return h._selected;
			}).map(function (h) {
				return h.storage_uuid;
			});
		} else {
			_hostids = $scope.hosts.filter(function (h) {
				return h.instance_num;
			}).map(function (h) {
				return h.storage_uuid;
			});
		}
		var moreDialog = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/host_config.html",
			controller: "hostConfigDialog",
			resolve: { param: function param() {
					return {
						"phostids": angular.copy(_hostids),
						"pstore": host_storages
					};
				} }
		});
		moreDialog.result.then(function () {});
	};

	$scope.selectAllHost = function (bool) {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		_hosts.map(function (item) {
			item._selected = bool;
			return item;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.selectOneHost = function () {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		$scope.step3.is_all = _hosts.every(function (item) {
			return item._selected === true;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.getDesktopNumber2 = function () {
		var _lis = angular.copy($scope.hosts.filter(function (item) {
			return item.instance_num > 0;
		}));
		if (_lis.length > 0) {
			$scope.step3.desktopNum2 = _lis.reduce(function (a, b) {
				a.instance_num += b.instance_num;
				return a;
			}).instance_num;
		} else {
			$scope.step3.desktopNum2 = 0;
		}
	};

	$scope.step4 = {};
	$scope.$on("selectStepChange", function (e, arg) {
		if (arg.index == 0) {
			arg.stepScope.$$nextSibling.error = false;
		}
	});
	$scope.$on("WizardStep_0", function (e, step, scope) {
		setTimeout(function () {
			$("[rel=popover-hover]").popover({
				trigger: "hover"
			});
		});
		scope.error = step.is_dirty;
		function toStrLong(ip) {
			var ips;
			ips = ip.split(".").map(function (item, idx) {
				var _prefix = '';
				for (var i = 0; i < 8 - Number(item).toString(2).length; i++) {
					_prefix += "0";
				}
				return _prefix + Number(item).toString(2);
			});
			return ips.join("");
		}
		function check_net() {
			// 返回值为true时，invalid
			if ($scope.step1.subnetwork && $scope.step1.subnetwork.netmask && $scope.step1.subnetwork.enable_dhcp && $scope.step1.ip) {
				var _startIP = toStrLong($scope.step1.subnetwork.start_ip);
				var _endIP = toStrLong($scope.step1.subnetwork.end_ip);
				var _bindStartIP = toStrLong($scope.step1.ip);
				return _bindStartIP < _startIP || _bindStartIP > _endIP;
			}
			return false;
		}

		if (check_net()) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$MSG.get(12061),
				timeout: 5000
			});
		}
		var sameDesktopName = $scope.rows.filter(function (item) {
			return item.display_name == $scope.step1.desktopName;
		}).length;
		var is_valid = scope.bodyForm1.$valid && !check_net();
		step.done = is_valid && !sameDesktopName;
		if (sameDesktopName) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("SAME_PERSONAL_NAME"),
				timeout: 6000
			});
		}
		if (step.done && !sameDesktopName) {
			hardwares.filter({
				"system_gb": $scope.step1.image.system_alloc_disk,
				"local_gb": $scope.step1.image.data_alloc_disk,
				"local_gb1": $scope.step1.image.data_alloc_disk_2
			}, function (data) {
				$scope.hardwareList = data.result.map(function (data) {
					data.memory_mb = data.memory_mb / 1024;
					return data;
				});
				$scope.step2.hardware = $scope.hardwareList[0];
				$scope.step2.hardware && $scope.updateHardware();
			});
		}
		//个人桌面创建不需要check_ip,后台会检测作出处理
		// if(step.done && scope.step1.ip){
		// 	step.showLoading = true;
		// 	step.done = false;
		// 	console.log('step23')
		// 	checkIP.check({ip: scope.step1.ip, subnet_id: scope.step1.subnetwork.id},function(res){
		// 		if(!res.result){
		// 			$.bigBox({
		// 				title	: $$$I18N.get("INFOR_TIP"),
		// 				content	: $$$I18N.get("USEDIP"),
		// 				timeout	: 6000
		// 			});
		// 		}else{
		// 			$scope.$broadcast("currentStepChange", 1);
		// 		}
		// 		step.showLoading = false;
		// 	},function(error){ step.showLoading = false; });
		// }
	});
	$scope.$on("WizardStep_1", function (e, step, scope) {
		scope.error = step.is_dirty;
		var is_valid = scope.bodyForm2.$valid;
		if (is_valid) {
			$scope.step3.desktopNum = undefined;
			$scope.step3.desktopNum2 = 0;
			$scope.get_host();
		}
		step.done = is_valid;
	});
	$scope.$on("WizardStep_2", function (e, step, scope) {
		scope.error = step.is_dirty;
		// number类型的input ，max属性是变量，不生效，手动判断
		if ($scope.step3.hostType == 0) {
			step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts, 'max_instance');
		}
		if ($scope.step3.hostType == 1) {
			step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
		}
	});
	$scope.$on("WizardStep_3", function (e, step, scope) {
		scope.error = step.is_dirty;
		step.done = $scope.step4.select_users.length ? true : false;
	});
	$scope.$on("WizardDone", function (e, steps, scopes) {
		var postData = {};
		var regWin10 = /Windows10/;
		postData.display_name = $scope.step1.desktopName;
		postData.network_id = $scope.step1.network.id;
		postData.resource_pool = $scope.step1.resource.uuid;

		if ($scope.step1.subnetwork) {
			postData.subnet_id = $scope.step1.subnetwork.id;
		} else {
			postData.subnet_id = '';
		}
		postData.ip_choose = Number($scope.step1.IPmode.value) ? true : false;
		if (postData.ip_choose && Number($scope.step1.IPmode.value) === 2) {
			postData.start_ip = $scope.step1.ip;
		}
		// if($scope.step1.domain){
		// postData.ad_server_id = $scope.step1.domain.id;}
		postData.image_id = $scope.step1.image.id;

		postData.rollback = Number($scope.step2.rollback);
		postData.data_rollback = $scope.step2.hardware.local_gb > 1 ? Number($scope.step2.data_rollback) : undefined;
		if (postData.rollback === 2) {
			postData.rollback_weekday = $scope.step2.rollback_weekday;
		}
		if (postData.rollback === 3) {
			postData.rollback_monthday = $scope.step2.rollback_monthday;
		}
		if (postData.data_rollback === 2) {
			postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;
		}
		if (postData.data_rollback === 3) {
			postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;
		}

		postData.instance_type_id = $scope.step2.hardware.id;
		postData.usb_redir = $scope.step2.usb_redir;
		postData.usb_version = $scope.step2.usb_redir && $scope.step1.resource.type == 'kvm' ? $scope.step2.usb_version : null;
		if ($scope.step1.resource.type === "hyper-v") postData.enable_gpu = $scope.step2.has_gpu;
		if ($scope.step1.resource.type === "kvm") {
			postData.gpu_auto_assignment = $scope.step2.gpu_auto_assignment;
			if (regWin10.test($scope.step1.image.os_type)) {
				postData.firmware_type = 'uefi';
			}
		}

		if ($scope.step3.hostType == 0) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item._selected;
			}).map(function (item) {
				return { "uuid": item.id };
			});
			postData.count = $scope.step3.desktopNum;
		}
		if ($scope.step3.hostType == 1) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item.instance_num > 0;
			}).map(function (item) {
				return { "uuid": item.id, "vm_count": item.instance_num };
			});
			postData.count = $scope.step3.desktopNum2;
		}
		postData.servers_storage = Object.keys(host_storages).map(function (key) {
			var host = host_storages[key];
			return {
				uuid: host.id,
				image_storage_capacity: host.image_storage_capacity,
				image_storage_performance: host.image_storage_performance,
				storage_capacity: host.storage_capacity,
				storage_performance: host.storage_performance
			};
		});
		postData.user_id = $scope.step4.select_users.map(function (item) {
			return item.id ? item.id : item.user_id;
		});
		postData.rule_id = $scope.step4.rule;

		postData.enable_share = $scope.step2.enable_share;
		if ($scope.step2.enable_share) {
			postData.share_server_ip = $scope.step2.share_server.net.ip_address;
			postData.share_server_id = $scope.step2.share_server.id;
		}
		postData.expand_enabled = $scope.step2.expand_enabled;
		$scope.submitting = true;
		Person.save(postData, function (res) {
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function () {
			$scope.submitting = false;
		});
	});
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("alterPersonalDialog", ["$scope", "$modalInstance", "Network", "HardwareTemplate", "User", "Admin", "PersonDesktop", "Domain", "$q", "$$$I18N", function ($scope, $modalInstance, net, hardwrare, user, admin, personDesktop, domain, $q, $$$I18N) {
	$scope.IPs = [];
	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	$scope.datas = angular.copy($scope.currentItem);
	if ($scope.datas.ips) {
		$scope.IPmodes = $scope.IPmodes2;
		$scope.datas.IPmode = $scope.IPmodes[1];
	} else {
		$scope.IPmodes = $scope.IPmodes1;
		$scope.datas.IPmode = $scope.IPmodes[0];
	}
	$scope.datas.usb_version = $scope.datas.usb_redir ? $scope.datas.usb_version : '2.0';
	$scope.datas.memory_mb = $scope.datas.memory_mb / 1024;
	$scope.btndisks = [];
	personDesktop.list_detail({ id: $scope.datas.id }, function (res) {
		$scope.detailData = res.result;
		["data_rollback_weekday", "data_rollback_monthday", "rollback_weekday", "rollback_monthday"].forEach(function (key) {
			$scope.detailData[key] = $scope.detailData[key] || 1;
		});
		$scope.get_net(true);
		$scope.loading_server = true;
		personDesktop.share_servers(function (res) {
			$scope.loading_server = false;
			var servers = [];
			res.servers.forEach(function (server) {
				server.nets.forEach(function (net) {
					servers.push({ id: server.id, net: { ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id } });
				});
			});
			$scope.share_servers = servers;
			if ($scope.detailData.share_server_ip) {
				$scope.detailData.share_server = $scope.share_servers.filter(function (item) {
					return item.net.ip_address == $scope.detailData.share_server_ip;
				})[0];
			} else {
				$scope.detailData.share_server = $scope.share_servers[0];
			}
		});
	});

	$scope.get_net = function (flag) {
		$scope.loading = true;
		net.query(function (res) {
			// 过滤无子网网络
			$scope.loading = false;
			// $scope.networks = res.networks.filter(function(net){ return net.subnets.length > 0});
			$scope.networks = res.networks;
			$scope.datas._network = $scope.networks.filter(function (item) {
				return item.id === $scope.detailData.network.id;
			})[0];
			$scope.get_sub_net($scope.datas._network, flag);
		});
	};

	$scope.get_sub_net = function (network, flag) {
		if (network.subnets.length) {
			$scope.loading = true;
			net.query_sub({ id: network.id }, function (res) {
				$scope.loading = false;
				$scope.subnetworks = res.result;
				if (flag) {
					$scope.datas._subnetwork = $scope.subnetworks.filter(function (item) {
						return item.id === $scope.detailData.subnet_id;
					})[0];
				} else {
					$scope.datas._subnetwork = $scope.subnetworks[0];
				}
				$scope.clearBindIp();
			});
		} else {
			$scope.subnetworks = [];
			$scope.datas._subnetwork = null;
			$scope.clearBindIp();
		}
	};
	var first = true;
	$scope.clearBindIp = function () {
		if (first) {
			first = false;
		} else {
			if ($scope.datas._subnetwork) {
				$scope.IPmodes = $scope.IPmodes2;
			} else {
				$scope.IPmodes = $scope.IPmodes1;
			}
			$scope.datas.IPmode = $scope.IPmodes[0];
			$scope.datas.ips = null;
		}
	};
	$scope.get_disks = function () {
		$scope.loading_disk = true;
		personDesktop.list_passive_disk({
			user_id: $scope.datas._user.id,
			instance_id: $scope.datas.instance_id
		}, function (res) {
			$scope.loading_disk = false;
			$scope.disks = res.result;
		});
	};
	$scope.$watch("datas._user", function (newval) {
		if (newval) {
			$scope.get_disks();
		}
	});
	$scope.expandedNodes = [];
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
			for (i = 0; i < oldlen; i++) {
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
	$scope.$on('selectCommonUser', function (e, user) {
		$scope.datas._is_open = false;
		$scope.datas._user = user;
	});
	$q.all([admin.query().$promise, user.query_tree().$promise, domain.list().$promise]).then(function (arr) {
		$scope.admin_users = arr[0].users;
		$scope.common_users = arr[1].result;
		$scope.common_users = formatData(removeNoChildrenDeparts($scope.common_users), "children");
		$scope.domain_users = arr[2].result;
		var commonUser = [];
		$scope.expandedNodes.forEach(function (node) {
			node.children.forEach(function (user) {
				if (user.user_id && !user.dept_id) {
					user.id = user.user_id;
					commonUser.push(user);
				}
			});
		});
		var dus = $scope.domain_users.reduce(function (arr, b) {
			b.groups.forEach(function (g) {
				[].push.apply(arr, g.users);
			});
			return arr;
		}, []);
		var all_users = $scope.admin_users.concat(commonUser).concat(dus);
		$scope.datas._user = all_users.filter(function (user) {
			return user.id == $scope.datas.user_id;
		})[0];
	});
	$scope.name = function (net) {
		var is_dhcp = net.enable_dhcp;
		if (is_dhcp) {
			return net.name + " ( " + net.start_ip + " - " + net.end_ip + " ) ";
		} else {
			return net.name;
		}
	};
	$scope.user_name = function (user) {
		return user.name + " ( " + user.real_name + " ) ";
	};
	$scope.ok = function () {
		$scope.loading = true;
		var volumes = $scope.disks.filter(function (d) {
			return d._selected;
		});
		var _local_gb = $scope.btndisks.length ? $scope.btndisks[0].local_gb : undefined;
		var is_data_disk = Boolean(_local_gb || $scope.datas.local_gb);
		var postData = {
			id: $scope.datas.id,
			display_name: $scope.datas.display_name,
			user_id: $scope.datas._user.id,
			vcpu: $scope.datas.vcpu,
			memory_mb: $scope.datas.memory_mb * 1024,
			network_id: $scope.datas._network.id,
			subnet_id: $scope.datas._subnetwork ? $scope.datas._subnetwork.id : '',
			local_gb: _local_gb,
			ip: $scope.datas.ips ? $scope.datas.ips : undefined,
			gpu_auto_assignment: $scope.datas.enable_gpu,
			vm_hostname: $scope.datas.vm_hostname,
			rollback: $scope.detailData.rollback,
			rollback_weekday: $scope.detailData.rollback == 2 ? $scope.detailData.rollback_weekday : undefined,
			rollback_monthday: $scope.detailData.rollback == 3 ? $scope.detailData.rollback_monthday : undefined,
			attach_volumes: volumes,
			usb_redir: $scope.datas.usb_redir,
			usb_version: $scope.datas.usb_redir && $scope.datas.virtual_type == 'kvm' ? $scope.datas.usb_version : undefined,
			data_rollback: is_data_disk ? $scope.detailData.data_rollback : undefined,
			enable_share: $scope.detailData.enable_share,
			share_server_ip: $scope.detailData.enable_share ? $scope.detailData.share_server.net.ip_address : undefined,
			share_server_id: $scope.detailData.enable_share ? $scope.detailData.share_server.id : undefined,
			expand_enabled: $scope.datas.expand_enabled
		};
		if (postData.data_rollback == 2) {
			postData.data_rollback_weekday = $scope.detailData.data_rollback_weekday;
		}
		if (postData.data_rollback == 3) {
			postData.data_rollback_monthday = $scope.detailData.data_rollback_monthday;
		}
		personDesktop.update(postData, function (res) {
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function () {
			$scope.loading = false;
		});
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("snapshotPersonalDialog", ["$scope", "$modalInstance", "PersonDesktop", "VMCommon", "$$$I18N", function ($scope, $modalInstance, personDesktop, vm, $$$I18N) {
	$scope.rows = [];
	function get_list() {
		$scope.loading = true;
		vm.list_snapshot({ instance_id: $scope.currentItem.instance_id }, function (res) {
			$scope.rows = res.snapshots.map(function (item, index) {
				item.snapshot_name = item.name;
				item.display_description = item.desc;
				item.editable = false;
				return item;
			}).sort(function (a, b) {
				return new Date(b.create_at).getTime() - new Date(a.create_at).getTime() > 0 ? 1 : -1;
			});
		}).$promise.finally(function () {
			$scope.loading = false;
		});
	}
	get_list();
	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.hasSaveButton = function () {
		return $scope.rows.filter(function (item) {
			return item.editable;
		}).length;
	};
	$scope.hasSubmit = function () {
		return $scope.rows.filter(function (item) {
			return item._submitting;
		}).length;
	};
	$scope.save = function (cur) {
		cur._submitting = true;
		vm.take_snapshot({
			method: "save",
			name: cur.snapshot_name,
			instance_id: $scope.currentItem.instance_id,
			desc: cur.display_description
		}).$promise.then(function () {
			$modalInstance.close();
			get_list();
		}).finally(function () {
			cur._submitting = false;
		});
	};

	$scope.addNew = function () {
		var manuals = $scope.rows.filter(function (item) {
			return item.created_by == 'manual';
		}).length;
		if (manuals == 2) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("只能创建两个手动快照"),
				icon: "fa fa-warning shake animated",
				timeout: 6000
			});
		} else {
			$scope.rows.unshift({ "editable": true });
		}
	};
	$scope.delete = function (cur) {
		cur._submitting = true;
		if (cur.editable) {
			var idx = $scope.rows.indexOf(cur);
			$scope.rows.splice(idx, 1);
		} else {
			vm.delete_snapshot({
				snapshot_name: cur.snapshot_name,
				snapshot_volumes: cur.snapshot_volumes,
				instance_id: $scope.currentItem.instance_id
			}, function (res) {
				var idx = $scope.rows.indexOf(cur);
				$scope.rows.splice(idx, 1);
			}).$promise.finally(function () {
				cur._submitting = false;
			});
		}
	};
	$scope.restore = function (cur) {
		cur._submitting = true;
		vm.restore_snapshot({
			method: "restore",
			snapshot_volumes: cur.snapshot_volumes,
			snapshot_name: cur.snapshot_name,
			instance_id: $scope.currentItem.instance_id
		}, function () {
			$modalInstance.close();
			get_list();
		}).$promise.finally(function () {
			cur._submitting = false;
			get_list();
		});
	};
}]).controller('sceneAddServerDialog', ['$scope', 'Server', '$modalInstance', 'param', function ($scope, Server, $modalInstance, param) {
	Server.query(function (res) {
		$scope.servers = res.servers;
		$scope.server = $scope.servers[0];
	});
	$scope.post = function () {
		var _this = this;
		$scope.submiting = true;
		Server.domain_set_scene({
			id: param.id,
			has_domain: true,
			ad_server_id: _this.server.id,
			recreate_sid: _this.is_sid
		}, function (res) {
			$modalInstance.close();
		}).$promise.finally(function () {
			$scope.submiting = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('personalAddServerDialog', ['$scope', 'Server', '$modalInstance', 'param', function ($scope, Server, $modalInstance, param) {
	Server.query(function (res) {
		$scope.servers = res.servers;
		$scope.server = $scope.servers[0];
	});
	$scope.post = function () {
		var _this = this;
		$scope.submiting = true;
		Server.domain_set_person({
			instance_ids: param.map(function (p) {
				return p.id;
			}),
			has_domain: true,
			ad_server_id: _this.server.id,
			recreate_sid: _this.is_sid
		}, function (res) {
			$modalInstance.close();
		}).$promise.finally(function () {
			$scope.submiting = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('hostConfigDialog', ['$scope', 'Storage', 'param', '$modalInstance', 'Host', function ($scope, Storage, param, $modalInstance, Host) {
	var host_ids = param.phostids;
	var datas = {};
	$scope.datas = datas = param.pstore;
	Object.keys(datas).forEach(function (key) {
		if (host_ids.indexOf(datas[key].storage_uuid) === -1) {
			datas[key] = undefined;
			delete datas[key];
		}
	});
	$scope.loading = true;
	Storage.get_luns({
		storage_hosts: host_ids
	}, function (res) {
		res.result.forEach(function (host) {
			if (!datas[host.storage_uuid]) {
				host.storages.forEach(function (sto) {
					try {
						sto._total_size = Number(sto.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
						sto._free_size = Number(sto.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
						sto._used_size = Number(sto._total_size - sto._free_size).toFixed(0);
					} catch (err) {}
				});
				datas[host.storage_uuid] = host;
			}
		});
		var firstKey = Object.keys(datas)[0];
		$scope.host = datas[firstKey];
		$scope.change_host($scope);
		$scope.loading = false;
	});
	$scope.sys_luns = [];
	$scope.data_luns = [];
	$scope.filterStorage = function (_s, type, _scope) {
		$scope.loading_lun = true;
		Host.filter_storage({
			storage_id: _s.uuid,
			device_type: _s.device_type,
			node_uuid: _s.node_uuid
		}).$promise.then(function (res) {
			$scope.loading_lun = false;
			res.result.forEach(function (s) {
				try {
					s._total_size = Number(s.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
					s._free_size = Number(s.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
					s._used_size = Number(s._total_size - s._free_size).toFixed(0);
				} catch (err) {}
			});
			switch (type) {
				case 1:
					$scope.sys_luns = res.result;
					break;
				case 2:
					$scope.data_luns = res.result;
					break;
				default:
					break;
			}
			_scope.storage_performance = $scope.sys_luns.filter(function (item) {
				return item.uuid === _scope.host.storage_performance;
			})[0] || $scope.sys_luns[0];
			_scope.storage_capacity = $scope.data_luns.filter(function (item) {
				return item.uuid === _scope.host.storage_capacity;
			})[0] || $scope.data_luns[0];
		});
	};
	$scope.change_host = function (_scope) {
		_scope.image_storage_performance = _scope.host.storages.filter(function (sto) {
			return sto.uuid === _scope.host.image_storage_performance;
		})[0];
		_scope.image_storage_capacity = _scope.host.storages.filter(function (sto) {
			return sto.uuid === _scope.host.image_storage_capacity;
		})[0];
		$scope.filterStorage(_scope.image_storage_performance, 1, _scope);
		$scope.filterStorage(_scope.image_storage_capacity, 2, _scope);
	};
	$scope.ok = function (_scope) {
		var d = _scope.host;
		d._changed = true;
		d.storage_performance = _scope.storage_performance.uuid;
		d.storage_capacity = _scope.storage_capacity.uuid;
		d.image_storage_performance = _scope.image_storage_performance.uuid;
		d.image_storage_capacity = _scope.image_storage_capacity.uuid;
	};
	$scope.okAll = function () {
		$scope.ok(this);
		$scope.close();
	};
	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.dismiss = function () {
		$modalInstance.dismiss();
	};
}]).controller("saveTemplatePersonalDialog", ["$scope", "$modalInstance", "Admin", "PersonDesktop", "HardwareTemplate", "$$$os_types", "virtualHost", "networkWithHost", "Network", "$$$I18N", function ($scope, $modalInstance, admin, personDesktop, hardwares, $$$os_types, virtualHost, networkWithHost, network, $$$I18N) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	var currentItem = $scope.currentItem = angular.copy($scope.currentItem);
	$scope.type = 2;
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('固定IP'), value: 'static' }, { name: $$$I18N.get('系统分配'), value: 'auto' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[1];
	admin.query(function (res) {
		$scope.owners = res.users;
		$scope.owner = $scope.owners.filter(function (o) {
			return o.id === currentItem.user_id;
		})[0] || $scope.owners[0];
	});
	personDesktop.list_detail({ id: currentItem.instance_id }, function (res) {
		$scope.currentItemDetail = res.result;
	}).$promise.then(function () {
		$scope.getVirtualHost($scope.type, currentItem.rbd_enabled);
	});
	$scope.getVirtualHost = function (type, rbd_enabled) {
		$scope.host_loading = true;
		virtualHost.query({
			virtual_type: currentItem.virtual_type,
			rbd_enabled: rbd_enabled
			// enable_gpu: currentItem.enable_gpu
		}, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts.filter(function (h) {
				return h.host_name === currentItem.hostname;
			})[0] || $scope.hosts[0];
			$scope.host && $scope.getNetwork($scope.host, true);
		});
	};

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		$scope.port_loading = true;
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				$scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				$scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip = $scope.band_ips[0];
	// 			_scope.bind_ip_loading = false;
	// 		}).$promise.finally(() =>{
	// 			$scope.port_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[1];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope, isFirst) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				if (isFirst) {
					_scope.subnet = _scope.subnets.filter(function (s) {
						return s.id === $scope.currentItemDetail.subnet_id;
					})[0];
				} else {
					_scope.subnet = _scope.subnets[0];
				}
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host, isFirst) {
		if (host) {
			$scope.net_loading = true;
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks.filter(function (n) {
					return n.id === $scope.currentItemDetail.network.id;
				})[0];
				getSubnets($scope.network, $scope, isFirst);
			}).$promise.finally(function () {
				$scope.net_loading = false;
			});
		}
	};
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};

	$scope.ok = function () {
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		var _this = this;
		if (this.saveTemplate.$valid) {
			var postData = {
				instance_id: currentItem.instance_id,
				owner: _this.owner.id,
				type_code: _this.type,
				name: _this.name,
				description: _this.description,
				network: _this.network.id,
				subnet: _this.subnet ? _this.subnet.id : "",
				band_type: _this.bind_ip_type.value,
				band_ip: _this.bind_ip_type.value === 'static' ? _this.bind_ip.value : undefined,
				host_uuid: _this.host.host_uuid,
				username: currentItem.virtual_type == 'hyper-v' ? _this.username : undefined,
				userPassword: currentItem.virtual_type == 'hyper-v' ? _this.userPassword : undefined,
				userPasswordConfirm: currentItem.virtual_type == 'hyper-v' ? _this.userPasswordConfirm : undefined
				// enable_gpu:currentItem.enable_gpu
			};
			personDesktop.saveAsTemplate(postData, function (res) {
				$scope.submiting = false;
				$scope.afterSubmiting = true;
				$modalInstance.close();
			}, function () {
				$scope.submiting = false;
				$scope.afterSubmiting = false;
			});
		}
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}])
/* 个人桌面池 */
.controller("vdiDesktopPoolController", ["$scope", "DeskPool", "$modal", "$timeout", "$interval", "$filter", "$$$I18N", function ($scope, DeskPool, $modal, $timeout, $interval, $filter, $$$I18N) {
	var _scope = $scope;
	$scope.rows = [], $scope.loading = true;

	//刷新机器执行后的状态
	$interval(function () {
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("personpools", filterSearchPage.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("personpoolsRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (item.status == 'updating') {
				item._ignore = true;
			} else {
				item._ignore = false;
			}
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	/*获取桌面池列表*/
	$scope.refresh = function () {
		var _s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $scope;

		DeskPool.query(function (res) {
			$scope.loading = false;
			$scope.rows = res.result;
		});
	};
	$scope.refresh();
	$scope.pagesize = Number($$$storage.getSessionStorage('pool_pagesize')) || 30;
	$scope.currentPage = 1;
	$scope.$watch("pagesize", function (newvalue) {
		$$$storage.setSessionStorage('pool_pagesize', newvalue);
	});

	//删除个人桌面池
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>" + "个人桌面池删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='确定删除此个人桌面池吗？'>确定删除此个人桌面池吗？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					DeskPool.delete({
						ids: rows.map(function (row) {
							return row.id;
						})
					}, function (data) {
						rows.forEach(function (r) {
							_scope.refresh();
						});
					}, function (error) {
						rows.forEach(function (r) {
							_scope.refresh();
						});
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	//获取选中item的id
	function getIds() {
		var params = {};
		var rows = $scope.rows.filter(function (row) {
			return row._selected && row.online_count < row.total_count;
		});
		params = {
			ids: rows.map(function (it) {
				return it.id;
			})
		};
		return params;
	}

	//桌面池开机
	$scope.start = function (item) {
		var params = getIds();
		params.action = 'power-on';
		DeskPool.start(params, function (res) {
			if (res.result) {
				_scope.refresh();
			}
		});
	};

	//桌面池强制关机
	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.online_count > 0;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					var params = {
						ids: rows.map(function (it) {
							return it.id;
						}),
						action: "force-power-off"
					};
					$scope.ok = function () {
						$modalInstance.close();
						DeskPool.shutdown(params, function () {
							_scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};

	//桌面池自然关机
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.online_count > 0;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						var params = {
							ids: rows.map(function (it) {
								return it.id;
							}),
							action: "power-off"
						};
						$modalInstance.close();
						DeskPool.shutdown(params, function () {
							_scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
}])
/* 个人桌面池二级列表*/
.controller("vdiDesktopPoolListController", ["$scope", "$modal", "$interval", "$filter", "DeskPool", "DeskPoolSecond", "$$$I18N", "UserRole", function ($scope, $modal, $interval, $filter, DeskPool, DeskPoolSecond, $$$I18N, UserRole) {
	var model_name,
	    url,
	    _scope = $scope,
	    cid,
	    carr,
	    searchName,
	    breadPoolName;
	var hasTerminalpermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Terminal';
	}).length;
	var hasTerminalManagepermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Terminal_Manage';
	}).length;
	var hasClassroompermission = UserRole.currentUserRoles.filter(function (role) {
		return role == 'Classroom';
	}).length;
	$scope.linkTerminal = hasTerminalpermission && hasTerminalManagepermission && hasClassroompermission ? true : false;
	$scope.inCurrentUserPool = function (pool) {
		if ($$$storage.getSessionStorage("loginInfo")) return JSON.parse($$$storage.getSessionStorage("loginInfo")).pool.indexOf(pool) > -1;
	};
	url = decodeURIComponent(location.href);
	if (url.indexOf('client') >= 0) {
		searchName = model_name = url.split('?')[1].split('&')[0];
		// breadPoolName=url.split('=')[1];
		// $scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", breadPoolName]);
	} else {
			// model_name=url.split('?')[1];
			// $scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", model_name]);
		}
	carr = url.split('?')[0].split('/');
	cid = carr[carr.length - 1];
	$scope.rows = [], $scope.loading = true;

	//tasklog刷新机器执行后的状态
	$interval(function () {
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (item.status == 'updating') {
				item._ignore = true;
			} else {
				item._ignore = false;
			}
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
	});

	//桌面名排序
	$scope.sortDesktopName = function (name, bool) {
		$scope.rows.sort(function (a, b) {
			var _numa, _numb;
			var get_num = function get_num(tar) {
				for (var i = tar.length - 1; i--; i >= 0) {
					if (!Number(tar[i])) {
						return Number(tar.substring(i + 1, tar.length));
					}
				}
			};
			_numa = get_num(a[name]);
			_numb = get_num(b[name]);
			return (_numa - _numb) * (bool ? -1 : 1);
		});
	};

	$scope.getObjLength = function (obj) {
		try {
			return Object.keys(obj).length;
		} catch (err) {
			return 0;
		}
	};

	//获取桌面列表|更新桌面列表
	_scope.refresh = function () {
		DeskPoolSecond.get({ id: cid }, function (res) {
			_scope.loading = false;
			_scope.rows = res.result;
			$scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", res.person_pool_name]);
			_scope.sortDesktopName('display_name');
			_scope.searchText = searchName;
			_scope.loading = false;
		});
	};

	_scope.refresh();

	$scope.pagesize = Number($$$storage.getSessionStorage('pool_details_pagesize')) || 30;
	$scope.currentPage = 1;
	$scope.$watch("pagesize", function (newvalue) {
		$$$storage.setSessionStorage('pool_details_pagesize', newvalue);
	});
	// $scope.rows=mockData.result;

	//获取桌面池详情信息
	$scope.getDetail = function (it) {
		$scope.loading_detail = true;
		DeskPool.list_detail({ id: it.id }, function (res) {
			it.detailData = res.result;
		}).$promise.finally(function () {
			$scope.loading_detail = false;
		});
	};

	//桌面池详情展开收起
	$scope.expand = function (row) {
		$scope.rows.forEach(function (r) {
			if (row.id === r.id) {
				r._expand = !row._expand;
				if (r._expand) {
					$scope.getDetail(row);
				}
			} else {
				r._expand = false;
			}
		});
	};

	//searchText输入搜索
	$scope.updateData = function (text, select) {
		$scope.rows = $scope.rows.filter(function (row) {
			row._selected = false;
			if (select) {
				if (text && text.trim()) {
					return row.status === select;
				}
				return row.status === select;
			}
			return true;
		});
	};

	//操作--查看桌面
	$scope.view = function (item) {
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};

	//获取选中item的id
	function getIds(item) {
		var params = {};
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		params = {
			ids: rows.map(function (it) {
				return it.id;
			})
		};
		return params;
	}

	//个人桌面池开机
	$scope.start = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state;
		});
		var params = {
			instance_ids: rows.map(function (it) {
				it._selected = false;return it.id;
			})
		};
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout: 6000
			});
		} else {
			DeskPoolSecond.start(params, function (res) {
				// _scope.refresh();//tasklog刷新，这里不需要再拉取列表
			});
		}
	};

	//桌面池强制关机
	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						var params = {
							instance_ids: rows.map(function (it) {
								it._selected = false;return it.id;
							})
						};
						$modalInstance.close();
						DeskPoolSecond.shutdown(params, function () {});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	//桌面池自然关机
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						var params = {
							instance_ids: rows.map(function (it) {
								it._selected = false;return it.id;
							})
						};
						$modalInstance.close();
						DeskPoolSecond.shutdown(params, function () {
							// _scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	//桌面池重启
	$scope.restart = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>" + "桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						var params = {
							instance_ids: rows.map(function (it) {
								it._selected = false;return it.id;
							})
						};
						$modalInstance.close();
						DeskPoolSecond.reboots(params, function () {
							// _scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	//挂起状态
	$scope.pause = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'running' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>" + "桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						var params = {
							instance_ids: rows.map(function (it) {
								it._selected = false;return it.id;
							})
						};
						$modalInstance.close();
						DeskPoolSecond.pause(params, function () {
							// _scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	//唤醒
	$scope.resume = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'paused' && !row.task_state;
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>" + "桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						var params = {
							instance_ids: rows.map(function (it) {
								it._selected = false;return it.id;
							})
						};
						DeskPoolSecond.resume(params, function () {
							// _scope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
}])
/*新增个人桌面池dialog控制器*/
.controller("newDeskPoolDialog", ["$scope", "$modalInstance", "$q", "DeskPool", "Host", "Network", "HardwareTemplate", "PersonTemplate", "User", "Admin", "Depart", "PersonDesktop", "Server", "$$$I18N", "$$$MSG", "ResourcePool", "$filter", "$modal", "VMCommon", function ($scope, $modalInstance, $q, DeskPool, host, networks, hardwares, images, user, Admin, Depart, Person, server, $$$I18N, $$$MSG, ResourcePool, $filter, $modal, vm) {
	var _scope = $scope;
	$scope.desktopNum = 1;
	$scope.max_instance = 0;
	$scope.host_loading = true;
	$scope.regXP = /WindowsXP|WindowsXP_64/;
	$scope.reg = /(windows\s*7|8|10)/i;
	$scope.depart = { name: '全部', id: -1, full_path: 'root' };
	/**
 * [selectMode 部门域选择]
 */
	function traverse(ids, obj) {
		if (obj.children && obj.children.length > 0) {
			obj.children.forEach(function (item) {
				ids.push(item.id);
				traverse(ids, item);
			});
		}
	}
	function setData(data, index) {
		data.filter(function (item) {
			return item.full_path_map.length == index;
		}).forEach(function (item) {
			var children = data.filter(function (d) {
				return d.parent == item.id;
			});
			item.children = children;
		});
	}
	function setTreeData(DATA) {
		DATA.forEach(function (item) {
			item.full_path_map = item.full_path.split('/');
		});
		DATA.sort(function (a, b) {
			return a.full_path_map.length > b.full_path_map.length ? -1 : 1;
		});
		for (var i = 1; i < DATA[0].full_path_map.length; i++) {
			setData(DATA, i);
		}
		return [DATA[DATA.length - 1]];
	};

	//初始化树状图
	function treeOptFun(arg, flag) {
		arg.opts = {};
		arg.treedata = newData;
		arg.expandnodes = DATA;
		arg.selected = arg.treedata[0] ? arg.treedata[0] : null;
		if (arg.selected) {
			arg.selected._selected = true;
		}
		arg.showSelected = function (node, selected) {
			node._selected = selected;
			arg.selected = node;
		};
	};
	var DATA = [],
	    newData = [];

	treeOptFun($scope, true);
	$scope.islastGroup = function () {
		return $scope.selected && !DATA.filter(function (item) {
			return item.id !== $scope.selected.id;
		}).filter(function (item) {
			return (item.full_path + '/').indexOf($scope.selected.full_path + '/') > -1;
		}).length;
	};

	$scope.getUserGroup = function () {
		Depart.query(function (res) {
			DATA = res.result;
			$scope.treedata = newData = DATA.length ? setTreeData(DATA) : [];
			$scope.treedata.sort(function (a, b) {
				return a.full_path > b.full_path ? -1 : 1;
			});
			$scope.expandnodes = DATA;
			var selected = {};
			if ($scope.selected) {
				var _selected = DATA.filter(function (item) {
					return item.id == $scope.selected.id;
				})[0];
				selected = _selected ? _selected : newData[0];
			} else {
				selected = DATA.filter(function (item) {
					return item.name == 'default';
				})[0];
			}
			$scope.selected = selected;
			if ($scope.selected) {
				$scope.selected._selected = true;
			}
		}, function (err) {});
	};

	// 第一步
	$scope.step1 = {};
	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	$scope.get_subnet = function (network) {
		if (network.subnets.length) {
			networks.query_sub({
				id: network.id
			}, function (res) {
				$scope.subnetworks = res.result.map(function (n) {
					n._desc = n.start_ip ? n.name + " (" + n.start_ip + " - " + n.end_ip + ") " : n.name;
					return n;
				});
				$scope.step1.subnetwork = $scope.subnetworks[0];
				$scope.clearBindIp();
			});
		} else {
			$scope.subnetworks = [];
			$scope.step1.subnetwork = null;
			$scope.clearBindIp();
		}
	};
	networks.query(function (data) {
		// $scope.networks = data.networks.filter(function(n){ return n.subnets.length > 0});
		$scope.networks = data.networks;
		if ($scope.networks.length) {
			$scope.step1.network = $scope.networks[0];
			$scope.get_subnet($scope.step1.network);
		}
	});
	ResourcePool.query(function (res) {
		$scope.resources = res.result.filter(function (item) {
			return item.hosts.length > 0;
		});
		$scope.step1.resource = $scope.resources[0];
		$scope.resource_update();
	});
	$scope.resource_update = function () {
		$scope.get_personal_template();
	};
	$scope.get_personal_template = function () {
		$scope.templates = [];
		$scope.templateNum = undefined;
		$scope.step1.image = undefined;
		$scope.loading_template = true;
		vm.list_template({ type: 2, virtual_type: $scope.step1.resource.type, rbd_enabled: $scope.step1.resource.rbd_enabled }, function (data) {
			$scope.loading_template = false;
			$scope.winTable = data.win_images.filter(function (item) {
				return item.status === "alive";
			});

			$scope.linTable = data.linux_images.filter(function (item) {
				return item.status === "alive";
			});
			$scope.otherTable = data.other_images.filter(function (item) {
				return item.status === "alive";
			});
			$scope.templates = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
			$scope.templateNum = $scope.templates.length;
			$scope.step1.image = $scope.templates[0];
		});
	};
	$scope.clearBindIp = function () {
		if ($scope.step1.subnetwork) {
			$scope.IPmodes = $scope.IPmodes2;
		} else {
			$scope.IPmodes = $scope.IPmodes1;
		}
		$scope.step1.IPmode = $scope.IPmodes[0];
		$scope.step1.ip = null;
	};
	// 第二步
	$scope.step2 = {};
	$scope.updateHardware = function () {
		var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
		var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
		$scope.step2.usb_version = "2.0";
		if (is_win7UP) {
			$scope.step2.usb_redir = true;
			$scope.step2.usb_version = "3.0";
		} else if (is_winXP) {
			$scope.step2.usb_redir = true;
		} else {
			// $scope.step2.usb_redir = false;
		}
		$scope.step2.usb3_disabled = !is_win7UP ? true : false;
	};
	// 第三步
	$scope.step3 = {};
	$scope.step3.desktopNum2 = 0;
	$scope.get_host = function () {
		$scope.getUserGroup();
		var uuid = $scope.step1.resource.uuid;
		var netid = $scope.step1.network.id;
		var is_gpu = $scope.step2.has_gpu;
		$scope.host_loadding = true;
		$scope.step3.is_all = undefined;
		$scope.hosts = undefined;
		if ($scope.step1.resource.type == 'hyper-v') {
			host.query_gpu_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: is_gpu
			}, function (data) {
				$scope.host_loadding = false;
				$scope.hosts = data.hosts_list.map(function (item) {
					if (item.disabled_tips !== '') {
						item.disabled_desc = $$$I18N.get(item.disabled_tips);
					}
					return item;
				});
			});
		} else {
			host.query_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: false
			}, function (res) {
				$scope.host_loadding = false;
				$scope.hosts = res.hosts_list.filter(function (h) {
					return h.status === 'active';
				});
			});
		}
	};

	var host_storages = {};
	$scope.openMoreDialog = function () {
		var _hostids;
		if ($scope.step3.hostType == '0') {
			_hostids = $scope.hosts.filter(function (h) {
				return h._selected;
			}).map(function (h) {
				return h.storage_uuid;
			});
		} else {
			_hostids = $scope.hosts.filter(function (h) {
				return h.instance_num;
			}).map(function (h) {
				return h.storage_uuid;
			});
		}
		var moreDialog = $modal.open({
			templateUrl: "views/vdi/dialog/desktop/host_config.html",
			controller: "hostConfigDialog",
			resolve: { param: function param() {
					return {
						"phostids": angular.copy(_hostids),
						"pstore": host_storages
					};
				} }
		});
		moreDialog.result.then(function () {});
	};

	$scope.selectAllHost = function (bool) {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		_hosts.map(function (item) {
			item._selected = bool;
			return item;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.selectOneHost = function () {
		var _hosts = $scope.hosts.filter(function (h) {
			if ($scope.step1.resource.type == 'hyper-v') {
				return h.disabled_tips == '';
			} else {
				return true;
			}
		});
		$scope.step3.is_all = _hosts.every(function (item) {
			return item._selected === true;
		});
		var num = $filter("selectedFilter")(_hosts, 'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu == "through" ? num : 0;
	};
	$scope.getDesktopNumber2 = function () {
		var _lis = angular.copy($scope.hosts.filter(function (item) {
			return item.instance_num > 0;
		}));
		if (_lis.length > 0) {
			$scope.step3.desktopNum2 = _lis.reduce(function (a, b) {
				a.instance_num += b.instance_num;
				return a;
			}).instance_num;
		} else {
			$scope.step3.desktopNum2 = 0;
		}
	};

	$scope.step4 = {};
	$scope.$on("selectStepChange", function (e, arg) {
		if (arg.index == 0) {
			arg.stepScope.$$nextSibling.error = false;
		}
	});
	$scope.$on("WizardStep_0", function (e, step, scope) {
		setTimeout(function () {
			$("[rel=popover-hover]").popover({
				trigger: "hover"
			});
		});
		scope.error = step.is_dirty;
		function toStrLong(ip) {
			var ips;
			ips = ip.split(".").map(function (item, idx) {
				var _prefix = '';
				for (var i = 0; i < 8 - Number(item).toString(2).length; i++) {
					_prefix += "0";
				}
				return _prefix + Number(item).toString(2);
			});
			return ips.join("");
		}
		function check_net() {
			// 返回值为true时，invalid
			if ($scope.step1.subnetwork && $scope.step1.subnetwork.netmask && $scope.step1.subnetwork.enable_dhcp && $scope.step1.ip) {
				var _startIP = toStrLong($scope.step1.subnetwork.start_ip);
				var _endIP = toStrLong($scope.step1.subnetwork.end_ip);
				var _bindStartIP = toStrLong($scope.step1.ip);
				return _bindStartIP < _startIP || _bindStartIP > _endIP;
			}
			return false;
		}

		if (check_net()) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$MSG.get(12061),
				timeout: 5000
			});
		}
		var sameDesktopName = $scope.rows.filter(function (item) {
			return item.pool_name == $scope.step1.desktopName;
		}).length;
		var is_valid = scope.bodyForm1.$valid && !check_net();
		step.done = is_valid && !sameDesktopName;
		if (sameDesktopName) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("SAME_POOL_NAME"),
				timeout: 6000
			});
		}
		if (step.done && !sameDesktopName) {
			hardwares.filter({
				"system_gb": $scope.step1.image.system_alloc_disk,
				"local_gb": $scope.step1.image.data_alloc_disk,
				"local_gb1": $scope.step1.image.data_alloc_disk_2
			}, function (data) {
				$scope.hardwareList = data.result.map(function (data) {
					data.memory_mb = data.memory_mb / 1024;
					return data;
				});
				$scope.step2.hardware = $scope.hardwareList[0];
				$scope.step2.hardware && $scope.updateHardware();
			});
		}
	});
	$scope.$on("WizardStep_1", function (e, step, scope) {
		scope.error = step.is_dirty;
		var is_valid = scope.bodyForm2.$valid;
		if (is_valid) {
			$scope.step3.desktopNum = undefined;
			$scope.step3.desktopNum2 = 0;
			$scope.get_host();
		}
		step.done = is_valid;
	});
	$scope.$on("WizardStep_2", function (e, step, scope) {
		scope.error = step.is_dirty;
		// number类型的input ，max属性是变量，不生效，手动判断
		if ($scope.step3.hostType == 0) {
			step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts, 'max_instance');
		}
		if ($scope.step3.hostType == 1) {
			step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
		}
	});
	$scope.$on("WizardStep_3", function (e, step, scope) {
		scope.error = step.is_dirty;
		// step.done = $scope.step4.select_users.length?true:false;
		step.done = $scope.selected ? true : false;
	});
	$scope.$on("WizardDone", function (e, steps, scopes) {
		var postData = {};
		postData.display_name = $scope.step1.desktopName;
		postData.pool_name = $scope.step1.desktopName;
		postData.network_id = $scope.step1.network.id;
		postData.resource_pool = $scope.step1.resource.uuid;

		if ($scope.step1.subnetwork) {
			postData.subnet_id = $scope.step1.subnetwork.id;
		} else {
			postData.subnet_id = '';
		}
		postData.ip_choose = Number($scope.step1.IPmode.value) ? true : false;
		if (postData.ip_choose && Number($scope.step1.IPmode.value) === 2) {
			postData.start_ip = $scope.step1.ip;
		}
		// if($scope.step1.domain){
		// postData.ad_server_id = $scope.step1.domain.id;}
		postData.image_id = $scope.step1.image.id;

		postData.rollback = Number($scope.step2.rollback);
		postData.data_rollback = $scope.step2.hardware.local_gb > 1 ? Number($scope.step2.data_rollback) : undefined;
		if (postData.rollback === 2) {
			postData.rollback_weekday = $scope.step2.rollback_weekday;
		}
		if (postData.rollback === 3) {
			postData.rollback_monthday = $scope.step2.rollback_monthday;
		}
		if (postData.data_rollback === 2) {
			postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;
		}
		if (postData.data_rollback === 3) {
			postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;
		}

		postData.instance_type_id = $scope.step2.hardware.id;
		postData.usb_redir = $scope.step2.usb_redir;
		postData.usb_version = $scope.step2.usb_redir && $scope.step1.resource.type == 'kvm' ? $scope.step2.usb_version : null;
		if ($scope.step1.resource.type === "hyper-v") postData.enable_gpu = $scope.step2.has_gpu;

		if ($scope.step3.hostType == 0) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item._selected;
			}).map(function (item) {
				return { "uuid": item.id };
			});
			postData.count = $scope.step3.desktopNum;
		}
		if ($scope.step3.hostType == 1) {
			postData.servers = $scope.hosts.filter(function (item) {
				return item.instance_num > 0;
			}).map(function (item) {
				return { "uuid": item.id, "vm_count": item.instance_num };
			});
			postData.count = $scope.step3.desktopNum2;
		}
		postData.servers_storage = Object.keys(host_storages).map(function (key) {
			var host = host_storages[key];
			return {
				uuid: host.id,
				image_storage_capacity: host.image_storage_capacity,
				image_storage_performance: host.image_storage_performance,
				storage_capacity: host.storage_capacity,
				storage_performance: host.storage_performance
			};
		});
		// postData.user_id = $scope.step4.select_users.map(function(item){ return item.id?item.id:item.user_id });
		postData.user_group_id = $scope.selected.id;
		//相比个人桌面的新增 多了个人桌面池name，分组id参数
		$scope.submitting = true;
		if (!postData.user_group_id) {
			console.log('用户分组ID"user_group_id"不能为空');
			return;
		}
		DeskPool.save(postData, function (res) {
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function () {
			$scope.submitting = false;
		});
	});
	$scope.close = function () {
		$modalInstance.close();
	};
}])
/*修改桌面池*/
.controller('editPoolDialog', ["$scope", "$modal", "$modalInstance", "DeskPool", function ($scope, $modal, $modalInstance, DeskPool) {
	$scope.need_ha = false;
	var selectedServer, raw_need_ha;
	$scope.rollbackChange = function (value) {
		if (value != "1") {
			$scope.need_ha = false;
		} else {
			if (selectedServer && selectedServer.length > 0) {
				$scope.need_ha = angular.copy(raw_need_ha);
				$scope.servers = selectedServer;
			}
		}
	};
	$scope.name = $scope.currentItem.name;
	$scope.desktopNum = $scope.currentItem.instance_max;
	$scope.min_instances = $scope.currentItem.instance_max;
	$scope.rollback = $scope.currentItem.rollback;
	$scope.rollback_monthday = $scope.currentItem.rollback_monthday ? $scope.currentItem.rollback_monthday : "1";
	$scope.rollback_weekday = $scope.currentItem.rollback_weekday ? $scope.currentItem.rollback_weekday : "1";

	$scope.disk_type = $scope.currentItem.disk_type;
	$scope.local_gb = $scope.currentItem.local_gb;
	$scope.data_rollback = $scope.currentItem.data_rollback;
	$scope.data_rollback_monthday = $scope.currentItem.data_rollback_monthday || "1";
	$scope.data_rollback_weekday = $scope.currentItem.data_rollback_weekday || "1";

	$scope.usb_redir = $scope.currentItem.usb_redir;
	// $scope.usb3_disabled = !$scope.currentItem.usb3_editable;
	$scope.usb_version = $scope.currentItem.usb_version || "2.0";

	$scope.running_count = $scope.currentItem.running_count;
	$scope.has_domain = $scope.currentItem.has_domain || false;
	$scope.domain = $scope.currentItem.domain;
	$scope.need_ha = false;
	// $scope.enable_gpu = $scope.currentItem.enable_gpu;

	$scope.ok = function () {
		var _rollback = parseInt(this.rollback);
		var _data_rollback = parseInt(this.data_rollback) >= 0 ? Number(this.data_rollback) : undefined;
		var item = {};
		item.id = $scope.currentItem.id;
		item.pool = $scope.currentItem.pool;
		item.name = this.name;
		item.instance_max = $scope.currentItem.instance_max;
		item.rollback = _rollback;
		item.rollback_monthday = _rollback == 3 ? this.rollback_monthday : undefined;
		item.rollback_weekday = _rollback == 2 ? this.rollback_weekday : undefined;
		item.data_rollback = _data_rollback;
		item.data_rollback_monthday = _data_rollback === 3 ? this.data_rollback_monthday : undefined;
		item.data_rollback_weekday = _data_rollback === 2 ? this.data_rollback_weekday : undefined;
		item.usb_redir = this.usb_redir;
		item.usb_version = item.usb_redir && $scope.currentItem.virtual_type == 'kvm' ? this.usb_version : null;
		item.has_domain = this.has_domain;
		// if($scope.currentItem.virtual_type === 'hyper-v')
		// 	item.enable_gpu			   = this.enable_gpu;
		item.domain = this.domain;
		item.need_ha = item.rollback == 1 && this.need_ha;
		if (item.rollback == 1 && item.need_ha) {
			item.server_ids = $scope.servers.filter(function (value) {
				return value._selected;
			}).map(function (value) {
				return value.id;
			});
			if (item.server_ids < 1) {
				return false;
			}
			item.server_ids = item.server_ids.join(',');
		}
		$scope.loading = true;
		DeskPool.update(item, function () {
			$modalInstance.close();
			$scope.refresh();
		}, function () {
			$scope.refresh();
		}).$promise.finally(function (res) {
			$scope.loading = false;
		});
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]);

/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.system", [])

/* 系统 */
.factory("SystemISO", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/isos", null, {
		query: { method: "GET", isArray: false },
		update: { method: "PUT"
			//        loadISO: {method: "POST", url:  $Domain + "/thor/image/loadISO"}
		} });
}]).factory("FenTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image?type_code=3&type_code=4&type_code=5", isArray: false }
	});
}]).factory("PuTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image/4", isArray: false }
	});
}]).factory("addTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "get", url: $Domain + "/thor/image/register" },
		update: { method: "POST", url: $Domain + "/thor/image/register" }
	});
}]).factory("SystemDesktop", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/sysInsts", null, {
		get_instances: { method: "GET", url: $Domain + "/thor/sysInsts/:id", params: { id: "@id" } },
		add_instances: { method: "POST", url: $Domain + "/thor/sysInsts/:id", params: { id: "@id" } },
		config_instances: { method: "PUT", url: $Domain + "/thor/sysInst/:id", params: { id: "@id" } },
		config_template: { method: "PUT", url: $Domain + "/thor/create_distribute_template" },
		get_devices: { method: "POST", url: $Domain + "/thor/get_pci_devices" },
		register: { method: "POST", url: $Domain + "/thor/register_system_template" },
		add: { method: "POST", url: $Domain + "/thor/system_template" },
		edit: { method: "PUT", url: $Domain + "/thor/system_template" }
	});
}]).factory("SystemBackup", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/admin/backup", null, {
		query: { method: "GET", isArray: false },
		backup: { method: "POST" },
		restore: { method: "POST" },
		delete: { method: "DELETE" },
		get_config: { method: "GET", url: $Domain + "/thor/admin/backup_config" },
		alter_config: { method: "PUT", url: $Domain + "/thor/admin/backup_config" }
	});
}]).factory("SystemUpgrade", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/admin/upgrade", null, {
		query: { method: "GET", isArray: false },
		upload: { method: "POST" },
		upgrade: { method: "PUT" },
		delete: { method: "DELETE" }

	});
}]).factory("SystemLog", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/log", null, {
		query: { method: "GET", isArray: false },
		delete: { method: "DELETE" }
	});
}]).factory("SystemUSB", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/usb", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" },
		update: { method: "PUT" },
		delete: { method: "DELETE" }
	});
}]).factory("CreateDistribute", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/create_distribute_template", null, {
		post: { method: "POST" }
	});
}]).factory("Outside", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/haproxy", null, {
		query: { method: "GET", url: $Domain + "/thor/haproxy/info", isArray: false },
		start: { method: "POST", url: $Domain + "/thor/haproxy/start" },
		stop: { method: "POST", url: $Domain + "/thor/haproxy/stop" },
		save: { method: "POST", url: $Domain + "/thor/haproxy/save" }
	});
}])
//系统资源回收接口
.factory('RecycleTech', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/recycle/public", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" }
	});
}]).factory('RecyclePer', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/recycle/person", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" }
	});
}])
//系统时间同步接口
.factory('SystemTime', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/system-time", null, {
		getInternetSync: { method: "GET", url: $Domain + "/thor/system-time/internet", isArray: false }, // 获取Internet时间服务器同步
		internetSync: { method: "POST", url: $Domain + "/thor/system-time/internet" }, // 与Internet时间服务器同步
		querySyncServer: { method: "GET", url: $Domain + "/thor/system-time/sync", isArray: false }, // 获取同步服务列表
		updateSyncServer: { method: "POST", url: $Domain + "/thor/system-time/sync" }, // 立即同步
		queryZone: { method: "GET", url: $Domain + "/thor/system-time", isArray: false }, // 系统当前时间，以及时区列表
		updateZone: { method: "POST", url: $Domain + "/thor/system-time" // 更新操作系统时区、日期、时间

		} });
}])
// 快速部署
.factory('SystemDeploy', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/init", null, {
		quickstart: { method: "GET", url: $Domain + "/thor/init/quickstart" },
		query_data_network: { method: "GET", url: $Domain + "/thor/networks" },
		// 导入模板镜像
		scan_iso: { method: "GET", url: $Domain + "/thor/init/prepare_import_img" },
		import_iso: { method: "POST", url: $Domain + "/thor/init/prepare_import_img" },
		complete_import: { method: "POST", url: $Domain + "/thor/init/import_img" },
		import_progress: { method: "POST", url: $Domain + "/thor/init/check_file" },
		// 注册教学模板
		list_system_images: { method: "get", url: $Domain + "/thor/image/register" },
		list_sub_networks: { method: "GET", url: $Domain + "/thor/network/:id/subnets", params: { id: "@id" } },
		list_ports: { method: "GET", url: $Domain + "/thor/network/subnet/:id/ports", params: { id: "@id" } },
		register_template: { method: "POST", url: $Domain + "/thor/init/regit_template" },
		// 创建教学场景
		create_scene: { method: "POST", url: $Domain + "/thor/init/create_mode" },
		first_deploy: { method: "GET", url: $Domain + "/thor/init/first_deploy" },
		//系统模块快速部署的界面展现
		quick_deploy_page: { method: "GET", url: $Domain + "/thor/controller/ha_storage_state" }
	});
}]).factory('AutoSnapshot', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/admin/auto_snapshot", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" },
		update: { method: "PUT", url: $Domain + "/thor/admin/auto_snapshot/detail/:id", params: { id: "@id" } },
		active: { method: "POST", url: $Domain + "/thor/admin/auto_snapshot/detail/:id", params: { id: "@id" } },
		delete: { method: "DELETE" }
	});
}]).factory('USBPassThrough', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/admin/thor/usb_pass_through", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" },
		cancel: { method: "DELETE" }
	});
}]).factory('TreeInstances', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/tree_instances", null, {
		query: { method: "GET", isArray: false }
	});
}]).factory('Spice', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/spice_image_compression", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" }
	});
}]).factory('Share', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/share/settings", null, {
		query: { method: "GET", isArray: false },
		save: { method: "POST" }
	});
}]).controller("vdiSystemDesktopListController", ["$scope", "$modal", "SystemDesktop", "FenTemplate", "PuTemplate", "$$$os_types", "$Domain", "$interval", "$$$I18N", function ($scope, $modal, SystemDesktop, FenTemplate, PuTemplate, $$$os_types, $Domain, $interval, $$$I18N) {
	$scope.domain = $Domain;
	$scope.rows = [];

	$scope.images = [];
	$scope.loading = true;

	$scope.currentPage = 1;
	$scope.pagesizes = [30, 20, 10];
	$scope.pagesize = $scope.pagesizes[0];

	$interval(function () {
		$scope.rows && $scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
		$scope.rows.forEach(function (row) {
			var updateInfor = row.sync_status && row.sync_status.filter(function (item) {
				return item.type === "image";
			});
			if (updateInfor && updateInfor.length !== 0) row.updateSize = (updateInfor[0].size / 1024 / 1024 / 1024).toFixed(2);
		});
	});
	$scope.editSysdesktop = function (item) {
		var ins = $modal.open({
			templateUrl: "views/vdi/dialog/system/template_config.html",
			controller: "systemTemplateConfigDialog",
			size: "lg",
			resolve: { param: function param() {
					return item;
				} }
		});
		ins.result.then(function () {
			// $scope.changeType($scope.select);
		});
	};
	function get_rows() {
		FenTemplate.query(function (res) {
			$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);

			$scope.rows.forEach(function (row) {
				var os = $$$os_types.filter(function (item) {
					return item.key === row.os_type;
				})[0];
				os && os.icon && (row.icon = os.icon);
				if (row.os_type && row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
				if (row.os_type && row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
			});
			$scope.rows.sort(function (a, b) {
				return a.created_at > b.created_at ? -1 : 1;
			});
			$scope.running = res.running;
			$scope.shutoff = res.shutoff;
			$scope.sync_mode = res.sync_mode;
			$scope.loading = false;
			$scope.teachNames = $scope.rows.map(function (item) {
				return item.name;
			});
			$scope.sameName = false;
		});
	}
	get_rows();

	var _controllerScope = $scope;
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除系统桌面'>删除系统桌面" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_SYSDESK_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance, $q) {
				$scope.name = rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					FenTemplate.delete({ id: rows.map(function (item) {
							return item.id;
						}) }, function (res) {
						rows.forEach(function (row) {
							_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
						});
					}, function (error) {
						template.query(function (res) {
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					});
					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("addTemplateDialog", ["$scope", "$modalInstance", "Admin", "addTemplate", "$$$os_types", "UserRole", "FenTemplate", "PuTemplate", "ResourcePool", "Host", "Network", "SystemISO", "SystemDesktop", "$filter", "CreateDistribute", "virtualHost", "$$$I18N", function ($scope, $modalInstance, admin, addTemplate, $$$os_types, UserRole, FenTemplate, PuTemplate, ResourcePool, host, Network, iso, SystemDesktop, $filter, CreateDistribute, virtualHost, $$$I18N) {
	var user = UserRole.currentUser;
	$scope.nets = [];
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.vcpus = 1;
	$scope.ram = 32;
	$scope.system_gb = 10;
	$scope.local_gb = 5;

	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	$scope.get_host = function (uuid) {
		host.query_agent({ id: uuid }, function (res) {
			$scope.hosts = res.hosts_list.filter(function (h) {
				return h.status === 'active';
			});
			$scope.node = $scope.hosts[0];
			$scope.get_devices($scope.node.host);
		});
	};
	ResourcePool.query(function (res) {
		$scope.pools = res.result.filter(function (item) {
			return item.hosts.length > 0 && item.type == 'kvm';
		});
		if ($scope.pools.length) {
			$scope.source_pool = $scope.pools[0];
			$scope.get_host($scope.source_pool.uuid);
		} else {
			$scope.hosts = [];
		}
	});

	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	function getNetwork(key) {
		$scope.loading = true;
		Network.query(function (data) {
			if (data.networks.length) {
				$scope.nets.push({ key: key, networks: data.networks, network: data.networks[0] });
				$scope.get_subnet(data.networks[0], key);
			}
		});
	}
	getNetwork(new Date());
	$scope.get_subnet = function (network, key) {
		if (network.subnets.length) {
			Network.query_sub({
				id: network.id
			}, function (res) {
				var subnetworks = [];
				subnetworks = res.result.map(function (n) {
					n._desc = n.start_ip ? n.name + " (" + n.start_ip + " - " + n.end_ip + ") " : n.name;
					return n;
				});
				$scope.nets.forEach(function (item) {
					if (item.key === key) {
						item.subnetworks = subnetworks;
						item.subnetwork = subnetworks[0];
						$scope.clearBindIp(key);
					}
				});
				$scope.loading = false;
			});
		} else {
			$scope.loading = false;
			$scope.nets.forEach(function (item) {
				if (item.key === key) {
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(key);
				}
			});
		}
	};
	$scope.clearBindIp = function (key) {
		$scope.nets.forEach(function (item) {
			if (item.key === key) {
				if (item.subnetwork) {
					item.IPmodes = $scope.IPmodes2;
				} else {
					item.IPmodes = $scope.IPmodes1;
				}
				item.IPmode = item.IPmodes[0];
				item.ip = null;
			}
		});
	};

	$scope.host_loading = true;

	$scope.get_devices = function (hostname) {
		SystemDesktop.get_devices({ host: hostname }, function (res) {
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function (item) {
				return item.status === "available";
			});
		});
	};
	$scope.selectAllHost = function (bool) {
		$scope.devices.map(function (item) {
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function () {
		$scope.is_all = $scope.devices.every(function (item) {
			return item._selected === true;
		});
	};

	iso.query(function (res) {
		$scope.isos = res.isos.filter(function (iso) {
			return iso.os_type && iso.type !== "package" && iso.type !== "other";
		});
		$scope.isos.forEach(function (item) {
			item.os_type = item.os_type.split(",");
		});
		$scope.iso = $scope.isos[0];
	});

	$scope.addNet = function () {
		getNetwork(new Date());
	};
	$scope.minusNet = function (i) {
		var idx = $scope.nets.indexOf(i);
		$scope.nets.splice(idx, 1);
	};
	var newWindow;
	setTimeout(function () {
		$("#finish").on('click', function () {
			newWindow = window.open('templateModifybt.html#0');
		});
	});

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array) {
		var flag = false;
		array.forEach(function (item, index) {
			for (var i = index + 1; i < array.length; i++) {
				console.log(array[index], array[i]);
				if (array[index]['subnetwork'] && array[i]['subnetwork'] && array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']) {
					flag = true;
				}
			}
		});
		return flag;
	}
	$scope.ok = function () {
		$scope.devices_selected = $filter("selectedFilter")($scope.devices);
		// if($scope.devices_selected.length!==0){
		var me = this;
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		var postData = {
			display_name: this.display_name,
			type_code: this.type,
			source_pool: this.source_pool.uuid,
			node: this.node.id,
			network: this.nets.map(function (item) {
				if (!item.network.id) return "";else return item.network.id;
			}),
			subnet: this.nets.map(function (item) {
				if (!item.subnetwork) return "";else return item.subnetwork.id;
			}),
			band_ip: this.nets.map(function (item) {
				if (!item.ip) return "";else return item.ip;
			}),
			iso_path: this.iso.name,
			iso_id: this.iso.id,
			vcpus: this.vcpus,
			ram: this.ram * 1024,
			pci_devices_node: $scope.devices_selected.map(function (item) {
				return item.compute_node_id;
			}),
			pci_devices_address: $scope.devices_selected.map(function (item) {
				return item.address;
			}),
			system_gb: this.system_gb,
			local_gb: this.local_gb,
			start_on_host_boot: this.start_on_host_boot,
			virtual_type: this.source_pool.type
		};
		//需求1651,新增和编辑模板都在新打开的vnc页面提示IP重复
		// if(giveTip(this.nets)){
		// 	$.bigBox({
		// 		title: $$$I18N.get("INFOR_TIP"),
		// 		content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
		// 		timeout:6000
		// 	});
		// }
		SystemDesktop.add(postData, function (res) {
			var alertFlag = giveTip(me.nets);
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			FenTemplate.query(function (res) {
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);
				var template = $scope.rows.filter(function (temp) {
					return temp.name == postData.display_name;
				})[0];
				if (res.sync_mode === 'scp') newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name + '&sytem_desktop' + '&sameIp=' + alertFlag);else newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name + '&sytem_desktop' + '&sameIp=' + alertFlag);
			});
			$modalInstance.close();
		}, function (res) {
			newWindow.close();
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
		// }
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("systemTemplateRegisterDialog", ["$scope", "$modalInstance", "Admin", "addTemplate", "$$$os_types", "UserRole", "FenTemplate", "PuTemplate", "ResourcePool", "Host", "Network", "SystemISO", "SystemDesktop", "$filter", "CreateDistribute", "virtualHost", "$$$I18N", "registerTemplate", function ($scope, $modalInstance, admin, addTemplate, $$$os_types, UserRole, FenTemplate, PuTemplate, ResourcePool, host, Network, iso, SystemDesktop, $filter, CreateDistribute, virtualHost, $$$I18N, registerTemplate) {
	var user = UserRole.currentUser;
	$scope.nets = [];
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.vcpus = 1;
	$scope.ram = 32;
	$scope.system_gb = 10;
	$scope.local_gb = 5;

	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	$scope.get_host = function (uuid) {
		host.query_agent({ id: uuid }, function (res) {
			$scope.hosts = res.hosts_list.filter(function (h) {
				return h.status === 'active';
			});
			$scope.node = $scope.hosts[0];
			$scope.get_devices($scope.node.host);
		});
	};
	ResourcePool.query(function (res) {
		$scope.pools = res.result.filter(function (item) {
			return item.hosts.length > 0 && item.type == 'kvm';
		});
		if ($scope.pools.length) {
			$scope.source_pool = $scope.pools[0];
			$scope.get_host($scope.source_pool.uuid);
		} else {
			$scope.hosts = [];
		}
	});

	registerTemplate.query(function (res) {
		$scope.sys_isos = res.system_image.filter(function (item) {
			return item.virtual_type == 'kvm';
		});
		$scope.sys_iso = res.system_image[0];
		$scope.old_data_isos = res.data_image;
		if ($scope.sys_iso) {
			$scope.getDataImgs($scope.sys_iso);
		}
	});
	$scope.filterDataISO = function (data_iso, data_iso2) {
		if (data_iso) {
			$scope.data_isos2 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso.name;
			});
		} else {
			$scope.data_isos2 = $scope.data_isos;
		}
		if (data_iso2) {
			$scope.data_isos1 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso2.name;
			});
		} else {
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function (systemImg, is_init) {
		if (systemImg) {
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function (item) {
				return item.virtual_type == systemImg.virtual_type;
			});
		}
	};

	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	function getNetwork(key) {
		$scope.loading = true;
		Network.query(function (data) {
			if (data.networks.length) {
				$scope.nets.push({ key: key, networks: data.networks, network: data.networks[0] });
				$scope.get_subnet(data.networks[0], key);
			}
		});
	}
	getNetwork(new Date());
	$scope.get_subnet = function (network, key) {
		if (network.subnets.length) {
			Network.query_sub({
				id: network.id
			}, function (res) {
				var subnetworks = [];
				subnetworks = res.result.map(function (n) {
					n._desc = n.start_ip ? n.name + " (" + n.start_ip + " - " + n.end_ip + ") " : n.name;
					return n;
				});
				$scope.nets.forEach(function (item) {
					if (item.key === key) {
						item.subnetworks = subnetworks;
						item.subnetwork = subnetworks[0];
						$scope.clearBindIp(key);
					}
				});
				$scope.loading = false;
			});
		} else {
			$scope.loading = false;
			$scope.nets.forEach(function (item) {
				if (item.key === key) {
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(key);
				}
			});
		}
	};
	$scope.clearBindIp = function (key) {
		$scope.nets.forEach(function (item) {
			if (item.key === key) {
				if (item.subnetwork) {
					item.IPmodes = $scope.IPmodes2;
				} else {
					item.IPmodes = $scope.IPmodes1;
				}
				item.IPmode = item.IPmodes[0];
				item.ip = null;
			}
		});
	};

	$scope.host_loading = true;

	$scope.get_devices = function (hostname) {
		SystemDesktop.get_devices({ host: hostname }, function (res) {
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function (item) {
				return item.status === "available";
			});
		});
	};
	$scope.selectAllHost = function (bool) {
		$scope.devices.map(function (item) {
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function () {
		$scope.is_all = $scope.devices.every(function (item) {
			return item._selected === true;
		});
	};

	iso.query(function (res) {
		$scope.isos = res.isos.filter(function (iso) {
			return iso.os_type && iso.type !== "package" && iso.type !== "other";
		});
		$scope.isos.forEach(function (item) {
			item.os_type = item.os_type.split(",");
		});
		$scope.iso = $scope.isos[0];
	});

	$scope.addNet = function () {
		getNetwork(new Date());
	};
	$scope.minusNet = function (i) {
		var idx = $scope.nets.indexOf(i);
		$scope.nets.splice(idx, 1);
	};

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array) {
		var flag = false;
		array.forEach(function (item, index) {
			for (var i = index + 1; i < array.length; i++) {
				if (array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']) {
					flag = true;
				}
			}
		});
		return flag;
	}

	$scope.ok = function () {
		$scope.devices_selected = $filter("selectedFilter")($scope.devices);
		// if($scope.devices_selected.length!==0){
		var me = this,
		    alertTip;
		alertTip = giveTip(me.nets);
		var postData = {
			display_name: this.display_name,
			type_code: this.type,
			source_pool: this.source_pool.uuid,
			node: this.node.id,
			network: this.nets.map(function (item) {
				if (!item.network.id) return "";else return item.network.id;
			}),
			subnet: this.nets.map(function (item) {
				if (!item.subnetwork) return "";else return item.subnetwork.id;
			}),
			band_ip: this.nets.map(function (item) {
				if (!item.ip) return "";else return item.ip;
			}),
			vcpus: this.vcpus,
			ram: this.ram * 1024,
			system_image_file: this.sys_iso,
			data_image_file: this.data_iso ? this.data_iso : undefined,
			pci_devices_node: $scope.devices_selected.map(function (item) {
				return item.compute_node_id;
			}),
			pci_devices_address: $scope.devices_selected.map(function (item) {
				return item.address;
			}),
			start_on_host_boot: this.start_on_host_boot,
			virtual_type: this.source_pool.type
		};
		if (alertTip) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("不同网卡上不能存在相同网段的IP"),
				timeout: 6000
			});
			return false;
		}
		$scope.afterSubmiting = false;
		$scope.submiting = true;
		SystemDesktop.register(postData, function (res) {
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			FenTemplate.query(function (res) {
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);
			});
			$modalInstance.close();
		}, function () {
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
		// }
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("vdiSystemBackupListController", ["$scope", "$modal", "SystemBackup", "$Domain", function ($scope, $modal, backup, $Domain) {
	$scope.rows = [];$scope.loading = true;

	$scope.getList = function () {
		backup.query(function (data) {
			$scope.allRows = data.ret;
			$scope.rows = data.ret;
			$scope.loading = false;
		});
	};
	$scope.getList();
	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	var controller_scope = $scope;
	$scope.getURL = function (item) {
		return $Domain + "/thor/admin/download?file_name=" + item.name;
	};
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (item) {
			return item._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='BACKUP_DE'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='BACKUP_DE_CONTENT'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$modalInstance.close();
					backup.delete({ name: rows.map(function (row) {
							return row.name;
						}) }, function (data) {
						controller_scope.getList();
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.backup = function () {
		$scope.submitting = true;
		backup.backup({ method: "backup" }, function (data) {
			controller_scope.getList();
		}).$promise.finally(function () {
			$scope.submitting = false;
		});
	};
	$scope.config = function () {
		$modal.open({
			controller: "systemBackupConfigController",
			templateUrl: "views/vdi/dialog/system/system_backup_config.html",
			size: "md"
		});
	};
}]).controller("vdiSystemISOListController", ["$scope", "SystemISO", "$modal", "$rootScope", "$filter", "$$$os_types", "$Domain", function ($scope, iso, $modal, $rootScope, $filter, $$$os_types, $Domain) {
	$$$os_types = $$$os_types.filter(function (type) {
		return type.key !== 'Windows 7';
	});
	$scope.rows = [];$scope.loading = true;$scope.domain = $Domain;
	var rows = [];
	function loadIso() {
		iso.query(function (res) {
			$scope.rows = res.isos;
			$scope.loading = false;
			var test = /Windows 7/;
			$scope.rows.forEach(function (item) {
				//item.os_type = $$$os_types[Math.random() * $$$os_types.length ^ 0].key;
				item.origin_os_type = item.os_type;
				if (item.os_type) {
					var type = $$$os_types.filter(function (type) {
						return type.key === item.os_type;
					})[0];
					if (type) {
						item.os_type = type;
					} else if (test.test(item.os_type)) {
						item.os_type = { "key": "Windows 7", "value": "Windows 7 series" };
					}
				}
				// item.editable = false;
				item.old_type = item.type;
				item.old_os_type = item.os_type;
				item.type_editable = false;
				item.os_editable = false;
			});
			angular.copy($scope.rows, rows);
			$scope.select = "";
		});
	}
	loadIso();
	var upload_id = 'system_iso_upload';
	var uploadModal;
	$scope.$on("progress", function (e, size) {
		if (size.id === upload_id) {
			if (uploadModal) {
				uploadModal.close();
				uploadModal = undefined;
			}
			$scope.progressName = size.name;
			$scope.isUploading = true;
			$scope.progressPercent = (size.loaded / size.total * 100).toFixed(2) + "%";
			if ($scope.progressPercent === "100.00%") {
				$scope.isUploading = false;
			}
		}
	});
	$scope.$on("finishISOUpload", function () {
		console.log("finished refresh");
		loadIso();
	});
	$scope.upload = function () {
		uploadModal = $modal.open({
			templateUrl: "./views/vdi/dialog/system/upload_iso.html",
			controller: "systemUploadIsoDialog",
			resolve: {
				param: function param() {
					return { "upload_id": upload_id };
				}
			}
		});
	};
	$scope.abortUpload = function () {
		var xhr = $rootScope.uploadPool[upload_id];
		xhr && xhr.abort();
		$scope.isUploading = false;
	};
	$scope.filter_iso = function (item) {
		if (!item) {
			$scope.rows = rows;
			return true;
		}
		$scope.rows = rows.filter(function (row) {
			return row.type == $scope.select;
		});
	};
	$scope.updateData = function (text, select) {
		$scope.rows = rows.filter(function (row) {
			if (select) {
				return row.type === select;
			}
			return true;
		});
	};
	$scope.os_types = $$$os_types;
	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.change = function (item) {
		var new_item = JSON.parse(JSON.stringify(item));
		if (new_item.os_type) {
			new_item.os_type = item.support_auto_install ? item.origin_os_type : item.os_type.key;
		}
		iso.update(new_item, function (res) {
			rows.map(function (row) {
				if (res.result && row.id == res.result.id) {
					row.os_type = item.os_type;
					row.type = item.type;
					row.old_type = item.type;
					row.old_os_type = item.os_type;
					row.type_editable = false;
					row.os_editable = false;
				}
				return row;
			});
		}).$promise.finally(function () {
			loadIso();
		});
		$scope.filter_iso($scope.select);
	};
	$scope.hideButton = function () {
		$scope.uploadStart = false;
	};
	var _scope = $scope;
	$scope.delete = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='ISO_DELETE'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ISO_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.name = item.name;
				$scope.ok = function () {
					iso.delete({
						ids: [item.id]
					}, function (res) {
						loadIso();
					});
					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	$scope.edit = function (item) {
		item.os_editable = !item.support_auto_install;
		item.type_editable = true;
	};
	$scope.cancel = function (item) {
		item.type = item.old_type;
		item.os_type = item.old_os_type;
		if (!item.support_auto_install) item.os_editable = !item.os_editable;
		item.type_editable = !item.type_editable;
	};
}]).controller("vdiSystemLogListController", ["$scope", "SystemLog", "$modal", function ($scope, log, $modal) {
	$scope.rows = [];
	$scope.loading = true;

	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('log_pagesize')) || 30;
	$scope.$watch("pagesize", function (newvalue) {
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('alarm_pagesize', newvalue ? newvalue : 0);
	});

	var last;
	$scope.search = function (e) {
		last = e.timeStamp;
		setTimeout(function () {
			if (last - e.timeStamp == 0) {
				fn_get_logs($scope.searchText);
			}
		}, 500);
	};

	var _start = 0;
	var fn_get_logs = function fn_get_logs(searchText) {
		var size = Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
		log.query({
			displayLength: size,
			displayStart: ($scope.currentPage - 1) * size,
			search: searchText ? searchText : ""
		}, function (data) {
			$scope.rows = data.data.sort(function (a, b) {
				return b.datetime - a.datetime;
			});
			$scope.totalCount = searchText ? data.totalDisplayRecords : data.totalRecords;
			$scope.loading = false;
			_start = data.displayStart;
		});
	};
	fn_get_logs();

	$scope.logPageSizeChange = function () {
		$scope.currentPage = $scope.pagesize ? Math.floor(_start / $scope.pagesize) + 1 : 0;
		fn_get_logs();
	};
	$scope.logPageChange = function () {
		fn_get_logs($scope.searchText);
	};

	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});

		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_LOG'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_LOG_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					log.delete({ ids: rows.map(function (row) {
							return row.id;
						}) }, function (data) {
						fn_get_logs();
					});
					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.deleteAll = function () {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_RIZHI'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_RIZHI_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					log.delete({ ids: 'all' }, function (data) {
						fn_get_logs();
					});
					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}])
// .controller("vdiSystemEndlogListController", ["$scope", "$modal", function($scope, $modal){
// 	$scope.rows = [];
// 	$scope.loading = true;

//     $scope.currentPage = 1;
//     $scope.pagesize = Number(localStorage.log_pagesize) || 30;
// 	$scope.$watch("pagesize" , function(newvalue){
// 		$scope.pagesize = newvalue || 0;
// 		localStorage.log_pagesize = newvalue ? newvalue : 0;
// 	});

// 	var _start = 0;
// 	var fn_get_logs = function(){
// 		var size = Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
// 		// log.query({
// 		// 	displayLength: size,
// 		// 	displayStart: ($scope.currentPage - 1) * size,
// 		// 	search: ""
// 		// }, function(data){
// 		// 	$scope.rows = data.data.sort(function(a,b){
// 		// 		return b.datetime - a.datetime;
// 		// 	});
// 		// 	$scope.totalCount = data.totalRecords;
// 		// 	$scope.loading = false;
// 		// 	_start = data.displayStart;
// 		// });
// 	};
// 	fn_get_logs();

// 	$scope.logPageSizeChange = function(){
// 		$scope.currentPage = $scope.pagesize ? Math.floor(_start / $scope.pagesize) + 1 : 0;
// 		fn_get_logs();
// 	};
// 	$scope.logPageChange = function(){
// 		fn_get_logs();
// 	};

// 	$scope.delete = function(item){
// 		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });

// 		$modal.open({
// 			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_LOG'>"+
// 						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_LOG_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
// 			controller : function($scope, $modalInstance){
// 				$scope.ok = function(){
// 					// log.delete({ids:rows.map(function(row){ return row.id })},function(data){
// 					// 	fn_get_logs();
// 					// });
// 					$modalInstance.close();
// 				},
// 				$scope.close = function(){
// 					$modalInstance.close();
// 				}
// 			},
// 			size : "sm"
// 		});
// 	};
// 	$scope.deleteAll = function(){
// 		$modal.open({
// 			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_RIZHI'>"+
// 						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_RIZHI_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
// 			controller : function($scope, $modalInstance){
// 				$scope.ok = function(){
// 					// log.delete({ids:'all'}, function(data){
// 					// 	fn_get_logs();
// 					// });
// 					$modalInstance.close();
// 				},
// 				$scope.close = function(){
// 					$modalInstance.close();
// 				}
// 			},
// 			size : "sm"
// 		});

// 	};
// }])
.controller("vdiSystemUpgradeListController", ["$scope", "SystemUpgrade", "$modal", "$$$I18N", "$$$MSG", function ($scope, upgrade, $modal, $$$I18N, $$$MSG) {
	function getList() {
		$scope.loading = true;
		$scope.rows = [];
		upgrade.query(function (data) {
			var _data = data.versions;
			var new_data = {};
			_data.forEach(function (d, idx) {
				d._idx = idx;
				// 上传包类型
				// d.packtype = d.owner === 'win_client' ? 'zip' : 'bin';
				if (d.owner === 'win_client') {
					d.packtype = 'zip';
				} else if (d.owner === 'android_client') {
					d.packtype = 'apk';
				} else if (d.owner.indexOf('guesttool') !== -1) {
					d.packtype = 'iso';
				} else {
					d.packtype = 'bin';
				}
				if (new_data[d.owner]) {
					new_data[d.owner].push(d);
				} else {
					new_data[d.owner] = [d];
				}
			});
			Object.keys(new_data).forEach(function (i) {
				$scope.rows.push(new_data[i]);
			});
			$scope.loading = false;
		});
	}
	getList();
	$scope.viewDetail = function (witch) {
		$modal.open({
			resolve: {
				modal_data: function modal_data() {
					return witch;
				}
			},
			backdrop: 'static',
			controller: "systemUpgradeDetailDialog",
			templateUrl: "views/vdi/dialog/system/system_upgrade_detail.html",
			size: 'lg'
		});
	};

	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.finish = function () {
		getList();
	};
	$scope.upgrade = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='升级'>" + "升级</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;'>{{ MESS }}</p><footer class='text-right'><button ng-if='!submitting' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><img src='img/loadingtext.gif' ng-if='submitting' height='24' width='24' alt=''><button  ng-if='!submitting'  class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				switch (item.owner) {
					case 'win_client':
					case 'lin_client':
					case 'arm_client':
					case 'android_client':
						$scope.MESS = $$$I18N.get("2UPGRADEMESS");
						break;
					case 'console':
					case 'agent':
						$scope.MESS = $$$I18N.get("UPGRADEMESS");
						break;
					default:
						$scope.MESS = $$$I18N.get("UPGRADEMESS");
						break;
				}
				$scope.ok = function () {
					$scope.submitting = true;
					item['auto'] = true;
					upgrade.upgrade(item, function () {
						getList();
						$modalInstance.close();
					}).$promise.finally(function () {
						$scope.submitting = false;
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "md"
		});
	};
}]).controller("vdiSystemUSBListController", ["$scope", "$modal", "SystemUSB", "$$$I18N", function ($scope, $modal, systemusb, $$$I18N) {
	$scope.rows = [];
	// var allRows = [];
	$scope.loading = true;
	systemusb.get(function (res) {
		//$scope.rows = [{id: 1, class_id: '0x00', priority: 2, rule_name: "ffff", product_id: "0x1111", vendor_id: "0x1234", allow: true}];
		$scope.rows = res.result;
		$scope.rows.forEach(function (item) {
			item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id) };
		});
		$scope.loading = false;
		// angular.copy($scope.rows,allRows);
	});

	$scope.sortClass_id = function (order) {
		$scope.rows.sort(function (a, b) {
			return a.class_id.key > b.class_id.key ? 1 : -1;
		});
		if (order) {
			$scope.rows.reverse();
		}
	};

	$scope.currentPage = 1;
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var rows = $scope.rows;

		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELE_USB'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELE_USB_TIP'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					systemusb.delete({ ids: selected_rows.map(function (row) {
							return row.id;
						}) }, function (res) {
						selected_rows.forEach(function (item) {
							var index = rows.indexOf(item);
							rows.splice(index, 1);
						});
					});

					$modalInstance.close();
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	// $scope.updateData = function(text){
	// 	$scope.rows = allRows.filter(function(row){
	// 		if(text.trim()){
	// 			return row.rule_name.indexOf(text.trim()) !== -1;
	// 		}
	// 		return true;
	// 	});
	// };
}])
// .controller("vdiSystemDeviceListController", ["$scope", "$modal", "$$$I18N", function($scope, $modal, $$$I18N){
// 	$scope.rows = [];

// 	var get_rows = function(){
// 		$scope.rows = [{name: 'iToken S3000', made: '天地融', PID: '3d45', VID: 'df45', host: "agent1", desktop: "zhujianchen", desc: "是的法规法规"}];
// 	};
// 	get_rows();

// 	$scope.transmission = function(){
// 		var device = this.item;
// 		var dialog = $modal.open({
// 			templateUrl: "views/vdi/dialog/system/transmission.html",
// 			controller: "transmissionDialog",
// 			size: "sm",
// 			resolve:{
// 				params : function(){
// 					return { device: angular.copy(device) };
// 				}
// 			}
// 		});
// 		dialog.result.then(function(data){
// 			if(data){
// 				get_rows();
// 			}
// 		});
// 	}

// 	$scope.currentPage = 1;
// 	$scope.pagesizes = [10,20,30];
// 	$scope.pagesize = $scope.pagesizes[0];
// }])
.controller("transmissionDialog", ["$scope", "$modalInstance", "$$$I18N", "params", function ($scope, $modalInstance, $$$I18N, params) {
	$scope.device = params.device;

	$scope.desktops = [{ id: "df", name: 'zhujianchen' }, { id: "fg", name: 'egg' }];

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("addSystemUSBDialog", ["$scope", "$modalInstance", "SystemUSB", "$$$I18N", function ($scope, $modalInstance, systemusb, $$$I18N) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.data = { allow: 'true' };
	$scope.types = [];
	var keys = ['0x01', '0x02', '0x03', '0x05', '0x06', '0x07', '0x08', '0x09', '0x0A', '0x0B', '0x0D', '0x0E', '0x0F', '0x10', '0x11', '0xDC', '0xE0', '0xEF', '0xFE', '0xFF', '-1'];
	keys.forEach(function (item) {
		$scope.types.push({ key: item, value: $$$I18N.get(item) });
	});
	$scope.data.class_id = $scope.types[0];
	$scope.master = { allow: true, class_id: $scope.types[0] };
	$scope.reset = function () {
		$scope.data = $scope.master;
	};
	$scope.isUnchanged = function () {
		return angular.equals($scope.master, $scope.data);
	};
	$scope.ok = function () {
		systemusb.save({
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1' ? $scope.data.product_id : "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1' ? $scope.data.vendor_id : "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow == "true" ? true : false
		}, function (res) {
			systemusb.get(function (res) {
				res.result.forEach(function (item) {
					item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id) };
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, res.result);
			});
		});
		$modalInstance.close();
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("editSystemUSBDialog", ["$scope", "$modalInstance", "SystemUSB", "$$$I18N", function ($scope, $modalInstance, systemusb, $$$I18N) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.types = [];
	var keys = ['0x01', '0x02', '0x03', '0x05', '0x06', '0x07', '0x08', '0x09', '0x0A', '0x0B', '0x0D', '0x0E', '0x0F', '0x10', '0x11', '0xDC', '0xE0', '0xEF', '0xFE', '0xFF', '-1'];
	keys.forEach(function (item) {
		$scope.types.push({ key: item, value: $$$I18N.get(item) });
	});
	var item = $scope.item || $scope.currentItem;
	if (item.product_id.indexOf("0x") > -1) {
		item.product_id = item.product_id == -1 ? "-1" : item.product_id.substring(2);
	}
	if (item.vendor_id.indexOf("0x") > -1) {
		item.vendor_id = item.vendor_id == -1 ? "-1" : item.vendor_id.substring(2);
	}
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};
	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
	};

	$scope.ok = function () {
		systemusb.update({
			group_id: $scope.data.id,
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1' ? $scope.data.product_id : "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1' ? $scope.data.vendor_id : "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow
		}, function (res) {
			systemusb.get(function (res) {
				res.result.forEach(function (item) {
					item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id) };
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, res.result);
			});
			$modalInstance.close();
		}, function () {});
	};

	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller("systemUpgradeDetailDialog", ["$scope", "SystemUpgrade", "modal_data", "$modalInstance", function ($scope, SystemUpgrade, modal_data, $modalInstance) {

	SystemUpgrade.query({ owner: modal_data }, function (res) {
		$scope.rows = res.result;
	});
	$scope.close = function () {
		$modalInstance.close();
	};
}]).controller('vdiSystemDesktopDetailController', ['$scope', '$modal', 'SystemDesktop', '$routeParams', '$interval', '$filter', '$$$os_types', 'VMCommon', 'PersonDesktop', '$$$I18N', function ($scope, $modal, SystemDesktop, $routeParams, $interval, $filter, $$$os_types, vm, person_desktop, $$$I18N) {
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["系统", "系统桌面", "桌面详情"]);

	$interval(function () {
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
	});

	$scope.refresh = function () {
		var _s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $scope;

		var _id = $routeParams.id;
		_s.select = '';
		SystemDesktop.get_instances({ id: _id }, function (res) {
			_s.rows = res.result.result;
			_s.allRows = res.result.result;
			_s.rows.forEach(function (row) {
				var os = $$$os_types.filter(function (item) {
					return item.key === row.os_type;
				})[0];
				os && os.icon && (row.icon = os.icon);
			});
			_s.loading = false;
		});
	};

	$scope.pagesize = Number($$$storage.getSessionStorage('personl_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize", function (newvalue) {
		$$$storage.setSessionStorage('personl_pagesize', newvalue);
	});

	$scope.loading = true;
	$scope.rows = [];
	$scope.refresh();

	$scope.changeStatus = function () {
		$scope.rows = $filter("filter")($scope.allRows, $scope.select).map(function (item) {
			item._selected = false;return item;
		});
	};

	var _controllerScope = $scope;
	$scope.start = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'shutdown' || row.status == 'suspended');
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout: 6000
			});
		} else {
			vm.start({ instance_ids: rows.map(function (row) {
					row.status = "building";return row.instance_id;
				}) }, function () {
				$scope.refresh();
			});
		}
	};

	$scope.forceShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended');
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>" + "桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						vm.shutdowns({ instance_ids: rows.map(function (row) {
								row._selected = false;
								row.status = "building";
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.natureShutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended');
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>" + "桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
							row.status = "building";
						});
						vm.shutdowns({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.restart = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && (row.status == 'running' || row.status == 'suspended');
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>" + "桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
							row.status = "building";
						});
						vm.reboots({ is_soft: 'true', instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.pause = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'running';
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout: 6000
			});
		} else {

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>" + "桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
							row.status = "building";
						});
						vm.pause({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.resume = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected && row.status == 'paused';
		});
		if (rows.length == 0) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>" + "桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller: function controller($scope, $modalInstance) {
					$scope.ok = function () {
						$modalInstance.close();
						rows.map(function (row) {
							row._selected = false;
							row.status = "building";
						});
						vm.resume({ instance_ids: rows.map(function (row) {
								return row.instance_id;
							}) }, function () {
							_controllerScope.refresh();
						});
					}, $scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var is_running = rows.some(function (row) {
			return row.status == 'running';
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>" + "桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller: function controller($scope, $modalInstance) {
				$scope.is_run = is_running;
				$scope.ok = function () {
					$modalInstance.close();
					person_desktop.delete({ instance_ids: rows.map(function (row) {
							return row.instance_id;
						}) }, function (data) {
						rows.forEach(function (r) {
							_controllerScope.refresh();
						});
					});
				}, $scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	$scope.add = function () {
		var instance = $modal.open({
			templateUrl: "views/vdi/dialog/system/system_desktop_add.html",
			controller: "systemDesktopAddDialog",
			size: "md"
		});
		instance.result.then(function () {
			_controllerScope.refresh();
		});
	};

	$scope.config = function (item) {
		var instance = $modal.open({
			templateUrl: "views/vdi/dialog/system/system_desktop_config.html",
			controller: "systemDesktopConfigDialog",
			size: "md",
			resolve: { param: function param() {
					return item;
				} }
		});
		instance.result.then(function () {
			_controllerScope.refresh();
		});
	};
}]).controller('systemDesktopConfigDialog', ['$scope', 'param', 'SystemDesktop', 'Host', '$filter', '$modalInstance', function ($scope, param, SystemDesktop, Host, $filter, $modalInstance) {
	$scope.data = {
		id: param.id,
		memory_mb: param.memory_mb / 1024,
		cpu_num: param.vcpu,
		hostname: param.hostname
	};
	$scope.host_loading = true;

	$scope.get_devices = function (hostname) {
		SystemDesktop.get_devices({ host: hostname }, function (res) {
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function (item) {
				return item.status === "available";
			});
		});
	};
	$scope.get_devices($scope.data.hostname);
	$scope.selectAllHost = function (bool) {
		$scope.devices.map(function (item) {
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function () {
		$scope.data.is_all = $scope.devices.every(function (item) {
			return item._selected === true;
		});
	};
	$scope.ok = function () {
		var devices = $filter("selectedFilter")($scope.devices);
		var node = $scope.data.is_cancel ? -1 : devices.map(function (item) {
			return item.compute_node_id;
		});
		var addr = $scope.data.is_cancel ? -1 : devices.map(function (item) {
			return item.address;
		});
		var postData = {
			id: $scope.data.id,
			is_auto_up: $scope.data.is_on,
			pci_devices_node: node,
			pci_devices_address: addr,
			cpu: $scope.data.cpu_num,
			ram: $scope.data.memory_mb
		};
		$scope.loading = true;
		SystemDesktop.config_instances(postData, function (res) {
			$modalInstance.close();
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('systemDesktopAddDialog', ['$scope', 'Host', '$filter', 'SystemDesktop', '$modalInstance', '$routeParams', function ($scope, Host, $filter, SystemDesktop, $modalInstance, $routeParams) {

	$scope.data = {};
	$scope.host_loading = true;
	Host.query({ type: 'kvm' }, function (res) {
		$scope.hosts = res.hosts_list.filter(function (host) {
			return host.status == 'active';
		});
	}).$promise.finally(function () {
		$scope.host_loading = false;
	});
	$scope.selectAllHost = function (bool) {
		$scope.hosts.map(function (item) {
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function () {
		$scope.data.is_all = $scope.hosts.every(function (item) {
			return item._selected === true;
		});
	};
	$scope.ok = function () {
		var _id = $routeParams.id ? $routeParams.id : $scope.creat_item.id;
		var postData = {
			id: _id,
			name: $scope.data.name,
			host_ids: $filter("selectedFilter")($scope.hosts).map(function (item) {
				return item.id;
			}),
			cpu: $scope.data.cpu_num,
			ram: $scope.data.memory_mb
		};
		$scope.loading = true;
		SystemDesktop.add_instances(postData, function (res) {
			$modalInstance.close();
		}).$promise.finally(function () {
			$scope.loading = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('systemTemplateConfigDialog', ['$scope', '$modalInstance', 'param', 'SystemDesktop', '$filter', 'TeachTemplate', "Network", "$$$I18N", function ($scope, $modalInstance, param, SystemDesktop, $filter, TeachTemplate, Network, $$$I18N) {
	var me = this;
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.data = {
		instance_id: param.instance_id,
		id: param.id,
		cpu_num: 1,
		memory_mb: 1
	};
	$scope.host_loading = true;

	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	TeachTemplate.infor({ image_id: $scope.data.id }, function (res) {
		$scope.data.cpu_num = res.vcpus;
		$scope.data.memory_mb = res.ram / 1024;
		$scope.data.display_name = res.name;
		$scope.data.type = res.type_code;
		$scope.data.host = res.host;
		$scope.data.start_on_host_boot = res.start_on_host_boot;
		$scope.get_devices($scope.data.host);
		res.nets.forEach(function (net) {
			getNetwork(net, new Date());
		});
	});

	$scope.nets = [];
	$scope.IPmodes1 = [{ name: $$$I18N.get('不分配'), value: 0 }];
	$scope.IPmodes2 = [{ name: $$$I18N.get('系统分配'), value: 1 }, { name: $$$I18N.get('固定IP'), value: 2 }];
	function getNetwork(net, key) {
		$scope.network_loading = true;
		Network.query(function (data) {
			if (data.networks.length) {
				var _network = net ? data.networks.filter(function (n) {
					return n.id == net.network_id;
				})[0] : data.networks[0];
				$scope.nets.push({ key: key, networks: data.networks, network: _network });
				$scope.get_subnet(net, _network, key);
			}
		});
	}

	$scope.get_subnet = function (net, network, key) {
		if (network.subnets.length) {
			Network.query_sub({
				id: network.id
			}, function (res) {
				var subnetworks = [];
				subnetworks = res.result.map(function (n) {
					n._desc = n.start_ip ? n.name + " (" + n.start_ip + " - " + n.end_ip + ") " : n.name;
					return n;
				});
				$scope.nets.forEach(function (item) {
					if (item.key === key) {
						item.subnetworks = subnetworks;
						var _subnetwork;
						if (net) {
							_subnetwork = net.subnet_id ? subnetworks.filter(function (n) {
								return n.id == net.subnet_id;
							})[0] : null;
						} else {
							_subnetwork = subnetworks[0];
						};
						item.subnetwork = _subnetwork;
						$scope.clearBindIp(net, key);
					}
				});
				$scope.network_loading = false;
			});
		} else {
			$scope.network_loading = false;
			$scope.nets.forEach(function (item) {
				if (item.key === key) {
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(net, key);
				}
			});
		}
	};
	$scope.clearBindIp = function (net, key) {
		$scope.nets.forEach(function (item) {
			if (item.key === key) {
				if (item.subnetwork) {
					item.IPmodes = $scope.IPmodes2;
					if (net.ip_address) {
						item.IPmode = item.IPmodes[1];
					} else {
						item.IPmode = item.IPmodes[0];
					}
				} else {
					item.IPmodes = $scope.IPmodes1;
					item.IPmode = item.IPmodes[0];
				}

				item.ip = net.ip_address;
			}
		});
	};

	$scope.addNet = function () {
		getNetwork(false, new Date());
	};
	$scope.minusNet = function (i) {
		var idx = $scope.nets.indexOf(i);
		$scope.nets.splice(idx, 1);
	};
	$scope.get_devices = function (hostname) {
		SystemDesktop.get_devices({ host: hostname }, function (res) {
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function (item) {
				return item.status === "available";
			});
		});
	};
	$scope.selectAllHost = function (bool) {
		$scope.devices.map(function (item) {
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function () {
		$scope.data.is_all = $scope.devices.every(function (item) {
			return item._selected === true;
		});
	};

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array) {
		var flag = false;
		array.forEach(function (item, index) {
			for (var i = index + 1; i < array.length; i++) {
				console.log(array[index], array[i]);
				if (array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']) {
					flag = true;
				}
			}
		});
		return flag;
	}

	$scope.ok = function () {
		var me = this,
		    alertTip = giveTip(me.nets);
		var devices = $filter("selectedFilter")($scope.devices);
		var node = $scope.data.is_cancel ? -1 : devices.map(function (item) {
			return item.compute_node_id;
		});
		var addr = $scope.data.is_cancel ? -1 : devices.map(function (item) {
			return item.address;
		});
		var postData = {
			image_id: $scope.data.id,
			instance_id: $scope.data.instance_id,
			display_name: $scope.data.display_name,
			type_code: this.data.type,
			network: this.nets.map(function (item) {
				if (!item.network.id) return "";else return item.network.id;
			}),
			subnet: this.nets.map(function (item) {
				if (!item.subnetwork) return "";else return item.subnetwork.id;
			}),
			band_ip: this.nets.map(function (item) {
				if (!item.ip) return "";else return item.ip;
			}),
			pci_devices_node: node,
			pci_devices_address: addr,
			vcpus: $scope.data.cpu_num,
			ram: $scope.data.memory_mb,
			start_on_host_boot: $scope.data.start_on_host_boot
		};
		if (alertTip) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("不同网卡上不能存在相同网段的IP"),
				timeout: 6000
			});
			return false;
		}
		$scope.loading = true;
		SystemDesktop.edit(postData, function (res) {
			$modalInstance.close();
		}).$promise.finally(function () {
			$scope.loading = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('systemBackupConfigController', ['$scope', '$modalInstance', 'SystemBackup', function ($scope, $modalInstance, SystemBackup) {
	$scope.data = {};
	SystemBackup.get_config(function (res) {
		$scope.data = res.result;
		var initTime = new Date();
		$scope.data.backup_weekday = $scope.data.backup_weekday || "";
		$scope.data.backup_time = $scope.data.backup_time || initTime;
	});
	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.ok = function () {
		$scope.submiting = true;
		SystemBackup.alter_config($scope.data, function () {
			$modalInstance.close();
		}).$promise.finally(function () {
			$scope.submiting = false;
		});
	};
}]).controller("vdiSystemOutsideController", ["$scope", "$modal", "$$$I18N", "Outside", 'AlarmPlicy', function ($scope, $modal, $$$I18N, Outside, AlarmPlicy) {
	$scope.enable_loading = false;
	$scope.save_loading = false;
	$scope.ips_loading = true;

	Outside.query(function (res) {
		// var res = {
		// 	enable: true,
		// 	proxy_ip: "10.1.41.188",
		// 	computer_ips: ["10.1.41.17"]
		// };
		// var res = {
		// 	enable: false,
		// 	proxy_ip: "",
		// 	computer_ips: []
		// };
		$scope.enable = res.enable;
		$scope.IP = res.proxy_ip;
		$scope.hasIP = res.proxy_ip == '' ? false : true;
		$scope.computer_ips = res.computer_ips;

		AlarmPlicy.get_hosts(function (result) {
			$scope.ips_loading = false;
			// var consoleIP = result.result.filter(function(r){ return r.type=="control"; })[0].hosts[0].ip;
			// result.result.forEach(function(item){
			// 	item.hosts = item.hosts.filter(function(i){ return i.ip!==consoleIP })
			// });
			$scope.pools = result.result.filter(function (r) {
				return r.hosts.length && r.type !== "control";
			});
		});
	});

	$scope.start = function () {
		if (!$scope.enable) {
			$scope.enable_loading = true;
			Outside.stop(function (res) {
				$scope.enable_loading = false;
				$scope.IP = null;
				$scope.computer_ips = [];
			}, function (error) {
				$scope.enable_loading = false;
				$scope.enable = !$scope.enable;
			});
		}
	};
	$scope.save = function () {
		var computer_ips = [];
		if (!$scope.hasIP) {
			$scope.pools.forEach(function (item) {
				item.hosts.forEach(function (host) {
					computer_ips.push(host.ip);
				});
			});
		} else {
			$scope.pools.forEach(function (item) {
				item.hosts.forEach(function (host) {
					var is_selected = $scope.computer_ips.filter(function (i) {
						return i === host.ip;
					}).length;
					if (is_selected) {
						computer_ips.push(host.ip);
					}
				});
			});
		}
		if (computer_ips.length) {
			$scope.save_loading = true;
			Outside.save({
				proxy_ip: $scope.IP,
				computer_ips: computer_ips
			}, function (res) {
				$scope.hasIP = true;
				$scope.save_loading = false;
				$scope.computer_ips = computer_ips;
			}, function (error) {
				$scope.save_loading = false;
			});
		} else {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("NO_OUSIDEIP"),
				timeout: 6000
			});
		}
	};
}]).controller('outsideAdvancedDialog', ['$scope', '$modalInstance', 'AlarmPlicy', "Outside", function ($scope, $modalInstance, AlarmPlicy, Outside) {
	$scope.ips_loading = true;
	$scope.isSubmiting = false;
	AlarmPlicy.get_hosts(function (result) {
		$scope.ips_loading = false;

		// var consoleIP = result.result.filter(function(r){ return r.type=="control"; })[0].hosts[0].ip;
		// result.result.forEach(function(item){
		// 	item.hosts = item.hosts.filter(function(i){ return i.ip!==consoleIP })
		// });
		var pools = result.result.filter(function (r) {
			return r.hosts.length && r.type !== "control";
		});
		$scope.pools.splice(0);
		Array.prototype.push.apply($scope.pools, pools);

		if (!$scope.hasIP) {
			$scope.pools.forEach(function (item) {
				item.hosts.forEach(function (host) {
					host._selected = true;
				});
			});
		} else {
			$scope.pools.forEach(function (item) {
				item.hosts.forEach(function (host) {
					var is_selected = $scope.computer_ips.filter(function (i) {
						return i === host.ip;
					}).length;
					if (is_selected) {
						host._selected = true;
					}
				});
			});
		}
		$scope.pools.forEach(function (item) {
			var selected_length = item.hosts.filter(function (host) {
				return host._selected;
			}).length;
			if (selected_length == item.hosts.length) {
				item._selected = true;
			}
		});
	});

	$scope.checkOne = function (pool) {
		pool._selected = pool.hosts.every(function (h) {
			return h._selected;
		});
	};
	$scope.checkAll = function (pool) {
		pool.hosts.forEach(function (h) {
			h._selected = pool._selected;
		});
	};
	$scope.checked = function () {
		var computer_ips = [];
		$scope.pools && $scope.pools.forEach(function (item) {
			item.hosts.forEach(function (host) {
				if (host._selected) {
					computer_ips.push(host.ip);
				}
			});
		});
		return computer_ips.length ? true : false;
	};
	$scope.ok = function () {
		var computer_ips = [];
		$scope.pools.forEach(function (item) {
			item.hosts.forEach(function (host) {
				if (host._selected) {
					computer_ips.push(host.ip);
				}
			});
		});
		$scope.isSubmiting = true;
		Outside.save({
			proxy_ip: $scope.IP,
			computer_ips: computer_ips
		}, function (res) {
			$scope.hasIP = true;
			$scope.computer_ips.splice(0);
			Array.prototype.push.apply($scope.computer_ips, computer_ips);
			$modalInstance.close();
			$scope.isSubmiting = false;
		}, function (error) {});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller("systemUploadIsoDialog", ['$scope', '$modalInstance', 'param', '$rootScope', function ($scope, $modalInstance, param, $rootScope) {
	$scope.id = param.upload_id;
	$scope.finishUpload = function () {
		$rootScope.$broadcast("finishISOUpload");
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}])
/**
 * [description vdiSystemRecycleController 系统资源回收控制器]
 */
.controller('vdiSystemRecycleController', ['$scope', '$modal', '$location', '$route', 'RecycleTech', 'RecyclePer', function ($scope, $modal, $location, $route, RecycleTech, RecyclePer) {
	var RecycleCtrl = this;
	RecycleCtrl.data = {}, RecycleCtrl.submit = {};

	RecycleCtrl.setTechDefault = function (val) {
		RecycleCtrl.tecSave(true);
	};
	RecycleCtrl.getTech = function () {
		RecycleCtrl.techLoading = true;
		RecycleTech.query(function (res) {
			RecycleCtrl.data.tecOpen = res.value.active;
			RecycleCtrl.data.tecDesk = res.value.broken_min;
			RecycleCtrl.data.tecStatus = res.value.run;
			RecycleCtrl.techLoading = false;
		}, function () {
			RecycleCtrl.techLoading = false;
		});
	};
	RecycleCtrl.getTech();
	RecycleCtrl.tecSave = function (onlyEnable) {
		//提交请求
		if (onlyEnable) {
			RecycleCtrl.techenabling = true;
			RecycleTech.save({ value: { active: RecycleCtrl.data.tecOpen } }, function (res) {
				RecycleCtrl.techenabling = false;
				RecycleCtrl.getTech();
				if (!RecycleCtrl.data.tecOpen) {
					RecycleCtrl.techEdit = false;
				}
			}, function () {
				RecycleCtrl.techenabling = false;
			});
		} else {
			RecycleCtrl.data.tecDesk = Number(RecycleCtrl.data.tecDesk);
			var params = {
				active: RecycleCtrl.data.tecOpen,
				broken_min: RecycleCtrl.data.tecDesk,
				run: RecycleCtrl.data.tecStatus
			};
			RecycleCtrl.techSave = true;
			RecycleTech.save({ value: params }, function (res) {
				RecycleCtrl.techSave = false;
				RecycleCtrl.techEdit = false;
			}, function () {
				RecycleCtrl.techSave = false;
			});
		}
	};

	RecycleCtrl.setPerDefault = function (val) {
		RecycleCtrl.perSave(true);
	};
	RecycleCtrl.getPerson = function () {
		RecycleCtrl.personLoading = true;
		RecyclePer.query(function (res) {
			RecycleCtrl.submit.perOpen = res.value.active;
			RecycleCtrl.submit.perDesk = res.value.broken_min / 60;
			RecycleCtrl.submit.perStatus = res.value.run;
			RecycleCtrl.personLoading = false;
		}, function () {
			RecycleCtrl.personLoading = false;
		});
	};
	RecycleCtrl.getPerson();
	RecycleCtrl.perSave = function (onlyEnable) {
		//提交请求
		if (onlyEnable) {
			RecycleCtrl.perenabling = true;
			RecyclePer.save({ value: { active: RecycleCtrl.submit.perOpen } }, function (res) {
				RecycleCtrl.perenabling = false;
				RecycleCtrl.getPerson();
				if (!RecycleCtrl.submit.perOpen) {
					RecycleCtrl.personEdit = false;
				}
			}, function () {
				RecycleCtrl.perenabling = false;
			});
		} else {
			RecycleCtrl.submit.perDesk = Number(RecycleCtrl.submit.perDesk);
			var params = {
				active: RecycleCtrl.submit.perOpen,
				broken_min: RecycleCtrl.submit.perOpen ? RecycleCtrl.submit.perDesk * 60 : undefined,
				run: RecycleCtrl.submit.perOpen ? RecycleCtrl.submit.perStatus : undefined
			};
			RecycleCtrl.personSave = true;
			RecyclePer.save({ value: params }, function (res) {
				RecycleCtrl.personSave = false;
				RecycleCtrl.personEdit = false;
			}, function () {
				RecycleCtrl.personSave = false;
			});
		}
	};
}])

/**
 * [description vdiSystemtimeSyncController 系统时间同步控制器]
 */
.controller('vdiSystemtimeSyncController', ['$scope', '$modal', '$route', 'SystemTime', '$$$I18N', 'formDate', function ($scope, $modal, $route, SystemTime, $$$I18N, formDate) {
	var SyncCtrl = this;
	// var oldSyncServer;
	SystemTime.getInternetSync(function (res) {
		SyncCtrl.internetSync = res.enable;
	}, function () {});

	SyncCtrl.setInternetSync = function (value) {
		SyncCtrl.loading_internet = true;
		SystemTime.internetSync({ enable: value }, function () {
			SyncCtrl.loading_internet = false;
		}, function () {
			SyncCtrl.loading_internet = false;
		});
		if (value) {
			SyncCtrl.updateSyncServer();
		}
	};

	SystemTime.querySyncServer(function (res) {
		SyncCtrl.servers = res.result;
		SyncCtrl.server = res.used !== '' ? res.used : res.result[0];
		// 保持对旧 server 引用
		// oldSyncServer = res.used;
	}, function () {});

	// SyncCtrl.isSyncServerChanged = function(){
	// 	// 不允许选择空值
	// 	if(!this.server) { return false; }
	// 	// 判断变化
	// 	if(oldSyncServer) {
	// 		return oldSyncServer !== this.server;
	// 	}
	// };

	SyncCtrl.updateSyncServer = function () {
		SyncCtrl.loading_updateServer = true;
		SystemTime.updateSyncServer({ time_server: SyncCtrl.server }, function (res) {
			// oldSyncServer = SyncCtrl.server;
			SyncCtrl.loading_updateServer = false;
			SyncCtrl.loadZone();
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("同步时间成功"),
				timeout: 6000
			});
		}, function () {
			SyncCtrl.loading_updateServer = false;
			SyncCtrl.loadZone();
		});
	};

	// 时区
	SyncCtrl.startDateOptions = {
		formatYear: 'yyyy-MM-dd',
		startingDay: 1
	};
	SyncCtrl.openStartDate = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();
		SyncCtrl.startDateOpened = true;
	};
	$scope.$on('matchInput', function (e, v) {
		$scope.matchInput = v;
	});
	var timeID;
	function updateTime(time) {
		var new_time = time;
		var timeArray = formDate.format(new Date(time), "hh:mm:ss").split(':');
		if (SyncCtrl.loopTime) {
			SyncCtrl.hours = timeArray[0];
			SyncCtrl.minutes = timeArray[1];
			SyncCtrl.seconds = timeArray[2];
			new_time = time + 1000;
			timeID = setTimeout(function () {
				updateTime(new_time);
			}, 1000);
		} else {
			clearTimeout(timeID);
		}
	};

	SyncCtrl.loadZone = function () {
		clearTimeout(timeID);
		SyncCtrl.loading_zone = true;
		SystemTime.queryZone(function (res) {
			SyncCtrl.choose_time = res.date;
			SyncCtrl.loopTime = true;
			updateTime(res.timestamp);
			SyncCtrl.zones = res.timezones.map(function (item) {
				item.value = $$$I18N.get(item.zones[0]);
				return item;
			});
			SyncCtrl.zone = SyncCtrl.zones.filter(function (item) {
				return item.offset == res.zone;
			})[0];
			SyncCtrl.loading_zone = false;
		}, function () {
			SyncCtrl.loading_zone = false;
		});
	};
	SyncCtrl.loadZone();
	SyncCtrl.updateZone = function () {
		SyncCtrl.updating_zone = true;
		// 格式化时间，0-9时前面加0
		if (SyncCtrl.hours.length == 1 && Number(SyncCtrl.hours) >= 0 && Number(SyncCtrl.hours) <= 9) {
			SyncCtrl.hours = "0" + SyncCtrl.hours;
		}
		if (SyncCtrl.minutes.length == 1 && Number(SyncCtrl.minutes) >= 0 && Number(SyncCtrl.minutes) <= 9) {
			SyncCtrl.minutes = "0" + SyncCtrl.minutes;
		}
		if (SyncCtrl.seconds.length == 1 && Number(SyncCtrl.seconds) >= 0 && Number(SyncCtrl.seconds) <= 9) {
			SyncCtrl.seconds = "0" + SyncCtrl.seconds;
		}
		var time = formDate.format(new Date(SyncCtrl.choose_time), "yyyy-MM-dd");
		SystemTime.updateZone({
			"date": time,
			"time": SyncCtrl.hours + ':' + SyncCtrl.minutes + ":" + SyncCtrl.seconds,
			"zone": SyncCtrl.zone.offset
		}, function (res) {
			SyncCtrl.updating_zone = false;
			SyncCtrl.modifyTime = false;
			SyncCtrl.loadZone();
		}, function () {
			SyncCtrl.updating_zone = false;SyncCtrl.modifyTime = false;SyncCtrl.loadZone();
		});
	};
}]).controller('vdiSystemSetController', ['$scope', '$modal', function ($scope, $modal) {}])
// 快速部署
.directive('htmlpopover', ['$tooltip', function ($tooltip) {
	return $tooltip('htmlpopover', 'htmlpopover', 'mouseenter');
}]).directive('htmlpopoverPopup', function () {
	return {
		restrict: 'EA',
		replace: true,
		scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
		template: "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" + "  <div class=\"arrow\"></div>\n" + "\n" + "  <div class=\"popover-inner\">\n" + "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" + "      <div class=\"popover-content\" bind-html-unsafe=\"content\"></div>\n" + "  </div>\n" + "</div>"
	};
}).filter("filename", function () {
	return function (text) {
		if (!text) {
			return text;
		}
		var pos = text.lastIndexOf("/");
		if (pos === -1) {
			pos = text.lastIndexOf("\\");
		}
		if (pos > -1) {
			return text.substring(pos + 1);
		} else {
			return text;
		}
	};
}).filter("filesize", function () {
	return function (num) {
		var units = ['B', 'KB', 'MB', 'GB', 'TB'];
		var index = 0;
		num = num || 0;
		while (num > 1024) {
			num = num / 1024;
			index++;
		}
		return num.toFixed(2) + units[index];
	};
}).service('quickMaskModel', ["$$$I18N", "$location", "$compile", "$rootScope", "$controller", function ($$$I18N, $location, $compile, $rootScope, $controller) {
	this.open = function () {
		var $body = $(document.body);
		$body.css('overflow', 'hidden');
		var modalRootElement = angular.element("" + "<div id='quickMaskModel'>" + "  <div class='content'>" + "    <p localize='quickstartTip'></p>" + "    <footer class='text-right'>" + "      <a ng-click='ok()' class='btn btn-md btn-primary deploy'><i class='fa-arrow-right fa'></i> <span localize='快速部署'></span></a>" + "      <a ng-click='close()' class='btn btn-md btn-default nodeploy'><span localize='暂不部署'></span></a>" + "    </footer>" + "  </div>" + "  <span class='jiantou'></span>" + "</div>");
		modalRootElement.appendTo($body);
		var modalScope = $rootScope.$new();
		$compile(modalRootElement)(modalScope);
		$controller("quickstartController", { $scope: modalScope, $element: modalRootElement });
		modalScope.$on("$destroy", function () {
			$body.css('overflow', 'auto');
		});
	};
}]).controller('vdiSystemDeployController', ['$scope', '$interval', '$q', '$location', '$modal', '$$$os_types', '$filter', 'localize', 'TeachTemplate', 'SystemDeploy', 'quickMaskModel', function ($scope, $interval, $q, $location, $modal, $$$os_types, $filter, localize, TeachTemplate, init, quickMaskModel) {
	$scope.currentIndex = 0;
	$scope.unknowStep = true;
	$scope.showMask = false;
	$scope.firstDeployTips = true;
	$scope.hideStep = false;
	//系统模块快速部署的界面展现
	init.quick_deploy_page(function (res) {
		if (res.result.ha_mode === "active_passive" && res.result.storage_type === "local" && res.result.ha_triggered) {
			$scope.showMask = true;
			$scope.firstDeployTips = false;
		}
		$scope.hideStep = true;
	});
	// 设置当前步骤
	init.quickstart(function (res) {
		var step = parseInt(res.step);
		if (step && step > 1) {
			$scope.$broadcast("currentStepChange", step - 1);
			$scope.$broadcast("browser refresh", step - 1, res);
		} else {
			$scope.unknowStep = false;
		}
	});

	$scope.knowStep = function () {
		$scope.unknowStep = false;
	};
	$scope.setStep = function (i) {
		$scope.$broadcast("currentStepChange", i);
	};

	$scope.$on("WizardStep_0", function (e, step, scope) {
		var formScope = scope.$$childHead;
		step.done = formScope.imgForm.$valid && !!formScope.selectedSysImage;
		if (!step.done) {
			return;
		}
		$scope.$broadcast("deploy:set", "system-image", formScope.selectedSysImage.filename);
	});

	$scope.$on("WizardStep_1", function (e, step, scope) {
		var formScope = scope.$$childHead;
		step.done = formScope.registerForm.$valid && !formScope.network_loading;
		if (!step.done) {
			angular.forEach(formScope.registerForm.$error, function (arr) {
				arr && arr.forEach(function (ctrl) {
					ctrl.$setViewValue("");
				});
			});
			return;
		}
		var wizardScope = e.targetScope;
		step.done = false;
		step.showLoading = true;
		formScope.ok(function (res) {
			step.showLoading = false;
			if (res === null) {
				return;
			}
			formScope.showTemplateBlock(res);
		});
	});

	$scope.$on("WizardStep_2", function (e, step, scope) {
		var formScope = scope.$$childHead;
		step.done = formScope.createForm.$valid;
		if (!step.done) {
			angular.forEach(formScope.createForm.$error, function (arr) {
				arr.forEach(function (ctrl) {
					ctrl.$setViewValue("");
				});
			});
			return;
		}
		var data = formScope.getValues();
		init.create_scene(data, function (res) {
			$$$storage.setSessionStorage('scene_page_classroom', '');
			$location.url("/desktop/scene");
		});
	});

	var countArr = [0, 0, 0];
	$scope.$on("selectStepChange", function (e, arg) {
		var index = arg.index;
		$scope.currentIndex = index;
		countArr[index]++;
		if (countArr[index] > 1) {
			$scope.$broadcast("deploy:step" + index + ".refresh");
		}
	});
}])
// 第一步：导入模板镜像
.controller('importImageStepController', ['$scope', '$modal', 'SystemDeploy', '$timeout', function ($scope, $modal, init, $timeout) {
	// = 导入模板镜像 =
	// 扫描后产生的镜像列表
	$scope.imglist = [];
	// 选中的镜像
	var autoSelect = true;
	$scope.selectedSysImage;

	$scope.listSystemImages = function () {
		init.list_system_images(function (res) {
			var imgmap = {};
			angular.forEach($scope.imglist, function (img) {
				imgmap[img.name] = img;
			});
			angular.forEach(res.system_image, function (img) {
				if (img.name in imgmap) {
					angular.extend(imgmap[img.name], img);
				} else {
					img.filename = img.name;
					$scope.imglist.push(img);
				}
			});
			if (autoSelect) {
				$scope.selectedSysImage = $scope.imglist[0];
			}
		}).$promise.finally(function () {
			$scope.loading = false;
		});
		$scope.loading = true;
	};

	$scope.selectSysImage = function (img) {
		$scope.selectedSysImage = img;
		$scope.autoSelect = false;
	};

	$scope.importByServer = function () {
		$modal.open({
			templateUrl: "/views/vdi/dialog/system/system_deploy_import_by_server.html",
			controller: "importByServerController as ctrl"
		}).result.then(function (imgs) {
			imgs.length > 0 && $scope.listSystemImages();
		});
	};

	$scope.listSystemImages();

	$scope.$on("finishUpload", function (e, suc, filename) {
		$scope.listSystemImages();
	});

	$scope.$on("deploy:step0.refresh", function () {
		$scope.listSystemImages();
	});
}])
// 第二步：注册教学模板
.controller('registerTeachTemplateStepController', ['$scope', '$interval', '$modal', 'SystemDeploy', "registerTemplate", "TeachTemplate", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types", "$$$I18N", "UserRole", "Network", "virtualHost", "networkWithHost", "$rootScope", function ($scope, $interval, $modal, init, registerTemplate, TeachTemplate, hardware, iso, admin, $$$os_types, $$$I18N, UserRole, network, virtualHost, networkWithHost, $root) {
	var user = UserRole.currentUser;
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.type = '1';
	$scope.name = "default";
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];

	// controller 实例化的时候不应当获取数据，每次 $scope 收到 deploy:set 事件的时候初始化
	function loadData() {
		admin.query(function (res) {
			$scope.users = res.users;
			angular.forEach($scope.users, function (item) {
				if (item.name === user.name) $scope.owner = item;
			});
		});
		registerTemplate.query(function (res) {
			$scope.sys_isos = res.system_image;
			if ($scope.selectIsoName && !selectIsoByName($scope.selectIsoName)) {
				$scope.sys_iso = res.system_image[0];
			}
			$scope.old_data_isos = res.data_image;
			if ($scope.sys_iso) {
				$scope.getDataImgs($scope.sys_iso);
			}
		});
	}

	$scope.filterDataISO = function (data_iso, data_iso2) {
		if (data_iso) {
			$scope.data_isos2 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso.name;
			});
		} else {
			$scope.data_isos2 = $scope.data_isos;
		}
		if (data_iso2) {
			$scope.data_isos1 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso2.name;
			});
		} else {
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function (systemImg, is_init) {
		if (systemImg) {
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function (item) {
				return item.virtual_type == systemImg.virtual_type;
			});
			// $scope.data_iso = $scope.data_isos[0];
			// $scope.data_iso2 = $scope.data_isos[0];
			$scope.getVirtualHost(systemImg.virtual_type, systemImg.rbd_enabled);
		}
	};

	var lastType;
	$scope.getVirtualHost = function (type, rbd_enabled) {
		if (type === lastType) {
			return;
		}
		$scope.host_loading = true;
		virtualHost.query({ virtual_type: type, rbd_enabled: rbd_enabled }, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts[0];
			$scope.getNetwork($scope.host);
			lastType = type;
		}, function () {});
	};

	$scope.os_types = $$$os_types.filter(function (item) {
		return item.key !== "package";
	});
	$scope.os_type = $scope.os_types[0];
	// $scope.enable_gpu = false;
	$scope.bind_ip_type = "static";

	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			$scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host) {
		if (host) {
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function () {});
		}
	};
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};

	$scope.ok = function (callback) {
		// if(this.bind_ip_type.value === 'static' && this.bind_ip === '无可用IP'){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("hasStaticIP_TIP"),
		// 		timeout	: 6000
		// 	});
		// } else{
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		var _ip = this.bind_ip_type.value === 'static' ? this.bind_ip.value : undefined;
		var host_uuid = this.host.host_uuid;
		var postData = {
			system_image_file: this.sys_iso,
			name: this.name,
			os: this.os_type.key,
			owner: this.owner.id,
			network: this.network.id,
			subnet: this.subnet ? this.subnet.id : "",
			band_ip: _ip,
			band_type: this.bind_ip_type.value,
			host_uuid: host_uuid
		};
		init.register_template(postData, function (res) {
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			callback({
				image_id: res.image_id,
				servers: [{ uuid: host_uuid }]
			});
		}, function () {
			callback(null);
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
		// }
	};

	$scope.$on("deploy:set", function (e, name, value) {
		if (name === "system-image") {
			$scope.selectIsoName = value;
			loadData();
			// if(selectIsoByName(value)) {
			// 	$scope.getVirtualHost($scope.sys_iso.virtual_type, $scope.sys_iso.rbd_enabled);
			// }
		}
	});

	function selectIsoByName(name) {
		var iso = $scope.sys_iso;
		var hit = false;
		if (iso && iso.name === name) {
			return true;
		}
		angular.forEach($scope.sys_isos, function (iso) {
			if (iso.name === name) {
				this.sys_iso = iso;
				hit = true;
			}
		}, $scope);
		return hit;
	}

	$scope.showTemplateBlock = function (data, browserRefresh) {
		// 切换视图
		$scope.registerFormLoading = true;
		$scope.loadingTeachTemplates = true;
		TeachTemplate.query({ ids: [data.image_id] }, function (res) {
			var teachTemplates = res.win_images.concat(res.linux_images).concat(res.other_images);

			teachTemplates.forEach(function (row) {
				var os = $$$os_types.filter(function (item) {
					return item.key === row.os_type;
				})[0];
				os && os.icon && (row.icon = os.icon);
				if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
				if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
			});
			teachTemplates.sort(function (a, b) {
				return a.created_at > b.created_at ? -1 : 1;
			});

			$scope.teachTemplates = teachTemplates;
			if (testTempateCreateDone(teachTemplates)) {
				data.xp = isXP(teachTemplates[0]);
				onCreateTemplateDone(data, browserRefresh);
			} else {
				if (browserRefresh) {
					$scope.$eval("knowStep()");
				}
				loopTemplateStatus(data).then(function (v) {
					data.xp = v;
					onCreateTemplateDone(data, browserRefresh);
				}).catch(function (err) {
					$.bigBox({
						title: $$$I18N.get("INFOR_TIP"),
						color: "#C46A69",
						content: err,
						timeout: 6000
					});
				});
			}
		}).$promise.finally(function () {
			$scope.loadingTeachTemplates = false;
		});
	};

	$scope.delete = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教学模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: ["$scope", "$modalInstance", function (modalScope, $modalInstance) {
				var template = TeachTemplate;
				var rows = [item];
				modalScope.name = rows.map(function (row) {
					return row.name;
				}).join(', ');
				modalScope.ok = function () {
					template.delete({ id: [item.id] }, function (res) {
						$scope.$eval("setStep(0)");
						$scope.registerFormLoading = false;
					});
					$modalInstance.close();
				};
				modalScope.close = function () {
					$modalInstance.close();
				};
			}],
			size: "sm"
		});
	};

	function loopTemplateStatus(res) {
		var timer = $interval(function () {
			var root = $scope.$root;
			// TODO: 某些情况这里还是会报错
			if (root) {
				root.$broadcast("imageIDS", [res.image_id]);
			} else {
				$interval.cancel(timer);
				timer = null;
			}
		}, 1000);
		return new Promise(function (resolve, reject) {
			var dereg = $scope.$on("imagesRowsUpdate", function (e, data) {
				var templates = $scope.teachTemplates;
				var _rows = {};
				templates.forEach(function (item) {
					_rows[item.id] = item;
				});
				data.forEach(function (item) {
					if (_rows[item.id]) {
						for (var k in item) {
							_rows[item.id][k] = item[k];
						}
					}
				});
				templates = templates.filter(function (item) {
					return item.type_code === 1;
				});
				templates.forEach(function (row) {
					if (row.sync_status) {
						var updateInfor = row.sync_status.filter(function (item) {
							return item.type === "image";
						});
						if (updateInfor.length !== 0) row.updateSize = (updateInfor[0].size / 1024 / 1024 / 1024).toFixed(2);
					}
				});
				$scope.teachTemplates = templates;
				if (testTempateCreateDone(templates)) {
					$interval.cancel(timer);
					dereg();
					timer = null;
					resolve(isXP(templates[0]));
				}
				if (templates[0].status === "register failed") {
					$interval.cancel(timer);
					dereg();
					timer = null;
					reject($$$I18N.get("REGISTER_FAILED"));
				}
			});
		});
		$scope.$on("$destroy", function () {
			timer && $interval.cancel(timer);
		});
	};

	function testTempateCreateDone(templates) {
		return templates && templates.length > 0 && templates[0].status === "alive";
	}

	function onCreateTemplateDone(res, browserRefresh) {
		var root = $scope.$root;
		root.$broadcast("currentStepChange", 2);
		root.$broadcast("deploy:set", "image_id", res.image_id);
		root.$broadcast("deploy:set", "servers", res.servers);
		root.$broadcast("deploy:set", "isxp", res.xp);
		if (res.max_instance) {
			root.$broadcast("deploy:set", "max_instance", res.max_instance);
		} else {
			// force trigger request `/thor/init/quickstart`
			root.$broadcast("deploy:set", "max_instance", false);
		}

		$scope.registerFormLoading = false;
		if (browserRefresh === true) {
			$scope.$eval("knowStep()");
		}
	}

	function isXP(template) {
		var ostype = template.os_type || "";
		return (/^Windows\s*XP/.test(ostype)
		);
	}
	// 快速部署过程中浏览器重新刷新，自动进入轮训
	$scope.$on("browser refresh", function (e, step, res) {
		if (step !== 1) {
			return;
		}
		// 显示模板
		$scope.showTemplateBlock(res, true);
	});
}])
// 第三步：创建教学场景
.controller('createTeachSceneController', ['$scope', '$modal', 'SystemDeploy', "TeachTemplate", "SchoolRoom", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types", "$$$I18N", "UserRole", "Network", "virtualHost", "networkWithHost", "$rootScope", "$q", function ($scope, $modal, init, teach, SchoolRoom, hardware, iso, admin, $$$os_types, $$$I18N, UserRole, network, virtualHost, networkWithHost, $root, $q) {
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;

	var data = $scope.data = {
		name: "default",
		cpu_num: 2,
		memory_mb: 2,
		system_gb: 20,
		kwargs: {
			data_rollback: 1,
			hostname_beginwith: 1,
			hostname_prefix: "PC",
			hostname_type: 1,
			is_exam: false,
			rollback: 1,
			usb_redir: true
		}
	};

	$scope.btndisks = [];
	$scope.master = {};

	SchoolRoom.querywithSimple(function (res) {
		$scope.classrooms = res.pools_.concat([{
			id: -1,
			name: $$$I18N.get("新增自定义教室")
		}]);
		$scope.classroom = $scope.classrooms[0];
	});

	hardware.query(function (res) {
		$scope.hardwareList = res.result.concat([{
			id: -1,
			name: $$$I18N.get("新增自定义模板")
		}]);
		$scope.hardware = $scope.hardwareList[0];
	});

	network.query(function (data) {
		$scope.networks = data.networks.filter(function (item) {
			return item.subnets.length !== 0;
		});
		$scope.data.network = $scope.networks[0];
		getSubnets($scope.data.network);
	});

	$scope.addbtndisk = function () {
		$scope.btndisks.push({ local_gb: 5 });
	};
	$scope.minusbtndisk = function () {
		// var idx = $scope.btndisks.indexOf(i)
		$scope.btndisks.splice($scope.btndisks.length - 1, 1);
	};

	$scope.switchSubnet = function (val) {
		getSubnets(val);
	};

	function getSubnets(Network) {
		$scope.network_loading = true;
		network.query_sub({ id: Network.id }, function (res) {
			$scope.subnets = res.result;
			$scope.data.subnet = $scope.subnets[0];
			$scope.network_loading = false;
		});
	}

	$scope.getValues = function () {
		var values = angular.extend({
			name: data.name,
			instance_max: data.instance_max,
			servers: data.servers,
			image_id: data.image_id
		}, data.kwargs);
		if ($scope.classroom.id === -1) {
			angular.extend(values, {
				pool_name: data.classroomName,
				desc: data.desc,
				network_id: data.network.id,
				subnet_id: data.subnet.id
			});
		} else {
			values.pool = $scope.classroom.id;
		}
		if ($scope.hardware.id === -1) {
			angular.extend(values, {
				instance_type_name: data.hardwareName,
				cpu_num: data.cpu_num,
				memory_mb: data.memory_mb * 1024,
				system_gb: data.system_gb
			});
			angular.forEach([0, 1], function (i) {
				var disk = $scope.btndisks[i];
				if (i === 0) {
					values.local_gb = disk ? disk.local_gb : 0;
				} else {
					values['local_gb' + i] = disk ? disk.local_gb : 0;
				}
			});
		} else {
			values.instance_type = $scope.hardware.id;
		}
		return values;
	};

	$scope.showAdvanceSceneOptionDialog = function () {
		var _isxp = data.isxp;
		$modal.open({
			templateUrl: "views/vdi/dialog/system/system_deploy_advance_options.html",
			controller: "teachSceneOptionDialog",
			resolve: {
				isxp: function isxp() {
					return _isxp;
				},
				kwargs: function kwargs() {
					return data.kwargs;
				}
			}
		}).result.then(function (options) {
			data.kwargs = options;
		});
	};

	$scope.getMaxInstance = function () {
		init.quickstart(function (res) {
			data.max_instance = res.max_instance;
		});
	};

	$scope.$on("deploy:set", function (e, name, value) {
		data[name] = value;
		if (value === false && name === "max_instance") {
			$scope.getMaxInstance();
		}
	});
}])
// 高级 dialog
.controller("teachSceneOptionDialog", ["$scope", "$modalInstance", "$rootScope", "localize", "isxp", "kwargs", "PersonDesktop", function (scope, modalInstance, rootScope, localize, isxp, kwargs, PersonDesktop) {
	var defaults = {
		usb_redir: true,
		usb_version: isxp ? '2.0' : '3.0',
		rollback: '1',
		rollback_weekday: '1',
		rollback_monthday: '1',
		data_rollback: '1',
		data_rollback_weekday: '1',
		data_rollback_monthday: '1',
		hostname_type: '1',
		hostname_prefix: 'PC',
		hostname_beginwith: 1,
		username_type: '1',
		username_prefix: 'K',
		username_beginwith: 1,
		isxp: isxp,
		enable_share: false
	};
	var data = scope.data = angular.extend(defaults, kwargs || {});
	scope.loading_server = true;
	PersonDesktop.share_servers(function (res) {
		scope.loading_server = false;
		var servers = [];
		res.servers.forEach(function (server) {
			server.nets.forEach(function (net) {
				servers.push({ id: server.id, net: { ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id } });
			});
		});
		scope.share_servers = servers;
		scope.data.share_server = scope.share_servers[0];
	});

	scope.USBRedictTips = localize.localizeText("USBRedictTips");
	scope.auto_mountPersonalTips = localize.localizeText("auto_mountPersonalTips");
	data.RDP = kwargs.is_exam;
	if (kwargs.username_prefix) {
		data.MORE = true;
		angular.forEach(["username_prefix", "username_beginwith", "username_type"], function (s) {
			scope[s] = kwargs[s];
		});
	}
	if (kwargs.hostname_prefix) {
		angular.forEach(["hostname_beginwith", "hostname_prefix", "hostname_type"], function (s) {
			scope[s] = kwargs[s];
		});
	}
	angular.forEach({
		rollback_weekday: "2",
		rollback_monthday: "3"
	}, function (v, k) {
		if (kwargs.hasOwnProperty(k)) {
			scope.rollback = v;
			scope[k] = kwargs[k];
		}
	});
	angular.forEach({
		data_rollback_weekday: "2",
		data_rollback_monthday: "3"
	}, function (v, k) {
		if (kwargs.hasOwnProperty(k)) {
			scope.data_rollback = v;
			scope[k] = kwargs[k];
		}
	});
	scope.addZero = function (len, str_begin, str_end) {
		if (str_end && str_begin) {
			var end_len = str_end.toString().length;
			if (end_len < len) {
				return str_begin + new Array(len - end_len + 1).join("0") + str_end;
			} else {
				return str_begin + str_end;
			}
		}
	};

	scope.ok = function () {
		var postData = {};
		// 这里的 this 引用了真正的 scope
		postData.enable_share = data.enable_share, postData.share_server_ip = data.enable_share ? data.share_server.net.ip_address : undefined;
		postData.share_server_id = data.enable_share ? data.share_server.id : undefined;
		postData.usb_redir = data.usb_redir;
		postData.usb_version = data.usb_redir ? data.usb_version : null;
		postData.rollback = data.rollback;
		postData.data_rollback = data.data_rollback;
		if (postData.rollback === "2") {
			postData.rollback_weekday = data.rollback_weekday;
		}
		if (postData.rollback === "3") {
			postData.rollback_monthday = data.rollback_monthday;
		}
		if (postData.data_rollback === "2") {
			postData.data_rollback_weekday = data.data_rollback_weekday;
		}
		if (postData.data_rollback === "3") {
			postData.data_rollback_monthday = data.data_rollback_monthday;
		}

		angular.forEach(["hostname_beginwith", "hostname_prefix", "hostname_type"], function (s) {
			postData[s] = data[s];
		});
		postData.is_exam = !!data.RDP;
		if (data.MORE) {
			angular.forEach(["username_prefix", "username_beginwith", "username_type"], function (s) {
				postData[s] = data[s];
			});
		}
		rootScope.$broadcast("scene-options", postData);
		modalInstance.close(postData);
	};
	scope.close = function () {
		modalInstance.dismiss();
	};
}]).controller("importByServerController", ["$scope", "$timeout", "$modalInstance", "SystemDeploy", function ($scope, $timeout, $modalInstance, init) {
	var importedImgs = [];
	var self = this;
	self.selected = null;
	self.remote_imgs = [];
	self.loading = false;

	self.refreshImgs = function () {
		init.scan_iso(function (res) {
			var imgs = {};
			angular.forEach(self.remote_imgs, function (img) {
				imgs[img.path] = img;
			});
			angular.forEach(res.result, function (img) {
				if (imgs.hasOwnProperty(img.path)) {
					angular.extend(imgs[img.path], img);
				} else {
					self.remote_imgs.push(img);
				}
			});
		}).$promise.finally(function () {
			self.loading = false;
		});
		self.loading = true;
	};

	self.importSelected = function () {
		var img = self.selected;
		if (!img) {
			return;
		}
		init.import_iso({
			upload_type: 'local',
			src_file: [img.path]
		}, function (res) {
			loopImportProgress(angular.copy(img), function () {
				importedImgs.push(img);
				self.is_importing = false;
				img.imported = true;
				delete self.selected;
				self.close();
			}, function () {
				self.is_importing = false;
			});
		}, function () {
			self.is_importing = false;
		});
		self.is_importing = true;
	};

	self.close = function () {
		$modalInstance.close(importedImgs);
	};

	self.isAjaxOn = function () {
		return self.loading || self.is_importing;
	};

	self.showRemain = function () {
		var yes = self.is_importing;
		yes = yes && self.hasOwnProperty("remain");
		if (yes) {
			yes = self.remain.hasOwnProperty("hour");
		}
		return yes;
	};

	self.refreshImgs();

	function loopImportProgress(img, doneCallback, failCallback) {
		var time = self.remain = {};
		img.total = img.size;
		img.startTime = Date.now();
		var hasFeature = !!console.time;
		var label = "[upload " + img.path + "]";
		hasFeature && console.time(label);
		loop();
		function loop() {
			init.import_progress(function (res) {
				var filemap = {};
				angular.forEach(res.result, function (item) {
					if (item.filename === img.filename) {
						angular.extend(img, item);
					}
				});
				// 还没有开始导入，此时不显示数据
				if (img.size === 0) {
					$timeout(loop, 1000);
					return;
				}
				var remainSize = img.total - img.size;
				var speed = img.size / (Date.now() - img.startTime);
				var remainTime = Math.floor(remainSize / speed / 1000);
				time.hour = Math.floor(remainTime / 3600);
				time.minute = Math.floor(remainTime / 60);
				time.second = Math.floor(remainTime % 60);
				if (img.total === img.size) {
					hasFeature && console.timeEnd(label);
					doneCallback();
				} else {
					$timeout(loop, 1000);
				}
			}, failCallback);
		}
	}
}]).controller("quickstartController", ["$scope", "$element", "$location", function ($scope, $element, $location) {
	var menuWidth = 220;
	// 循环计时器
	var updateTimer;
	// 缓存的样式
	var oldContentStyles = {};
	var oldArrowStyles = {};
	// 是否需要手动点击快速部署父菜单的标记
	var opened = false;
	$scope.ok = function () {
		cleanDOM();
		$location.url("/system/deploy");
	};
	$scope.close = function () {
		cleanDOM();
		$location.url("/summary");
	};
	$scope.$on("NOAUTH", cleanDOM);

	updatePosition();

	function updatePosition() {
		var alignTarget = $("li[nav-title='快速部署']");
		if (alignTarget.length === 0) {
			updateTimer = setTimeout(updatePosition, 100);
			return;
		}
		// 高亮 快速部署 菜单项
		alignTarget.addClass("left-menu-item-on");
		// 如果父菜单没有展开，手动展开
		var pmenu = alignTarget.parents("li");
		if (!pmenu.hasClass("open") && !opened) {
			pmenu.children("a")[0].click();
			opened = true;
			setTimeout(function () {
				if (!pmenu.hasClass("opened")) {
					opened = false;
				}
			}, 300);
		}
		var targetOffset = alignTarget.offset();
		var totalWidth = $(window).width();
		var totalHeight = $(window).height();
		var $content = $("#quickMaskModel .content");
		var $arrow = $("#quickMaskModel .jiantou");
		if (!$content || !$arrow) {
			return;
		}
		// 水平垂直居中
		var contentStyles = {
			'margin-left': $content.outerWidth() / -2,
			'margin-top': $content.outerHeight() / -2
		};
		if (!equalsRoughly(contentStyles, oldContentStyles)) {
			$content.css(contentStyles);
			oldContentStyles = contentStyles;
		}
		$arrow[totalWidth < 979 ? 'hide' : 'show']();
		var btn = $content.find(".btn-primary");
		var btnOffset = btn.offset();
		var contentLeft = $content.offset().left;
		var arrowTop = btnOffset.top + btn.outerHeight() + 5;
		// var arrowRight = (btnOffset.left - contentLeft) / 2 + contentLeft;
		var arrowRight = btnOffset.left + btn.outerWidth() / 2;
		if (totalWidth > 1460) {
			arrowRight = $content.offset().left + parseInt($content.css("padding-left"));
		}
		var arrowWidth = arrowRight - menuWidth;
		var arrowHeight = targetOffset.top + alignTarget.outerHeight() / 2 - arrowTop;
		var arrowStyles = {
			left: menuWidth,
			top: arrowTop + 6,
			width: arrowWidth,
			height: arrowHeight > 0 ? arrowHeight : 0,
			"background-position-x": totalWidth > 1460 ? "right" : "left"
		};
		// 仅在计算的样式与之上一次计算的样式不同时才应用样式
		if (!equalsRoughly(arrowStyles, oldArrowStyles)) {
			$arrow.css(arrowStyles);
			oldArrowStyles = arrowStyles;
		}
		updateTimer = setTimeout(updatePosition, 100);
	}

	function cleanDOM() {
		$element.remove();
		$scope.$destroy();
		$("li[nav-title='快速部署']").removeClass("left-menu-item-on");
		clearTimeout(updateTimer);
	}

	function equalsRoughly(obj1, obj2) {
		var eq = true;
		var keys = Object.keys(obj1);
		angular.forEach(keys, function (key) {
			var v1 = obj1[key] || 0;
			var v2 = obj2[key] || 0;
			if (typeof v1 !== "number" || typeof v2 !== "number") {
				return;
			}
			if (Math.abs(v1 - v2) >= 5) {
				eq = false;
			}
		});
		return eq;
	}
}]).controller("vdiSystemUSBThroughController", ["$scope", "$modal", "USBPassThrough", function ($scope, $modal, USBPassThrough) {

	$scope.rows = [];
	$scope.loading = true;

	var get_rows = function get_rows() {
		USBPassThrough.query(function (res) {
			$scope.rows = res.devices_info.sort(function (a, b) {
				return a.manufacturer > b.manufacturer ? 1 : -1;
			});
			$scope.loading = false;
		});
	};
	get_rows();

	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;
	var _SCOPE = $scope;

	$scope.through = function (item) {
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/through_add.html",
			controller: "USBthroughDialog",
			scope: $scope,
			size: "md",
			resolve: {
				params: function params() {
					return { throughItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function (data) {
			if (data) {
				get_rows();
			}
		});
	};
	$scope.editThrough = function (item) {
		item.edit = true;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/through_add.html",
			controller: "USBthroughDialog",
			scope: $scope,
			size: "md",
			resolve: {
				params: function params() {
					return { throughItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function (data) {
			if (data) {
				get_rows();
			}
		});
	};
	$scope.cancelThrough = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='取消绑定'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='CANCEL_THROUGH'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$scope.loading = true;
					var data = {
						compute_node_id: item.compute_node_id,
						identify: item.identify,
						instance_id: item.instance_id
					};
					USBPassThrough.cancel(data, function (res) {
						get_rows();
						$modalInstance && $modalInstance.close();
					}).$promise.finally(function (res) {
						$scope.loading = false;
					});
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller('USBthroughDialog', ['$scope', "$modalInstance", "AutoSnapshot", "ResourcePool", "params", "Scene", "TeachDesktop", "FenTemplate", "$$$I18N", "TreeInstances", "USBPassThrough", function ($scope, $modalInstance, AutoSnapshot, ResourcePool, params, Scene, TeachDesktop, FenTemplate, $$$I18N, TreeInstances, USBPassThrough) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.data = params.throughItem;
	if (!$scope.data.edit) {
		$scope.data.type = null;
		$scope.data.scene_id = null;
	}
	var old_instance_id = $scope.data.instance_id;
	$scope.data.expandedNodes = [];
	$scope.all_users = [];
	$scope.selectedUsers = {};

	$scope.changeType = function (type, flag) {
		if (!flag) {
			$scope.data.scene_id = null;
			$scope.data.instance_id = null;
			$scope.data.selected_desktop = null;
		}
		if (type == '2') {
			getScenesDektop();
		} else if (type == '1') {
			getCommonDektop();
		} else {
			getSystemDektop();
		}
	};
	if ($scope.data.edit) {
		$scope.changeType($scope.data.type, true);
	}
	function getScenesDektop() {
		Scene.query(function (res) {
			$scope.scenes = res.modes.filter(function (item) {
				return item.virtual_type == 'kvm';
			});
			if ($scope.data.scene_id) {
				$scope.data.scene = $scope.scenes.filter(function (item) {
					return item.id == $scope.data.scene_id;
				})[0];
			} else {
				$scope.data.scene = $scope.scenes[0];
			}
			$scope.getTeaches($scope.data.scene);
		}, function () {});
	}
	$scope.getTeaches = function (scene) {
		if (scene) {
			$scope.teachLoading = true;
			TeachDesktop.query({ id: scene.id }, function (res) {
				$scope.teachLoading = false;
				$scope.teaches = res.result;
				if ($scope.data.instance_id) {
					$scope.data.teach = $scope.teaches.filter(function (item) {
						return item.instance_id == $scope.data.instance_id;
					})[0];
				} else {
					$scope.data.teach = $scope.teaches[0];
				}
			}, function () {
				$scope.teachLoading = false;
			});
		}
	};
	function getCommonDektop() {
		$scope.loadDesktops = true;
		TreeInstances.query({ resource_pool: $scope.data.resource_pool_uuid }, function (res) {
			var adminUsers = res.result.filter(function (u) {
				return u.type == 'admin' && u.desktop_num;
			});
			var adminDesktops = [];
			adminUsers.forEach(function (u) {
				u.desktops.forEach(function (desk) {
					adminDesktops.push(desk);
				});
			});
			var datas = [];
			if (getAdminNum(adminUsers)) {
				datas.push({ name: $$$I18N.get('管理用户关联桌面'), desktop_num: getAdminNum(adminUsers), desktops: adminDesktops });
			}
			res.result.forEach(function (item) {
				if (item.type == 'common' && item.desktop_num) {
					datas.push(item);
				} else if (item.type == 'domain' && item.desktop_num) {
					datas.push(item);
				} else {}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas), "children");
			if ($scope.data.instance_id) {
				$scope.data.selected_desktop = $scope.all_users.filter(function (d) {
					return d.desktop_id === $scope.data.instance_id;
				})[0];
			}
			$scope.loadDesktops = false;
		});
	}
	function getSystemDektop() {
		FenTemplate.query(function (res) {
			$scope.sys_desktops = res.win_images.concat(res.linux_images).concat(res.other_images);
			if ($scope.data.instance_id) {
				$scope.data.sys_desktop = $scope.sys_desktops.filter(function (item) {
					return item.id == $scope.data.instance_id;
				})[0];
			} else {
				$scope.data.sys_desktop = $scope.sys_desktops[0];
			}
			$scope.data.sys_desktop = $scope.sys_desktops[0];
		}, function () {});
	}

	/* 个人桌面数据拉取及配置 */
	$scope.desktopsTreeOptions = {
		dirSelectable: false,
		injectClasses: {
			"liSelected": "tree-leaf-active"
		}
	};
	function getAdminNum(rows) {
		return rows.reduce(function (count, item) {
			return count + item.desktop_num;
		}, 0);
	}
	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if (!node.dept_id) {
				return;
			}
			if (node.children) {
				node.children = node.children.filter(noUserFilter);
				node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
			if (node.dept_id && !node.children && node.desktops.length === 0) {
				return false;
			}
			return true;
		}
	}
	function formatData(d, name) {
		iteration(d, name);
		return d;
	}
	function iteration(data, childName, list) {
		for (var i = 0; i < data.length; i++) {
			$scope.data.expandedNodes.push(data[i]);
			if (data[i][childName] && data[i][childName].length) {
				var len = iteration(data[i][childName], childName);
				if (len === 0) {
					data[i] = undefined;
				}
			}
			if (!data[i]) {
				continue;
			}
			if (data[i].desktops && data[i].desktops.length > 0) {
				data[i].desktops.map(function (user) {
					user.name = user.name || user.user_name;
					user.id = user.id || user.desktop_id;
					user._is_last = true;
					$scope.all_users.push(user);
					return user;
				});
				data[i][childName] = data[i].desktops;
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
	/* 个人桌面数据拉取及配置---------------end */

	$scope.ok = function () {
		$scope.submiting = true;
		var instance_id = "";
		if (this.data.type == '2') {
			instance_id = this.data.teach.instance_id;
		} else if (this.data.type == '1') {
			instance_id = this.data.selected_desktop.desktop_id;
		} else {
			instance_id = this.data.sys_desktop.instance_id;
		}
		var data = {
			compute_node_id: this.data.compute_node_id,
			identify: this.data.identify,
			instance_id: instance_id,
			old_instance_id: this.data.edit ? old_instance_id : undefined
		};
		console.log(11111, data);
		USBPassThrough.save(data, function (res) {
			$scope.submiting = false;
			$modalInstance.close(res);
		}, function () {
			$scope.submiting = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller("vdiSystemAutoSnapshotController", ["$scope", "AutoSnapshot", "$modal", function ($scope, AutoSnapshot, $modal) {
	$scope.rows = [];
	$scope.loading = true;
	var get_rows = function get_rows() {
		AutoSnapshot.query(function (res) {
			$scope.rows = res.result.sort(function (a, b) {
				return a.name > b.name ? 1 : -1;
			});
			$scope.rows.forEach(function (item) {
				if (item.period == 'weekly') {
					item.date = 'weekly' + item.week_date;
				} else if (item.period == 'monthly') {
					item.date = 'monthly' + item.month_date;
				}
			});
			$scope.loading = false;
		});
	};
	get_rows();

	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;
	var _SCOPE = $scope;

	$scope.active = function (snapshot) {
		$scope.rows.forEach(function (item) {
			if (item.id == snapshot.id) {
				item.active_loadding = true;
			}
		});
		AutoSnapshot.active({ id: snapshot.id, active: !snapshot.active }, function (res) {
			get_rows();
			$scope.rows.forEach(function (item) {
				if (item.id == snapshot.id) {
					item.active = !snapshot.active;
					item.active_loadding = false;
				}
			});
		}, function (err) {
			get_rows();
			$scope.rows.forEach(function (item) {
				if (item.id == snapshot.id) {
					item.active = snapshot.active;
					item.active_loadding = false;
				}
			});
		});
	};
	$scope.add = function () {
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_add.html",
			controller: "addSnapshotDialog",
			size: "md"
		});
		dialog.result.then(function (res) {
			if (res) {
				get_rows();
			}
		});
	};
	$scope.edit = function (item) {
		item.edit = true;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_edit.html",
			controller: "editSnapshotDialog",
			scope: $scope,
			size: "md",
			resolve: {
				params: function params() {
					return { snapshotItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function (data) {
			if (data) {
				get_rows();
			}
		});
	};
	$scope.view = function (item) {
		item.edit = false;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_edit.html",
			controller: "editSnapshotDialog",
			scope: $scope,
			size: "md",
			resolve: {
				params: function params() {
					return { snapshotItem: angular.copy(item) };
				}
			}
		});
	};
	$scope.delete = function (item) {
		var selected_rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除自动快照策略'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_AUTO_SNAPSHOT'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					$scope.loading = true;
					AutoSnapshot.delete({ ids: selected_rows.map(function (row) {
							return row.id;
						}) }, function (res) {
						get_rows();
						$modalInstance && $modalInstance.close();
					}).$promise.finally(function (res) {
						$scope.loading = false;
					});
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller('addSnapshotDialog', ['$scope', "$modalInstance", "AutoSnapshot", "ResourcePool", "$$$I18N", "TreeInstances", function ($scope, $modalInstance, AutoSnapshot, ResourcePool, $$$I18N, TreeInstances) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;

	$scope.data = { expandedNodes: [] };

	ResourcePool.query(function (res) {
		// $scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.resources = res.result;
		$scope.data.resource = $scope.resources[0];
		$scope.data.resource && $scope.queryTreeInstances($scope.data.resource);
	});

	/* 个人桌面数据拉取及配置 */
	$scope.selectedUsers = {};
	function getAdminNum(rows) {
		return rows.reduce(function (count, item) {
			return count + item.desktop_num;
		}, 0);
	}

	$scope.queryTreeInstances = function (resource) {
		$scope.loadDesktops = true;
		TreeInstances.query({ resource_pool: resource.id, need_rollback_desktops: 0 }, function (res) {
			var adminUsers = res.result.filter(function (u) {
				return u.type == 'admin' && u.desktop_num;
			});
			var adminDesktops = [];
			adminUsers.forEach(function (u) {
				u.desktops.forEach(function (desk) {
					adminDesktops.push(desk);
				});
			});
			var datas = [];
			if (getAdminNum(adminUsers)) {
				datas.push({ name: $$$I18N.get('管理用户关联桌面'), desktop_num: getAdminNum(adminUsers), desktops: adminDesktops });
			}
			res.result.forEach(function (item) {
				if (item.type == 'common' && item.desktop_num) {
					datas.push(item);
				} else if (item.type == 'domain' && item.desktop_num) {
					datas.push(item);
				} else {}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas), "children");
			$scope.loadDesktops = false;
			console.log(1111111, $scope.data.expandedNodes);
		});
	};

	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if (!node.dept_id) {
				return;
			}
			if (node.children) {
				node.children = node.children.filter(noUserFilter);
				node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
			if (node.dept_id && !node.children && node.desktops.length === 0) {
				return false;
			}
			return true;
		}
	}
	function formatData(d, name) {
		iteration(d, name);
		return d;
	}

	function iteration(data, childName, list) {
		for (var i = 0; i < data.length; i++) {
			$scope.data.expandedNodes.push(data[i]);
			if (data[i][childName] && data[i][childName].length) {
				var len = iteration(data[i][childName], childName);
				if (len === 0) {
					data[i] = undefined;
				}
			}
			if (!data[i]) {
				continue;
			}
			if (data[i].desktops && data[i].desktops.length > 0) {
				data[i].desktops.map(function (user) {
					user.name = user.name || user.user_name;
					user._is_last = true;
					return user;
				});
				data[i][childName] = data[i].desktops;
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

	function recursionNode(obj, selected, name) {
		if (obj[name]) {
			obj[name].forEach(function (item) {
				item._selected = selected;
				recursionNode(item, selected, name);
			});
		}
	}

	function calculateSelectedLeafs(node, cName, leafs) {
		// 计算每一次点击有多少用户被选中
		var _id = node.id || node.desktop_id;
		if (node[cName] && node[cName].length) {
			node[cName].forEach(function (n) {
				calculateSelectedLeafs(n, cName, leafs);
			});
		} else {
			node._selected ? $scope.selectedUsers[_id] = node : delete $scope.selectedUsers[_id];
		}
	}

	$scope.showManageSelected = function (node, selected, $parentNode, $index, $first, $middle, $last, $odd, $even, $path, nodeChildren) {
		var childName = nodeChildren || "children";
		node._selected = !node._selected;
		recursionNode(node, node._selected, childName);
		calculateSelectedLeafs(node, childName, $scope.selectedUsers);
		$path().forEach(function (item, index) {
			if (index !== 0) {
				var _selectedNum = item[childName].filter(function (item) {
					return item._selected == true;
				}).length;
				var _middSelectedNum = item[childName].filter(function (item) {
					return item._selected == 'middle';
				}).length;
				if (!_selectedNum) {
					item._selected = false;
				}
				if (_selectedNum == item[childName].length) {
					item._selected = true;
				}
				if (_middSelectedNum || _selectedNum && _selectedNum !== item[childName].length) {
					item._selected = 'middle';
				}
			}
		});
	};

	$scope.selectedUsersNums = function () {
		return Object.keys($scope.selectedUsers).length;
	};
	$scope.ok = function () {
		$scope.submiting = true;
		var data = {
			name: this.data.name,
			description: this.data.description,
			resource_pool: this.data.resource.uuid,
			period: this.data.period,
			week_date: this.data.period == 'weekly' ? this.data.week_date : undefined,
			month_date: this.data.period == 'monthly' ? this.data.month_date : undefined,
			instances: Object.keys($scope.selectedUsers)
		};
		AutoSnapshot.save(data, function (res) {
			$scope.submiting = false;
			$modalInstance.close(res);
		}, function () {
			$scope.submiting = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller('editSnapshotDialog', ['$scope', "$modalInstance", "AutoSnapshot", "ResourcePool", "$$$I18N", "TreeInstances", "params", function ($scope, $modalInstance, AutoSnapshot, ResourcePool, $$$I18N, TreeInstances, params) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.data = params.snapshotItem;
	$scope.data.expandedNodes = [];
	$scope.all_desktops = [];

	ResourcePool.query(function (res) {
		// $scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.resources = res.result;
		$scope.data.resource = $scope.resources.filter(function (item) {
			return item.uuid == $scope.data.resource_pool;
		})[0];
		$scope.data.resource && $scope.queryTreeInstances($scope.data.resource);
	});
	$scope.initPeriod = function (period) {
		if (period == 'weekly') {
			$scope.data.week_date = '1';
		} else if (period == 'monthly') {
			$scope.data.month_date = '1';
		}
	};
	/* 个人桌面数据拉取及配置 */
	$scope.selectedUsers = {};
	if ($scope.data.edit) {
		$scope.desktopTreeOptions = {
			isSelectable: function isSelectable(node) {
				return true;
			}
		};
	} else {
		$scope.desktopTreeOptions = {
			isSelectable: function isSelectable(node) {
				return false;
			}
		};
	}
	function getAdminNum(rows) {
		return rows.reduce(function (count, item) {
			return count + item.desktop_num;
		}, 0);
	}

	$scope.queryTreeInstances = function (resource) {
		$scope.loadDesktops = true;
		TreeInstances.query({ resource_pool: resource.id, need_rollback_desktops: 0 }, function (res) {
			var adminUsers = res.result.filter(function (u) {
				return u.type == 'admin' && u.desktop_num;
			});
			var adminDesktops = [];
			adminUsers.forEach(function (u) {
				u.desktops.forEach(function (desk) {
					adminDesktops.push(desk);
				});
			});
			var datas = [];
			if (getAdminNum(adminUsers)) {
				datas.push({ name: $$$I18N.get('管理用户关联桌面'), desktop_num: getAdminNum(adminUsers), desktops: adminDesktops });
			}
			res.result.forEach(function (item) {
				if (item.type == 'common' && item.desktop_num) {
					datas.push(item);
				} else if (item.type == 'domain' && item.desktop_num) {
					datas.push(item);
				} else {}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas), "children");
			$scope.all_desktops.forEach(function (item) {
				$scope.data.instances.forEach(function (instance) {
					if (instance.instance_id == item.desktop_id) {
						item._selected = true;
						$scope.selectedUsers[item.desktop_id] = item;
					}
				});
			});
			checkNodeSelected($scope.desktops);
			$scope.loadDesktops = false;
		});
	};

	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if (!node.dept_id) {
				return;
			}
			if (node.children) {
				node.children = node.children.filter(noUserFilter);
				node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
			if (node.dept_id && !node.children && node.desktops.length === 0) {
				return false;
			}
			return true;
		}
	}
	function formatData(d, name) {
		iteration(d, name);
		return d;
	}
	function checkNodeSelected(arr) {
		arr.forEach(function (node) {
			if (node.children) {
				checkNodeSelected(node.children);
				var isAllSelected = true;
				var hasSelected = false;
				var hasMiddle = false;
				node.children.forEach(function (subNode) {
					if (subNode._selected == 'middle') {
						hasMiddle = true;
						isAllSelected = false;
						return;
					}
					if (subNode._selected) {
						hasSelected = true;
					}
					isAllSelected = isAllSelected && subNode._selected;
				});
				if (isAllSelected) {
					node._selected = true;
				} else if (hasMiddle) {
					node._selected = "middle";
				} else if (hasSelected) {
					node._selected = "middle";
				}
			}
		});
		return arr;
	}
	function iteration(data, childName, list) {
		for (var i = 0; i < data.length; i++) {
			$scope.data.expandedNodes.push(data[i]);
			if (data[i][childName] && data[i][childName].length) {
				var len = iteration(data[i][childName], childName);
				if (len === 0) {
					data[i] = undefined;
				}
			}
			if (!data[i]) {
				continue;
			}
			if (data[i].desktops && data[i].desktops.length > 0) {
				data[i].desktops.map(function (user) {
					user.name = user.name || user.user_name;
					user.id = user.id || user.desktop_id;
					user._is_last = true;
					$scope.all_desktops.push(user);
					return user;
				});
				data[i][childName] = data[i].desktops;
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
	function recursionNode(obj, selected, name) {
		if (obj[name]) {
			obj[name].forEach(function (item) {
				item._selected = selected;
				recursionNode(item, selected, name);
			});
		}
	}
	function calculateSelectedLeafs(node, cName, leafs) {
		// 计算每一次点击有多少用户被选中
		var _id = node.id || node.desktop_id;
		if (node[cName] && node[cName].length) {
			node[cName].forEach(function (n) {
				calculateSelectedLeafs(n, cName, leafs);
			});
		} else {
			node._selected ? $scope.selectedUsers[_id] = node : delete $scope.selectedUsers[_id];
		}
	}
	$scope.showManageSelected = function (node, selected, $parentNode, $index, $first, $middle, $last, $odd, $even, $path, nodeChildren) {
		var childName = nodeChildren || "children";
		node._selected = !node._selected;
		recursionNode(node, node._selected, childName);
		calculateSelectedLeafs(node, childName, $scope.selectedUsers);
		$path().forEach(function (item, index) {
			if (index !== 0) {
				var _selectedNum = item[childName].filter(function (item) {
					return item._selected == true;
				}).length;
				var _middSelectedNum = item[childName].filter(function (item) {
					return item._selected == 'middle';
				}).length;
				if (!_selectedNum) {
					item._selected = false;
				}
				if (_selectedNum == item[childName].length) {
					item._selected = true;
				}
				if (_middSelectedNum || _selectedNum && _selectedNum !== item[childName].length) {
					item._selected = 'middle';
				}
			}
		});
	};

	$scope.selectedUsersNums = function () {
		return Object.keys($scope.selectedUsers).length;
	};
	$scope.ok = function () {
		$scope.submiting = true;
		var data = {
			id: this.data.id,
			name: this.data.name,
			description: this.data.description,
			resource_pool: this.data.resource.uuid,
			period: this.data.period,
			week_date: this.data.period == 'weekly' ? this.data.week_date : undefined,
			month_date: this.data.period == 'monthly' ? this.data.month_date : undefined,
			instances: Object.keys($scope.selectedUsers)
		};
		AutoSnapshot.update(data, function (res) {
			$scope.submiting = false;
			$modalInstance.close(res);
		}, function () {
			$scope.submiting = false;
		});
	};
	$scope.close = function () {
		$modalInstance.dismiss();
	};
}]).controller("spiceConnectController", ["$scope", "$modal", "$$$I18N", "Spice", function ($scope, $modal, $$$I18N, Spice) {
	var spiceCtrl = this;
	spiceCtrl.getSpiceConnect = function () {
		spiceCtrl.loading = true;
		Spice.query(function (res) {
			spiceCtrl.mode = res.spice_jpeg_compression;
			spiceCtrl.loading = false;
		}, function (error) {
			spiceCtrl.loading = false;
		});
	};
	spiceCtrl.getSpiceConnect();
	spiceCtrl.saveSpiceConnect = function () {
		spiceCtrl.save = true;
		Spice.save({ spice_jpeg_compression: spiceCtrl.mode }, function (res) {
			spiceCtrl.save = false;
			spiceCtrl.getSpiceConnect();
			spiceCtrl.edit = false;
		}, function (error) {
			spiceCtrl.save = false;
		});
	};
}]).controller("vdiSystemAutoclearController", ["$scope", "$modal", "$$$I18N", "Share", function ($scope, $modal, $$$I18N, Share) {
	var clearCtrl = this;
	clearCtrl.getClearTime = function () {
		clearCtrl.loading = true;
		Share.query(function (res) {
			clearCtrl.day = res.value.day;
			var time = res.value.time.split(":");
			clearCtrl.hours = time[0];
			clearCtrl.minutes = time[1];
			clearCtrl.seconds = time[2];
			clearCtrl.loading = false;
		}, function (error) {
			clearCtrl.loading = false;
		});
	};
	clearCtrl.getClearTime();
	clearCtrl.saveClearTime = function () {
		if (clearCtrl.hours.length == 1 && Number(clearCtrl.hours) >= 0 && Number(clearCtrl.hours) <= 9) {
			clearCtrl.hours = "0" + clearCtrl.hours;
		}
		if (clearCtrl.minutes.length == 1 && Number(clearCtrl.minutes) >= 0 && Number(clearCtrl.minutes) <= 9) {
			clearCtrl.minutes = "0" + clearCtrl.minutes;
		}
		if (clearCtrl.seconds.length == 1 && Number(clearCtrl.seconds) >= 0 && Number(clearCtrl.seconds) <= 9) {
			clearCtrl.seconds = "0" + clearCtrl.seconds;
		}
		var time = clearCtrl.hours + ":" + clearCtrl.minutes + ":" + clearCtrl.seconds;
		clearCtrl.save = true;
		Share.save({ value: { day: clearCtrl.day, time: time } }, function (res) {
			clearCtrl.save = false;
			clearCtrl.getClearTime();
			clearCtrl.edit = false;
		}, function (error) {
			clearCtrl.save = false;
		});
	};
}]);

/***/ }),

/***/ 176:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
__webpack_require__(4);
__webpack_require__(3);
__webpack_require__(5);
__webpack_require__(11);
__webpack_require__(12);
__webpack_require__(10);
__webpack_require__(6);
__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(9);
__webpack_require__(36);
module.exports = __webpack_require__(177);


/***/ }),

/***/ 177:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $instance_id;
angular.module("vdi.spice", ["app.controllers", "app.localize", "ngResource", "ui.bootstrap", "vdi", "vdi.desktop", "vdi.template", "vdi.template.teach", "vdi.template.person", "vdi.template.hardware", "vdi.system", "vdi.user"]).factory('$$base64encode', function () {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return function base64encodePwd(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
            out += base64EncodeChars.charAt((c2 & 0xF) << 2 | (c3 & 0xC0) >> 6);
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    };
}).controller("isoListController", ["$scope", "$modalInstance", "SystemISO", "VNC", function ($scope, $modalInstance, isos, vnc) {
    $scope.isos = [];
    isos.get(function (data) {
        // console.log(data);
        $scope.isos = data.isos;
        $scope.selectIsos = {
            'package': [],
            'other': [],
            'system': []
        };
        $scope.isos_package = data.isos.filter(function (item) {
            return item.type == 'package';
        });
        angular.forEach(data.isos, function (item) {
            if (item['type'] == 'package') {
                $scope.selectIsos['package'].push(item);
            } else if (item['type'] == 'other') {
                $scope.selectIsos['other'].push(item);
            } else {
                $scope.selectIsos['system'].push(item);
            }
        });
    });

    $scope.ok = function (iso) {
        /*  thor/image/loadISO post instance_id iso_name */
        console.log($scope, iso);

        vnc.loadISO({
            instance_id: $instance_id,
            id: iso ? iso.id : "-1"
        }, function () {
            $modalInstance.close();
        }, function (err) {
            //alert(err);
        });
    };
    $scope.close = function () {
        $modalInstance.close();
    };
}]).controller("updateTemplateController", ["$scope", "$modalInstance", "SystemISO", function ($scope, $modalInstance, isos) {
    $scope.isos = [];
    isos.get(function (data) {
        $scope.isos = data.isos;
    });

    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.close = function () {
        $modalInstance.close();
    };
}]).controller("spiceBtController", ["$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "$$$os_types", "$$$I18N", "$$$var_constant", "$$base64encode", function ($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, $$$os_types, $$$I18N, $$$var_constant, $$base64encode) {
    var it = $scope;
    var flag = false;
    var oldBigBox = $.bigBox;
    var iframe = document.getElementById("webSpice");
    iframe.onload = function () {
        $scope.CAD = function () {
            iframe.contentWindow.clientAgent.sendCtrlAltDel();
        };
    };
    //密码错误事件
    jQuery(window).on("passwordError", function () {
        console.log('password invalid tips');
        iframe.contentWindow.location.reload();
    });
    //token过期事件
    // jQuery(window).on("tokenError",function(){
    //     //token错误
    //     console.log('token outtime');
    //     iframe.contentWindow.location.reload();
    // });
    jQuery(window).on("socketClose", function () {
        //socket断开处理
        console.log('socketClose');
        iframe.contentWindow.location.reload();
        jQuery('#noVNC_status').html('socket closed');
    });
    //监听5个socket是否全部完成连接，超过5s未完成则刷新页面
    var socketCount = 0;
    jQuery(window).on("socketConnect", function () {
        socketCount++;
        console.log('webSpice连接通道' + socketCount);
        if (socketCount == 1) {
            $timeout(function () {
                if (socketCount < 5) {
                    console.log("webSpice连接中断，请刷新页面重连");
                    iframe.contentWindow.location.reload();
                }
            }, 5000);
        }
    });

    function setIframeParams(host, port, token, password) {
        var p = port || 6082;
        iframe.src = "vdi-client/index.html?host=" + host + "&port=" + p + "&token=" + token + "&password=" + $$base64encode(password);
        setTimeout(function () {
            iframe.contentWindow.location.reload();
        }, 32000);
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
    function getStatus() {
        $timeout(function () {
            personTemplate.status({ id: $$$var_constant.$id }, function (res) {
                $scope.saveDisabled = res.status === "installed" || res.status === "alive" || res.status === "update failed" ? true : false;
                $scope.undoDisabled = res.status === "alive" ? true : false;
                getStatus();
            });
        }, 3000);
    }

    function getTemplateInfo() {
        $timeout(function () {
            if (!flag) {
                template.spiceConnectInfo({ instance_id: $instance_id }, function (res) {
                    flag = true;
                    var data = res.instance.connect;
                    $scope.is_template = res.instance.image.is_template;
                    $scope.os_type = res.instance.os_type;
                    $scope.image_name = res.instance.image.name;
                    $scope.instance_count = res.instance.image.instance_count;
                    $scope.instance_id = res.instance.uuid;
                    getStatus();
                    //端口是固定6082还是由后台提供有待后台确认，暂取固定端口6082；
                    setIframeParams(data.host, 6082, data.token, data.password);
                    jQuery('#noVNC_status').html('connecting');
                    $.bigBox = oldBigBox;
                }, function () {
                    getTemplateInfo();
                });
            }
        }, 3000);
    }
    getTemplateInfo();
    $scope.start = function () {
        template.virtualStatus({ id: $instance_id }, function (res) {
            if (res.run_status !== "ACTIVE") {
                vm.start({ instance_ids: [$scope.instance_id] }, function () {
                    function _loop() {
                        template.spiceConnectInfo({ instance_id: $instance_id }, function (res) {
                            setIframeParams(res.vnc_host, 6082, res.vnc_token, res.passwd);
                            jQuery('#noVNC_status').html('connecting');
                            setTimeout(function () {
                                console.log(res.run_status);
                                if (res.run_status !== "ACTIVE") {
                                    _loop();
                                }
                            }, 1000);
                        }, function () {});
                    }
                    _loop();
                });
            } else {
                alert("System has been in the boot state");
            }
        });
    };
    $scope.shutdown = function () {
        var instance_id = $scope.instance_id;
        template.virtualStatus({ id: $instance_id }, function (res) {
            if (res.run_status === "ACTIVE") {
                $modal.open({
                    template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENTMODIFY_SHUT'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller: function controller($scope, $modalInstance) {
                        $scope.ok = function () {
                            vm.shutdowns({ instance_ids: [instance_id] }, function () {
                                $modalInstance.close();
                            }, function () {});
                        }, $scope.close = function () {
                            $modalInstance.close();
                        };
                    },
                    size: "sm"
                });
            } else {
                alert("System has been in the under off state");
            }
        });
    };
    var p_scope = $scope;
    $scope.save = function () {
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='保存'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEMP_SAVE_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
            controller: function controller($scope, $modalInstance) {
                $scope.ok = function () {
                    console.log(p_scope.is_template);
                    if (p_scope.is_template) {
                        template.bt_save_template({
                            image_id: p_scope.image_id
                        }, function (res) {
                            $modalInstance.close();
                        });
                    } else {
                        desktop.saveAsTemplate({
                            instance_id: p_scope.instance_id,
                            instance_type: p_scope.instance_type,
                            os_type: p_scope.os_type,
                            name: p_scope.image_name,
                            type_code: p_scope.type_code,
                            owner: p_scope.owner
                        }, function (res) {
                            $modalInstance.close();
                        });
                    }
                };
                $scope.close = function () {
                    $modalInstance.close();
                };
            },
            size: "sm"
        });
    };
    $scope.undo = function () {
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='撤销本次'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEMP_UNDO_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
            controller: function controller($scope, $modalInstance) {
                $scope.ok = function () {
                    template.bt_prev_save_template({
                        image_id: p_scope.image_id
                    }, function (res) {
                        $modalInstance.close();
                    });
                };
                $scope.close = function () {
                    $modalInstance.close();
                };
            },
            size: "sm"
        });
    };

    $scope.expand = function () {
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='扩容模板C盘'>" + "</h4></div><div class='modal-body'><form class='form-horizontal' name='expendTemplate' ng-submit='expendTemplate.$valid' novalidate>" + "<div >" + "<label class='col-xs-4 control-label required' for='expand' data-localize='扩容大小'></label>" + "<div class='col-xs-4'>" + "<input class='form-control' id='expand' type='text'" + "name='expand'" + "required " + "data-ng-model='expand'" + "placeholder='1-10'" + "data-ng-pattern='/^\s*([1-9]|10)\s*$/'" + "data-ng-trim='false'" + ">" + "</div><span class='col-xs-2' style='margin-top: 9px;padding-left: 0;'>GB</span>" + "</div><br><footer class='text-right' style='margin-top: 40px;'><button class='btn btn-primary' data-ng-disabled='expendTemplate.$invalid'  data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
            controller: function controller($scope, $modalInstance) {
                $scope.ok = function () {
                    vm.undo({ instance_ids: [$scope.instance_id] }, function (res) {
                        $modalInstance.close();
                    });
                };
                $scope.close = function () {
                    location.reload();
                    $modalInstance.close();
                    init_params(it.passwd, it.instance_id);
                };
            },
            size: "sm"
        });
    };

    $scope.loadISO = function () {
        $modal.open({
            templateUrl: "/select-iso.html",
            controller: "isoListController",
            size: "md"
        });
    };
}]).constant('$$$var_constant', function () {
    var $hashstr = location.hash.substr(1) || "";
    var $hash = $hashstr.replace(/^\/+/, "").split("&");
    var $id = parseInt($hash[0].split('=')[1]);
    var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
    var $name = $hash[2] ? decodeURIComponent($hash[2].split('=')[1]) : '';
    var $is_personalTemp = $hashstr.indexOf('personal') >= 0 ? true : false;
    var $is_systemTemp = $hashstr.indexOf('sytem_desktop') >= 0 ? true : false;
    var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
    $instance_id = $hash[3] ? $hash[3].split('=')[1] : '';
    return {
        $hashstr: $hashstr,
        $hash: $hash,
        $id: $id,
        $is_windows: $is_windows,
        $name: $name,
        $is_personalTemp: $is_personalTemp,
        $is_systemTemp: $is_systemTemp,
        $sameIp: $sameIp,
        $instance_id: $instance_id
    };
}()).run(["$rootScope", "settings", "localize", function ($rootScope, settings, localize) {
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function (lang) {
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;

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

/***/ 36:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2] ? decodeURIComponent($hash[2]) : '';
var $is_personalTemp = $hash[3] == "personal" ? true : false;
var $is_systemTemp = $hash[3] == "sytem_desktop" ? true : false;
var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
angular.module("vdi.vnc", ["app.controllers", "app.localize", "ngResource", "ui.bootstrap", "vdi", "vdi.desktop", "vdi.template", "vdi.template.teach", "vdi.template.person", "vdi.template.hardware", "vdi.system", "vdi.user"]).config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]).controller("isoListController", ["$scope", "$modalInstance", "SystemISO", "VNC", function ($scope, $modalInstance, isos, vnc) {
    $scope.isos = [];
    isos.get(function (data) {
        // console.log(data);
        $scope.isos = data.isos;
        $scope.selectIsos = {
            'package': [],
            'other': [],
            'system': []
        };
        $scope.isos_package = data.isos.filter(function (item) {
            return item.type == 'package';
        });
        angular.forEach(data.isos, function (item) {
            if (item['type'] == 'package') {
                $scope.selectIsos['package'].push(item);
            } else if (item['type'] == 'other') {
                $scope.selectIsos['other'].push(item);
            } else {
                $scope.selectIsos['system'].push(item);
            }
        });
    });

    $scope.ok = function (iso) {
        /*  thor/image/loadISO post instance_id iso_name */
        console.log($scope, iso);

        vnc.loadISO({
            instance_id: $instance_id,
            id: iso ? iso.id : "-1"
        }, function () {
            $modalInstance.close();
        }, function (err) {
            //alert(err);
        });
    };
    $scope.close = function () {
        $modalInstance.close();
    };
}]).controller("updateTemplateController", ["$scope", "$modalInstance", "SystemISO", function ($scope, $modalInstance, isos) {
    $scope.isos = [];
    isos.get(function (data) {
        $scope.isos = data.isos;
    });

    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.close = function () {
        $modalInstance.close();
    };
}]).controller("vncController", ["$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "Scene", "$$$os_types", "UserRole", "$$$I18N", function ($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, scen, $$$os_types, UserRole, $$$I18N) {
    var rfb;
    var it = $scope;
    //不同网卡上不能存在相同网段的IP提示框
    function duplicatedIp() {
        if ($sameIp) {
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content: $$$I18N.get("不同网卡上不能存在相同网段的IP"),
                timeout: 6000
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
    function init_params(password, instance_id, vnc_host, vnc_token) {
        var host, port, path, token;
        host = WebUtil.getQueryVar('host', vnc_host); // vnc_host
        port = WebUtil.getQueryVar('port', 6080);
        password = WebUtil.getQueryVar('password', password);
        //path = WebUtil.getQueryVar('path', 'websockify?instance_id=' + instance_id);
        token = WebUtil.getQueryVar('token', null);
        if (token) {
            WebUtil.createCookie('token', token, 1);
        }
        path = WebUtil.getQueryVar('path', 'websockify?token=' + vnc_token);

        rfb = new RFB({ 'target': $D('noVNC_canvas'),
            'encrypt': WebUtil.getQueryVar('encrypt', window.location.protocol === "https:"),
            'repeaterID': WebUtil.getQueryVar('repeaterID', ''),
            'true_color': WebUtil.getQueryVar('true_color', true),
            'local_cursor': WebUtil.getQueryVar('cursor', true),
            'shared': WebUtil.getQueryVar('shared', false),
            'view_only': WebUtil.getQueryVar('view_only', false),
            'onUpdateState': updateState,
            // 'onXvpInit':    xvpInit,
            'onPasswordRequired': passwordRequired });

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
        var s, sb, cad, level, save_as_temp, load_iso;
        s = $D('noVNC_status');
        sb = $D('noVNC_status_bar');
        cad = $D('sendCtrlAltDelButton');
        save_as_temp = $D('save_as_template');
        load_iso = $D('load_iso');
        switch (state) {
            case 'failed':
                level = "error";break;
            case 'fatal':
                level = "error";break;
            case 'normal':
                level = "normal";break;
            case 'disconnected':
                level = "normal";break;
            case 'loaded':
                level = "normal";break;
            default:
                level = "warn";break;
        }

        if (typeof msg !== 'undefined') {
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

    function getStatus() {
        $timeout(function () {
            personTemplate.status({ id: $id }, function (res) {
                $scope.installed = res.status === "installed" || res.status === "alive" ? true : false;
                $scope.making_installed = res.status === "making" || res.status === "installed" ? true : false;
                getStatus();
            }, function () {});
        }, 3000);
    }

    var flag = false;
    var oldBigBox = $.bigBox;
    $.bigBox = null;
    function checkLoad() {
        $timeout(function () {
            if (!flag) {
                template.update({ id: $id }, function (res) {
                    flag = true;
                    $scope.is_template = res.is_template;
                    $scope.instance_id = res.instance_id;
                    $scope.os_type = res.os_type;
                    $instance_id = res.instance_id;
                    $scope.passwd = res.passwd;
                    $scope.vnc_host = res.vnc_host;
                    $scope.image_name = res.image_name;
                    $scope.instance_count = res.instance_count;
                    init_params(res.passwd, res.instance_id, res.vnc_host, res.vnc_token);
                    getStatus();
                    $.bigBox = oldBigBox;
                }, function () {
                    checkLoad();
                });
            }
        }, 3000);
    }
    checkLoad();

    $scope.status = function () {
        console.log(5555, rfb);
        return rfb ? rfb._rfb_state : "";
    };
    $scope.start = function () {

        if ($scope.status() !== "normal") {
            vm.start({ instance_ids: [$scope.instance_id] }, function () {
                function _loop() {
                    template.get_image_vnc_info({ instance_id: $instance_id }, function (res) {
                        init_params(res.result.password, $scope.instance_id, $scope.vnc_host, res.result.token);
                        setTimeout(function () {
                            console.log($scope.status());
                            if ($scope.status() !== "normal") {
                                _loop();
                            }
                        }, 1000);
                    }, function () {
                        alert("start error");
                    });
                }
                _loop();
            });
        } else {
            alert("System has been in the boot state");
        }
    };
    $scope.shutdown = function () {
        var instance_id = $scope.instance_id;
        if ($scope.status() === "normal") {
            $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENTMODIFY_SHUT'></p><footer class='text-right'><img data-ng-if='loading' src='./img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller: function controller($scope, $modalInstance) {
                    $scope.ok = function () {
                        $scope.loading = true;
                        vm.shutdowns({ instance_ids: [instance_id] }, function () {
                            $scope.loading = false;
                            $modalInstance.close();
                        }, function () {
                            $scope.loading = false;alert("shutdown error");
                        });
                    }, $scope.close = function () {
                        $modalInstance.close();
                    };
                },
                size: "sm"
            });
        } else {
            alert("System has been in the under off state");
        }
    };
    $scope.CAD = function () {
        rfb.sendCtrlAltDel();
    };
    $scope.updateTemplate = function (is_sys) {
        var instance_id = $scope.instance_id;
        var image_name = $scope.image_name;
        var is_personalTemp = $scope.is_personalTemp;
        var instance_count = $scope.instance_count;
        /*4.5.0添加模板更新提示*/
        var is_update = false;
        template.update_tpl_tip(function (res) {
            var resp = res.result;
            if (resp.storage_type !== "remote" && resp.ha_mode === "active_passive") {
                is_update = true;
            }
        });
        if (is_update) {
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content: $$$I18N.get("HA_MODE_REMOTE"),
                timeout: 6000
            });
            return false;
        }
        if (!is_sys && $scope.is_template) {
            $modal.open({
                templateUrl: "views/vdi/dialog/template/template_update.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function ($scope, $modalInstance) {
                    $scope.hasSchool = false;
                    $scope.is_personalTemp = is_personalTemp;
                    $scope.instance_count = instance_count;
                    if ($scope.is_personalTemp) {
                        desktop.update_instance({ id: $id }, function (res) {
                            $scope.instance = res.values;
                        });
                    } else {
                        scen.query(function (res) {
                            var schools = [];$scope.schools = [];
                            res.modes.filter(function (item) {
                                if (item.image_name === image_name) return item;
                            }).forEach(function (item) {
                                if (!schools[item.schoolroom]) {
                                    schools[item.schoolroom] = { name: item.schoolroom, modes: [item] };
                                    $scope.schools.push({ name: item.schoolroom, modes: [item] });
                                } else {
                                    schools[item.schoolroom].modes.push(item);
                                    $scope.schools.forEach(function (sch) {
                                        if (sch.name == item.schoolroom) {
                                            sch.modes.push(item);
                                        }
                                    });
                                }
                            });
                            if ($scope.schools.length) {
                                $scope.hasSchool = true;
                            }
                        });
                    }
                    $scope.ok = function () {
                        $scope.loading = true;
                        vnc.save({
                            instance_id: instance_id,
                            image_id: $id
                        }, function () {
                            $scope.loading = false;
                            $D('noVNC_status').innerHTML = "Update directive has been sent";
                            rfb.disconnect();
                            $modalInstance.close();
                            window.close();
                        }, function () {
                            $scope.loading = false;
                            rfb.disconnect();
                            $modalInstance.close();
                            $D('noVNC_status').innerHTML = "Update failed";
                            // window.close();
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                    };
                }]
            });
        } else if (!is_sys && !$scope.is_template) {
            $scope.saveTem_loading = true;
            var p_scope = $scope;
            vnc.save({
                instance_id: p_scope.instance_id,
                image_id: $id
            }, function (res) {
                rfb.disconnect();
                window.close();
            }, function () {
                $scope.saveTem_loading = false;
            });
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
        } else {
            $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='安装完成确认'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='我已安装完成确认' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller: function controller($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close();
                        it.saveTem_loading = true;
                        vnc.save({
                            instance_id: instance_id,
                            image_id: $id
                        }, function (res) {}, function () {
                            it.saveTem_loading = false;
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                    };
                },
                size: "sm"
            });
        }
    };
    $scope.loadISO = function () {
        $modal.open({
            templateUrl: "/select-iso.html",
            controller: "isoListController",
            size: "md"
        });
    };
}]).run(["$rootScope", "settings", "localize", function ($rootScope, settings, localize) {
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function (lang) {
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;

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

/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.template", [])

/* 模板 */
.factory("registerTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "get", url: $Domain + "/thor/image/register" },
		update: { method: "POST", url: $Domain + "/thor/image/register" }
	});
}]).factory("Network", ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/networks", null, {
		query: { method: "GET", isArray: false, params: null },
		add: { method: "POST", isArray: false },
		get: { method: "GET", url: $Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false },
		alter: { method: "PUT", url: $Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false },
		delete: { method: "DELETE", url: $Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false },

		query_sub: { method: "GET", url: $Domain + "/thor/network/:id/subnets", params: { id: "@id" } },
		add_sub: { method: "POST", url: $Domain + "/thor/network/:id/subnets", params: { id: "@id" } },

		get_sub: { method: "GET", url: $Domain + "/thor/network/subnet/:id", params: { id: "@id" } },
		alter_sub: { method: "PUT", url: $Domain + "/thor/network/subnet/:id", params: { id: "@id" } },
		delete_sub: { method: "DELETE", url: $Domain + "/thor/network/subnet/:id", params: { id: "@id" } },
		ports: { method: "GET", url: $Domain + "/thor/network/subnet/:id/ports", params: { id: "@id" } }

	});
}]).factory('ResourcePool', ["$resource", "$Domain", function ($resource, $Domain) {
	return $resource($Domain + "/thor/resource", null, {
		query: { method: "GET" }
	});
}])
/* 模板镜像分发 */
.factory("manageTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } },
		handout: { method: "POST", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } },
		delete: { method: "DELETE", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } }
	});
}])
/* 根据虚拟化类型返回可用主机列表 */
.factory("virtualHost", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/hosts_with_virtual_type", null, {
		query: { method: "GET", url: $Domain + "/thor/hosts_with_virtual_type" }
	});
}])
/* 根据主机查找可用网络 */
.factory("networkWithHost", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/list_network_with_host", null, {
		query: { method: "GET", url: $Domain + "/thor/list_network_with_host" }
	});
}]).factory("checkIP", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/check_ip", null, {
		check: { method: "GET" }
	});
}]);

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.template.teach", ["vdi.template"]).directive("downloadUrl", ['$http', function ($http) {
	return {
		restrict: "A",
		link: function link(scope, element, attrs) {
			var url_arry = JSON.parse(attrs.urls.split(","));
			url_arry.forEach(function (item) {
				$(element).append('<iframe style="width: 0; height: 0;" src="" id="' + item + '" frameborder="0"></iframe>');
			});
			$(element).click(function (e) {
				url_arry.forEach(function (item) {
					$(element).find('#' + item)[0].contentWindow.location = scope.domain + '/thor/image/download/' + item;
				});
			});
		}
	};
}]).factory("TeachTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image/1", isArray: false },
		update: { method: "POST", url: $Domain + "/thor/image/modify_template/:id", params: { id: "@id" } },
		listModes: { method: "GET", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" }, isArray: false },
		applyTemplate: { method: "POST", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" } },
		status: { method: "GET", url: $Domain + "/thor/image/status/:id", params: { id: "@id" } },
		copy: { method: "POST", url: $Domain + "/thor/image/clone_template" },
		modify: { method: "PUT", url: $Domain + "/thor/image/1", isArray: false },
		infor: { method: "GET", url: $Domain + "/thor/image/info" },
		spiceConnectInfo: { method: "GET", url: $Domain + "/compute/v1/instances/connection" },
		virtualStatus: { method: "GET", url: $Domain + "/compute/v1/instances/:id/status", params: { id: "@id" } },
		download: { method: "GET", url: $Domain + "/thor/image/download/:id", params: { id: "@id" } },
		reset: { method: "post", url: $Domain + "/thor/image/reset_template" },
		get_image_vnc_info: { method: "GET", url: $Domain + "/thor/image/get_image_vnc_info" },
		get_image_rdp_info: { method: "GET", url: $Domain + "/thor/image/get_image_rdp_info" },
		sync: { method: "post", url: $Domain + "/thor/image/bt_sync_template" },
		sync_status: { method: "GET", url: $Domain + "/thor/image/bt_sync_status" },
		bt_before_edit_template: { method: "POST", url: $Domain + "/thor/image/bt_before_edit_template" },
		bt_save_template: { method: "POST", url: $Domain + "/thor/image/bt_save_template" },
		bt_prev_save_template: { method: "POST", url: $Domain + "/thor/image/bt_prev_save_template" },
		bt_sync_retry: { method: "POST", url: $Domain + "/thor/image/bt_sync_retry" },
		bt_sync_repair: { method: "POST", url: $Domain + "/thor/image/bt_sync_repair" },
		update_tpl_tip: { method: "GET", url: $Domain + "/thor/controller/ha_storage_state" }
	});
}]).controller("vdiTemplateTeachDesktopListController", ["$scope", "$modal", "TeachTemplate", "PersonTemplate", "$route", "Admin", "TeachDesktop", "$interval", "$filter", "$$$os_types", "$Domain", "Network", "$http", "$$$I18N", "ResourcePool", "manageTemplate", "VMCommon", "networkWithHost", "virtualHost", "UserRole", function ($scope, $modal, template, tmpl, $route, admin, teachdesktop, $interval, $filter, $$$os_types, $Domain, network, $http, $$$I18N, ResourcePool, manageTemplate, vm, networkWithHost, virtualHost, UserRole) {
	// teachdesktop.query({ id : $route.current.params.id }, function(res){
	// 	console.log(787878,res.result)
	// });
	var user = UserRole.currentUser;
	$scope.domain = $Domain;
	$scope.rows = [];$scope.allrows = [];

	$scope.images = [];
	$scope.loading = true;

	$scope.currentPage = 1;
	$scope.pagesizes = [30, 20, 10];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.orders = [{ name: $$$I18N.get("按创建时间排序"), val: 'time' }, { name: $$$I18N.get("按模板名称排序"), val: 'name' }];
	$scope.order = $scope.orders[0];
	$scope.sortTem = function (val) {
		if (val == 'time') {
			$scope.rows.sort(function (a, b) {
				return a.created_at > b.created_at ? -1 : 1;
			});
		} else {
			$scope.rows.sort(function (a, b) {
				return a.name > b.name ? 1 : -1;
			});
		}
	};

	$interval(function () {
		$scope.rows && $scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function ($event, data) {

		var _rows = {};
		$scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
		$scope.rows = $scope.rows.filter(function (item) {
			return item.type_code === 1;
		});
		$scope.rows.forEach(function (row) {
			if ($scope.sync_mode === 'bt') {
				if (row.sync_status) {
					var syncFaildLen = row.sync_status.filter(function (item) {
						return item.status === "sync failed" || item.status === "no space left" || item.sch == 'time out';
					}).length;
					var syncDownloading = row.sync_status.filter(function (item) {
						return item.status === "downloading";
					}).length;
					if (syncFaildLen) {
						row.sync_status.syncFaild = true;
					}
					if (syncDownloading && !syncFaildLen) {
						row.sync_status.syncing = true;
					}
				}
			} else {
				if (row.sync_status) {
					var updateInfor = row.sync_status.filter(function (item) {
						return item.type === "image";
					});
					if (updateInfor.length !== 0) row.updateSize = (updateInfor[0].size / 1024 / 1024 / 1024).toFixed(2);
				}
			}
		});
		$scope.$root.$broadcast("syncTempl", $scope.rows);
		// $scope.allrows = $scope.rows;
	});

	template.query(function (res) {
		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);

		$scope.rows.forEach(function (row) {
			var os = $$$os_types.filter(function (item) {
				return item.key === row.os_type;
			})[0];
			os && os.icon && (row.icon = os.icon);
			if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
			if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
		});
		$scope.rows.sort(function (a, b) {
			return a.created_at > b.created_at ? -1 : 1;
		});
		$scope.sync_mode = res.sync_mode;
		$scope.loading = false;
		$scope.teachNames = $scope.rows.map(function (item) {
			return item.name;
		});
		$scope.sameName = false;

		$scope.allrows = $scope.rows;
		if ($$$storage.getSessionStorage('virtual_type_T') !== 'all') $scope.rows = $scope.allrows.filter(function (item) {
			return item.virtual_type === $$$storage.getSessionStorage('virtual_type_T');
		});
	});

	$scope.select = $$$storage.getSessionStorage('virtual_type_T') || 'all';
	$scope.$watch("select", function (newvalue) {
		if (newvalue) {
			if (newvalue !== 'all') {
				$scope.rows = $scope.allrows.filter(function (item) {
					return item.virtual_type === newvalue;
				});
			} else {
				$scope.rows = $scope.allrows;
			}
			$$$storage.setSessionStorage('virtual_type_T', newvalue);
		}
	});
	var _controllerScope = $scope;
	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教学模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance, $q) {
				$scope.name = rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					template.delete({ id: rows.map(function (item) {
							return item.id;
						}) }, function (res) {
						template.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					}, function (error) {
						template.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					});
					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.shutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var rows_active = rows.filter(function (item) {
			return item.instance_status === 'running';
		});
		if (!rows_active.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("SHUTOFF_TIP"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='shutdown_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><img data-ng-if='loading' src='./img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function controller($scope, $modalInstance, $q) {
					$scope.name = rows_active.map(function (row) {
						return row.name;
					}).join(', ');
					$scope.ok = function () {
						$scope.loading = true;
						vm.shutdowns({ instance_ids: rows_active.map(function (item) {
								return item.instance_id;
							}) }, function (res) {
							rows.forEach(function (row) {
								_controllerScope.rows.forEach(function (item) {
									if (item.id === row.id) {
										item.instance_status = "shutdown";
									}
								});
							});
							$scope.loading = false;
						}, function (error) {
							$scope.loading = false;
						});
						$modalInstance.close();
					};
					$scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.syncTem = function (item) {
		$scope.loading = false;
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_sync.html",
			controller: function controller($scope, $modalInstance) {
				if (!$scope.sync_status) {
					$scope.loading = true;
				}
				$scope.name = item.name;
				$scope.$on("syncTempl", function ($event, data) {
					var thistmpl = data.filter(function (r) {
						return r.id === item.id;
					})[0];
					$scope.sync_status = thistmpl.sync_status;
					$scope.loading = false;
				});
				$scope.close = function () {
					$modalInstance.close();
				};
				$scope.Retry = function (temp) {
					var data = { image_id: temp.image, server_ip: temp.server_ip, server_id: temp.server_id, version: temp.version };
					template.bt_sync_retry(data, function (res) {}, function () {});
				};
				$scope.Repair = function (temp) {
					var data = { image_id: temp.image, server_ip: temp.server_ip, server_id: temp.server_id, version: temp.version };
					template.bt_sync_repair(data, function (res) {}, function () {});
				};
			},
			size: "lg"

		});
	};

	$scope.update = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_mode_list.html",
			controller: function controller($scope, $modalInstance) {
				$scope.modes = [];
				template.listModes({ id: item.id }, function (res) {
					$scope.modes = res.modes;
				}, function () {
					$scope.noScense = true;
				});
				$scope.ok = function () {
					template.applyTemplate({ id: item.id }, function (res) {
						/* doSTH */
						$modalInstance.close();
					});
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	$scope.trigger = function () {
		$scope.rows.some(function (row) {
			row._selected;
		});
	};

	$scope.copy = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_copy.html",
			size: "md",
			controller: ["$scope", "$modalInstance", function ($scope, $modalInstance) {
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				$scope.is_copy = true;
				$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
				$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
				$scope.types = $scope.types2;
				$scope.bind_ip_type = $scope.types2[0];
				admin.query(function (res) {
					$scope.owners = res.users;
					angular.forEach($scope.owners, function (item) {
						if (item.name == user.name) {
							$scope.owner = item;
						}
					});
					if (!$scope.owner) {
						$scope.owner = $scope.users[0];
					}
				});
				$scope.type = '1';
				$scope.temCopy = false;

				$scope.temData = item;
				$scope.getVirtualHost = function (type, rbd_enabled) {
					$scope.host_loading = true;
					virtualHost.query({
						virtual_type: type,
						rbd_enabled: rbd_enabled
						// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
					}, function (res) {
						$scope.host_loading = false;
						$scope.hosts = res.result;
						$scope.host = $scope.hosts[0];
						$scope.getNetwork($scope.host);
					}, function () {});
				};
				$scope.getVirtualHost(item.virtual_type, item.rbd_enabled);

				// function getIps(subnet_id, _scope){
				// 	if(subnet_id)
				// 		network.ports({ id: subnet_id },function(res){
				// 			if(res.unused_ips.length){
				// 				_scope.band_ips = res.unused_ips;
				// 			}
				// 			else{
				// 				_scope.band_ips = ["无可用IP"];
				// 			}
				// 			_scope.bind_ip_loading = false;
				// 		})
				// };
				$scope.switchIps = function (subnet, _scope) {
					// _scope.bind_ip_loading = true;
					if (subnet) {
						// getIps(subnet.id, _scope);
						_scope.types = _scope.types2;
						_scope.bind_ip_type = _scope.types2[0];
					} else {
						_scope.types = _scope.types1;
						_scope.band_ips = [];
						_scope.bind_ip_type = _scope.types1[0];
						// _scope.bind_ip_loading = false;
					}
				};
				function getSubnets(Network, _scope) {
					if (Network.subnets.length) {
						$scope.network_loading = true;
						// $scope.bind_ip_loading = true;
						network.query_sub({ id: Network.id }, function (res) {
							_scope.subnets = res.result;
							_scope.subnet = _scope.subnets[0];
							_scope.switchIps(_scope.subnet, _scope);
							$scope.network_loading = false;
						});
					} else {
						_scope.subnets = [];
						_scope.subnet = null;
						_scope.switchIps(_scope.subnet, _scope);
					}
				};
				$scope.getNetwork = function (host) {
					if (host) {
						networkWithHost.query({ host: host.host_uuid }, function (res) {
							// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
							$scope.networks = res.result;
							$scope.network = $scope.networks[0];
							getSubnets($scope.network, $scope);
						}, function () {});
					}
				};

				$scope.switchSubnet = function (val, _scope) {
					getSubnets(val, _scope);
				};
				$scope.bind_ip = { value: null };
				$scope.ok = function () {
					var bindIP = this.bind_ip.value;
					// var unUseIP = this.band_ips.filter(function(item){ return item===bindIP });
					// if(this.bind_ip_type.value === 'static' && bindIP === '无可用IP'){
					// 	$.bigBox({
					// 		title	: $$$I18N.get("INFOR_TIP"),
					// 		content	: $$$I18N.get("hasStaticIP_TIP"),
					// 		timeout	: 6000
					// 	});
					// }else if(this.bind_ip_type.value === 'static' && bindIP !== '无可用IP' && !unUseIP.length){
					// 	$.bigBox({
					// 		title	: $$$I18N.get("INFOR_TIP"),
					// 		content	: $$$I18N.get("USEDIP"),
					// 		timeout	: 6000
					// 	});
					// }else{
					$scope.temCopy = true;
					var _ip = this.bind_ip_type.value === 'static' ? bindIP : undefined;
					template.copy({
						name: this.name,
						description: this.description,
						image_id: item.id,
						type_code: this.type,
						owner: $scope.owner.id,
						network: this.network.id,
						subnet: this.subnet ? this.subnet.id : '',
						band_ip: _ip,
						band_type: this.bind_ip_type.value,
						host_uuid: this.host.host_uuid
						// enable_gpu: item.virtual_type == 'hyper-v'?this.enable_gpu:undefined
					}, function (res) {
						template.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
						$modalInstance.close();
					}, function () {
						$scope.temCopy = false;
					});
					// }
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}]
		});
	};

	$scope.sync = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='SYNC_TEM'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='SYNC_TEM_TIP' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					template.sync({ image_id: item.id }, function (res) {}, function (error) {});

					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};

	$scope.undoSync = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='UNDO_SYNC_TEM'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEM_UNDOSYNC' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					template.bt_before_edit_template({ image_id: item.id }, function (res) {}, function (error) {});

					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.modify = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_modify.html",
			controller: function controller($scope, $modalInstance) {
				$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
				$scope.types = $scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
				$scope.virtual_type = item.virtual_type;
				$scope.disabled_gpu = item.disabled_gpu;
				$scope.data = { vcpus: 1, ram: 1.5, system_alloc_disk: 10, bind_ip_type: $scope.types2[1] };
				var oldData = {};
				function getSubnets(Network, subnet_id, flag) {
					if (Network.subnets.length) {
						$scope.network_loading = true;
						network.query_sub({ id: Network.id }, function (res) {
							$scope.data.subnets = res.result;
							if (flag) {
								oldData.subnets = $scope.data.subnets;
								oldData.subnet = $scope.data.subnet = $scope.data.subnets.filter(function (data) {
									return data.id === subnet_id;
								})[0];
							} else {
								$scope.data.subnet = $scope.data.subnets[0];
								if ($scope.data.subnet) getIps($scope.data.subnet.id, $scope.cur_imgInfor.nets.ip_address, false);else $scope.data.band_ips = [];
							}
							$scope.network_loading = false;
						});
					} else {
						$scope.data.subnets = [];
						$scope.data.subnet = null;
						$scope.switchIps($scope.data.subnet);
					}
				};
				function getIps(subnet_id, curr_ip, flag) {
					if (subnet_id) {
						// $scope.bind_ip_loading = true;
						$scope.types = $scope.types2;
						if (flag) {
							oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[1];
							oldData.band_ips = $scope.data.band_ips;
							oldData.band_ip = $scope.data.band_ip = curr_ip;
						} else {
							$scope.data.bind_ip_type = $scope.types[0];
							$scope.data.band_ip = null;
						}
						// network.ports({ id: subnet_id },function(res){
						// 	if(res.unused_ips.length){
						// 		$scope.data.band_ips = res.unused_ips;
						// 	}
						// 	else{
						// 		$scope.data.band_ips = ["无可用IP"];
						// 	}

						// 	if(subnet_id===$scope.cur_imgInfor.nets[0].subnet_id){
						// 		$scope.data.band_ips.push(curr_ip);
						// 	}
						// 	if(flag){
						// 		oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[1];
						// 		oldData.band_ips = $scope.data.band_ips;
						// 		oldData.band_ip = $scope.data.band_ip = curr_ip;
						// 	}
						// 	else{
						// 		$scope.data.bind_ip_type = $scope.types[0];
						// 		$scope.data.band_ip = null;
						// 	}
						// 	$scope.bind_ip_loading = false;
						// });
					} else {
						$scope.types = $scope.types1;
						oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[0];
					}
				};
				$scope.switchSubnet = function (val) {
					getSubnets(val, $scope.cur_imgInfor.nets.network_id, false);
				};
				$scope.switchIps = function (subnet) {
					if (subnet) {
						getIps(subnet.id, $scope.cur_imgInfor.nets.ip_address, false);
					} else {
						$scope.types = $scope.types1;
						$scope.data.bind_ip_type = $scope.types[0];
						$scope.data.band_ips = [];
						$scope.data.band_ip = null;
					}
				};
				$scope.addbtndisk = function () {
					if (!$scope.data.data_alloc_disk) {
						$scope.data.data_alloc_disk = 1;
						return false;
					}
					if (!$scope.data.data_alloc_disk_2) {
						$scope.data.data_alloc_disk_2 = 1;
						return false;
					}
				};
				$scope.minusbtndisk = function () {
					if ($scope.old_data_alloc_disk && !$scope.old_data_alloc_disk_2) {
						if ($scope.data.data_alloc_disk_2) {
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
					} else {
						if ($scope.data.data_alloc_disk_2) {
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
						if ($scope.data.data_alloc_disk) {
							$scope.data.data_alloc_disk = 0;
							return false;
						}
					}
				};
				template.infor({ image_id: item.id }, function (templateInfor) {

					$scope.cur_imgInfor = templateInfor;
					oldData.name = $scope.data.name = templateInfor.name;
					oldData.description = $scope.data.description = templateInfor.description;
					getIps(templateInfor.nets[0].subnet_id, templateInfor.nets[0].ip_address, true);
					network.query(function (data) {
						$scope.networks = data.networks.filter(function (item) {
							return item.subnets.length !== 0;
						});
						$scope.networks = data.networks;
						oldData.network = $scope.data.network = $scope.networks.filter(function (data) {
							return data.id === templateInfor.nets[0].network_id;
						})[0];
						getSubnets($scope.data.network, templateInfor.nets[0].subnet_id, true);
					});
					oldData.enable_gpu = $scope.data.enable_gpu = templateInfor.enable_gpu;
					oldData.vcpus = $scope.data.vcpus = templateInfor.vcpus;
					oldData.ram = $scope.data.ram = templateInfor.ram / 1024;
					oldData.system_alloc_disk = $scope.data.system_alloc_disk = templateInfor.system_alloc_disk;
					oldData.data_alloc_disk = $scope.data.data_alloc_disk = templateInfor.data_alloc_disk;
					oldData.data_alloc_disk_2 = $scope.data.data_alloc_disk_2 = templateInfor.data_alloc_disk_2;
					$scope.old_data_alloc_disk = templateInfor.data_alloc_disk;
					$scope.old_data_alloc_disk_2 = templateInfor.data_alloc_disk_2;
				});
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				$scope.oldData = angular.copy($scope.data);

				$scope.isUnchanged = function () {
					return angular.equals(oldData, $scope.data);
				};
				$scope.reset = function () {
					if (oldData.bind_ip_type.value !== 'none') {
						$scope.types = $scope.types2;
					} else {
						$scope.types = $scope.types1;
					}
					$scope.data = angular.copy(oldData);
				};
				$scope.ok = function () {
					// if($scope.data.system_alloc_disk < oldData.system_alloc_disk || $scope.data.data_alloc_disk_2 < oldData.data_alloc_disk_2 || $scope.data.data_alloc_disk < oldData.data_alloc_disk){
					// 	$.bigBox({
					// 			title : $$$I18N.get("INFOR_TIP"),
					// 			content : $$$I18N.get("modifyTemTip"),
					// 			timeout : 6000
					// 		});
					// }
					// var bindIP = $scope.data.band_ip;
					//            	var unUseIP = $scope.data.band_ips.filter(function(item){ return item===bindIP });
					//            	if($scope.data.bind_ip_type.value === 'static' && bindIP === '无可用IP'){
					//            		$.bigBox({
					//            			title	: $$$I18N.get("INFOR_TIP"),
					//            			content	: $$$I18N.get("hasStaticIP_TIP"),
					//            			timeout	: 6000
					//            		});
					//            	}else if($scope.data.bind_ip_type.value === 'static' && bindIP !== '无可用IP' && !unUseIP.length){
					//            		$.bigBox({
					//            			title	: $$$I18N.get("INFOR_TIP"),
					//            			content	: $$$I18N.get("USEDIP"),
					//            			timeout	: 6000
					//            		});
					//            	}else{
					$scope.submit_loading = true;
					template.modify({
						image_id: item.id,
						instance_id: item.instance_id,
						template_name: $scope.data.name,
						description: $scope.data.description,
						network: $scope.data.network.id,
						subnet: $scope.data.subnet ? $scope.data.subnet.id : "",
						band_ip: $scope.data.bind_ip_type.value === 'static' ? $scope.data.band_ip : undefined,
						band_type: $scope.data.bind_ip_type.value,
						vcpus: $scope.data.vcpus,
						ram: $scope.data.ram,
						enable_gpu: item.virtual_type == 'hyper-v' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
						gpu_auto_assignment: item.virtual_type == 'kvm' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
						system_alloc_disk: $scope.data.system_alloc_disk,
						data_alloc_disk: $scope.data.data_alloc_disk,
						data_alloc_disk_2: $scope.data.data_alloc_disk_2
					}, function (res) {
						$scope.submit_loading = false;
						template.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
						$modalInstance.close();
					}, function () {
						$scope.submit_loading = false;
					});
					// }
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	$scope.resetTemp = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重置模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='REST_TEMP_TIP' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					template.reset({ image_id: item.id }, function (res) {}, function (error) {});

					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.imgManage = function (IMG) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_imgManage.html",
			size: "md",
			controller: function controller($scope, $modalInstance) {
				$scope.imgType = IMG.virtual_type;
				function formLocalData(dataResource) {
					var arry = [];
					dataResource.forEach(function (item) {
						if (!arry[item.host_ip]) {
							var obj = { host_ip: item.host_ip, hostname: item.hostname, resource_pool_uuid: item.resource_pool_uuid, storages: [] };
							arry[item.host_ip] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function (item) {
						var hostArry = dataResource.filter(function (data) {
							return data.host_ip == item.host_ip;
						});
						hostArry.forEach(function (data) {
							if (!item.storages[data.storage_name]) {
								var obj = { storage_name: data.storage_name, storage_uuid: data.storage_uuid, storage_type: data.storage_type, imgs: [] };
								item.storages[data.storage_name] = obj;
								item.storages.push(obj);
							}
						});
					});
					arry.forEach(function (item) {
						item.storages.forEach(function (data) {
							var storageArry = dataResource.filter(function (d) {
								return item.host_ip == d.host_ip && d.storage_name == data.storage_name;
							});
							storageArry.forEach(function (d) {
								data.imgs.push({ image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status });
							});
						});
						item.storages.sort(function (a, b) {
							return a.storage_name > b.storage_name ? 1 : -1;
						});
					});
					return arry;
				};
				function formRemoteData(dataResource) {
					var arry = [];
					dataResource.forEach(function (item) {
						if (!arry[item.storage_name + "_remote"]) {
							var obj = { storage_name: item.storage_name, storage_uuid: item.storage_uuid, storage_type: item.storage_type, host_ip: item.host_ip, imgs: [] };
							arry[item.storage_name + "_remote"] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function (item) {
						var imgArry = dataResource.filter(function (d) {
							return item.storage_name == d.storage_name;
						});
						imgArry.forEach(function (d) {
							item.imgs.push({ image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status });
						});
					});
					return arry;
				};
				function getLocal(resource_pool_uuid) {
					$scope.local_loading = true;
					manageTemplate.query({ id: IMG.id, storage_type: 'local', resource_pool_uuid: resource_pool_uuid }, function (res) {
						$scope.local_loading = false;
						$scope.locals = formLocalData(res.result.sort(function (a, b) {
							return a.image_type > b.image_type ? -1 : 1;
						}));
					}, function (err) {
						$scope.local_loading = false;
					});
				};
				function getRemote() {
					$scope.remote_loading = true;
					manageTemplate.query({ id: IMG.id, storage_type: 'remote' }, function (res) {
						console.log(res.result);
						$scope.remote_loading = false;
						$scope.remotes = formRemoteData(res.result.sort(function (a, b) {
							return a.image_type > b.image_type ? -1 : 1;
						}));
					}, function (err) {
						$scope.remote_loading = false;
					});
				};
				var new_pool = {};
				getRemote();
				ResourcePool.query(function (res) {
					$scope.pools = res.result.filter(function (p) {
						return p.type == IMG.virtual_type;
					});
					new_pool = $scope.pool = $scope.pools[0];
					getLocal($scope.pool.uuid);
				});

				$scope.getlocalImages = function (pool) {
					new_pool = pool;
					getLocal(pool.uuid);
				};
				$scope.$on("syncTempl", function ($event, data) {
					var updateVolume = data.filter(function (item) {
						return item.id == IMG.id;
					})[0].volume;
					if (updateVolume.length !== 0) {
						updateVolume.forEach(function (volume) {
							if (volume.storage_type == 'local') {
								$scope.locals && $scope.locals.forEach(function (local) {
									local.storages.forEach(function (storage) {
										storage.imgs.forEach(function (img) {
											if (img.volume_uuid == volume.volume_uuid) {
												img.volume_status = volume.volume_status;
												if (volume.volume_status == 'available') {
													img.has_image = true;
												}
												if (volume.volume_status == 'deleted') {
													img.has_image = false;
												}
											}
										});
									});
								});
							} else {
								$scope.remotes && $scope.remotes.forEach(function (remote) {
									remote.imgs.forEach(function (img) {
										if (img.volume_uuid == volume.volume_uuid) {
											img.volume_status = volume.volume_status;
											if (volume.volume_status == 'available') {
												img.has_image = true;
											}
											if (volume.volume_status == 'deleted') {
												img.has_image = false;
											}
										}
									});
								});
							}
						});
					}
				});
				$scope.sendImg = function (storage_type, resource_pool_uuid, image_type, image_uuid, storage_uuid, img, pool) {
					img.volume_status = 'sending';
					manageTemplate.handout({
						id: IMG.id,
						resource_pool_uuid: storage_type == 'local' ? resource_pool_uuid : undefined,
						image_type: image_type,
						image_uuid: image_uuid,
						storage_uuid: storage_uuid,
						storage_type: storage_type
					}, function (res) {
						if (storage_type == 'local') {
							manageTemplate.query({ id: IMG.id, storage_type: 'local', resource_pool_uuid: pool.uuid }, function (res) {
								var newData = formLocalData(res.result.sort(function (a, b) {
									return a.image_type > b.image_type ? -1 : 1;
								}));
								$scope.locals.splice(0, $scope.locals.length);
								Array.prototype.push.apply($scope.locals, newData);
							});
						} else {
							manageTemplate.query({ id: IMG.id, storage_type: 'remote' }, function (res) {
								var newData = formRemoteData(res.result.sort(function (a, b) {
									return a.image_type > b.image_type ? -1 : 1;
								}));
								$scope.remotes.splice(0, $scope.remotes.length);
								Array.prototype.push.apply($scope.remotes, newData);
							});
						}
					}, function () {
						// img.status = 'sended failed';
					});
				};
				$scope.deleteImg = function (storage_type, volume_uuid, img, storage_uuid, pool) {
					if (!img.has_instance) {
						img.volume_status = 'deleting';
						manageTemplate.delete({
							storage_type: storage_type,
							id: IMG.id,
							volume_uuid: volume_uuid,
							image_uuid: img.image_uuid,
							storage_uuid: storage_uuid
						}, function (res) {}, function () {
							img.volume_status = 'delete failed';
						});
					}
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	$scope.detail = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_detail.html",
			size: "md",
			controller: function controller($scope, $modalInstance) {
				template.infor({ image_id: item.id }, function (infor) {
					$scope.data = infor;
					function formData(obj) {
						obj.imgs = [];
						for (var i in obj) {
							if (i !== 'imgs') {
								var img = {};
								img.location = i;
								img.volumeId = obj[i];
								obj.imgs.push(img);
							}
						}
					};
					for (var i in $scope.data.inst_volumes) {
						formData($scope.data.inst_volumes[i]);
					};
					network.query(function (data) {
						$scope.data.network = data.networks.filter(function (data) {
							return data.id === infor.nets[0].network_id;
						})[0];
						if (infor.nets[0].subnet_id) {
							network.query_sub({ id: infor.nets[0].network_id }, function (res) {
								var subnet = res.result.filter(function (data) {
									return data.id === infor.nets[0].subnet_id;
								})[0];
								$scope.data.subnet = subnet.name + " (" + subnet.start_ip + "~" + subnet.end_ip + ")";
							});
						}
					});
				}, function () {});
				$scope.close = function () {
					$modalInstance.close();
				};
			}
		});
	};
}]).controller("addTeachTemplateDialog", ["$scope", "$modalInstance", "TeachTemplate", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types", "$$$I18N", "UserRole", "Network", "virtualHost", "networkWithHost", "$rootScope", "checkIP", function ($scope, $modalInstance, teach, hardware, iso, admin, $$$os_types, $$$I18N, UserRole, network, virtualHost, networkWithHost, $root, checkIP) {
	var user = UserRole.currentUser;
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.auto_isos = [];$scope.all_isos = [];
	$scope.iso = [];
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];
	admin.query(function (res) {
		$scope.users = res.users;
		angular.forEach($scope.users, function (item) {
			if (item.name === user.name) $scope.owner = item;
		});
		if (!$scope.owner) $scope.owner = $scope.users[0];
	});
	hardware.query(function (res) {
		$scope.hardware_templates = res.result;
		$scope.template = $scope.hardware_templates[0];
	});
	iso.query(function (res) {
		$scope.all_isos = res.isos.filter(function (iso) {
			return iso.type && iso.type !== "package" && iso.type !== "other";
		});

		$scope.all_isos.forEach(function (item) {
			item.os_type = item.os_type.split(",");
		});
		$scope.isos = $scope.all_isos;
		$scope.iso = [$scope.isos[0]];
		angular.forEach($scope.isos, function (item) {
			if (item.support_auto_install == true) $scope.auto_isos.push(item);
		});
	});

	$scope.type = 'kvm';
	$scope.enable_gpu = false;
	$scope.gpu_auto_assignment = false;
	$scope.getVirtualHost = function (type) {
		var _this = this;
		$scope.host_loading = true;
		var data = {};
		data.type = type;
		if (type == 'hyper-v') {
			data.enable_gpu = _this.enable_gpu;
			_this.gpu_auto_assignment = false;
		} else {
			data.enable_gpu = _this.gpu_auto_assignment;
			_this.enable_gpu = false;
		}
		virtualHost.query(data, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			_this.host = $scope.hosts[0];
			_this.host && $scope.getNetwork(_this.host);
		}, function () {});
	};
	$scope.getVirtualHost($scope.type);

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host) {
		if (host) {
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function () {});
		}
	};
	// network.query(function(data){
	// 	$scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
	// 	$scope.network = $scope.networks[0];
	// 	getSubnets($scope.network, $scope);
	// })
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};
	$scope.names = $scope.rows.map(function (item) {
		return item.name;
	});
	$scope.sameName = false;
	var _scope = $scope;
	$scope.install = "manualinstall";
	$scope.isOther = false;
	$scope.$on("selectStepChange", function (e, arg) {
		if (arg.index == 0) {
			arg.stepScope.$$nextSibling.error = false;
		}
	});
	$scope.$on("WizardStep_0", function (e, step, scope) {
		_scope.type = scope.type;
		scope.error = step.is_dirty;
		var flag = false;
		_scope.names.forEach(function (item) {
			if (scope.name == item) {
				flag = true;
			}
		});
		if (flag) {
			_scope.sameName = true;
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("WRONG_NAME"),
				timeout: 6000
			});
		} else {
			_scope.sameName = false;
		}
		step.done = !scope.step_pane0.$invalid && !_scope.sameName && !scope.network_loading;

		if (step.done && scope.$$childTail && scope.$$childTail.bind_ip) {
			step.showLoading = true;
			step.done = false;
			checkIP.check({ ip: scope.$$childTail.bind_ip, subnet_id: scope.subnet.id }, function (res) {
				if (!res.result) {
					$.bigBox({
						title: $$$I18N.get("INFOR_TIP"),
						content: $$$I18N.get("USEDIP"),
						timeout: 6000
					});
				} else {
					$scope.$broadcast("currentStepChange", 1);
				}
				step.showLoading = false;
			}, function (error) {
				step.showLoading = false;
			});
		}
	});
	$scope.$on("WizardStep_1", function (e, step, scope) {
		scope.error = step.is_dirty;
		if (scope.template.system_gb == 0) $.bigBox({
			title: $$$I18N.get("INFOR_TIP"),
			content: $$$I18N.get("模板系统盘不能为0"),
			timeout: 6000
		});
		step.done = !(scope.template.system_gb == 0);
	});
	$scope.$on("WizardStep_2", function (e, step, scope) {
		setTimeout(function () {
			$("[rel=popover-hover]").popover({
				trigger: "hover"
			});
		});
		_scope.install = scope.install;
		if (scope.iso != undefined && scope.iso[0] != undefined) {
			if (scope.iso[0].os_type[0] == 'other') {
				scope.$parent.system_versions = $$$os_types;
				scope.$parent.system_version1 = scope.$parent.system_versions[0];
			} else {
				var _types = [];
				scope.iso[0].os_type.forEach(function (item) {
					var _obj = {};
					_obj.key = item;
					_obj.value = item;
					_types.push(_obj);
				});
				scope.$parent.system_versions = _types;
				scope.$parent.system_version1 = _types[0];
			}
		}
		scope.error = step.is_dirty;
		step.done = scope.iso != undefined && scope.iso[0] != undefined;
	});
	var newWindow;
	var FLAG = false;
	function gotoUrl(val) {
		if (val) {
			newWindow = window.open('templateModify.html#0');
			// newWindow = window.open('js/vdi-spice/spiceModify.html#?id=0');
		}
	}
	setTimeout(function () {
		$("#finish").on('click', function () {
			gotoUrl(FLAG);
		});
	});

	$scope.$on("WizardStep_3", function (e, step, scope) {
		if (scope.step_pane3.$invalid) {
			scope.error = step.is_dirty;
			step.done = false;
		} else if (scope.userPassword && scope.userPasswordConfirm && scope.userPassword !== scope.userPasswordConfirm) {
			step.done = false;
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("两次输入密码不一致"),
				timeout: 6000
			});
		} else step.done = true;
		FLAG = step.done;
	});
	$scope.$on("WizardDone", function (e, steps, scopes) {
		var auto_install = scopes[2].install === "autoinstall" ? true : false;
		var _ip = scopes[0].bind_ip_type.value === 'static' ? scopes[0].$$childHead.bind_ip : undefined;
		var testWin10 = /Windows10/;
		var item = {
			template_name: scopes[0].name,
			description: scopes[0].description,
			owner: scopes[0].owner.id,
			type_code: 1,
			vcpus: scopes[1].template.cpu_num,
			system_gb: scopes[1].template.system_gb,
			local_gb: scopes[1].template.local_gb,
			memory_mb: scopes[1].template.memory_mb,
			iso_path: scopes[2].iso[0].name,
			iso_id: scopes[2].iso[0].id,
			os_type: scopes[3].system_version1.key,
			instance_type: scopes[1].template.id,
			auto_install: auto_install,
			network: scopes[0].network.id,
			subnet: scopes[0].subnet ? scopes[0].subnet.id : '',
			band_ip: _ip,
			band_type: scopes[0].bind_ip_type.value,
			key: scopes[3].key,
			username: scopes[3].userName,
			userPassword: scopes[3].userPassword,
			userPasswordConfirm: scopes[3].userPasswordConfirm,
			virtual_type: scopes[0].type,
			enable_gpu: scopes[0].type == 'hyper-v' ? scopes[0].enable_gpu : undefined,
			gpu_auto_assignment: scopes[0].type == 'kvm' ? scopes[0].gpu_auto_assignment : undefined,
			firmware_type: scopes[0].type == 'kvm' && testWin10.test(scopes[3].system_version1.key) ? 'uefi' : undefined,
			host_uuid: scopes[0].host.host_uuid
		};
		function updateTem(isSuccess) {
			teach.query(function (res) {
				console.log(res, 'teachDesktop', item.virtual_type);
				$scope.allrows.splice(0, $scope.allrows.length);
				Array.prototype.push.apply($scope.allrows, res.win_images.concat(res.linux_images).concat(res.other_images));
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
					if ($scope.select === 'all') {
						return item;
					} else {
						return item.virtual_type === scopes[0].type;
					}
				});
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				newRows.sort(function (a, b) {
					return a.created_at > b.created_at ? -1 : 1;
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);

				// if(!auto_install){
				var template = $scope.rows.filter(function (temp) {
					return temp.name == item.template_name;
				})[0];
				if (template && isSuccess) {
					if (scopes[0].type == "hyper-v") {
						if (res.sync_mode === 'scp') {
							newWindow.location.replace('templateModify_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
							//novnc-->spice-html5 
							// newWindow.location.replace('js/vdi-spice/spiceModify_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						} else {
							newWindow.location.replace('templateModifybt_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
							//novnc-->spice-html5
							// newWindow.location.replace('js/vdi-spice/spiceModifybt_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						}
					} else {
						if (res.sync_mode === 'scp') {
							//novnc-->spice-html5
							// newWindow.location.replace('js/vdi-spice/spiceModify.html#?id=' + template.id + '&os_type' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
							// newWindow.location.reload();
							newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name);
							newWindow.location.reload();
						} else {
							newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name);
							//novnc-->spice-html5
							// newWindow.location.replace('js/vdi-spice/spiceModifybt.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						}
					}
				}
				// }
			});
		};
		e.targetScope.currentStep.showLoading = true;
		$modalInstance.close();
		teach.save(item, function (res) {
			updateTem(true);
		}, function () {
			newWindow.close();updateTem();
		}).$promise.finally(function () {
			e.targetScope.currentStep.showLoading = false;
		});
	});

	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.cpu_num = 1;
}]).controller("registerTeachTemplateDialog", ["$scope", "$modalInstance", "Admin", "registerTemplate", "TeachTemplate", "$$$os_types", "UserRole", "Network", "virtualHost", "networkWithHost", "$$$I18N", function ($scope, $modalInstance, admin, registerTemplate, teach, $$$os_types, UserRole, network, virtualHost, networkWithHost, $$$I18N) {
	var user = UserRole.currentUser;
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.type = '1';
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];
	admin.query(function (res) {
		$scope.users = res.users;
		angular.forEach($scope.users, function (item) {
			if (item.name === user.name) $scope.owner = item;
		});
	});
	registerTemplate.query(function (res) {
		$scope.sys_isos = res.system_image;
		$scope.sys_iso = res.system_image[0];
		$scope.old_data_isos = res.data_image;
		if ($scope.sys_iso) {
			$scope.getDataImgs($scope.sys_iso);
		}
	});
	$scope.filterDataISO = function (data_iso, data_iso2) {
		if (data_iso) {
			$scope.data_isos2 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso.name;
			});
		} else {
			$scope.data_isos2 = $scope.data_isos;
		}
		if (data_iso2) {
			$scope.data_isos1 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso2.name;
			});
		} else {
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function (systemImg, is_init) {
		if (systemImg) {
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function (item) {
				return item.virtual_type == systemImg.virtual_type;
			});
			// $scope.data_iso = $scope.data_isos[0];
			// $scope.data_iso2 = $scope.data_isos[0];
			$scope.getVirtualHost(systemImg.virtual_type, systemImg.rbd_enabled);
		}
	};
	$scope.getVirtualHost = function (type, rbd_enabled) {
		$scope.host_loading = true;
		virtualHost.query({
			virtual_type: type,
			rbd_enabled: rbd_enabled
			// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
		}, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts[0];
			if (res.result.length === 0) {
				var form = getRegisterTemplateForm();
				form.host.$setViewValue("");
			}
			$scope.getNetwork($scope.host);
		}, function () {
			$scope.host_loading = false;
		});
	};

	$scope.os_types = $$$os_types.filter(function (item) {
		return item.key !== "package";
	});
	$scope.os_type = $scope.os_types[0];
	// $scope.enable_gpu = false;
	$scope.bind_ip = { value: null };

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			}, function () {
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host) {
		if (host) {
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function () {});
		}
	};
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};

	$scope.ok = function () {
		var bindIP = this.bind_ip.value;
		// var unUseIP = this.band_ips.filter(function(item){ return item===bindIP });
		// if(this.bind_ip_type.value === 'static' && bindIP === '无可用IP'){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("hasStaticIP_TIP"),
		// 		timeout	: 6000
		// 	});
		// }else if(this.bind_ip_type.value === 'static' && bindIP !== '无可用IP' && !unUseIP.length){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("USEDIP"),
		// 		timeout	: 6000
		// 	});
		// }else{
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		var _ip = this.bind_ip_type.value === 'static' ? bindIP : undefined;
		var postData = {
			system_image_file: this.sys_iso,
			data_image_file: this.data_iso ? this.data_iso : undefined,
			data_image_file_2: this.data_iso2 ? this.data_iso2 : undefined,
			name: this.name,
			description: this.description,
			type_code: this.type,
			os: this.os_type.key,
			is_64: this.os_type.value.indexOf("64 bit") > -1 ? true : false,
			owner: this.owner.id,
			network: this.network.id,
			subnet: this.subnet ? this.subnet.id : '',
			band_ip: _ip,
			band_type: this.bind_ip_type.value,
			host_uuid: this.host.host_uuid,
			username: this.sys_iso.virtual_type == 'hyper-v' ? this.username : undefined,
			userPassword: this.sys_iso.virtual_type == 'hyper-v' ? this.userPassword : undefined,
			userPasswordConfirm: this.sys_iso.virtual_type == 'hyper-v' ? this.userPasswordConfirm : undefined
			// enable_gpu: this.sys_iso.virtual_type == 'hyper-v'?this.enable_gpu:undefined
		};
		registerTemplate.update(postData, function (res) {
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			teach.query(function (res) {
				$scope.allrows.splice(0, $scope.allrows.length);
				Array.prototype.push.apply($scope.allrows, res.win_images.concat(res.linux_images).concat(res.other_images));
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
					if ($scope.select === 'all') {
						return item;
					} else {
						return item.virtual_type === $scope.select;
					}
				});
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				newRows.sort(function (a, b) {
					return a.created_at > b.created_at ? -1 : 1;
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);
			});
			$modalInstance.close();
		}, function () {
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
		// }
	};
	$scope.close = function () {
		$modalInstance.close();
	};
	function getRegisterTemplateForm() {
		var child = $scope.$$childHead;
		var form = null;
		while (child && !form) {
			form = child.registerTemplate;
			child = child.$$nextSibling;
		}
		return form;
	}
}]);

/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.template.person", ["vdi.template"]).factory("PersonTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image/2", isArray: false },
		update: { method: "POST", url: $Domain + "/thor/image/modify_template/:id", params: { id: "@id" } },
		listModes: { method: "GET", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" }, isArray: false },
		applyTemplate: { method: "POST", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" } },
		status: { method: "GET", url: $Domain + "/thor/image/status/:id", params: { id: "@id" } },
		copy: { method: "POST", url: $Domain + "/thor/image/clone_template" },
		modify: { method: "PUT", url: $Domain + "/thor/image/2", isArray: false },
		download: { method: "GET", url: $Domain + "/thor/image/download/:id", params: { id: "@id" } },
		reset: { method: "post", url: $Domain + "/thor/image/reset_template" },
		get_image_vnc_info: { method: "GET", url: $Domain + "/thor/image/get_image_vnc_info" },
		get_image_rdp_info: { method: "GET", url: $Domain + "/thor/image/get_image_rdp_info" },
		update_tpl_tip: { method: "GET", url: $Domain + "/thor/controller/ha_storage_state" }
	});
}]).controller("vdiTemplatePresonalDesktopListController", ["$scope", "$modal", "TeachTemplate", "PersonTemplate", "Admin", "$interval", "$filter", "$$$os_types", "$Domain", "Network", "$$$I18N", "ResourcePool", "manageTemplate", "VMCommon", "networkWithHost", "virtualHost", "UserRole", function ($scope, $modal, template, tmpl, admin, $interval, $filter, $$$os_types, $Domain, network, $$$I18N, ResourcePool, manageTemplate, vm, networkWithHost, virtualHost, UserRole) {
	$scope.domain = $Domain;
	$scope.rows = [];$scope.allrows = [];
	var _controllerScope = $scope;
	$scope.loading = true;
	var user = UserRole.currentUser;
	$scope.currentPage = 1;
	$scope.pagesizes = [30, 20, 10];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.orders = [{ name: $$$I18N.get("按创建时间排序"), val: 'time' }, { name: $$$I18N.get("按模板名称排序"), val: 'name' }];
	$scope.order = $scope.orders[0];
	$scope.sortTem = function (val) {
		if (val == 'time') {
			$scope.rows.sort(function (a, b) {
				return a.created_at > b.created_at ? -1 : 1;
			});
		} else {
			$scope.rows.sort(function (a, b) {
				return a.name > b.name ? 1 : -1;
			});
		}
	};

	$interval(function () {
		$scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows && $scope.rows.map(function (item) {
			return item.id;
		}));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function ($event, data) {
		var _rows = {};
		$scope.rows && $scope.rows.forEach(function (item) {
			_rows[item.id] = item;
		});
		data.forEach(function (item) {
			if (_rows[item.id]) {
				for (var k in item) {
					_rows[item.id][k] = item[k];
				}
			}
		});
		$scope.rows = $scope.rows.filter(function (item) {
			return item.type_code === 2;
		});
		$scope.rows.forEach(function (row) {
			if (row.sync_status) {
				var updateInfor = row.sync_status.filter(function (item) {
					return item.type === "image";
				});
				if (updateInfor.length !== 0) row.updateSize = (updateInfor[0].size / 1024 / 1024 / 1024).toFixed(2);
			}
		});
		$scope.$root.$broadcast("syncTempl", $scope.rows);
	});

	tmpl.query(function (res) {
		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);
		$scope.rows.forEach(function (row) {
			var os = $$$os_types.filter(function (item) {
				return item.key === row.os_type;
			})[0];
			os && os.icon && (row.icon = os.icon);
			if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
			if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
		});
		$scope.rows.sort(function (a, b) {
			return a.created_at > b.created_at ? -1 : 1;
		});
		$scope.loading = false;
		$scope.personalNames = $scope.rows.map(function (item) {
			return item.name;
		});
		$scope.sameName = false;

		$scope.allrows = $scope.rows;
		if ($$$storage.getSessionStorage('virtual_type_P') !== 'all') $scope.rows = $scope.allrows.filter(function (item) {
			return item.virtual_type === $$$storage.getSessionStorage('virtual_type_P');
		});
	});

	$scope.select = $$$storage.getSessionStorage('virtual_type_P') || 'all';
	$scope.$watch("select", function (newvalue) {
		if (newvalue) {
			if (newvalue !== 'all') {
				$scope.rows = $scope.allrows.filter(function (item) {
					return item.virtual_type === newvalue;
				});
			} else {
				$scope.rows = $scope.allrows;
			}
			$$$storage.setSessionStorage('virtual_type_P', newvalue);
		}
	});

	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除个人模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_P' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance, $q) {
				$scope.name = rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					tmpl.delete({ id: rows.map(function (item) {
							return item.id;
						}) }, function (res) {
						tmpl.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					}, function (error) {
						tmpl.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					});

					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.shutdown = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		var rows_active = rows.filter(function (item) {
			return item.instance_status === 'running';
		});
		if (!rows_active.length) {
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("SHUTOFF_TIP"),
				timeout: 6000
			});
		} else {
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='shutdown_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><img data-ng-if='loading' src='./img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function controller($scope, $modalInstance, $q) {
					$scope.name = rows_active.map(function (row) {
						return row.name;
					}).join(', ');
					$scope.ok = function () {
						$scope.loading = true;
						vm.shutdowns({ instance_ids: rows_active.map(function (item) {
								return item.instance_id;
							}) }, function (res) {
							rows.forEach(function (row) {
								_controllerScope.rows.forEach(function (item) {
									if (item.id === row.id) {
										item.instance_status = "shutdown";
									}
								});
							});
							$scope.loading = false;
						}, function (error) {
							$scope.loading = false;
						});
						$modalInstance.close();
					};
					$scope.close = function () {
						$modalInstance.close();
					};
				},
				size: "sm"
			});
		}
	};
	$scope.copy = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_copy.html",
			size: "md",
			controller: ["$scope", "$modalInstance", function ($scope, $modalInstance) {
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				$scope.is_copy = true;
				$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
				$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
				$scope.types = $scope.types2;
				$scope.bind_ip_type = $scope.types2[0];
				admin.query(function (res) {
					$scope.owners = res.users;
					angular.forEach($scope.owners, function (item) {
						if (item.name == user.name) {
							$scope.owner = item;
						}
					});
					if (!$scope.owner) {
						$scope.owner = $scope.users[0];
					}
				});
				$scope.type = '2';
				$scope.temCopy = false;

				$scope.temData = item;
				$scope.getVirtualHost = function (type, rbd_enabled) {
					$scope.host_loading = true;
					virtualHost.query({
						virtual_type: type,
						rbd_enabled: rbd_enabled
						// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
					}, function (res) {
						$scope.host_loading = false;
						$scope.hosts = res.result;
						$scope.host = $scope.hosts[0];
						$scope.getNetwork($scope.host);
					}, function () {});
				};
				$scope.getVirtualHost(item.virtual_type, item.rbd_enabled);

				// function getIps(subnet_id, _scope){
				// 	if(subnet_id)
				// 		network.ports({ id: subnet_id },function(res){
				// 			_scope.band_ips = res.unused_ips;
				// 			_scope.bind_ip = _scope.band_ips[0];
				// 			_scope.bind_ip_loading = false;
				// 		})
				// };
				$scope.switchIps = function (subnet, _scope) {
					// _scope.bind_ip_loading = true;
					if (subnet) {
						// getIps(subnet.id, _scope);
						_scope.types = _scope.types2;
						_scope.bind_ip_type = _scope.types2[0];
					} else {
						_scope.types = _scope.types1;
						_scope.band_ips = [];
						_scope.bind_ip_type = _scope.types1[0];
						// _scope.bind_ip_loading = false;
					}
				};
				function getSubnets(Network, _scope) {
					if (Network.subnets.length) {
						$scope.network_loading = true;
						// $scope.bind_ip_loading = true;
						network.query_sub({ id: Network.id }, function (res) {
							_scope.subnets = res.result;
							_scope.subnet = _scope.subnets[0];
							_scope.switchIps(_scope.subnet, _scope);
							$scope.network_loading = false;
						});
					} else {
						_scope.subnets = [];
						_scope.subnet = null;
						_scope.switchIps(_scope.subnet, _scope);
					}
				};
				$scope.getNetwork = function (host) {
					if (host) {
						networkWithHost.query({ host: host.host_uuid }, function (res) {
							// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
							$scope.networks = res.result;
							$scope.network = $scope.networks[0];
							getSubnets($scope.network, $scope);
						}, function () {});
					}
				};
				$scope.switchSubnet = function (val, _scope) {
					getSubnets(val, _scope);
				};
				$scope.ok = function () {
					$scope.temCopy = true;
					var _ip = this.bind_ip_type.value === 'static' ? this.bind_ip.value : undefined;
					tmpl.copy({
						name: this.name,
						description: this.description,
						image_id: item.id,
						type_code: this.type,
						owner: $scope.owner.id,
						network: this.network.id,
						subnet: this.subnet ? this.subnet.id : "",
						band_ip: _ip,
						band_type: this.bind_ip_type.value,
						host_uuid: this.host.host_uuid
						// enable_gpu: item.virtual_type == 'hyper-v'?this.enable_gpu:undefined
					}, function (res) {
						tmpl.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
						$modalInstance.close();
					}, function () {
						$scope.temCopy = false;
					});
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}]
		});
	};
	$scope.modify = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_modify.html",
			controller: function controller($scope, $modalInstance) {
				$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
				$scope.types = $scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
				$scope.virtual_type = item.virtual_type;
				$scope.disabled_gpu = item.disabled_gpu;
				$scope.data = { vcpus: 1, ram: 1.5, system_alloc_disk: 10, bind_ip_type: $scope.types2[1] };
				var oldData = {};
				function getSubnets(Network, subnet_id, flag) {
					if (Network.subnets.length) {
						$scope.network_loading = true;
						network.query_sub({ id: Network.id }, function (res) {
							$scope.data.subnets = res.result;
							if (flag) {
								oldData.subnets = $scope.data.subnets;
								oldData.subnet = $scope.data.subnet = $scope.data.subnets.filter(function (data) {
									return data.id === subnet_id;
								})[0];
							} else {
								$scope.data.subnet = $scope.data.subnets[0];
								if ($scope.data.subnet) getIps($scope.data.subnet.id, $scope.cur_imgInfor.nets.ip_address, false);else $scope.data.band_ips = [];
							}
							$scope.network_loading = false;
						});
					} else {
						$scope.data.subnets = [];
						$scope.data.subnet = null;
						$scope.switchIps($scope.data.subnet);
					}
				};
				function getIps(subnet_id, curr_ip, flag) {
					if (subnet_id) {
						$scope.types = $scope.types2;
						if (flag) {
							oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[1];
							oldData.band_ips = $scope.data.band_ips;
							oldData.band_ip = $scope.data.band_ip = curr_ip;
						} else {
							$scope.data.bind_ip_type = $scope.types[0];
							$scope.data.band_ip = null;
						}
					} else {
						$scope.types = $scope.types1;
						oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[0];
					}
				};
				$scope.switchSubnet = function (val) {
					getSubnets(val, $scope.cur_imgInfor.nets.network_id, false);
				};
				$scope.switchIps = function (subnet) {
					if (subnet) getIps(subnet.id, $scope.cur_imgInfor.nets.ip_address, false);else {
						$scope.types = $scope.types1;
						$scope.data.bind_ip_type = $scope.types[0];
						$scope.data.band_ips = [];
						$scope.data.band_ip = null;
					}
				};
				$scope.addbtndisk = function () {
					if (!$scope.data.data_alloc_disk) {
						$scope.data.data_alloc_disk = 1;
						return false;
					}
					if (!$scope.data.data_alloc_disk_2) {
						$scope.data.data_alloc_disk_2 = 1;
						return false;
					}
				};
				$scope.minusbtndisk = function () {
					if ($scope.old_data_alloc_disk && !$scope.old_data_alloc_disk_2) {
						if ($scope.data.data_alloc_disk_2) {
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
					} else {
						if ($scope.data.data_alloc_disk_2) {
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
						if ($scope.data.data_alloc_disk) {
							$scope.data.data_alloc_disk = 0;
							return false;
						}
					}
				};
				template.infor({ image_id: item.id }, function (templateInfor) {
					$scope.cur_imgInfor = templateInfor;
					oldData.name = $scope.data.name = templateInfor.name;
					oldData.description = $scope.data.description = templateInfor.description;
					getIps(templateInfor.nets[0].subnet_id, templateInfor.nets[0].ip_address, true);
					network.query(function (data) {
						// $scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
						$scope.networks = data.networks;
						oldData.network = $scope.data.network = $scope.networks.filter(function (data) {
							return data.id === templateInfor.nets[0].network_id;
						})[0];
						getSubnets($scope.data.network, templateInfor.nets[0].subnet_id, true);
					});
					oldData.enable_gpu = $scope.data.enable_gpu = templateInfor.enable_gpu;
					oldData.vcpus = $scope.data.vcpus = templateInfor.vcpus;
					oldData.ram = $scope.data.ram = templateInfor.ram / 1024;
					oldData.system_alloc_disk = $scope.data.system_alloc_disk = templateInfor.system_alloc_disk;
					oldData.data_alloc_disk = $scope.data.data_alloc_disk = templateInfor.data_alloc_disk;
					oldData.data_alloc_disk_2 = $scope.data.data_alloc_disk_2 = templateInfor.data_alloc_disk_2;
					$scope.old_data_alloc_disk = templateInfor.data_alloc_disk;
					$scope.old_data_alloc_disk_2 = templateInfor.data_alloc_disk_2;
				});
				$scope.min_namelength = 2;$scope.max_namelength = 20;
				$scope.oldData = angular.copy($scope.data);
				$scope.isUnchanged = function () {
					return angular.equals(oldData, $scope.data);
				};
				$scope.reset = function () {
					if (oldData.bind_ip_type.value !== 'none') {
						$scope.types = $scope.types2;
					} else {
						$scope.types = $scope.types1;
					}
					$scope.data = angular.copy(oldData);
				};
				$scope.ok = function () {
					// if($scope.data.system_alloc_disk < oldData.system_alloc_disk || $scope.data.data_alloc_disk_2 < oldData.data_alloc_disk_2 || $scope.data.data_alloc_disk < oldData.data_alloc_disk){
					// 	$.bigBox({
					// 			title : $$$I18N.get("INFOR_TIP"),
					// 			content : $$$I18N.get("modifyTemTip"),
					// 			timeout : 6000
					// 		});
					// }
					// else{
					$scope.submit_loading = true;
					tmpl.modify({
						image_id: item.id,
						instance_id: item.instance_id,
						template_name: $scope.data.name,
						description: $scope.data.description,
						network: $scope.data.network.id,
						subnet: $scope.data.subnet ? $scope.data.subnet.id : "",
						band_ip: $scope.data.bind_ip_type.value === 'static' ? $scope.data.band_ip : undefined,
						band_type: $scope.data.bind_ip_type.value,
						vcpus: $scope.data.vcpus,
						ram: $scope.data.ram,
						enable_gpu: item.virtual_type == 'hyper-v' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
						gpu_auto_assignment: item.virtual_type == 'kvm' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
						system_alloc_disk: $scope.data.system_alloc_disk,
						data_alloc_disk: $scope.data.data_alloc_disk,
						data_alloc_disk_2: $scope.data.data_alloc_disk_2
					}, function (res) {
						$scope.submit_loading = false;
						tmpl.query(function (res) {
							_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
								if (_controllerScope.select === 'all') {
									return item;
								} else {
									return item.virtual_type === _controllerScope.select;
								}
							});
							newRows.forEach(function (row) {
								var os = $$$os_types.filter(function (item) {
									return item.key === row.os_type;
								})[0];
								os && os.icon && (row.icon = os.icon);
								if (row.os_type.indexOf("_64") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("_64"));
								if (row.os_type.indexOf("(64 bit)") > -1) row.os_type = row.os_type.slice(0, row.os_type.indexOf("(64 bit)"));
							});
							newRows.sort(function (a, b) {
								return a.created_at > b.created_at ? -1 : 1;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
						$modalInstance.close();
					}, function () {
						$scope.submit_loading = false;
					});
					// }
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	$scope.resetTemp = function (item) {
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重置模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='REST_TEMP_TIP' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.ok = function () {
					tmpl.reset({ image_id: item.id }, function (res) {}, function (error) {});

					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
	$scope.imgManage = function (IMG) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_imgManage.html",
			size: "md",
			controller: function controller($scope, $modalInstance) {
				$scope.imgType = IMG.virtual_type;
				function formLocalData(dataResource) {
					var arry = [];
					dataResource.forEach(function (item) {
						if (!arry[item.host_ip]) {
							var obj = { host_ip: item.host_ip, hostname: item.hostname, resource_pool_uuid: item.resource_pool_uuid, storages: [] };
							arry[item.host_ip] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function (item) {
						var hostArry = dataResource.filter(function (data) {
							return data.host_ip == item.host_ip;
						});
						hostArry.forEach(function (data) {
							if (!item.storages[data.storage_name]) {
								var obj = { storage_name: data.storage_name, storage_uuid: data.storage_uuid, storage_type: data.storage_type, imgs: [] };
								item.storages[data.storage_name] = obj;
								item.storages.push(obj);
							}
						});
					});
					arry.forEach(function (item) {
						item.storages.forEach(function (data) {
							var storageArry = dataResource.filter(function (d) {
								return item.host_ip == d.host_ip && d.storage_name == data.storage_name;
							});
							storageArry.forEach(function (d) {
								data.imgs.push({ image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status });
							});
						});
						item.storages.sort(function (a, b) {
							return a.storage_name > b.storage_name ? 1 : -1;
						});
					});
					return arry;
				};
				function formRemoteData(dataResource) {
					var arry = [];
					dataResource.forEach(function (item) {
						if (!arry[item.storage_name + "_remote"]) {
							var obj = { storage_name: item.storage_name, storage_uuid: item.storage_uuid, storage_type: item.storage_type, host_ip: item.host_ip, imgs: [] };
							arry[item.storage_name + "_remote"] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function (item) {
						var imgArry = dataResource.filter(function (d) {
							return item.storage_name == d.storage_name;
						});
						imgArry.forEach(function (d) {
							item.imgs.push({ image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status });
						});
					});
					return arry;
				};
				function getLocal(resource_pool_uuid) {
					$scope.local_loading = true;
					manageTemplate.query({ id: IMG.id, storage_type: 'local', resource_pool_uuid: resource_pool_uuid }, function (res) {
						$scope.local_loading = false;
						$scope.locals = formLocalData(res.result.sort(function (a, b) {
							return a.image_type > b.image_type ? -1 : 1;
						}));
					}, function (err) {
						$scope.local_loading = false;
					});
				};
				function getRemote() {
					$scope.remote_loading = true;
					manageTemplate.query({ id: IMG.id, storage_type: 'remote' }, function (res) {
						console.log(res.result);
						$scope.remote_loading = false;
						$scope.remotes = formRemoteData(res.result.sort(function (a, b) {
							return a.image_type > b.image_type ? -1 : 1;
						}));
					}, function (err) {
						$scope.remote_loading = false;
					});
				};
				var new_pool = {};
				getRemote();
				ResourcePool.query(function (res) {
					$scope.pools = res.result.filter(function (p) {
						return p.type == IMG.virtual_type;
					});
					new_pool = $scope.pool = $scope.pools[0];
					getLocal($scope.pool.uuid);
				});

				$scope.getlocalImages = function (pool) {
					new_pool = pool;
					getLocal(pool.uuid);
				};
				$scope.$on("syncTempl", function ($event, data) {
					var updateVolume = data.filter(function (item) {
						return item.id == IMG.id;
					})[0].volume;
					if (updateVolume.length !== 0) {
						updateVolume.forEach(function (volume) {
							if (volume.storage_type == 'local') {
								$scope.locals && $scope.locals.forEach(function (local) {
									local.storages.forEach(function (storage) {
										storage.imgs.forEach(function (img) {
											if (img.volume_uuid == volume.volume_uuid) {
												img.volume_status = volume.volume_status;
												if (volume.volume_status == 'available') {
													img.has_image = true;
												}
												if (volume.volume_status == 'deleted') {
													img.has_image = false;
												}
											}
										});
									});
								});
							} else {
								$scope.remotes && $scope.remotes.forEach(function (remote) {
									remote.imgs.forEach(function (img) {
										if (img.volume_uuid == volume.volume_uuid) {
											img.volume_status = volume.volume_status;
											if (volume.volume_status == 'available') {
												img.has_image = true;
											}
											if (volume.volume_status == 'deleted') {
												img.has_image = false;
											}
										}
									});
								});
							}
						});
					}
				});
				$scope.sendImg = function (storage_type, resource_pool_uuid, image_type, image_uuid, storage_uuid, img, pool) {
					img.volume_status = 'sending';
					manageTemplate.handout({
						id: IMG.id,
						resource_pool_uuid: storage_type == 'local' ? resource_pool_uuid : undefined,
						image_type: image_type,
						image_uuid: image_uuid,
						storage_uuid: storage_uuid,
						storage_type: storage_type
					}, function (res) {
						if (storage_type == 'local') {
							manageTemplate.query({ id: IMG.id, storage_type: 'local', resource_pool_uuid: pool.uuid }, function (res) {
								var newData = formLocalData(res.result.sort(function (a, b) {
									return a.image_type > b.image_type ? -1 : 1;
								}));
								$scope.locals.splice(0, $scope.locals.length);
								Array.prototype.push.apply($scope.locals, newData);
							});
						} else {
							manageTemplate.query({ id: IMG.id, storage_type: 'remote' }, function (res) {
								var newData = formRemoteData(res.result.sort(function (a, b) {
									return a.image_type > b.image_type ? -1 : 1;
								}));
								$scope.remotes.splice(0, $scope.remotes.length);
								Array.prototype.push.apply($scope.remotes, newData);
							});
						}
					}, function () {
						// img.status = 'sended failed';
					});
				};
				$scope.deleteImg = function (storage_type, volume_uuid, img, storage_uuid, pool) {
					if (!img.has_instance) {
						img.volume_status = 'deleting';
						manageTemplate.delete({
							storage_type: storage_type,
							id: IMG.id,
							volume_uuid: volume_uuid,
							image_uuid: img.image_uuid,
							storage_uuid: storage_uuid
						}, function (res) {}, function () {
							img.volume_status = 'delete failed';
						});
					}
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			}

		});
	};
	$scope.detail = function (item) {
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_detail.html",
			size: "md",
			controller: function controller($scope, $modalInstance) {
				template.infor({ image_id: item.id }, function (infor) {
					$scope.data = infor;
					function formData(obj) {
						obj.imgs = [];
						for (var i in obj) {
							if (i !== 'imgs') {
								var img = {};
								img.location = i;
								img.volumeId = obj[i];
								obj.imgs.push(img);
							}
						}
					};
					for (var i in $scope.data.inst_volumes) {
						formData($scope.data.inst_volumes[i]);
					};
					network.query(function (data) {
						$scope.data.network = data.networks.filter(function (data) {
							return data.id === infor.nets[0].network_id;
						})[0];
						if (infor.nets[0].subnet_id) {
							network.query_sub({ id: infor.nets[0].network_id }, function (res) {
								var subnet = res.result.filter(function (data) {
									return data.id === infor.nets[0].subnet_id;
								})[0];
								$scope.data.subnet = subnet.name + " (" + subnet.start_ip + "~" + subnet.end_ip + ")";
							});
						}
					});
				}, function () {});
				$scope.close = function () {
					$modalInstance.close();
				};
			}
		});
	};
}]).controller("addPersonalTemplateDialog", ["$scope", "$modalInstance", "PersonTemplate", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types", "$$$I18N", "UserRole", "Network", "virtualHost", "networkWithHost", "checkIP", function ($scope, $modalInstance, personal, hardware, iso, admin, $$$os_types, $$$I18N, UserRole, network, virtualHost, networkWithHost, checkIP) {
	var user = UserRole.currentUser;
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.auto_isos = [];$scope.all_isos = [];
	$scope.iso = [];
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types[0];
	admin.query(function (res) {
		$scope.users = res.users;
		angular.forEach($scope.users, function (item) {
			if (item.name == user.name) $scope.owner = item;
		});
		if (!$scope.owner) $scope.owner = $scope.users[0];
	});
	hardware.query(function (res) {
		$scope.hardware_templates = res.result;
		$scope.template = $scope.hardware_templates[0];
	});
	iso.query(function (res) {
		$scope.all_isos = res.isos.filter(function (iso) {
			return iso.type && iso.type !== "package" && iso.type !== "other";
		});
		$scope.all_isos.forEach(function (item) {
			item.os_type = item.os_type.split(",");
		});
		$scope.isos = $scope.all_isos;
		$scope.iso = [$scope.isos[0]];
		angular.forEach($scope.isos, function (item) {
			if (item.support_auto_install == true) $scope.auto_isos.push(item);
		});
	});

	$scope.type = 'kvm';
	$scope.enable_gpu = false;
	$scope.getVirtualHost = function (type) {
		var _this = this;
		$scope.host_loading = true;
		var data = {};
		data.type = type;
		if (type == 'hyper-v') {
			data.enable_gpu = _this.enable_gpu;
			_this.gpu_auto_assignment = false;
		} else {
			data.enable_gpu = _this.gpu_auto_assignment;
			_this.enable_gpu = false;
		}
		virtualHost.query(data, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			_this.host = $scope.hosts[0];
			_this.host && $scope.getNetwork(_this.host);
		}, function () {});
	};
	$scope.getVirtualHost($scope.type);

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip = _scope.band_ips[0];
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host) {
		if (host) {
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function () {});
		}
	};
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};
	$scope.names = $scope.rows.map(function (item) {
		return item.name;
	});
	$scope.sameName = false;
	var _scope = $scope;
	$scope.install = "manualinstall";
	$scope.isOther = false;
	$scope.$on("selectStepChange", function (e, arg) {
		if (arg.index == 0) {
			arg.stepScope.$$nextSibling.error = false;
		}
	});
	$scope.$on("WizardStep_0", function (e, step, scope) {
		scope.error = step.is_dirty;
		_scope.type = scope.type;
		var flag = false;
		_scope.names.forEach(function (item) {
			if (scope.name == item) {
				flag = true;
			}
		});
		if (flag) {
			_scope.sameName = true;
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("WRONG_NAME"),
				timeout: 6000
			});
		} else {
			_scope.sameName = false;
		}
		step.done = !scope.step_pane0.$invalid && !_scope.sameName && !scope.network_loading;

		if (step.done && scope.$$childTail && scope.$$childTail.bind_ip) {
			step.showLoading = true;
			step.done = false;
			checkIP.check({ ip: scope.$$childTail.bind_ip, subnet_id: scope.subnet.id }, function (res) {
				if (!res.result) {
					$.bigBox({
						title: $$$I18N.get("INFOR_TIP"),
						content: $$$I18N.get("USEDIP"),
						timeout: 6000
					});
				} else {
					$scope.$broadcast("currentStepChange", 1);
				}
				step.showLoading = false;
			}, function (error) {
				step.showLoading = false;
			});
		}
	});
	$scope.$on("WizardStep_1", function (e, step, scope) {
		if (scope.template.system_gb == 0) $.bigBox({
			title: $$$I18N.get("INFOR_TIP"),
			content: $$$I18N.get("模板系统盘不能为0"),
			color: "#C46A69",
			icon: "fa fa-warning shake animated",
			timeout: 6000
		});
		step.done = !(scope.template.system_gb == 0);
	});
	$scope.$on("WizardStep_2", function (e, step, scope) {
		setTimeout(function () {
			$("[rel=popover-hover]").popover({
				trigger: "hover"
			});
		});
		_scope.install = scope.install;
		if (scope.iso != undefined && scope.iso[0] != undefined) {
			if (scope.iso[0].os_type[0] == 'other') {
				_scope.isOther = true;
				scope.$parent.system_versions = $$$os_types;
				scope.$parent.system_version1 = scope.$parent.system_versions[0];
			} else {
				var _types = [];
				scope.iso[0].os_type.forEach(function (item) {
					var _obj = {};
					_obj.key = item;
					_obj.value = item;
					_types.push(_obj);
				});
				scope.$parent.system_versions = _types;
				scope.$parent.system_version1 = _types[0];
			}
		}
		scope.error = step.is_dirty;
		step.done = scope.iso != undefined && scope.iso[0] != undefined;
	});
	var newWindow;
	var FLAG = false;
	function gotoUrl(val) {
		if (val) {
			newWindow = window.open('templateModify.html#0');
			// newWindow = window.open('js/vdi-spice/spiceModify.html#?id=0');
		}
	}
	setTimeout(function () {
		$("#finish").on('click', function () {
			gotoUrl(FLAG);
		});
	});

	$scope.$on("WizardStep_3", function (e, step, scope) {
		if (scope.step_pane3.$invalid) {
			scope.error = step.is_dirty;
			step.done = false;
		} else if (scope.userPassword && scope.userPasswordConfirm && scope.userPassword !== scope.userPasswordConfirm) {
			step.done = false;
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content: $$$I18N.get("两次输入密码不一致"),
				timeout: 6000
			});
		} else step.done = true;
		FLAG = step.done;
	});
	$scope.$on("WizardDone", function (e, steps, scopes) {
		var auto_install = scopes[2].install === "autoinstall" ? true : false;
		var _ip = scopes[0].bind_ip_type.value === 'static' ? scopes[0].$$childHead.bind_ip : undefined;
		var testWin10 = /Windows10/;
		var item = {
			template_name: scopes[0].name,
			description: scopes[0].description,
			owner: scopes[0].owner.id,
			type_code: 2,
			vcpus: scopes[1].template.cpu_num,
			system_gb: scopes[1].template.system_gb,
			local_gb: scopes[1].template.local_gb,
			memory_mb: scopes[1].template.memory_mb,
			iso_path: scopes[2].iso[0].name,
			iso_id: scopes[2].iso[0].id,
			os_type: scopes[3].system_version1.key,
			instance_type: scopes[1].template.id,
			auto_install: auto_install,
			network: scopes[0].network.id,
			subnet: scopes[0].subnet ? scopes[0].subnet.id : '',
			band_ip: _ip,
			band_type: scopes[0].bind_ip_type.value,
			key: scopes[3].key,
			username: scopes[3].userName,
			userPassword: scopes[3].userPassword,
			userPasswordConfirm: scopes[3].userPasswordConfirm,
			virtual_type: scopes[0].type,
			enable_gpu: scopes[0].type == 'hyper-v' ? scopes[0].enable_gpu : undefined,
			gpu_auto_assignment: scopes[0].type == 'kvm' ? scopes[0].gpu_auto_assignment : undefined,
			firmware_type: scopes[0].type == 'kvm' && testWin10.test(scopes[3].system_version1.key) ? 'uefi' : undefined,

			host_uuid: scopes[0].host.host_uuid
		};
		function updateTem(isSuccess) {
			personal.query(function (res) {
				$scope.allrows.splice(0, $scope.allrows.length);
				Array.prototype.push.apply($scope.allrows, res.win_images.concat(res.linux_images).concat(res.other_images));
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
					if ($scope.select === 'all') {
						return item;
					} else {
						return item.virtual_type === scopes[0].type;
					}
				});
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				newRows.sort(function (a, b) {
					return a.created_at > b.created_at ? -1 : 1;
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);
				// if(!auto_install){
				var template = $scope.rows.filter(function (temp) {
					return temp.name == item.template_name;
				})[0];
				if (template && isSuccess) {
					if (scopes[0].type == "hyper-v") {
						if (res.sync_mode === 'scp') {
							newWindow.location.replace('templateModify_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
						} else {
							newWindow.location.replace('templateModifybt_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
						}
					} else {
						if (res.sync_mode === 'scp') {
							newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
							newWindow.location.reload();
						} else {
							newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
						}
					}
					// if(scopes[0].type == "hyper-v"){
					// 	if(res.sync_mode==='scp'){
					// 		// newWindow.location.replace('templateModify_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
					// 		//novnc-->spice-html5
					// 		newWindow.location.replace('js/vdi-spice/spiceModify_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
					// 	}
					// 	else{
					// 		// newWindow.location.replace('templateModifybt_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
					// 		//novnc-->spice-html5
					// 		newWindow.location.replace('js/vdi-spice/spiceModifybt_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
					// 	}
					// }
					// else{
					// 	if(res.sync_mode==='scp'){
					// 		// newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name);
					// 		// newWindow.location.reload();
					// 		//novnc-->spice-html5
					// 		newWindow.location.replace('js/vdi-spice/spiceModify.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
					// 		newWindow.location.reload();
					// 	}
					// 	else{
					// 		// newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name);
					// 		//novnc-->spice-html5
					// 		newWindow.location.replace('js/vdi-spice/spiceModifybt.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
					// 	}
					// }
				}
				// }
			});
		};
		e.targetScope.currentStep.showLoading = true;
		$modalInstance.close();
		personal.save(item, function (res) {
			updateTem(true);
		}, function () {
			newWindow.close();updateTem();
		}).$promise.finally(function () {
			e.targetScope.currentStep.showLoading = false;
		});;
	});

	$scope.close = function () {
		$modalInstance.close();
	};
	$scope.cpu_num = 1;
}]).controller("registerPersonalTemplateDialog", ["$scope", "$modalInstance", "Admin", "registerTemplate", "PersonTemplate", "$$$os_types", "UserRole", "Network", "virtualHost", "networkWithHost", "$$$I18N", function ($scope, $modalInstance, admin, registerTemplate, personal, $$$os_types, UserRole, network, virtualHost, networkWithHost, $$$I18N) {
	var user = UserRole.currentUser;
	$scope.min_namelength = 2;$scope.max_namelength = 20;$scope.min_passwordLe = 6;$scope.max_passwordLe = 20;
	$scope.type = '2';
	$scope.types1 = [{ name: $$$I18N.get('不分配'), value: 'none' }];
	$scope.types2 = [{ name: $$$I18N.get('系统分配'), value: 'auto' }, { name: $$$I18N.get('固定IP'), value: 'static' }];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];
	admin.query(function (res) {
		$scope.users = res.users;
		angular.forEach($scope.users, function (item) {
			if (item.name === user.name) $scope.owner = item;
		});
	});
	registerTemplate.query(function (res) {
		$scope.sys_isos = res.system_image;
		$scope.sys_iso = res.system_image[0];
		$scope.old_data_isos = res.data_image;
		if ($scope.sys_iso) {
			$scope.getDataImgs($scope.sys_iso);
		}
	});
	$scope.filterDataISO = function (data_iso, data_iso2) {
		if (data_iso) {
			$scope.data_isos2 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso.name;
			});
		} else {
			$scope.data_isos2 = $scope.data_isos;
		}
		if (data_iso2) {
			$scope.data_isos1 = $scope.data_isos.filter(function (item) {
				return item.name !== data_iso2.name;
			});
		} else {
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function (systemImg) {
		if (systemImg) {
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function (item) {
				return item.virtual_type == systemImg.virtual_type;
			});
			// $scope.data_iso = $scope.data_isos[0];
			// $scope.data_iso2 = $scope.data_isos[0];
			$scope.getVirtualHost(systemImg.virtual_type, systemImg.rbd_enabled);
		}
	};
	$scope.getVirtualHost = function (type, rbd_enabled) {
		$scope.host_loading = true;
		virtualHost.query({
			virtual_type: type,
			rbd_enabled: rbd_enabled
			// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
		}, function (res) {
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts[0];
			$scope.getNetwork($scope.host);
		}, function () {
			$scope.host_loading = false;
		});
	};

	$scope.os_types = $$$os_types.filter(function (item) {
		return item.key !== "package";
	});
	$scope.os_type = $scope.os_types[0];
	// $scope.enable_gpu = false;
	$scope.bind_ip = { value: null };

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip = _scope.band_ips[0];
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function (subnet, _scope) {
		// _scope.bind_ip_loading = true;
		if (subnet) {
			// getIps(subnet.id, _scope)
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		} else {
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network, _scope) {
		if (Network.subnets.length) {
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({ id: Network.id }, function (res) {
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			}, function () {
				$scope.network_loading = false;
			});
		} else {
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
	};
	$scope.getNetwork = function (host) {
		if (host) {
			networkWithHost.query({ host: host.host_uuid }, function (res) {
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function () {});
		}
	};
	$scope.switchSubnet = function (val, _scope) {
		getSubnets(val, _scope);
	};

	$scope.ok = function () {
		var bindIP = this.bind_ip.value;
		// if(this.bind_ip_type.value === 'static' && this.bind_ip === '无可用IP'){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("hasStaticIP_TIP"),
		// 		timeout	: 6000
		// 	});
		// }
		// else{
		$scope.submiting = true;
		$scope.afterSubmiting = false;
		var _ip = this.bind_ip_type.value === 'static' ? bindIP : undefined;
		var postData = {
			system_image_file: this.sys_iso,
			data_image_file: this.data_iso ? this.data_iso : undefined,
			data_image_file_2: this.data_iso2 ? this.data_iso2 : undefined,
			name: this.name,
			description: this.description,
			type_code: this.type,
			os: this.os_type.key,
			is_64: this.os_type.value.indexOf("64 bit") > -1 ? true : false,
			owner: this.owner.id,
			network: this.network.id,
			subnet: this.subnet ? this.subnet.id : '',
			band_ip: _ip,
			band_type: this.bind_ip_type.value,
			host_uuid: this.host.host_uuid,
			username: this.sys_iso.virtual_type == 'hyper-v' ? this.username : undefined,
			userPassword: this.sys_iso.virtual_type == 'hyper-v' ? this.userPassword : undefined,
			userPasswordConfirm: this.sys_iso.virtual_type == 'hyper-v' ? this.userPasswordConfirm : undefined
			// enable_gpu: this.sys_iso.virtual_type == 'hyper-v'?this.enable_gpu:undefined
		};
		console.log(postData);
		registerTemplate.update(postData, function (res) {
			$scope.submiting = false;
			$scope.afterSubmiting = true;
			personal.query(function (res) {
				$scope.allrows.splice(0, $scope.allrows.length);
				Array.prototype.push.apply($scope.allrows, res.win_images.concat(res.linux_images).concat(res.other_images));
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function (item) {
					if ($scope.select === 'all') {
						return item;
					} else {
						return item.virtual_type === $scope.select;
					}
				});
				newRows.forEach(function (row) {
					var os = $$$os_types.filter(function (item) {
						return item.key === row.os_type;
					})[0];
					os && os.icon && (row.icon = os.icon);
				});
				newRows.sort(function (a, b) {
					return a.created_at > b.created_at ? -1 : 1;
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows, newRows);
			});
			$modalInstance.close();
		}, function () {
			$scope.submiting = false;
			$scope.afterSubmiting = false;
		});
		// }
	};
	$scope.close = function () {
		$modalInstance.close();
	};
}]);

/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


angular.module("vdi.template.hardware", ["vdi.template"]).factory("HardwareTemplate", ["$resource", "$Domain", function (res, $Domain) {
	return res($Domain + "/thor/image", null, {
		query: { method: "GET", url: $Domain + "/thor/image/hardwares", isArray: false },
		"delete": { method: "DELETE", url: $Domain + "/thor/image/hardwares" },
		save: { method: "POST", url: $Domain + "/thor/image/hardwares" },
		get: { method: "GET", url: $Domain + "/thor/image/hardwares/:id", params: { id: "@id" }, isArray: false },
		update: { method: "PUT", url: $Domain + "/thor/image/hardware/:id", params: { id: "@id" }, isArray: false },
		// 过滤模板
		filter: { method: "GET", url: $Domain + "/thor/image/hardwares" }
	});
}]).controller("vdiTemplateHardwareListController", ["$scope", "$modal", "HardwareTemplate", function ($scope, $modal, hardware) {
	$scope.rows = [];
	$scope.loading = true;
	var _controllerScope = $scope;
	hardware.query(function (res) {
		$scope.rows = res.result;
		$scope.loading = false;
	});

	$scope.currentPage = 1;
	$scope.pagesizes = [30, 20, 10];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.delete = function (item) {
		var rows = item ? [item] : $scope.rows.filter(function (row) {
			return row._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除硬件模板'>" + "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_H' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function controller($scope, $modalInstance) {
				$scope.name = rows.map(function (row) {
					return row.name;
				}).join(', ');
				$scope.ok = function () {
					hardware.delete({
						"instance_type_id": rows.map(function (item) {
							return item.id;
						})
					}, function () {
						hardware.query(function (res) {
							var newRows = res.result;
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					}, function (error) {
						hardware.query(function (res) {
							var newRows = res.result;
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows, newRows);
						});
					});
					$modalInstance.close();
				};
				$scope.close = function () {
					$modalInstance.close();
				};
			},
			size: "sm"
		});
	};
}]).controller("addHardwareTemplateDialog", ["$scope", "$modalInstance", "HardwareTemplate", function ($scope, $modalInstance, hardware) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	$scope.data = {
		cpu_num: 1,
		memory_mb: 1,
		system_gb: 10
		// system_disk_type: "2",
		// local_disk_type: "3"
	};
	$scope.btndisks = [];
	// $scope.data.system_disk_type = "2";$scope.data.local_disk_type = "3";
	var _controllerScope = $scope;
	$scope.ok = function () {
		var _this = this;
		hardware.save({
			"name": this.data.name,
			"cpu_num": this.data.cpu_num,
			"memory_mb": this.data.memory_mb * 1024,
			"system_gb": this.data.system_gb,
			"local_gb": this.btndisks[0] ? this.btndisks[0].local_gb : 0,
			"local_gb1": this.btndisks[1] ? this.btndisks[1].local_gb : 0
			// "system_disk_type": this.data.system_disk_type,
			// "local_disk_type": this.data.local_disk_type
		}, function (data) {
			// $scope.rows.unshift({
			// 	id: data.id,
			// 	name : _this.data.name,
			// 	cpu_num : _this.data.cpu_num,
			// 	memory_mb: _this.data.memory_mb*1024,
			// 	system_gb : _this.data.system_gb,
			// 	local_gb : _this.data.local_gb,
			// 	"system_disk_type": _this.data.system_disk_type,
			// 	"local_disk_type": _this.data.local_disk_type
			// });
			hardware.query(function (res) {
				var newRows = res.result;
				_controllerScope.rows.splice(0, _controllerScope.rows.length);
				Array.prototype.push.apply(_controllerScope.rows, newRows);
			});
			$modalInstance.close();
		});
	};

	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.addbtndisk = function () {
		$scope.btndisks.push({ local_gb: 5 });
	};
	$scope.minusbtndisk = function () {
		// var idx = $scope.btndisks.indexOf(i)
		$scope.btndisks.splice($scope.btndisks.length - 1, 1);
	};
}]).controller("editHardwareTemplateDialog", ["$scope", "$modalInstance", "HardwareTemplate", function ($scope, $modalInstance, hardware) {
	$scope.min_namelength = 2;$scope.max_namelength = 20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);
	$scope.isUnchanged = function () {
		return angular.equals($scope.item, $scope.data) || angular.equals($scope.currentItem, $scope.data);
	};
	$scope.reset = function () {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function () {
		hardware.update($scope.data, function (res) {
			item.name = res.name;
			item.cpu_num = res.cpu_num;
			item.memory_mb = res.memory_mb;
			item.local_gb = res.local_gb;
			item.system_gb = res.system_gb;
			$modalInstance.close();
		}, function () {});
	};
	$scope.close = function () {
		$modalInstance.close();
	};

	$scope.useNum = "1";
	$scope.btndisks = [];
	$scope.addharddisk = function () {
		$scope.useNum -= 1;
		$scope.btndisks.push(new String());
	};
	$scope.deleteharddisk = function (itemindex) {
		$scope.useNum += 1;
		$scope.btndisks.splice(itemindex, 1);
	};
}]);

/***/ })

/******/ });
//# sourceMappingURL=spiceModifybt.map