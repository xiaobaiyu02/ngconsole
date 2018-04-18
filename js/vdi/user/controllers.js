angular.module("vdi.user", [])

.constant('$$$UserRoles', "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About")

.factory("UserRole", ["$$$UserRoles", "NavigatorLink", "$rootScope", "$$$UserRoles", "User", function(roles, navigators, $root, $$$UserRoles, User){
	let lastSessionPromise;
	let lastRequestTime = 0;
	let role = {
		getNavigator(roles){
			if($$$storage.getSessionStorage("lang_code") == 'pc')
				navigators = navigators.filter(function(item){ return item.key !== 'Timetable' });
			return navigators.reduce((userNavigators, role) => {
				if(roles.indexOf(role.key) > -1){
					let role_copy = JSON.parse(JSON.stringify(role));
					userNavigators.push(role_copy);
					if(role.sublist && role.sublist.length){

						role_copy.sublist = role.sublist.filter(role => roles.indexOf(role.key) > -1);
					}
				}
				return userNavigators;
			}, []);
		},
		get currentUser(){
			var hasCache = !!$$$storage.getSessionStorage("loginInfo");
			if(hasCache && Date.now() - lastRequestTime > 1000 * 60 * 5) {
				this.refreshSession();
			}
			
			if(hasCache){
				return JSON.parse($$$storage.getSessionStorage("loginInfo"));
			}
			$root.$broadcast("NOAUTH");
			return null;
		},
		get logined(){
			return Boolean($$$storage.getSessionStorage("loginInfo"));
		},
		get currentUserRoles(){
			let user = role.currentUser;
			return user && user.keys ? user.keys.split(",").map(r => r.trim()) : [];
		},
		get isOwner(){
			let user = role.currentUser;
			return user && user.keys && user.keys===$$$UserRoles ? true:false;
		},
		get currentNavigator(){
			return role.getNavigator(role.currentUserRoles);
		},
		get currentSession(){
			return lastSessionPromise;
		},
		isAllowFilter(role){
			if(role.sublist && role.sublist.length){
				role.sublist.filter(isAllowFilter, this);
			}
			return this.indexOf(role.key) > -1;
		},
		refreshSession(){
			lastSessionPromise = User.session({user_id: $$$storage.getSessionStorage("userId")}).$promise;
			lastSessionPromise.then(function(res){
				var oldInfo = JSON.parse($$$storage.getSessionStorage("loginInfo")) || {};
				// test--
                // res.user.keys = "Summary,Resource,Console,Pool,Storage,Network,ManageNetwork,VirtualSwitch,DataNetwork,DHCP,Desktop,Teaching_desktop,Personal_desktop,Personal_desktop_pool,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Alarm_policy,Timetable,Course_list,Plan,Timer_switch,Host_switch,HA,desktop_ha,System,System_deploy,System_desktop,System_backup,System_ISO,USB_redirection,USB_through,AutoSnapshot,System_set,System_upgrade,Operation_log,About";
				Object.keys(res.user).forEach(function(key){
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
.factory("Roles", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/user/permissions", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/permissions", isArray: false},
		update:
			{method: "PUT", url: $Domain + "/thor/user/permissions" }
	});
}])
.factory("Admin", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/user/manager", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/manager", isArray: false},
		update: 
			{method: "PUT", url: $Domain + "/thor/user/manager" }
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
.factory("User", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/user/common", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/common", isArray: false},
		edit: 
			{method: "PATCH", url: $Domain + "/thor/user/common/:id", params: { "id": "@id" }, isArray:false},
		move:
			{method: "PATCH", url: $Domain + "/thor/user/common/move"},
		query_tree :
			{method: "GET", url: $Domain + "/thor/user/common/tree"},
		session: {method: "POST", url: $Domain + "/thor/user/session"}
	});
}])
/**
 * [description 部门]
 */
 .factory("Depart", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/user/departments", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/departments", isArray: false},
		add: 
			{method: "POST", url: $Domain + "/thor/user/departments" },
		update: 
			{method: "PATCH", url: $Domain + "/thor/user/departments/:id", params: { "id": "@id" }, isArray:false},
		delete:
			{ method: "DELETE", url: $Domain + "/thor/user/departments/:id", params: { "id": "@id" }, isArray:false}
	});
}])
.factory("Server", ["$resource", "$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/user/server", null, {
		// 读取域列表
		query:
			{ method: "GET", url: $Domain + "/thor/user/server"},
		get: 
			{ method: "GET", url: $Domain + "/thor/user/info/:id", params: { "id": "@id" }, isArray:false},
		// 修改域基本信息
		update: 
			{ method: "PUT", url: $Domain + "/thor/user/server"},
		//新增域
		create:
			{ method: "POST", url: $Domain + "/thor/user/server"},
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" }, isArray:false},
		listDomain:
			{ method: "GET", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" }},

		// 指定教学桌面设置域
		"domain_set_scene":
			{ method: "POST", url: $Domain + "/thor/pool/mode/:id/change_domain" , params:{"id": "@id"}},
		//个人桌面设置域
		"domain_set_person":
			{ method: "POST", url: $Domain + "/thor/instances/change_domain"}
	});
}])
.factory("Domain", ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/user/domain/:id", { "id": "@id" }, {
		// 域用户列表
		list:
			{method: "GET", url: $Domain + "/thor/user/get_users"},
		// 查看特定域的用户信息
		query:
			{ method: "GET", url: $Domain + "/thor/user/domain/:id",params:{"id":"@id"}},
		asycing:
			{ method: "POST", url: $Domain + "/thor/user/domain/:id", params: { "auto": "@auto" }, isArray: false},
		get:
			{ method: "GET", url: $Domain + "/thor/user/domain/:id/ous",params:{"id":"@id"}},
		delete:
			{ method: "DELETE", url: $Domain + "/thor/user/common",isArray: false}
	});
}])


.controller("vdiUserAdminManageController", [
"$scope", "Admin","$modal", "UserRole", "$$$I18N",
function($scope, UseradminList, $modal, UserRole, $$$I18N){
	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.rows = [];
	// $scope.allRows = [];
	$scope.loading = true;
	$scope.owner = UserRole.isOwner;
	$scope.loginName = user.name;
	
	UseradminList.query(function(res){
		if(!$scope.owner){
			$scope.rows = res.users.filter(function(item){ return item.name == $scope.loginName });
		}
		else{
			$scope.rows = res.users;
		}
		$scope.loading = false;
		var _ip;
		$scope.rows.forEach(function(row){
			if(row.last_login !== null){
				_ip = row.last_login.split(".");
				row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
			}
			else{
				_ip = null;
				row._ip = null;
			}
		});
		// angular.copy($scope.rows,$scope.allRows);
	});

    $scope.currentPage = 1;
 	$scope.pagesize = Number($$$storage.getSessionStorage('admin_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('admin_pagesize', newvalue ? newvalue : 0)
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

    $scope.sortIP = function(order){
    	$scope.rows.sort(function(a, b){
			return (a._ip > b._ip) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
    };

	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && !row._ignore; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });
		var rows = $scope.rows;
		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					timeout : 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

					controller : function($scope, $modalInstance){
						$scope.nodelete_rows = nodelete_rows;
						$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
						$scope.ok = function(){
							UseradminList.delete({
								ids: delete_rows.map(function(row){ return row.id; })
							}, function(res){
								delete_rows.forEach(function(item){
									var index = rows.indexOf(item);
									rows.splice(index, 1);
								});
								$modalInstance.close();
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
				});
	};

}])
.controller("vdiUserCommonManageController", [
"$scope","User","$modal", "$http", "$$$MSG", "$$$I18N", "$Domain","$timeout","customModal", "Depart","User","UserRole","$location",
function($scope, UsercommonList, $modal, $http, $$$MSG, $$$I18N, $Domain,$timeout,customModal,Depart,User,UserRole,$location){
	var _scope = $scope;
	$scope.rows = [];
	var WIDTH = $$$I18N.get("GOD_VERSION") == "cloudClassEn" || $$$I18N.get("GOD_VERSION") == "korean" ? 66:50;
	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('common_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('common_pagesize', newvalue ? newvalue : 0)
	}); 
	$scope.domain = $Domain;
	/**
	 * [sortIP IP排序]
	 */
	$scope.sortIP = function(order){
		$scope.rows.sort(function(a, b){
			return (a._ip > b._ip) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};

	 // 组合json数据
	 function setData(data, index){
	 	data.filter(function(item){ return item.full_path_map.length == index }).forEach(function(item){
	 		var children = data.filter(function(d){ return d.parent == item.id });
	 		item.children = children;
	 	});
	 }
	function setTreeData(DATA){
		DATA.forEach(function(item){
			item.full_path_map = item.full_path.split('/');
		});
		DATA.sort(function(a,b){ return a.full_path_map.length>b.full_path_map.length?-1:1 });
		for(var i=1; i<DATA[0].full_path_map.length; i++){
			setData(DATA, i);
		}
		return [DATA[DATA.length-1]];
	};
	// 初始化树状图
	function treeOptFun(arg,flag){
		arg.opts = {};
		arg.treedata = newData;
		arg.expandnodes = DATA;
		arg.selected = arg.treedata[0]?arg.treedata[0]:null;
		if(arg.selected){
			arg.selected._selected = true;
		}
		arg.showSelected = function(node, selected){
			node._selected = selected;
			arg.selected = node;
			if(arg.selected._selected && flag){
				$scope.queryCommon(arg.selected.id);
			}
		}
	};
	var DATA = [], newData = [];
	treeOptFun($scope,true);

	$scope.islastGroup = function(){
		return $scope.selected && !DATA.filter(function(item){
					return item.id!==$scope.selected.id;
				}).filter(function(item){
					return (item.full_path+'/').indexOf($scope.selected.full_path+'/')>-1;
				}).length
	}
	$scope.queryCommon = function(departId){
		$scope.user_loading = true;
		$scope.rows = [];
		UsercommonList.query({department: departId?departId:undefined}, function(users){
			$scope.user_loading = false;
			$scope.rows = users.result;
			// $scope.rows.forEach(function(item){ item.department_desc = $scope.selected.full_path });
			var _ip;
			$scope.rows.forEach(function(row){
				if(row.last_login !== null){
					_ip = row.last_login.split(".");
					row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
				}
				else{
					_ip = null;
					row._ip = null;
				}
			});
			console.log(777, $scope.rows)
		},function(){
			$scope.user_loading = false;
		})
	}
	$scope.treedata_loading = true;
	$scope.queryDepart = function(){
		Depart.query(function(res){
			$scope.treedata_loading = false;
			DATA = res.result;
			$scope.treedata = newData = DATA.length?setTreeData(DATA):[];
			$scope.treedata[0].children && $scope.treedata[0].children.sort(function(a,b){ return a.name>b.name?-1:1 });
			$scope.expandnodes = DATA;
			var selected = {};
			if($scope.selected){
				var _selected = DATA.filter(function(item){ return item.id==$scope.selected.id })[0];
				selected = _selected?_selected:newData[0];
			}else{
				selected = newData[0];
			}
			$scope.selected = selected;
			if($scope.selected){
				$scope.selected._selected = true;
				$scope.queryCommon($scope.selected.id);
			}
		},function(err){
			$scope.treedata_loading = false;
		});
	}
	if($location.$$search.depart)
		$scope.selected = {id: Number($location.$$search.depart)};
	if($location.$$search.username)
		$scope.searchText = decodeURIComponent($location.$$search.username);

	$scope.queryDepart();
	
	
	/**
	 * [addDepartment 添加部门]
	 */
	$scope.addDepartment=function(){
		$modal.open({
			templateUrl:"views/vdi/dialog/user/user_common_department_add.html",
			size: DATA.length ? "md":'sm',
			controller:function($scope,$modalInstance){
				$scope.min_namelength=2;$scope.max_namelength=20;
				treeOptFun($scope);
				$scope.selected = null;
				$scope.ok = function(){
					Depart.add({
						name: this.name,
						parent: this.selected?this.selected.id:1
					},function(res){
						$modalInstance.close();
						_scope.queryDepart();
					},function(){});					
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			}

		})
	}
	/**
	 * [deleteDpartment 删除部门]
	 */
	$scope.deleteDpartment=function(){
		var modalOptions = {
			key: "CommonDepartDel",
			title: "删除用户组",
			delTips: "USER_TIPGROUP3",
			delete_rows: [$scope.selected],
			delParm: 'name'
		}
		customModal.openModal(modalOptions);
	}
	/**
	 * [delete 列表删除用户]
	 */
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });

		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					timeout: 6000
				});
		}else{
			var modalOptions = {
				key: "CommonUserDel",
				title: "删除用户",
				delTips: "USER_TIPGROUP1",
				delete_rows: delete_rows,
				delParm: 'name',
				nodelete_rows: nodelete_rows,
				nodelTips: "USER_TIPGROUP4"
			}
			customModal.openModal(modalOptions);
		}
	};

	$scope.$on('DELETE',function(e, val){
		if(val){
			// 删除部门
			if(val.key=='CommonDepartDel'){
				Depart.delete({
					id: val.data[0].id,
				},function(res){
					$scope.queryDepart();
				},function(){});
			}
			//删除部门用户
			if(val.key=='CommonUserDel'){
				UsercommonList.delete({
					id: val.data.map(function(row){ return row.id; })
				},
				function(res){
					$scope.queryDepart();
				});
			}
		}
	});
	/**
	 * [modifyInfo 修改部门名称]
	 */
	$scope.modifyInfo=function(node){
		var obj = node?node:$scope.selected;
		$modal.open({
			templateUrl:"views/vdi/dialog/user/user_common_department_modify.html",
			size:"sm",
			controller:function($scope,$modalInstance){
				$scope.min_namelength=2;$scope.max_namelength=20;
				$scope.name = obj.name;
				$scope.ok = function(){
					Depart.update({
						id: obj.id,
						name: this.name
					},function(res){
						_scope.queryDepart();
					},function(){});
					$modalInstance.close();
				}

				$scope.close=function(){
					$modalInstance.close();
				}
			}
		})
	}
	/**
	 * [moveTo 用户移动至部门]
	 */
	$scope.moveTo=function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		$modal.open({
			templateUrl:"views/vdi/dialog/user/user_common_moveTo.html",
			size:"md",
			draggable:true,
			controller:function($scope,$modalInstance){
				treeOptFun($scope);
				$scope.opts.isSelectable = function(node){
					return	!DATA.filter(function(item){
								return item.id!==node.id;
							}).filter(function(item){
								return (item.full_path+'/').indexOf(node.full_path+'/')>-1;
							}).length
				};
				$scope.selected = null;
				$scope.ok = function(){
					User.move({
						id: selected_rows.map(function(item){ return item.id }),
						department: this.selected.id
					},function(res){
						_scope.queryDepart();
					});
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
				//勾选的人员姓名
				$scope.selectedPerson = selected_rows.map(function(item,index,arr){ return item.name }).join('，');
			}
		})
	}
	/**
	 * [description uploadify上传文件]
	 */
	var encodeHTML = function(txt, con){
		con = con || document.createElement("div");
		while(con.firstChild){
			con.removeChild(con.firstChild);
		}
		return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
	};
	var format = function(tmpl){
		var data = Array.prototype.slice.call(arguments, 0);
		return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function(match, param){
			if(data[param]){
				return encodeHTML(data[param]);
			}
			return match;
		}) : "";
	};
	
	$scope.finishUpload = function(response){
		$scope.queryDepart();
	}

	$scope.$on("UploadError", function (e, suc, errorData) {
		var errorMsg = errorData.code==17041? $$$MSG.get(errorData.code)+errorData.detail : $$$MSG.get(errorData.code);
		$.bigBox({
			title : $$$MSG.get("PAI_CODE") + errorData.code,
			content : errorMsg,
			color : "#C46A69",
			icon : "fa fa-warning shake animated",
			timeout : 6000
		});
	});
}])
.controller("vdiUserDomainController", ["$scope", "$modal", "Server", function($scope,$modal,Server){
	$scope.loading = true;
	$scope.rows = [];

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading=false;

	Server.query(function(response){
		$scope.rows=response.servers;
	},function(){
		//console.log(arguments);
	});

	var _scope = $scope;
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var rows = $scope.rows;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除域控制器'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.name = selected_rows.map(function(row){ return row.host }).join(', ');
				$scope.ok = function(){
					Server.delete({
						ids: selected_rows.map(function(row){ return row.id; })
					},
					function(res){
						Server.query(function(response){
							_scope.rows=response.servers;
						});
						$modalInstance.close();
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	
}])
.controller("vdiUserDomainListController",["$scope", "$modal","Domain", "User","$routeParams", "$$$I18N", function($scope, $modal,Domain,User,$routeParams,$$$I18N){
	$scope.loading = true;
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["用户", "域用户","域用户列表"]);

	// location.replace("#/user/domain/");
	$scope.domainId = location.hash.match(/\d+$/)? parseInt(location.hash.match(/\d+$/)[0]):$routeParams.id;
	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading=false;
	$scope.rows=[];
	$scope.oneKeySycing=function(){
		Domain.asycing({"auto":1,"id":$scope.domainId},function(response){
			angular.forEach(response.result,function(item,index){
				var i;
				for(i=0;i<$scope.rows.length;i++){
					if(item.id==$scope.rows[i]){
						$scope.rows[i]=item;
					}
				}
				if(i>=$scope.rows.length){
					$scope.rows.push(item);
				}
				//$scope.rows.push(item);
			});
		});
	}

    var _scope = $scope;
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });
		var rows = $scope.rows;
		
		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					timeout : 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;word-break: break-all;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.nodelete_rows = nodelete_rows;
						$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						User.delete({
							ids: delete_rows.map(function(row){ return row.id; })
						},
						function(res){
							delete_rows.forEach(function(item){
								var index = rows.indexOf(item);
								rows.splice(index, 1);
							});
							$modalInstance.close();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
	};

	Domain.query({"id":$scope.domainId},function(response){
		$scope.rows=response.users;
	},function(){
	});
}])
.controller("vdiUserRoleManageController", ["$scope", "$modal", "Roles", "$$$UserRoles", "$$$I18N",function($scope, $modal, roles, $$$UserRoles, $$$I18N){
	$scope.rows = [];var _controllerScope = $scope;$scope.loading = true;
	// $scope.allRows = [];
	$scope.powers = $$$UserRoles;
	roles.query(function(res){
		$scope.rows = res.result.sort(function(a,b){
			if(a.name === 'Administrator'){
				return -1
			}else if(b.name === 'Administrator'){
				return 1;
			}
			return 0;
		});
		$scope.loading = false;
		// angular.copy($scope.rows,$scope.allRows);
	});

    $scope.currentPage = 1;
    $scope.pagesize = Number($$$storage.getSessionStorage('role_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('role_pagesize', newvalue ? newvalue : 0)
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

    $scope.delete = function(item){
    	var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && !row._ignore });
    	var nodelete_rows = selected_rows.filter(function(row){ return row.user_num != 0; });
    	var delete_rows = selected_rows.filter(function(row){ return row.user_num == 0; });
    	var rows = $scope.rows;

    	if(delete_rows.length==0){
    		$.bigBox({
    				title : $$$I18N.get("INFOR_TIP"),
    				content : $$$I18N.get("ROEL_TIP"),
    				timeout : 6000
    			});
    	}
    	else 
    		$modal.open({
    			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除角色'>"+
    					"删除角色</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ROLES1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='DELETE_ROLES2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

    				controller : function($scope, $modalInstance){
    					$scope.nodelete_rows = nodelete_rows;
    					$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
    					$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');

    					$scope.ok = function(){
    						roles.delete({
    							ids: delete_rows.map(function(row){ return row.id; })
    						}, function(res){
    							delete_rows.forEach(function(item){
    								var index = rows.indexOf(item);
    								rows.splice(index, 1);
    							});
    							$modalInstance.close();
    						});
    					}
    					$scope.close = function(){
    						$modalInstance.close();
    					}
    				},
    				size : "sm"
    			});
    	};

}])



.controller("addUserRoleDialog", ["$scope", "$modalInstance", "Roles", "$$$I18N", "NavigatorLink", function($scope, $modalInstance, role,$$$I18N, navigators){
	$scope.checked = true;$scope.roles = [];
	navigators.forEach( item => {
		if(item.sublist){
			$scope.roles.push(item);
			item.sublist.forEach( data => { if(data.key!=="Role_Manage") $scope.roles.push(data);} )
		}
		else
			$scope.roles.push(item);
	});
	$scope.roles.forEach(function(item){
		item._selected = $scope.checked;
		item._slide = false;
		item._arrow = "up";
	})
	$scope.selectAll = function(){
	 	$scope.checked = !$scope.checked;
	 	if($scope.checked){
	 		$scope.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = true;
	 		})
	 	}
	 	else{
	 		$scope.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = false;
	 		})
	 	}
	 }
	$scope.slide = function(name,checked){
		var fatheritem = $scope.roles.filter(function(item){ return item.key === name })[0];
		var subitem = $scope.roles.filter(function(item){ return item.belong === name })
		if(checked){
			fatheritem._arrow = "down";
			subitem.forEach(function(item){
				item._slide = true;
			})
		}
		else{
			fatheritem._arrow = "up";
			subitem.forEach(function(item){
				item._slide = false;
			})
		}
	 };
	$scope.select = function(name){
			var checked = $scope.roles.filter(function(item){ return item.key === name })[0]._selected;
			var subitem = $scope.roles.filter(function(item){ return item.belong === name })
			if(!checked){
				subitem.forEach(function(item){
					item._selected = true;
				})
			}
			else{
				subitem.forEach(function(item){
					item._selected = false;
				})
			}
			var length = $scope.roles.filter(function(item){ return item._selected; }).length;
			if(length+1 == $scope.roles.length){
				$scope.checked = true;
			}
			else
				$scope.checked = false;
		 };
		$scope.set = function(name){
			var allchecked = false;
			$scope.roles.filter(function(item){ return item.belong === name }).forEach(function(item){ 
				if(item._selected == true){
					allchecked = true;
				}
			})
			var fatheritem = $scope.roles.filter(function(item){ return item.key === name })[0];
			if(fatheritem){
				if(!allchecked)
					fatheritem._selected = false;
				else{
					fatheritem._selected = true;
				}	
			}
			var length = $scope.roles.filter(function(item){ return item._selected; }).length;
			if(length == $scope.roles.length){
				$scope.checked = true;
			}
			else
				$scope.checked = false;
			
		}



	 $scope.min_namelength=2;$scope.max_namelength=20;

	$scope.ok = function(){
		var _this = this;
		var roles = this.roles.filter(function(item){ return item._selected == true }).map(function(item){ return item.key });
		if(roles.length){
			role.save({
					"name": this.data.name,
					"desc": this.data.desc,
					"keys": roles.toString()
				},
				function(data){
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
				}
			);			
		}
		else{
			$.bigBox({
				title	:$$$I18N.get("INFOR_TIP"),
				content	:$$$I18N.get("PERMISSION_TIP"),
				timeout	:6000
			});
		}

	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editUserRoleDialog", [
"$scope", "$modalInstance", "Roles", "$$$I18N", "UserRole","NavigatorLink",
function($scope, $modalInstance, role, $$$I18N, UserRole, navigators){
	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {};
	$scope.master = {};

	var item = $scope.item || $scope.currentItem;
	var roles = [];
	navigators.forEach( item => {
		if(item.sublist){
			roles.push(item);
			item.sublist.forEach( data => { if(data.key!=="Role_Manage") roles.push(data);} )
		}
		else
			roles.push(item);
	});
	item.roles = roles;
	var access_roles = item.access_key.split(",");
	item.roles.forEach(function(item){
		item._selected = false;
		item._slide = false;
		item._arrow = "up";
	})
	access_roles.forEach(function(role){
		item.roles.forEach(function(item){
			if(item.key === role) item._selected = true;
		})
	})
	$scope.data = angular.copy(item);

	if($scope.data.roles.filter(function(item){ return item._selected === true }).length === $scope.data.roles.length){
		$scope.checked = true;
	}
	else $scope.checked = false;

	$scope.selectAll = function(){
	 	$scope.checked = !$scope.checked;
	 	if($scope.checked){
	 		$scope.data.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = true;
	 		})
	 	}
	 	else{
	 		$scope.data.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = false;
	 		})
	 	}
	 }
	 $scope.slide = function(name,checked){
	 	var fatheritem = $scope.data.roles.filter(function(item){ return item.key === name })[0];
	 	var subitem = $scope.data.roles.filter(function(item){ return item.belong === name })
	 	if(checked){
	 		fatheritem._arrow = "down";
	 		subitem.forEach(function(item){
	 			item._slide = true;
	 		})
	 	}
	 	else{
	 		fatheritem._arrow = "up";
	 		subitem.forEach(function(item){
	 			item._slide = false;
	 		})
	 	}
	  };
	$scope.select = function(name){
		var checked = $scope.data.roles.filter(function(item){ return item.key === name })[0]._selected;
		var subitem = $scope.data.roles.filter(function(item){ return item.belong === name })
		if(!checked){
			subitem.forEach(function(item){
				item._selected = true;
			})
		}
		else{
			subitem.forEach(function(item){
				item._selected = false;
			})
		}
		var length = $scope.data.roles.filter(function(item){ return item._selected; }).length;
		if(length+1 == $scope.data.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
	 };
	$scope.set = function(name){
		var allchecked = false;
		$scope.data.roles.filter(function(item){ return item.belong === name }).forEach(function(item){ 
			if(item._selected == true){
				allchecked = true;
			}
		})
		var fatheritem = $scope.data.roles.filter(function(item){ return item.key === name })[0];
		if(fatheritem){
			if(!allchecked)
				fatheritem._selected = false;
			else{
				fatheritem._selected = true;
			}	
		}
		var length = $scope.data.roles.filter(function(item){ return item._selected; }).length;
		if(length == $scope.data.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
		
	}


	$scope.ok = function(){
		var _this = this;
		var roles = this.data.roles.filter(function(item){ return item._selected == true }).map(function(item){ return item.key });
		if(roles.length){
			role.update({
					"id": this.data.id,
					"name": this.data.name,
					"desc": this.data.desc,
					"keys": roles.toString()
				},
				function(data){
					var POWER = item.access_key;
					item.name = data.name;
					item.desc = data.desc;
					item.access_key = data.access_key;
					item.redactor = data.redactor;
					item.updated_time = data.updated_time;
					item.user_num = data.user_num;
					$modalInstance.close();
					if(_this.data.id === user.permission && item.access_key != POWER){
						$$$storage.setSessionStorage('power', roles.toString())
						location.reload();
					}
				}
			);
		}
		else{
			$.bigBox({
				title	:$$$I18N.get("INFOR_TIP"),
				content	:$$$I18N.get("PERMISSION_TIP"),
				timeout	:6000
			});
		}

	};
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
		if($scope.data.roles.filter(function(item){ return item._selected === true }).length === $scope.data.roles.length){
			$scope.checked = true;
		}
		else $scope.checked = false;
	};
}])
.controller("addUserAdminDialog", ["$scope", "$modalInstance", "Admin", "SchoolRoom", "Roles","$$$I18N", function($scope, $modalInstance, admin, schoolroom, role, $$$I18N){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope._ischeckAll = true;
	$scope.data = {
		sex:'true',
	};
	$scope.master = {sex:'true'};

	$scope.schoolroom_loading = true;
	schoolroom.querywithSimple(function(res){
		$scope.schoolroom_loading = false;
		$scope.data.schoolrooms = res.pools_;
		$scope.data.schoolrooms.forEach(function(item){ item._selected = true;  });
	})
	role.query(function(res){
		$scope.roles = res.result;
		// $scope.data.role = res.result.filter(function(item){ return item.name==="Administrator" })[0];
	})
	$scope.DISABLED = false;
	$scope.changeRole = function(role){
		if($scope.data.role && $scope.data.role.name == "Administrator"){
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
			
		}
		else{
			$scope.DISABLED = false;
		}
	}
	$scope.checkAll = function(scope){
		if(scope._ischeckAll){
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			})
		}else{
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function(scope){
		var schoolrooms = $scope.data.schoolrooms.filter(function(p){ 
			return p._selected;
		});
		if(schoolrooms.length === $scope.data.schoolrooms.length){
			scope._ischeckAll = true;
		}else{
			scope._ischeckAll = false;
		}
	};

	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}
	$scope.ok = function(){
		var pools = $scope.data.schoolrooms.filter(function(item){ if(item._selected) return item }).map(function(item){ return item.id });
		if(pools.length)
			admin.save(
				{
					name: $scope.data.name,
					real_name: $scope.data.real_name,
					sex: $scope.data.sex,
					permission: $scope.data.role.id,
					password: $scope.data.password,
					passwordConfirm: $scope.data.passwordConfirm,
					email: $scope.data.email,
					contact: $scope.data.contact,
					pools: pools
				},
				function(data){
					data.result.instance_num = 0;
					$scope.rows.push(data.result);
					$modalInstance.close();
				}
			);
		else{
			$.bigBox({
				title	:$$$I18N.get("INFOR_TIP"),
				content	:$$$I18N.get("POOL_TIP"),
				timeout	:6000
			});
		}
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editUserAdminDialog", [
"$scope", "$modalInstance","Admin", "SchoolRoom", "Roles", "$$$UserRoles", "$$$I18N", "UserRole",
function($scope, $modalInstance, admin, schoolroom, role, $$$UserRoles, $$$I18N, UserRole){
	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.owner = UserRole.isOwner;

	$scope.master = {};
	$scope.data = {};

	var item = $scope.item || $scope.currentItem;
	$scope.schoolroom_loading = true;
	schoolroom.querywithSimple(function(res){
		$scope.schoolroom_loading = false;
		item.schoolrooms = res.pools_;
		var i = 0;
		item.schoolrooms.forEach(function(sch){
			item.pool.forEach(function(id){
				if(sch.id === id){
					sch._selected = true;
					i++;
				}
			})
		});
		if(i == item.schoolrooms.length){
			$scope._ischeckAll = true;
		}
		role.query(function(res){
			item.roles = res.result;
			var myrole = res.result.filter(function(role){ return role.name === item.permission })[0];
			// if(myrole)
				item.myrole = res.result.filter(function(role){ return role.name === item.permission })[0];
			// else
			// 	item.myrole = res.result[0];
			$scope.data = angular.copy(item);
		})
		
	})
	if(!$scope.owner)
		$scope.DISABLED = true;
	$scope.changeRole = function(role){
		if($scope.data.myrole && $scope.data.myrole.name == "Administrator"){
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
			
		}
		else{
			$scope.data.schoolrooms.forEach(function(item){
					item._selected = false;
			})
			item.pool.forEach(function(schoolroom_id){
				$scope.data.schoolrooms.forEach(function(item){
					if(item.id === schoolroom_id){
						item._selected = true
					}
				})
			});
			if($scope.data.schoolrooms.filter(function(item){ return item._selected == true }).length == $scope.data.schoolrooms.length)
				role._ischeckAll = true;
			else role._ischeckAll = false;
			
			$scope.DISABLED = false;
		}
	}
	$scope.checkAll = function(scope){
		if(scope._ischeckAll){
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			})
		}else{
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function(scope){
		var schoolrooms = $scope.data.schoolrooms.filter(function(p){ 
			return p._selected;
		});
		if(schoolrooms.length === $scope.data.schoolrooms.length){
			scope._ischeckAll = true;
		}else{
			scope._ischeckAll = false;
		}
	};


	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
		if($scope.data.schoolrooms.filter(function(item){ return item._selected === true }).length === $scope.data.schoolrooms.length){
			$scope.$$childTail._ischeckAll = true;
		}
		else {console.log($scope); $scope.$$childTail._ischeckAll = false;}

	};

	$scope.edit = function() {
		var user_id = this.data.id;
		var pools = this.data.schoolrooms.filter(function(item){ if(item._selected) return item }).map(function(item){ return item.id });
		if(pools.length)
			admin.update(
			{
				id:this.data.id,
				contact:this.data.contact,
				email:this.data.email,
				name:this.data.name,
				real_name:this.data.real_name,
				sex:this.data.sex,
				password:this.data.password,
				pools:pools,
				permission: this.data.myrole.id

			},
				function(res){
					var PERMISSION = item.permission;
					item.name = res.result.name;
					item.real_name = res.result.real_name;
					item.sex = res.result.sex;
					item.email = res.result.email;
					item.contact = res.result.contact;
					item.pool = res.result.pool;
					item.permission = res.name;
					if(user_id === user.id){
						$$$storage.setSessionStorage('power', $scope.data.roles.filter(item => item.name === res.name )[0].access_key)
						var logInfor = UserRole.currentUser;
						logInfor.keys = $$$storage.getSessionStorage("power");
						logInfor.pool = res.result.pool;
						$$$storage.setSessionStorage("loginInfo", JSON.stringify(logInfor))
						if(item.permission != PERMISSION){ location.reload(); }
					}
					$modalInstance.close();
				},
				function(){  }
			);
		else{
			$.bigBox({
				title	:$$$I18N.get("INFOR_TIP"),
				content	:$$$I18N.get("POOL_TIP"),
				timeout	:6000
			});
		}
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("addUserCommonDialog", ["$scope", "$modalInstance","User", "UserRole", function($scope, $modalInstance, user, Role){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.data = {
		sex:'true',
		role:'2',
		department: $scope.selected.id,
		redactor: Role.currentUser.name

	};
	$scope.master = {sex:'true',role_desc:'教师'};

	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}

	$scope.ok = function(){
		console.log(666666666, $scope.data)
		user.save(
			$scope.data,
			function(data){
				$scope.queryDepart();
				$modalInstance.close();
			}
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("editUserCommonDialog", ["$scope", "$modalInstance", "User", function($scope, $modalInstance, user){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function() {
		user.edit({
			id: this.data.id,
			contact:this.data.contact,
			email:this.data.email,
			name:this.data.name,
			real_name:this.data.real_name,
			sex:this.data.sex,
			password:this.data.password,
			passwordConfirm: this.data.password,
			desc: this.data.desc
		},function(res){
			$scope.queryDepart();
			$modalInstance.close();
		},function(){});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("addUserDomainDialog", ["$scope", "$modalInstance", "Server", function($scope, $modalInstance, Server){
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}

	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem||{});
	};

	$scope.close = function(){
		$modalInstance.close();
	};	

	$scope.ok=function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
		Server.create($scope.data,function(response){
			$scope.submiting = false ;
			$scope.afterSubmiting = true ;
			$scope.rows.unshift(response.result[0]);
			$modalInstance.close();
		},function(){
			$scope.submiting = false ;
			$scope.afterSubmiting = false ;
		});
	};

	$scope.data = {"user":"","passwd":""};
}])
.controller("editUserDomainDialog", ["$scope", "$modalInstance", "Server", function($scope, $modalInstance, Server){
	var item = $scope.item || $scope.currentItem||{};
	$scope.data = angular.copy(item);
	Server.get({"id":item.id},function(response){
		var data=response;
		angular.forEach(data,function(value,key){
			item[key]=data[key];
		});
	},function(){
	});

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}

	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem||{});
	};

	$scope.close = function(){
		$modalInstance.close();
	};	

	$scope.ok=function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
		Server.update($scope.data,function(response){
			var data=response.result[0];
			angular.forEach(data,function(value,key){
				item[key]=data[key];
			});
			$modalInstance.close();
		}, function(){
			$scope.submiting = false ;
			$scope.afterSubmiting = false ;
		});
	};
}])
.controller("userDoaminAscingDialog", ["$scope", "$modalInstance", "Domain", function($scope, $modalInstance, Domain){
	var domainId = parseInt(location.hash.match(/\d+$/)[0]);
	$scope.selected=[];

	Domain.get({id: domainId},function(response){
		$scope.status = 'completed';
		$scope.ous = response.ous;

	},function(){
		$scope.status = 'completed';
	});

	$scope.ok = function(){
		Domain.asycing({
			id: domainId,
			auto: 0,
			ous: $scope.selected.map(function(item){ return item.base_dn; })
		},function(response){
			response.result.map(function(item){
				var len=$scope.rows.length,i;
				for(i=0;i<len;i++){
					if(item.id==$scope.rows[i].id){
						$scope.rows[i]=item;
					}
				}
				if(i>=len){
					$scope.rows.push(item);
				}
			});
			$modalInstance.close();
		},function(){});
	};

	$scope.select_row = function(item){
		item._selected = true;
	};
	$scope.select = function(item){
		if(item){
			if($scope.selected.filter(function(d){ return d.fullname==item.fullname; }).length==0)
				$scope.selected.push(item);
		}
		else{
			$scope.ous.filter(function(item){ return item._selected }).forEach(function(d){
				if($scope.selected.filter(function(data){ return data.fullname==d.fullname; }).length==0)
					$scope.selected.push(d);
			});
		}
	};
	$scope.removeSelected=function(_item){
		var index;
		if(!_item){
			return false;
		}
		index=$scope.selected.indexOf(_item);
		if(index>-1){
			$scope.selected.splice(index,1);
		}
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.constant("NavigatorLink", [
	{
		"key": "Summary",
		"value": "概要",
		"is_group": true,
		icon: "icon-jj-home",
		"url": "/summary"
	},
	{
		"key": "Resource",
		"value": "资源",
		icon: "icon-jj-cloud",
		"is_group": true,
		"sublist": [
			{
				"key": "Console",
				"value": "主控管理",
				"is_group": false,
				"belong": "Resource",
				"url": "/resource/console"
			},
			{
				"key": "Pool",
				"value": "资源池管理",
				"is_group": false,
				"belong": "Resource",
				"url": "/resource/pool"
			},
			{
				"key": "Storage",
				"value": "存储管理",
				"is_group": false,
				"belong": "Resource",
				"url": "/resource/storage"
			}
		]
	},
	{
		"key": "Network",
		"value": "网络",
		"is_group": true,
		icon: "icon-jj-017",
		"sublist": [
			{
				"key": "ManageNetwork",
				"value": "管理网络",
				"is_group": false,
				"belong": "Network",
				"url": "/network/manageNetwork"
			},
			{
				"key": "VirtualSwitch",
				"value": "分布式虚拟交换机",
				"is_group": false,
				"belong": "Network",
				"url": "/network/virtualSwitch"
			},
			{
				"key": "DataNetwork",
				"value": "数据网络",
				"is_group": false,
				"belong": "Network",
				"url": "/network/dataNetwork"
			},
			{
				"key": "DHCP",
				"value": "DHCP",
				"is_group": false,
				"belong": "Network",
				"url": "/network/dhcp"
			}
		]
	},
	{
		"key": "Desktop",
		"value": "桌面",
		"is_group": true,
		icon: "icon-jj-pc",
		"sublist": [
			{
				"key": "Teaching_desktop",
				"value": "教学桌面",
				"is_group": false,
				"belong": "Desktop",
				"url": "/desktop/scene"
			},
			{
				"key": "Personal_desktop",
				"value": "个人桌面",
				"is_group": false,
				"belong": "Desktop",
				"url": "/desktop/personal"
			},
			{
				"key": "Personal_desktop_pool",
				"value": "个人桌面池",
				"is_group": false,
				"belong": "Desktop",
				"url": "/desktop/pool"
			}
		]
	},
	{
		"key": "Template",
		"value": "模板",
		icon: "icon-jj-Template",
		"is_group": true,
		"sublist": [
			{
				"key": "Teaching_template",
				"value": "教学模板",
				"is_group": false,
				"belong": "Template",
				"url": "/template/teach"
			},
			{
				"key": "Personal_template",
				"value": "个人模板",
				"is_group": false,
				"belong": "Template",
				"url": "/template/personal"
			},
			{
				"key": "Hardware_template",
				"value": "硬件模板",
				"is_group": false,
				"belong": "Template",
				"url": "/template/hardware"
			}
		]
	},
	{
		"key": "Terminal",
		"value": "终端",
		icon: "icon-jj-Terminal",
		"is_group": true,
		"sublist": [
			{
				"key": "Classroom",
				"value": "教室管理",
				"is_group": false,
				"belong": "Terminal",
				"url": "/terminal/schoolroom"
			},
			{
				"key": "Terminal_Manage",
				"value": "终端管理",
				"is_group": false,
				"belong": "Terminal",
				"url": "/terminal/client"
			}
		]
	},
	{
		"key": "User",
		"value": "用户",
		icon: "icon-jj-men",
		"is_group": true,
		"sublist": [
			{
				"key": "Role_Manage",
				"value": "角色管理",
				"is_group": false,
				"belong": "User",
				"url": "/user/role"
			},
			{
				"key": "Administrator",
				"value": "管理用户",
				"is_group": false,
				"belong": "User",
				"url": "/user/admin"
			},
			{
				"key": "Common_user",
				"value": "普通用户",
				"is_group": false,
				"belong": "User",
				"url": "/user/common"
			},
			{
				"key": "Domain_user",
				"value": "域用户",
				"is_group": false,
				"belong": "User",
				"url": "/user/domain"
			}
		]
	},
	{
		"key": "Monitor",
		"value": "监控",
		"is_group": true,
		icon: "icon-jj-Monitor",
		"sublist": [
			{
				"key": "Host_monitoring",
				"value": "主机监控",
				"is_group": false,
				"belong": "Monitor",
				"url": "/monitor/host"
			},
			{
				"key": "Desktop_monitoring",
				"value": "桌面监控",
				"is_group": false,
				"belong": "Monitor",
				"url": "/monitor/desktop"
			},
			{
				"key": "Alarm_information",
				"value": "告警信息",
				"is_group": false,
				"belong": "Monitor",
				"url": "/monitor/alarm"
			},
			{
				"key": "Alarm_policy",
				"value": "告警策略",
				"is_group": false,
				"belong": "Monitor",
				"url": "/monitor/policy"
			}
		]
	},
	{
		"key": "Timetable",
		"value": "排课",
		"is_group": true,
		icon: "icon-jj-paike",
		"sublist": [
			{
				"key": "Course_list",
				"value": "课程列表",
				"is_group": false,
				"belong": "Timetable",
				"url": "/scheduler/view"
			}
		]
	},
	{
		"key": "Plan",
		"value": "计划任务",
		"is_group": true,
		icon: "icon-jj-012",
		"sublist": [
			{
				"key": "Timer_switch",
				"value": "定时开关机",
				"is_group": false,
				"belong": "Plan",
				"url": "/plan/switch"
			},
			{
				"key": "Host_switch",
				"value": "主机定时开关机",
				"is_group": false,
				"belong": "Plan",
				"url": "/plan/hostSwitch"
			}
		]
	},
	{
		"key": "HA",
		"value": "高可用性",
		"is_group": true,
		icon: "icon-jj-001",
		"sublist": [
			{
				"key": "desktop_ha",
				"value": "桌面HA",
				"is_group": false,
				"belong": "HA",
				"url": "/HA/desktop"
			}
		]
	},
	{
		"key": "System",
		"value": "系统",
		"is_group": true,
		icon: "icon-jj-Setup",
		"sublist": [
			{
				"key": "System_deploy",
				"value": "快速部署",
				"is_group": false,
				"belong": "System",
				"url": "/system/deploy"
			},
			{
				"key": "System_desktop",
				"value": "系统桌面",
				"is_group": false,
				"belong": "System",
				"url": "/system/desktop"
			},
			{
				"key": "System_ISO",
				"value": "系统 ISO",
				"is_group": false,
				"belong": "System",
				"url": "/system/iso"
			},
			{
				"key": "USB_redirection",
				"value": "USB 重定向",
				"is_group": false,
				"belong": "System",
				"url": "/system/usb"
			},
			{
				"key": "USB_through",
				"value": "USB 透传",
				"is_group": false,
				"belong": "System",
				"url": "/system/through"
			},
			{
				"key": "AutoSnapshot",
				"value": "自动快照",
				"is_group": false,
				"belong": "System",
				"url": "/system/snapshot"
			},
			{
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
			},
			{
				"key": "System_upgrade",
				"value": "系统升级",
				"is_group": false,
				"belong": "System",
				"url": "/system/upgrade"
			},
			{
				"key": "Operation_log",
				"value": "操作日志",
				"is_group": false,
				"belong": "System",
				"url": "/system/logs"
			}
			// {
			// 	"key": "End_log",
			// 	"value": "后台日志",
			// 	"is_group": false,
			// 	"belong": "System",
			// 	"url": "/system/endlogs"
			// }
		]
	},
	{
		"key": "About",
		"value": "关于",
		icon: "icon-jj-about-1",
		"is_group": true,
		"url": "/about"
	}
])
