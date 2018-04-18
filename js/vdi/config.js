/**
 * 这个文件会在每个独立页面用到，如：init, index, templateXXX
 */

// TODO: 移动到基础代码
window.$$$storage = {
	getSessionStorage(key){
		return sessionStorage.getItem('vdi_'+ key);
	},
	setSessionStorage(key, value){
		sessionStorage.setItem('vdi_'+ key, value);
	},
	clearSessionStorage(){
		sessionStorage.clear()
	}
}

// 提供翻译的闭包变量
let codeData = {};
let i18nData = {};
let imagesData = {};

let firstKey; // 记录第一个支持的 OEM，没有其它选择的时候使用这个
let ng = angular.module("ng");
let supportedOems = getSupportedOEMs();
let currentOEM = null;

let host = location.hostname;
let hasBootstrap = false;


// 定义后端接口地址
let domain = location.protocol + "//" + host + ":8081"; // 多数用这个
let controllerDomain = location.protocol + "//" + host + ":19891"; // 很少用
let interfaceDomain = location.protocol + "//" + host + ":19893"; // 很少用
if(window.vdiEnvironment === "development") {
	host = $$$storage.getSessionStorage('dev_host');
	// use dev_host
	if(host) {
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
let splitDomain = location.protocol + "//" + ($$$storage.getSessionStorage('splitIP') || domain) + ":8081";
ng.service("$RESOURCE", [function(){
	this.get = function(key){
		return supportedOems[key];
	};
	this.load = function(langCode, cb){
		loadOEMResources(langCode, cb);
	};
}]);

ng.factory("settings", [function(){
	return {
		languages: Object.keys(supportedOems).map(function(key){
			return supportedOems[key];
		}),
		currentLang: supportedOems[currentOEM]
	};
}]);

ng.service("$$$MSG", [function(){
	this.get = function(key){
		return codeData[key] || "";
	};
}]);

ng.service("$$$I18N", [function(){
	this.get = function(key){
		return i18nData[key] || "";
	};
}]);
ng.service("$$$IMAGES", [function(){
	this.get = function(key){
		return imagesData[key] || "";
	};
}]);
ng.constant("$$$os_types", require("./os-types"));
ng.config(["$httpProvider", function($httpProvider){
	$httpProvider.interceptors.push(["$q", "$rootScope", "$$$MSG", function($q, $root, $$$MSG){
		return {
			"request": function(config){
				if(/^https?\:\/\//.test(config.url)){
					config.withCredentials = true;
					return config;
				}
				if(/\.html$/i.test(config.url)) {
					return config;
				}
				if(!/^https?:\/\//.test(config.url)) {
					config.withCredentials = true;
					config.url = domain + config.url;
				}
				return config;
			},
			"requestError": function(reject){
				console.log("REQ_ERROR");
				return $q.reject({
					info: reject
				});
			},
			"responseError": function(reject){
				console.log("RES_ERROR", arguments);
				return $q.reject({
					code: 100,
					message: $$$MSG.get("返回信息格式错误"),
					info: reject
				});
			},
			"response": function(res){
				if(/^https?\:\/\//.test(res.config.url)){
					if(/\/thor\/toolkit\//.test(res.config.url) || /\/v1\/(?:node|network)\//.test(res.config.url)){
						return res;
					} else {
						switch(res.data.code){
							case 17001:
								$root.$broadcast("NOAUTH");
								break;
							case 11011:
								$$$storage.setSessionStorage('returnUrl', location.href)
								location.replace("init.html");
								break;
							case 0:
								return res;
							default:
								if(/\/thor\/home\/tasklog/.test(res.config.url)){
									return $q.reject(res);
								}
								if(window.ignoreAnyRequestError) { return res; }
								$.bigBox && $.bigBox({
									title : $$$MSG.get("PAI_CODE") + res.data.code,
									content : $$$MSG.get(res.data.code)==''?res.data.message:$$$MSG.get(res.data.code),
									color : "#C46A69",
									icon : "fa fa-warning shake animated",
									timeout : 6000
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
function bootstrap(oem){
	var oemData = supportedOems ? supportedOems[oem] : null;
	if(!oemData) {
		if(window.vdiEnvironment === "development") {
			return alert("加载资源出错！");
		}
	}
	if(oemData.code && oemData.lang && oemData.images){
		var $body = $(document.body);
		var theme = $$$storage.getSessionStorage('current_theme') || "smart-style-0";
		if(!/personal_login/.test(location.pathname)) {
			$body.addClass(theme);
			$("#vdi_skins_url").attr("href", `/resources/pkg/${oem}/skins.css`);
			$body.fadeIn(1000);
		}
		
		// 仅开发模式提示
		if(window.vdiEnvironment === "development" && !window.$$$MAIN_MODULE) {
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
function loadOEMResources(oem, cb){
	if(!oem) {
		if(window.vdiEnvironment === "development") {
			return alert("获取资源 key 失败！");
		}
	}
	if(!(oem in supportedOems)) {
		console.error("unsupported resource key:", oem);
		oem = Object.keys(supportedOems)[0];
	}
	let oemData = supportedOems[oem];
	// 先检查后加载
	if(oemData.code && oemData.lang && oemData.images){
		codeData = oemData.code;
		i18nData = oemData.lang;
		imagesData = oemData.images;
		return cb(oemData);
	}
	$.when(
		$.getJSON(`/resources/pkg/${oem}/code.js`),
		$.getJSON(`/resources/pkg/${oem}/lang.js`),
		$.getJSON(`/resources/pkg/${oem}/images.js`)
	).done(function(codeResponse, langResponse, imagesResponse){
		codeData = oemData.code = codeResponse[0];
		i18nData = oemData.lang = langResponse[0];
		imagesData = oemData.images = imagesResponse[0];
		if(!hasBootstrap) {
			registerLazyService();
			bootstrap(oem);
		} else {
			cb && cb(oemData);
		}
	}).fail(function(){
		console.log(`load ${oem} resource error:`, arguments[2]);
	});
	currentOEM = oem;
}
function main(){
	var statusXhr = $.get(controllerDomain + "/v1/node/status");
	var langXhr = $.get(domain + "/thor/init/lang");
	var status_ha = $.get(domain + "/thor/get_controller_ha_status");
	$.when(statusXhr, langXhr, status_ha).done(function(statusResponse, langResponse, haResponse){
		if(typeof statusResponse[0] === "string") {
			statusResponse[0] = JSON.parse(statusResponse[0])
		}
		var oem = langResponse[0].current_lang_type;
		var isSplitBrain = haResponse[0].result.is_split_brain;
		var isInitPage = /init\.html$/.test(location.pathname);
		var isPersonalLoginPage = location.pathname==='/personal_login/';
		var isControlNode = statusResponse[0].is_control_node;
		var isSplitBrainPage = /split\.html$/.test(location.pathname);
		if(isSplitBrainPage) {
			if(!isSplitBrain) {
				location.replace("/");
			}else{
				start();
			}
		} else {
			if(isSplitBrain){
				// $$$storage.clearSessionStorage();
				$$$storage.setSessionStorage('splitIP', haResponse[0].result.roles[0].ip);
				location.replace("split.html");
			} else {
				if(isControlNode) {
					if(isInitPage || isPersonalLoginPage) {
						start();
					} else {
						start(oem);
						initCurrentUser();
					}
				} else {
					if(isInitPage || isPersonalLoginPage){
						start();
					}else{
						location.replace("init.html");
					}
					
				}
			}
		}
	});
}

function start(oem){
	// 初始化页面默认没有语言
	if(!oem) {
		// NOTE: 版本是和语言相关的
		// 如果支持多个版本，优先使用系统默认语言
		if(Object.keys(supportedOems).length > 1) {
			// 仅仅我们自己的版本支持多语言
			// 参考：https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/language
			// 调试时，使用这段代码将浏览器设置为其它语言
			//   navigator.__defineGetter__("language", function(){ return "en-us" })
			let lang = navigator.language;
			if(lang) {
				lang = lang.split("-")[0].toLowerCase();
			}
			if(lang === "zh") {
				oem = "e-vdi";
			} else if(lang === "en") {
				oem = "classEn";
			}
			if(!supportedOems[oem]) {
				oem = firstKey;
			}
		} else {
			oem = firstKey; // 否则的话使用仅支持的版本
		}
	}
	loadOEMResources(oem, supportedOems);
}

function getSupportedOEMs(){
	var list = require("../../resources/info").resources;
	var ret = {};
	list.forEach(function(item){
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

function initCurrentUser(){
	var userId = $$$storage.getSessionStorage('userId');
	if(!userId) { return; }
	$.ajax({
		method: "POST",
		url: domain + "/thor/user/session",
		data: JSON.stringify({
			user_id: userId
		}),
		dataType: 'json'
	}).done(function(res){
		if(res.code === 0){
			// res.user.keys = "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About";
			var oldInfo = JSON.parse($$$storage.getSessionStorage("loginInfo")) || {};
			Object.keys(res.user).forEach(function(key){
				oldInfo[key] = res.user[key];
			});
			$$$storage.setSessionStorage('loginInfo', JSON.stringify(oldInfo));
			$$$storage.setSessionStorage('power', res.user.keys);
		}
	})
}

function registerLazyService(){
	ng.constant("$$$version", i18nData["GOD_VERSION"] || "dev");
}
