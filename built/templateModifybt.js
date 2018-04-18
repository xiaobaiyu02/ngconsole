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
/******/ 	return __webpack_require__(__webpack_require__.s = 164);
/******/ })
/************************************************************************/
/******/ ({

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

/***/ 164:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(10);
__webpack_require__(6);
__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(9);
module.exports = __webpack_require__(165);


/***/ }),

/***/ 165:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $is_personalTemp = $hash[2] ? true : false;
var $sameIp = $hashstr.split('=')[1] === "true" ? true : false;
angular.module("vdi.vnc", ["app.controllers", "app.localize", "ngResource", "ui.bootstrap", "vdi", "vdi.desktop", "vdi.template", "vdi.template.teach", "vdi.template.person", "vdi.template.hardware", "vdi.system", "vdi.user"]).controller("isoListController", ["$scope", "$modalInstance", "SystemISO", "VNC", function ($scope, $modalInstance, isos, vnc) {
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
}]).controller("vncController", ["$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "$$$os_types", "$$$I18N", function ($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, $$$os_types, $$$I18N) {
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
        var host, port, password, path, token;
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
    $scope.is_template = false;
    $scope.saveDisabled = false;$scope.undoDisabled = false;
    $scope.is_windows = $is_windows;
    $scope.is_personalTemp = $is_personalTemp;
    $scope.instance_count = 0;

    function getStatus() {
        $timeout(function () {
            personTemplate.status({ id: $id }, function (res) {
                $scope.saveDisabled = res.status === "installed" || res.status === "alive" || res.status === "update failed" ? true : false;
                $scope.undoDisabled = res.status === "alive" ? true : false;
                getStatus();
            });
        }, 3000);
    }

    var flag = false;
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
                    init_params(res.passwd, res.instance_id, res.vnc_host, res.vnc_token);
                    getStatus();
                }, function () {
                    checkLoad();
                });
            }
        }, 3000);
    }
    checkLoad();

    $scope.status = function () {
        return rfb ? rfb._rfb_state : "";
    };
    $scope.start = function () {

        if ($scope.status() !== "normal") {
            vm.start({ instance_ids: [$scope.instance_id] }, function () {
                function _loop() {
                    template.get_image_vnc_info({ instance_id: $instance_id }, function (res) {
                        init_params($scope.passwd, $scope.instance_id, $scope.vnc_host, res.result.token);
                        setTimeout(function () {
                            console.log($scope.status());
                            if ($scope.status() !== "normal") {
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
    };
    $scope.shutdown = function () {
        var instance_id = $scope.instance_id;
        if ($scope.status() === "normal") {
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
    };
    $scope.CAD = function () {
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
        rfb.disconnect();
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
//# sourceMappingURL=templateModifybt.map