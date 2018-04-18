var vdiApp = angular.module("smartApp", [
	"ngRoute",
	"ngResource",
	// 'ngAnimate', // this is buggy, jarviswidget will not work with ngAnimate :(
	"ui.bootstrap",
	"app.controllers",
	//"app.demoControllers",
	"app.main",
	"app.navigation",
	"app.localize",
	"app.activity",
	"app.smartui",
	"vdi",
	"vdi.auth",
	"vdi.summary",
	"vdi.about",
	"vdi.desktop",
	"vdi.resource",
	"vdi.scheduler",
	"vdi.system",
	"vdi.monitor",
	"vdi.template",
	"vdi.template.teach",
	"vdi.template.person",
	"vdi.template.hardware",
	"vdi.terminal",
	"vdi.schoolroom",
	"vdi.user",
	"vdi.plan",
	"vdi.HA",
	"vdi.network",
	"treeControl"
])

.config(["$routeProvider", "$provide", function($routeProvider, $provide){
	
	$routeProvider
		.when("/", { redirectTo: '/summary' })
		// .when("/login", {
		// 	template: "",
		// 	controller: ["$location", "$rootScope", "UserRole", function($location, $root, Role){
		// 		// if(Role.logined){
		// 		// 	$root.$broadcast("AUTHED", args)
		// 		// }
		// 		console.log("login", arguments, Role.logined);
		// 	}]
		// })
		.when("/summary", { templateUrl: "views/vdi/summary.html", controller: "vdiSummaryController"})

		.when("/resource/console", { templateUrl: "views/vdi/resource/console/console.html", controller: "vdiResourceConsoleListController"})
		.when("/resource/pool",{templateUrl: "views/vdi/resource/pool/pool.html", controller:"vdiResourcePoolListController"})
		.when("/resource/pool/:id/:type",{templateUrl: "views/vdi/resource/pool/host.html", controller:"vdiResourcePoolHostController"})
		.when("/resource/storage", { templateUrl: "views/vdi/resource/storage/storage.html", controller: "vdiResourceStorageListController"})
		
		.when("/network/manageNetwork", { templateUrl: "views/vdi/network/manageNetwork/manageNetwork.html", controller: "vdiManageNetworkListController"})
		.when("/network/virtualSwitch", { templateUrl: "views/vdi/network/virtualSwitch/virtualSwitch.html", controller: "vdiVirtualSwitchListController"})
		.when("/network/virtualSwitch/:id", {templateUrl: function(){return "views/vdi/network/virtualSwitch/virtualSwitchItem.html"; }, controller: "vdiVirtualSwitchItemController"})
		.when("/network/dataNetwork", { templateUrl: "views/vdi/network/dataNetwork/dataNetwork.html", controller: "vdiDataNetworkListController"})
		.when("/network/dataNetwork/:id", {templateUrl: function(){return "views/vdi/network/dataNetwork/sub_network.html"; }, controller: "vdiDataNetworkSubNetworkListController"})
		.when("/network/dataNetwork/:id/subnet/:sub_id",{templateUrl: "views/vdi/network/dataNetwork/IPpool.html", controller: "vdiDataNetworkIPListController"})
		.when("/network/dhcp", { templateUrl: "views/vdi/network/dhcp/dhcp.html", controller: "vdiDHCPController", controllerAs: "DHCPCtrl"})

		.when("/desktop/scene", { templateUrl: "views/vdi/desktop/scene.html", controller: "vdiDesktopSceneListController"})
		.when("/desktop/teach/:id", { templateUrl: function(){ return "views/vdi/desktop/teach.html"}, controller: "vdiDesktopTeachListController"})
		.when("/desktop/personal", { templateUrl: "views/vdi/desktop/personal.html", controller: "vdiDesktopPersonalListController"})
		.when("/desktop/pool", { templateUrl: "views/vdi/desktop/pool.html", controller: "vdiDesktopPoolController"})
		.when("/desktop/poolList/:id", { templateUrl: function(){ return "views/vdi/desktop/poolList.html"}, controller: "vdiDesktopPoolListController"})
		.when("/template/teach", { templateUrl: "views/vdi/template/teach.html", controller: "vdiTemplateTeachDesktopListController"})
		.when("/template/personal", { templateUrl: "views/vdi/template/personal.html", controller: "vdiTemplatePresonalDesktopListController"})
		.when("/template/hardware", { templateUrl: "views/vdi/template/hardware.html", controller: "vdiTemplateHardwareListController"})
		.when("/terminal/schoolroom", { templateUrl: "views/vdi/terminal/schoolroom.html", controller: "vdiTerminalSchoolroomManageController"})
		.when("/terminal/client", { templateUrl: "views/vdi/terminal/client.html", controller: "vdiTerminalClientManageController"})
		.when("/terminal/session", { templateUrl: "views/vdi/terminal/session.html", controller: "vdiTerminalSessionManageController"})
		.when("/user/role", { templateUrl: "views/vdi/user/role.html", controller: "vdiUserRoleManageController"})
		.when("/user/admin", { templateUrl: "views/vdi/user/admin.html", controller: "vdiUserAdminManageController"})
		.when("/user/common", { templateUrl: "views/vdi/user/common.html", controller: "vdiUserCommonManageController"})
		.when("/user/domain", { templateUrl: "views/vdi/user/domain.html", controller: "vdiUserDomainController"})
		.when("/user/domain/:id", { templateUrl: function(){ return "views/vdi/user/domainList.html"}, controller: "vdiUserDomainListController"})
		.when("/monitor/host", { templateUrl: "views/vdi/monitor/host.html", controller: "vdiMonitorController"})
		.when("/monitor/desktop", {templateUrl:"views/vdi/monitor/desktop.html", controller:"vdiMonitorController"})
		.when("/monitor/alarm", { templateUrl: "views/vdi/monitor/alarm.html", controller: "vdiMonitorAlarmController"})
		.when("/monitor/policy", { templateUrl: "views/vdi/monitor/policy.html", controller: "vdiMonitorPolicyController"})
		.when("/scheduler/view", { templateUrl: "views/vdi/scheduler/view.html", controller: "vdiSchedulerViewController"})
		.when("/plan/switch", { templateUrl: "views/vdi/plan/switch.html", controller: "vdiPlanSwitchController"})
		.when("/plan/hostSwitch", { templateUrl: "views/vdi/plan/host_switch.html", controller: "vdiHostPlanSwitchController"})
		.when("/HA/desktop", { templateUrl: "views/vdi/HA/desktop_ha.html", controller: "vdiDesktopHAViewController"})

		.when("/system/deploy", { templateUrl: "views/vdi/system/deploy.html", controller: "vdiSystemDeployController"})
		.when("/system/set", { templateUrl: "views/vdi/system/set.html", controller: "vdiSystemSetController", controllerAs:"SetCtrl"})

		.when("/system/desktop", { templateUrl: "views/vdi/system/desktop.html", controller: "vdiSystemDesktopListController"})
		.when("/system/desktop/:id", { templateUrl: "views/vdi/system/desktop_detail.html", controller: "vdiSystemDesktopDetailController"})
		.when("/system/backup", { templateUrl: "views/vdi/system/backup.html", controller: "vdiSystemBackupListController"})
		.when("/system/iso", { templateUrl: "views/vdi/system/iso.html", controller: "vdiSystemISOListController"})
		.when("/system/usb", { templateUrl: "views/vdi/system/usb.html", controller: "vdiSystemUSBListController"})
		.when("/system/through", { templateUrl: "views/vdi/system/through.html", controller: "vdiSystemUSBThroughController"})
		.when("/system/snapshot", { templateUrl: "views/vdi/system/snapshot.html", controller: "vdiSystemAutoSnapshotController"})
		// .when("/system/device", { templateUrl: "views/vdi/system/device.html", controller: "vdiSystemDeviceListController"})
		.when("/system/upgrade", { templateUrl: "views/vdi/system/upgrade.html", controller: "vdiSystemUpgradeListController"})
		.when("/system/logs", { templateUrl: "views/vdi/system/logs.html", controller: "vdiSystemLogListController"})
		// .when("/system/endlogs", { templateUrl: "views/vdi/system/endlogs.html", controller: "vdiSystemEndlogListController"})
		.when("/system/outside", { templateUrl: "views/vdi/system/outside.html", controller: "vdiSystemOutsideController"})
		.when("/about", { templateUrl: "views/vdi/about.html", controller: "vdiPermissionController"})

		.otherwise({
			redirectTo: '/summary'
		});
	// with this, you can use $log('Message') same as $log.info('Message');
	$provide.decorator('$log', ['$delegate',
	function($delegate) {
		// create a new function to be returned below as the $log service (instead of the $delegate)
		function logger() {
			// if $log fn is called directly, default to "info" message
			logger.info.apply(logger, arguments);
		}

		// add all the $log props into our new logger fn
		angular.extend(logger, $delegate);
		return logger;
	}]); 

}])

.run([
"$rootScope", "settings","localize", "$route", "UserRole", "$window", "$document", "$$$I18N", "UserAuth", "UserRole", "NavigatorLink", "quickMaskModel", "SystemDeploy","desktopHelpBox",
function($root, settings, localize, $route, UserRole, $window, $doc, $$$I18N, Auth, userRole, navigators, quickMaskModel, SystemDeploy, desktopHelpBox){
	//$root.$broadcast(Auth.logined ? "AUTHED" : "NOAUTH");
	if($$$storage.getSessionStorage("desktopHelpBox")=='open'){
		desktopHelpBox.close();
		desktopHelpBox.open();
	}else{ desktopHelpBox.close(); }
	
	if($$$storage.getSessionStorage("loginInfo")) {
		openQuickstart();
	}
	$root.$on("AUTHED", function(name, userInfo){
		$route.reload();
		$root.$broadcast("updateNavData", UserRole.currentNavigator);
		openQuickstart();
	});
	var preferLang = settings.languages.filter(function(l) {
		return l.langCode === $$$storage.getSessionStorage('lang_code');
	})[0];
	if(preferLang) {
		settings.currentLang = preferLang;
	}
	var ev_dialog_close = function(){
		try{
			window.___dialog && window.___dialog.dismiss && window.___dialog.dismiss();
			window.___dialog = null;
		}
		catch(e){}
	}
	$root.$on("updateDocumentTitle", function(name, title){
		$window.document.title = $$$I18N.get(title);
	});
	$root.$on("$viewContentLoaded", ev_dialog_close);
	$root.$on("$$$forceCloseDailog", ev_dialog_close);

	$root.$on("$viewContentLoaded", function(){
		let URL = [], HASH = location.hash.slice(1);
		UserRole.currentNavigator.map(function(item){
			if(item.sublist){
				item.sublist.forEach( data => { URL.push(data.url); } )
			}
			else
				return URL.push(item.url);
		})
		var is_hasid = false;
		if(
			location.hash.match(/#\/desktop\/teach\/\S+$/) || 
			location.hash.match(/#\/desktop\/pool\/\S+$/) || 
			location.hash.match(/#\/desktop\/personal\S+$/) || 
			location.hash.match(/#\/desktop\/poolList\/\S+$/) || 
			location.hash.match(/#\/network\/dataNetwork\/\S+$/) || 
			location.hash.match(/#\/resource\/pool\/\S+$/) || 
			location.hash.match(/#\/system\/desktop\/\S+$/) || 
			location.hash.match(/#\/user\/domain\/\S+$/)  || 
			location.hash.match(/#\/network\/virtualSwitch\/\S+$/) || 
			location.hash.match(/#\/terminal\/client\S+$/) || 
			location.hash.match(/#\/system\/deploy\S+$/)){
			is_hasid = true;
		}			
		if(URL.length!==0 && URL.filter(function(item){ return item===HASH }).length===0 && !is_hasid){
			location.replace("#summary.html")
		}
	});
	$root.navs = UserRole.currentNavigator;
	$root.$broadcast("updateNavData", UserRole.currentNavigator);

	var debug = true;
	if(window.console && !debug){
		window.console = {};
		"memory,debug,error,info,log,warn,dir,dirxml,table,trace,assert,count,markTimeline,profile,profileEnd,time,timeEnd,timeStamp,timeline,timelineEnd,group,groupCollapsed,groupEnd,clear".split(",").forEach(function(n){
			window.console[n] = Function.prototype;
		});
	}
	var UA = navigator.userAgent;
	$root.is_chrome = /Chrome\//.test(UA) && /AppleWebKit\//.test(UA) && /Safari\//.test(UA);

	function openQuickstart(){
		SystemDeploy.first_deploy(function(res){
			if(res.result){
				quickMaskModel.open();
			}
		});
	}
}
]);

vdiApp.constant('ip_pattern',/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g);
