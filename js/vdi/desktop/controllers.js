angular.module("vdi.desktop", [])

/* 场景 */
.factory("Scene", ["$resource", function($resource){
	return $resource("/thor/pool/modes", null, {
		query:
			{ method: "GET", isArray: false },
		save :
			{ method: "POST"},
		get:
			{ method: "GET", url: "/thor/pool/mode/:id", params: {id: "@id"} },
		update:
			{ method: "POST", url: "/thor/pool/mode/:id", params: {id: "@id"} },
		active:
			{ method: "PUT", url: "/thor/pool/mode/:id", params: {id: "@id"} },
		powerOn:
			{ method: "POST", url: "/thor/pool/mode/action"},
	    powerOff:
			{ method: "POST", url: "/thor/pool/mode/action"},
	    forcePowerOff:
			{ method: "POST", url: "/thor/pool/mode/action"},
		haConfig:
			{ method: "GET", url: "/thor/pool/mode/haConfig/:id", params:{id: "@id"} },
		sort:
			{ method: "POST",url: "/thor/pool/modes/order"}

	});
}])
/*教学桌面 */
.factory("TeachDesktop", ["$resource", function($resource){
	return $resource("/thor/instance/mode/:id", { id: "@id" }, {
		query:
			{ method: "GET", isArray: false },
		delete:
			{ method:"DELETE", url: "/thor/instances" },
		reset:
			{ method:"POST" , url:"/thor/instance/mode/reset"},
		save:
			{ method:"POST" },
		get:
			{ method: "GET", url: "/thor/instance/:id", params: { id: "@id" }, isArray: false },
		start:
			{ method: "POST", url: "/thor/instances/starts" },
		shutdown:
			{ method: "POST", url: "/thor/instances/shutdowns" },
		pause:
			{ method: "POST", url: "/thor/instances/pause" },
		resume:
			{ method: "POST", url: "/thor/instances/unpause" },
		reboots:
			{ method: "POST", url: "/thor/instances/reboots" },
		screenshot:
			{ method: "POST", url: "/thor/instances/screenshot" },
		rename:
			{method:"POST", url: "/thor/pool/mode/instance/rename"}
	});
}])
/*个人桌面 */
.factory("PersonDesktop", ["$resource", function($resource){
	return $resource("/thor/instance/:id", { id: "@id" }, {
		query:
			{ method: "GET", url: "/thor/instances", isArray: false },
		delete:
			{ method:"DELETE", url: "/thor/instances" },
		save:
			{ method:"POST", url: "/thor/instance" },
		get:
			{ method: "GET", isArray: false },
		update:
			{ method: "PUT" },
		start:
			{ method: "POST", url: "/thor/instance/starts" },
		shutdown:
			{ method: "POST", url: "/thor/instance/shutdowns" },
		pause:
			{ method: "POST", url: "/thor/instance/pause" },
		resume:
			{ method: "POST", url: "/thor/instance/unpause" },
		reboot:
			{ method: "POST", url: "/thor/instance/reboots" },
		migrate : 
			{ method: "post",url: "/thor/instance/livemigration/:id" , params: { "id": "@id" } },
		screenshot:
			{ method: "POST", url: "/thor/instances/screenshot/:id", params: { "id": "@id" } },
		saveAsTemplate:
			{ method: "POST", url: "/thor/instance/saveTemplate" },
		//移动至
		moveHostList:
			{ method: "GET", url: "/thor/ha/instance/move"},
		moveTo:
			{ method:"POST", url: "/thor/ha/instance/move"},
		//获取无源数据盘
		list_passive_disk:
			{ method: "GET", url: "/thor/list_passive_volume"},
		//获取桌面详情信息
		list_detail:
			{ method: "GET", url: "/thor/get_instance_details/:id", params:{ "id": "@id"} },
		// 个人模板获取有哪些个人桌面会更新
		update_instance:
			{ method: "GET", url: "/thor/instance/image/:id", params: { "id": "@id" } },
		check_can_migrate_host:
			{ method:"POST", url: "/thor/check_can_migrate_host" },
		share_servers:
			{ method: "GET", url: "/thor/share/servers" }
	});
}])
/*个人桌面池*/
.factory('DeskPool', ['$resource', function($resource){
	return $resource("/thor/instances/pool/:id", { id: "@id" }, {
			query:
				{ method: "GET", isArray: false },
			delete:
				{ method:"DELETE", url: "/thor/instances/pool" },
			save:
				{ method:"POST", url: "/thor/instances/pool" },
			get:
				{ method: "GET", isArray: false },
			update:
				{ method: "PUT",url: "/thor/instance/pool/:id", params: { "id": "@id" }},
			start:
				{ method: "POST", url: "/thor/instances/pool/action" },
			shutdown:
				{ method: "POST", url: "/thor/instances/pool/action" },
			pause:
				{ method: "POST", url: "/thor/instances/pool/pause" },
			resume:
				{ method: "POST", url: "/thor/instances/pool/unpause" },
			reboot:
				{ method: "POST", url: "/thor/instances/pool/reboots" },
			migrate : 
				{ method: "post",url: "/thor/instances/livemigration/:id" , params: { "id": "@id" } },
			screenshot:
				{ method: "POST", url: "/thor/instances/screenshot/:id", params: { "id": "@id" } },
			saveAsTemplate:
				{ method: "POST", url: "/thor/instances/saveTemplate" },
			//移动至
			moveHostList:
				{ method: "GET", url: "/thor/ha/instances/pool/move"},
			moveTo:
				{ method:"POST", url: "/thor/ha/instances/move"},
			//获取无源数据盘
			list_passive_disk:
				{ method: "GET", url: "/thor/list_passive_volume"},
			//获取桌面详情信息
			list_detail:
				{ method: "GET", url: "/thor/get_instance_details/:id", params:{ "id": "@id"} },
			// 个人模板获取有哪些个人桌面会更新
			update_instance:
				{ method: "GET", url: "/thor/instances/image/:id", params: { "id": "@id" } }
	});
}])
/*个人桌面池详情*/
.factory("DeskPoolSecond", ["$resource", function($resource){
	return $resource("/thor/instances/pool", null, {
		query:
			{ method: "GET", isArray: false },
		save :
			{ method: "POST"},
		get:
			{ method: "GET", url: "/thor/instance/pool/:id", params: {id: "@id"} },
		update:
			{ method: "POST", url: "/thor/instance/pool/:id", params: {id: "@id"} },
		active:
			{ method: "PUT", url: "/thor/instance/pool/:id", params: {id: "@id"} },
		start:
			{ method: "POST", url: "/thor/instance/starts" },
		shutdown:
			{ method: "POST", url: "/thor/instance/shutdowns"},
		pause:
			{ method: "POST", url: "/thor/instance/pause" },
		resume:
			{ method: "POST", url: "/thor/instance/unpause" },
		reboots:
			{ method: "POST", url: "/thor/instance/reboots" },
		moveHostList:
			{ method: "GET", url: "/thor/ha/instance/move"},
		moveTo:
			{ method:"POST", url: "/thor/ha/instance/move"},
	});
}])
//教学桌面--桌面修改
.factory("SenceAlter", ["$resource", function($resource){
	var res = $resource("/thor/pool/mode/new", null, {
		query: 
		    {method: "GET", isArray: false},
		save: 
		    {method: "POST"}
	});
	return res;
}])

/* 教学、个人公用 */
.factory("VMCommon", ["$resource", function($resource){
	var base_url = "/thor/instance";
	return $resource(base_url, { id: "@id" }, {
		start:
			{ method: "POST", url: base_url +"/starts"},
		shutdowns:
			{ method: "POST", url: base_url +"/shutdowns"},
		pause:
			{ method: "POST", url: base_url + "/pause"},
		resume:
			{ method: "POST", url: base_url + "/unpause"},
		reboots:
			{ method: "POST", url: base_url + "/reboots"},
		screenshot:
			{ method: "POST", url: base_url + "/screenshot"},
		// 列出桌面快照
		list_snapshot:
			{ method: "GET", url:base_url + "/snapshot"},
		// 创建快照
		take_snapshot:
			{ method:"POST", url:base_url + "/snapshot"},
		restore_snapshot:
			{ method:"POST", url:base_url + "/snapshot"},
		delete_snapshot:
			{ method:"DELETE", url:base_url + "/snapshot"},
		// 获取在线迁移主机
		get_live_move_hosts:
			{ method: "GET", url: "/thor/ha/instance/live/move"},
		//在线迁移
		live_move:
			{ method: "POST", url: "/thor/ha/instance/live/move"},
		list_template:
			{ method: "GET", url: "/thor/image/simple/:type", params:{ "type": "@type"} },
	});
}])
// 筛选出选中的元素。若field参数存在，算出所有选中元素field字段的累计值
.filter('selectedFilter',function(){
	return function(list,field){
		if(list){
			if(field){
				var _list = list.filter(function(item){ return item._selected }).map(function(item){ return item[field] });
				return _list.length ? _list.reduce(function(a,b){return a + b}) : 0;
			}else{
				return list.filter(function(item){ return item._selected });
			}
		}
	}
})
// 个人桌面列表控制器
.controller("vdiDesktopPersonalListController", ["$scope","$modal", "PersonDesktop", "VMCommon", "$interval", "$filter","PersonTemplate","$$$os_types","$$$I18N","Server","UserRole","$location","$q","Admin","User","Depart","TreeInstances",
	function($scope,$modal, person_desktop, vm, $interval, $filter, tmpl,$$$os_types,$$$I18N,Server,UserRole,$location,$q,Admin,UsercommonList,Depart,TreeInstances){
	let hasTerminalpermission = UserRole.currentUserRoles.filter(function(role){ return role=='Terminal' }).length;
	let hasTerminalManagepermission = UserRole.currentUserRoles.filter(function(role){ return role=='Terminal_Manage' }).length;
	let hasClassroompermission = UserRole.currentUserRoles.filter(function(role){ return role=='Classroom' }).length;
	$scope.linkTerminal = hasTerminalpermission && hasTerminalManagepermission && hasClassroompermission ? true:false;
	$scope.inCurrentUserPool = function(pool){
		if($$$storage.getSessionStorage("loginInfo"))
			return JSON.parse($$$storage.getSessionStorage("loginInfo")).pool.indexOf(pool)>-1
	};


	if($location.$$search.name)
		$scope.searchText = decodeURIComponent($location.$$search.name);

	$interval(function(){
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(item => item.id));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(item.task_state){
				item.other_status = 'other';
			}else{
				item.other_status = 'certain';
			}
			if(item.status == 'updating' || item.status == 'making'){
				item._ignore = true;
			}else{
				item._ignore = false;
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
		// $scope.updateData("", $scope.select, $scope.depart);
	});
	$scope.getObjLength = function(obj){
		try{
			return Object.keys(obj).length;
		}catch(err){
			return 0;
		}
	};

	$scope.depart = {name: '全部', id: -1, full_path: 'root'};
	$scope.refresh = (_s = $scope) => {
		_s.depart = $$$storage.getSessionStorage('depart')?JSON.parse($$$storage.getSessionStorage('depart')):$scope.depart;
		person_desktop.query(res => {
			// _s.rows = _s.select==''?res.result:res.result.filter(function(item){ return item.status == _s.select });
			res.result.forEach(function(desk){
				if(desk.user_group==""){
					desk.user_group=$$$I18N.get("管理用户")
				}
				if(desk.task_state){
					desk.other_status = 'other';
				}else{
					desk.other_status = 'certain';
				}
				if(desk.status == 'updating' || desk.status == 'making'){
					desk._ignore = true;
				}else{
					desk._ignore = false;
				}
			})
			_s.allRows = res.result;
			_s.updateData("", _s.select, _s.depart);
			_s.rows.forEach(row => {
				let os = $$$os_types.filter(item => item.key === row.os_type)[0];
				os && os.icon && (row.icon = os.icon);
				row.detailData = {};
			});
			_s.loading = false;
		});
	};
	$scope.getDetail = function(it){
		$scope.loading_detail = true;
		person_desktop.list_detail({id:it.id},function(res){
			it.detailData = res.result;
		}).$promise.finally(function(){
			$scope.loading_detail = false;
		});
	};
	$scope.expand = function(row){
		$scope.rows.forEach(r => {
			if(row.id === r.id){
				r._expand = !row._expand;
				if(r._expand){
					$scope.getDetail(row);
				}
			}else{
				r._expand = false;
			}
		})
	};
	$scope.pagesize    = Number($$$storage.getSessionStorage('personl_pagesize')) || 30;
	$scope.currentPage = 1;
 	$scope.$watch("pagesize",function(newvalue){
 		$$$storage.setSessionStorage('personl_pagesize', newvalue);
	});
	$scope.loading = true;
	$scope.rows = [];
	$scope.refresh();
	$scope.openAddDomainDialog = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.is_domain_user && !row.ad_server_name });
		if(rows.length === 0){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalDomain_TIP1"),
				timeout:6000
			});
			return;
		}
		var modal = $modal.open({
			templateUrl:"views/vdi/dialog/desktop/add_server.html",
			controller:"personalAddServerDialog",
			resolve:{param:function(){return angular.copy(rows);}}
		});
		modal.result.then(function(res){
			$scope.refresh();
		});
	};
	$scope.personExitDomain = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.ad_server_name; });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalDomain_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='退域'>"+
							"退域</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='DOMAIN_EXIT_TIP'>所选桌面在下一次开机时，将自动执行退域的操作，是否确定？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							Server.domain_set_person({
								instance_ids:rows.map(function(row){ return row.id }),
								has_domain:false
							},function(){
								_controllerScope.refresh();
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
			});
		}
	};
	$scope.updateData = function(text,select,depart){
		$$$storage.setSessionStorage('depart', JSON.stringify(depart));
		$scope.rows = $scope.allRows.filter(function(row){
			row._selected = false;
			if(select){
				if(text && text.trim()){
					return row.status === select || row.other_status === select;
				}
				return row.status === select || row.other_status === select;
			}
			return true;
		});
		var ids = [];
		if(depart.type=='common'){
			$scope.rows = $scope.rows.filter(it=>it.user_group.indexOf(depart.dept_name)>-1);
		}else if(depart.type=='domain'){
			$scope.rows = $scope.rows.filter(it=>it.user_group===depart.domain_name);
		}else if(depart.type=='admin'){
			$scope.rows = $scope.rows.filter(it=>it.user===depart.name);
		}else if(depart.type=='adminAll'){
			$scope.rows = $scope.rows.filter(it=>it.user_group==$$$I18N.get("管理用户"));
		}
	};

	var _controllerScope = $scope;
	/**
	* [selectMode 部门域选择]
	*/
    $scope.selectMode = function(){
         $modal.open({
			templateUrl:"views/vdi/dialog/desktop/personal_user_group.html",
			size: 'sm-md',
			controller:function($scope,$modalInstance){
				function formatData(d,name){
					iteration(d,name);
					return d;
				}
				function iteration(data,childName){
					for(var i = 0 ; i < data.length ; i++){
						data[i]['type'] = 'common';
						data[i]['name'] = data[i]['dept_name'];
						$scope.expandnodes.push(data[i]);
						if(data[i][childName] && data[i][childName].length){
							var len = iteration(data[i][childName],childName);
							if(len === 0){
								data[i] = undefined;
							}
						}
						if(data[i][childName] && data[i][childName].length === 0){
							data[i]= undefined;
						}
					}
					for(i = 0 ; i < data.length ; i++){
						if(data[i] === undefined){
							data.splice(i,1);
						}
					}
					return data.length;
				}
			    function getAdminNum(rows){
					return rows.reduce(function(count, item){
						return count + item.desktop_num;
					}, 0);
				}
				$scope.loading = true;
				TreeInstances.query(function(res){
					$scope.loading = false;
					res.result.forEach(function(item){
						if(item.dept_name){
							item.name = item.dept_name;
						}else if(item.domain_name){
							item.name = item.domain_name;
						}else{}
					});
					$scope.expandnodes = [];
					var adminData = res.result.filter(function(item){ return item.type == 'admin' });
					var admins = [{name: $$$I18N.get("管理用户"), type: 'adminAll', children: adminData, desktop_num: getAdminNum(adminData)}];
					var domains = res.result.filter(function(item){ return item.type == 'domain' });
					var commons = res.result.filter(function(item){ return item.type == 'common' });
					commons = formatData(commons,"children",$scope.expandnodes);
					var all = [{id: -1, name:$$$I18N.get("全部"), children: admins.concat(commons).concat(domains)}];
					$scope.treedata = all;
					$scope.expandnodes = $scope.expandnodes.concat(admins).concat(adminData).concat(domains).concat(all);
					$scope.selected = $scope.expandnodes.filter(function(item){ return item.name==_controllerScope.depart.name; })[0];
					$scope.selected._selected = true;
					$scope.showSelected = function(node, selected){
						node._selected = selected;
						$scope.selected = node;
					}
				})
				$scope.ok = function(){
				    _controllerScope.depart = $scope.selected && $scope.selected._selected?$scope.selected:{name: $$$I18N.get("全部"), id: -1, full_path: 'root'};
				    _controllerScope.updateData(_controllerScope.searchText, _controllerScope.select, _controllerScope.depart)
				    $modalInstance.close();
				},
				$scope.close = function(){
				 $modalInstance.close();
				}
			}
         })
    }
    /**
	* [selectMode 部门域选择]_____end
	*/
	


	$scope.start = item => {
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state; });
		if(rows.length==0){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout:6000
			});
		}else{
			vm.start({instance_ids: rows.map(row => 
				{return row.instance_id})}, () => 
			{$scope.refresh();});
		}
	};

	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							vm.shutdowns({instance_ids: rows.map(row => {
									row._selected = false;
									return row.instance_id;
								})},() => { _controllerScope.refresh()});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
			});
		}
	};
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.shutdowns({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.restart = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout:6000
			});
		}else{
		
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
							"桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.reboots({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.pause = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout:6000
			});
		}else{

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>"+ 
						"桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.pause({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	}
	$scope.resume = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>"+
						"桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.resume({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.hasPausedStatus = function(){
		var flag = false;
		var _selected = $scope.rows.filter(function(row){ return row._selected });
		var _hasPaused = _selected.filter(function(row){ return row.status=='paused' });
		if(_hasPaused.length==_selected.length){
			flag = true;
		}
		return flag;
	}
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status!=='paused' });
		var is_running = rows.some(function(row){ return row.status == 'running' && !row.task_state});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>"+
					"桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><div ng-show='has_data_disk' style='margin-bottom:20px;'><label class='checkbox-inline'><input class='checkbox' ng-model='delete_disk' type='checkbox'/><span  localize='删除数据盘'>删除数据盘</span></label></div><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.is_run = is_running;
				$scope.delete_disk = true;
				$scope.has_data_disk = rows.some(function(d){ return d.local_gb});
				$scope.ok = function(){
					$modalInstance.close();
					person_desktop.delete({
						instance_ids: rows.map(function(row){ return row.instance_id; }),
						force_delete_data: this.delete_disk
					}, function(data){
						_controllerScope.refresh();
					}, function(error){
						_controllerScope.refresh();
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});			
	};
	$scope.moveto = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected});
		var can_migrate_rows = rows.filter(function(item){ return item.virtual_type === 'kvm' && item.status=='shutdown' && !item.task_state });
		if(!can_migrate_rows.length){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("DESKTOP_MOVE_TIP1"),
				timeout:6000
			});
		}else{
			var can_migrate_host = [];
			$scope.moveto_loading = true;
			person_desktop.check_can_migrate_host({instance_ids:can_migrate_rows.map(function(item){ return item.id })},function(res){
				for(var i in res.result){can_migrate_host.push({id:i,value:res.result[i]})};
				can_migrate_host = can_migrate_host.filter(function(item){ return item.value });
				$scope.moveto_loading = false;
				if(!can_migrate_host.length){
					$.bigBox({
						title:$$$I18N.get("INFOR_TIP"),
						content:$$$I18N.get("DESKTOP_MOVE_TIP1"),
						timeout:6000
					});
					return;
				}
				$modal.open({
					template: 
						`<section id='widget-grid'>
							<div class='modal-content'>
								<div class='modal-header'>
									<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>
									<h4 class='modal-title' id='mySmallModalLabel' localize='桌面移动'>桌面移动</h4>
								</div>
								<div class='modal-body'>
									<form class='form-horizontal' novalidate name='movetoForm'>
										<div class='form-group'>
											<label class='control-label col-xs-4' localize='选择目标主机'>选择目标主机</label>
											<div class='col-xs-4'>
												<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>
													<option value="" localize="--请选择--"> --请选择-- </option>
												</select>
											</div>
											<img style="position: relative;top: 3px" ng-if="hosts_loading" width="24" height="24" src="img/HLloading.gif">
										</div>
										<footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>
										<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定' ng-disabled='movetoForm.$invalid'>确定</button>
										<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer>
									</form>
								</div>
							</div>
						</section>`,			
					controller : function($scope, $modalInstance){
						$scope.hosts = [];
						$scope.hosts_loading = true;
						person_desktop.moveHostList({instance_ids:rows.map(function(item){ return item.id })}, function(res){
							$scope.hosts = res.result;
							$scope.host = $scope.hosts[0];
							$scope.hosts_loading = false;
						});
						
						$scope.ok = function(){
							var _this = this;
							$scope.loading = true;
							person_desktop.moveTo({instance_ids:can_migrate_host.map(function(item){ return item.id }),host:_this.host},function(){
								$modalInstance.close();
								$.bigBox({
									title:$$$I18N.get("INFOR_TIP"),
									content:$$$I18N.get("桌面移动成功"),
									timeout:6000
								});
							}).$promise.finally(function(){
								$scope.loading = false;
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "md"
				});
			})
		}
	};
	$scope.migration = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status === 'running' && !row.task_state});
		if(!rows.length){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("DESKTOP_MOVE_TIP2"),
				timeout:6000
			});
			return;
		}
		$modal.open({
			template: 
				`<section id='widget-grid'>
					<div class='modal-content'>
						<div class='modal-header'>
							<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>
							<h4 class='modal-title' id='mySmallModalLabel' localize='动态迁移'></h4>
						</div>
						<div class='modal-body'>
							<form class='form-horizontal' novalidate name='movetoForm'>
								<div class='form-group'>
									<label class='control-label col-xs-4' localize='选择目标主机'>选择目标主机</label>
										<div class='col-xs-4'>
											<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>
												<option value="" localize="--请选择--">请选择</option>
											</select>
										</div>
										<img style="position: relative;top: 3px" ng-if="hosts_loading" width="24" height="24" src="img/HLloading.gif">
										<a style="position: relative;top: 5px;" ng-if="!hosts_loading && !hosts.length" class="mypopover" htmlpopover='{{migrationTip}}'><i class="fa fa-question-circle"></i></a>
									</div>
									<footer class='text-right'>
										<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>
										<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定' ng-disabled='movetoForm.$invalid'>确定</button>
										<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>
									</footer>
								</form>
							</div>
						</div>
					</section>`,					
			controller : function($scope, $modalInstance){
				$scope.hosts = [];
				$scope.hosts_loading = true;
				$scope.migrationTip = $$$I18N.get('migrationTip');
				vm.get_live_move_hosts({instance_ids:rows.map(function(item){ return item.id })}, function(res){
					$scope.hosts = res.result;
					$scope.host = $scope.hosts[0];
					$scope.hosts_loading = false;
				});
				$scope.ok = function(){
					var _this = this;
					$scope.loading = true;
					vm.live_move({
						instance_ids:rows.map(function(item){ return item.id }),
						host:_this.host
					},function(){
						$modalInstance.close();
						$.bigBox({
							title:$$$I18N.get("INFOR_TIP"),
							content:$$$I18N.get("桌面迁移成功"),
							timeout:6000
						});
					}).$promise.finally(function(){
						$scope.loading = false;
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "md"
		});
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
	$scope.viewStorage = function(item){
		$modal.open({
			templateUrl:"views/vdi/dialog/desktop/view_storage.html",
			controller:['$scope','$modalInstance',function($scope,$modalInstance){
				person_desktop.list_detail({id:item.id},function(res){
					$scope.data = res.result;
					$scope.data.hostname = item.hostname;
				});
				$scope.close = function(){
					$modalInstance.close();
				}
			}],
		});
	};
	
}])

.controller("vdiDesktopTeachListController", [
"$scope", "$route","$modal", "$routeParams", "TeachDesktop","PersonDesktop", "VMCommon", "$interval", "$filter","$$$I18N", "UserRole","$location",
function($scope, $route,$modal, $routeParams,teach_desktop,person_desktop, vm, $interval, $filter, $$$I18N, UserRole, $location){
	if($location.$$search.name)
		$scope.searchText = decodeURIComponent($location.$$search.name);

	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.rows = [];
	$scope.loading = true;
	$scope.refresh = getList;
	$interval(function(){
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.$root && $scope.rows && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(item.task_state){
				item.other_status = 'other';
			}else{
				item.other_status = 'certain';
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
		// $scope.updateData($scope.searchText, $scope.select);
	});

	var _controllerScope = $scope;
	var _id =  $route.current.params.id;
	function getList(){
		teach_desktop.query({ id : _id }, function(res){
			res.result.forEach(function(desk){
				if(desk.task_state){
					desk.other_status = 'other';
				}else{
					desk.other_status = 'certain';
				}
			})
			_controllerScope.rows = res.result.sort(function(a,b){
				var _numa,_numb;
				var get_num = function(tar){
					for(var i = tar.length - 1 ; i-- ; i >= 0 ){
						if(!Number(tar[i])){
							return Number(tar.substring(i + 1,tar.length));
						}
					}
				};
				_numa = get_num( a.display_name );
				_numb = get_num( b.display_name );
				return (_numa - _numb) * (false ? -1 : 1);
			});
			_controllerScope.allRows = res.result;
			_controllerScope.res = res;
			_controllerScope.loading = false;
			_controllerScope.$root && $scope.$root.$broadcast("navItemSelected", ["桌面", "教学桌面", res.mode_name]);
		},function(error){ 
			location.replace("#desktop/scene/");
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("NOEXSIT_SECNE_TIP"),
				timeout : 6000
			});
		});
	}
	getList();
	$scope.refresh = getList;
	$scope.pagesize = parseInt($$$storage.getSessionStorage('teach_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize",function(newvalue){
		if(newvalue){
			$$$storage.setSessionStorage('teach_pagesize', newvalue);
		}
	});
	// $scope.$watch("select",function(newvalue){
	// 	if(newvalue && $scope.allRows){
	// 		$scope.rows = $scope.allRows.filter(function(item){ return item.status == newvalue});
	// 		$$$storage.setSessionStorage('status', newvalue);
	// 	}
	// });	
	$scope.updateData = function(text,select){
		$scope.rows = $scope.allRows.filter(function(row){
			row._selected = false;
			if(select){
				if(text && text.trim()){
					return row.status === select || row.other_status === select;
				}
				return row.status === select || row.other_status === select;
			}
			return true;
		});
	};
	$scope.sortDesktopName = function(name,bool){
		$scope.rows.sort(function(a,b){
			var _numa,_numb;
			var get_num = function(tar){
				for(var i = tar.length - 1 ; i-- ; i >= 0 ){
					if(!Number(tar[i])){
						return Number(tar.substring(i + 1,tar.length));
					}
				}
			};
			_numa = get_num( a[name] );
			_numb = get_num( b[name] );
			return (_numa - _numb) * (bool ? -1 : 1);
		});
	};
	
	$scope.start = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state; });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP1"),
				timeout:6000
			});
		}else{
			rows.map(function(row){
				row._selected = false ;
			});
			vm.start({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
				_controllerScope.refresh();	
			});
		}
	};

	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							rows.map(function(row){
								row._selected = false;
							});
							vm.shutdowns({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
								_controllerScope.refresh();
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
			});
		}
	};
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.shutdowns({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.restart = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP4"),
				timeout:6000
			});
		}else{
		
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
							"桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.reboots({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.pause = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP5"),
				timeout:6000
			});
		}else{

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>"+ 
						"桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.pause({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	}
	$scope.resume = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP6"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>"+
						"桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
						});
						vm.resume({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.reset = function(item){
		var row = item;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重置'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定重置桌面吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					teach_desktop.reset({instance_id: row.instance_id}, function(data){
						$.bigBox({
							title:$$$I18N.get("操作结果"),
							content:$$$I18N.get("重置成功"),
							timeout:5000
						});
						_controllerScope.refresh();
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});			
	};
	$scope.alter = function(item){
		$modal.open({
			templateUrl:"views/vdi/dialog/desktop/teach_alter.html",
			controller: function($scope,$modalInstance){
				$scope.vm_hostname = item.vm_hostname;
				$scope.post = function(){
					var _this= this;
					teach_desktop.rename({
						'instance_ids':[item.id],
						'instance_name':_this.vm_hostname
					},function(){
						$modalInstance.close();
						_controllerScope.refresh();	
					});
				};
				$scope.close = function(){
					$modalInstance.dismiss();
				};
			},
		});
	};
	$scope.rename = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(r){ return r._selected && r.status == "shutdown" && !r.task_state });
		if(rows.length){
			$modal.open({
				templateUrl:"views/vdi/dialog/desktop/teach_rename.html",
				controller: function($scope,$modalInstance){
					$scope.addZero = function(len,str_begin,str_end){
						if(str_end && str_begin){
							var end_len = str_end.toString().length;
							if(end_len < len){
								return  str_begin + new Array(len - end_len+1).join("0") + str_end;
							}else{
								return str_begin + str_end;
							}
						}
					};	
					$scope.ok = function(){
						var _this= this;
						teach_desktop.rename({
							'instance_ids' : rows.map(function(row){ return row.instance_id}),
							'hostname_type' : _this.hostNameType,
							'hostname_prefix' :_this.hostNamePre,
							'hostname_beginwith':_this.hostNameBegin
						},function(){
							$modalInstance.close();
							_controllerScope.refresh();	
						});
					};
					$scope.close = function(){
						$modalInstance.dismiss();
					};
				},
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP7"),
				timeout:6000
			});
		}
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
	$scope.moveto = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected});
		var can_migrate_rows = rows.filter(function(item){ return item.virtual_type === 'kvm' && item.status=='shutdown' && !item.task_state });
		if(!can_migrate_rows.length){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("DESKTOP_MOVE_TIP1"),
				timeout:6000
			});
		}else{
			var can_migrate_host = [];
			$scope.moveto_loading = true;
			person_desktop.check_can_migrate_host({instance_ids:can_migrate_rows.map(function(item){ return item.id })},function(res){
				var datas = [];
				for(var i in res.result){can_migrate_host.push({id:i,value:res.result[i]})};
				can_migrate_host = can_migrate_host.filter(function(item){ return item.value });
				$scope.moveto_loading = false;
				if(!can_migrate_host.length){
					$.bigBox({
						title:$$$I18N.get("INFOR_TIP"),
						content:$$$I18N.get("DESKTOP_MOVE_TIP1"),
						timeout:6000
					});
					return;
				}
				$modal.open({
					template: 
						`<section id='widget-grid'>
							<div class='modal-content'>
								<div class='modal-header'>
									<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>
									<h4 class='modal-title' id='mySmallModalLabel' localize='桌面移动'>桌面移动</h4>
								</div>
								<div class='modal-body'>
									<form class='form-horizontal' name='movetoForm' novalidate>
										<div class='form-group'>
											<label class='control-label col-xs-4' localize='选择目标主机'>选择目标主机</label>
											<div class='col-xs-4'>
												<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>
													<option value="" localize='--请选择--'></option>
												</select>
											</div>
											<img style="position: relative;top: 3px" ng-if="hosts_loading" width="24" height="24" src="img/HLloading.gif">
										</div>
										<footer class='text-right'>
											<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>
											<button class='btn btn-primary' data-ng-click='ok()' ng-if='!loading' localize='确定' ng-disabled='movetoForm.$invalid'>确定</button>
											<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>
										</footer>
									</form>
								</div>
							</div>
						</section>`,
					controller : function($scope, $modalInstance){
						$scope.hosts = [];
						$scope.hosts_loading = true;
						person_desktop.moveHostList({instance_ids:rows.map(function(item){ return item.id })}, function(res){
							$scope.hosts = res.result;
							$scope.host = $scope.hosts[0];
							$scope.hosts_loading = false;
						});
						$scope.ok = function(){
							var _this = this;
							$scope.loading = true;
							person_desktop.moveTo({instance_ids:can_migrate_host.map(function(item){ return item.id }),host:_this.host},function(){
								$modalInstance.close();
								$.bigBox({
									title:$$$I18N.get("INFOR_TIP"),
									content:$$$I18N.get("桌面移动成功"),
									timeout:6000
								});
							}).$promise.finally(function(){
								$scope.loading = false;
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "md"
				});
			})
		}
	};
	$scope.migration = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status === 'running' && !row.task_state});
		if(!rows.length){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("DESKTOP_MOVE_TIP2"),
				timeout:6000
			});
			return;
		}
		$modal.open({
			template: 
			`<section id='widget-grid'>
				<div class='modal-content'>
					<div class='modal-header'>
						<button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>
						<h4 class='modal-title' id='mySmallModalLabel' localize='动态迁移'></h4>
					</div>
					<div class='modal-body'>
						<form class='form-horizontal' novalidate name='movetoForm'>
							<div class='form-group'><label class='control-label col-xs-4' localize='选择目标主机'>选择目标主机</label>
								<div class='col-xs-4'>
									<select class='form-control' ng-model='host' ng-options='host for host in hosts' required>
										<option value="" localize="--请选择--">请选择</option>
									</select>
								</div>
								<img style="position: relative;top: 3px" ng-if="hosts_loading" width="24" height="24" src="img/HLloading.gif">
								<a style="position: relative;top: 5px;" ng-if="!hosts_loading && !hosts.length" class="mypopover" htmlpopover='{{migrationTip}}'><i class="fa fa-question-circle"></i></a>
							</div>
							<footer class='text-right'>
								<img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''>
								<button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定' ng-disabled='movetoForm.$invalid'>确定</button>
								<button ng-if='!loading' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>
							</footer>
						</form>
					</div>
				</div>
			</section>`,					
			controller : function($scope, $modalInstance){
				$scope.hosts = [];
				$scope.hosts_loading = true;
				$scope.migrationTip = $$$I18N.get('migrationTip');
				vm.get_live_move_hosts({instance_ids:rows.map(function(item){ return item.id })}, function(res){
					$scope.hosts = res.result;
					$scope.host = $scope.hosts[0];
					$scope.hosts_loading = false;
				});
				$scope.ok = function(){
					var _this = this;
					$scope.loading = true;
					vm.live_move({
						instance_ids:rows.map(function(item){ return item.id }),
						host:_this.host
					},function(){
						$modalInstance.close();
						$.bigBox({
							title:$$$I18N.get("INFOR_TIP"),
							content:$$$I18N.get("桌面迁移成功"),
							timeout:6000
						});
					}).$promise.finally(function(){
						$scope.loading = false;
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "md"
		});
	};
	$scope.viewStorage = function(item){
		$modal.open({
			templateUrl:"views/vdi/dialog/desktop/view_storage.html",
			controller:['$scope','$modalInstance',function($scope,$modalInstance){
				$scope.loading = true;
				person_desktop.list_detail({id:item.id},function(res){
					$scope.data = res.result;
					$scope.data.hostname = item.hostname;
				}).$promise.finally(function(){
					$scope.loading = false;
				});
				$scope.close = function(){
					$modalInstance.close();
				}
			}],
		});
	};
}])

.controller("vdiDesktopSceneListController", [
"$scope", "$modal", "Scene", "$filter", "TeachTemplate", "SchoolRoom", "$$$I18N", "UserRole", "$interval", "$q", "Server",
function($scope, $modal, scene, $filter, template, SchoolRoom, $$$I18N, UserRole,$interval, $q, Server){
	$interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("modeIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("modesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(item.status == 'updating' || item.status == 'making'){
				item._ignore = true;
			}else{
				item._ignore = false;
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	let user = UserRole.currentUser;
	if(user === null){ return }
	$scope.loading = true;
	$scope.searchText = "";
	$scope.selectLoading = true;
	$scope.rows = [];
	$scope.allRows = [];
	$scope.refresh = getList;
	$scope.classrooms = [];

	var _controllerScope = $scope;
	var _loginPool =  user.pool;
	var _loginClassroom = $$$storage.getSessionStorage('classroom');

	

	getList();
	
	function getList(){
		$q.all([
			UserRole.refreshSession(),
			SchoolRoom.query().$promise,
			scene.query().$promise
		]).then(function(arr){
			var userId = user.id;
			var session = arr[0];
			// filter by user
			var schoolrooms = arr[1].pools_.filter(function(item){
				return item.user_ids.some(function(id){
					return id === userId;
				});
			});
			var ownedIds = session.user.pool;
			// filter by schoolroom id
			schoolrooms = schoolrooms.filter(function(item){
				return ownedIds.indexOf(item.id) > -1;
			});
			var cachedPoolId = $$$storage.getSessionStorage('scene_page_classroom') * 1 || null;
			if(cachedPoolId && ownedIds.indexOf(cachedPoolId) > -1 && !_controllerScope.select) {
				_controllerScope.select = cachedPoolId;
			}
			_controllerScope.classrooms = schoolrooms;
			// 处理场景数据
			var sceneData = arr[2];
			// 2017-08-18: 根据时间降序
			sceneData.modes.sort(function(a,b){
				return a.created_at > b.created_at ? -1 : 1;
			});
			sceneData.modes.forEach(function(item){
				if(item.status == 'updating' || item.status == 'making'){
					item._ignore = true;
				}else{
					item._ignore = false;
				}
			});
			_controllerScope.allRows = sceneData.modes;
			// 过滤当前教室对应场景
			_controllerScope.updateData("", _controllerScope.select);
		}).finally(function(){
			_controllerScope.selectLoading = false;
			_controllerScope.loading = false;
		});
	}
	$scope.refresh = getList;

	function getRealTimeRows(){
		var filterPages = $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize);
		var filterPagesAndSeatches = $filter("filter")(filterPages, $scope.searchText);
		return filterPagesAndSeatches;
	}
	$scope.getTotalCount = function(rows){		
		return getRealTimeRows().reduce(function(count, item){
			return count + item.instances_count;
		}, 0);
	};

	$scope.getRunningCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.running_count;
		}, 0);
	};

	$scope.getShutdownCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.shutdown_count;
		}, 0);
	};
	$scope.getPausedCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.paused_count;
		}, 0);
	};
	$scope.getNostateCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.nostate_count;
		}, 0);
	};
	$scope.getErrorCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.error_count;
		}, 0);
	};
	$scope.getOtherCount = function(rows){
		return getRealTimeRows().reduce(function(count, item){
			return count + item.other_count;
		}, 0);
	};

	$scope.cacheValue = function(v){
		$$$storage.setSessionStorage('scene_page_classroom', v);
	};

	$scope.updateData = function(text,pid){
		if(pid){
			$scope.rows = $scope.allRows.filter(function(row){ return row.pool === pid; })
		}
		else{
			var _rows = [];
			$scope.allRows.forEach(function(item){
				var isInClassrooms = _controllerScope.classrooms.filter(function(room){ return room.id === item.pool }).length;
				if(isInClassrooms){
					_rows.push(item);
				}
			});
			$scope.rows = _rows;
		}
	};

	$scope.pagesize = parseInt($$$storage.getSessionStorage('scene_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize", function(newvalue){
		newvalue && ($$$storage.setSessionStorage('scene_pagesize', newvalue))
	});

	$scope.openAddDomainDialog = function(item){
		var modal = $modal.open({
			templateUrl:"views/vdi/dialog/desktop/add_server.html",
			controller:"sceneAddServerDialog",
			resolve:{param:function(){return angular.copy(item);}}
		});
		modal.result.then(function(res){
			getList();
		});
	};
	$scope.sceneExitServerDialog = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='退域'>"+
					"退域</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='DOMAIN_EXIT_TIP2'>该场景下的所有桌面在下一次开机时，将自动执行退域的操作，是否确定？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					Server.domain_set_scene({
						id:item.id,
						has_domain:false
					},function(){
						_controllerScope.refresh();
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};

	$scope.start = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.shutdown_count <= row.instances_count && row.status!=="making" && row.status!=="updating" && row.status!=="setting-recoverable" && row.status!=='recovering'});
		var flag = rows.some((it)=> it.shutdown_count>0);
		if(rows.length && !flag){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout : 6000
			});
			return;
		}
		scene.powerOn({ids : rows.map(function(row){return row.id }),action : "power-on"},function(){
			// rows.forEach(function(row){
				// row.running_count = row.instances_count;
				// row._selected = false;
			// });
		});
	};
	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.running_count > 0 && row.status!=="updating" && row.status!=="setting-recoverable"; })
		if(rows.length == 0){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout : 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
					"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定强制关闭场景吗'>确定强制关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					scene.forcePowerOff({ids : rows.map(function(row){return row.id }),
                        action : "force-power-off"}, function(){
			           	rows.forEach(function(row){
							row.running_count = 0;
							// row._selected = false;
						});
			        });  
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.running_count > 0 && row.status!=="updating" && row.status!=="setting-recoverable"; })
		if(rows.length == 0){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout : 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
					"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭场景吗'>确定自然关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
			        $modalInstance.close();
					scene.powerOff({ids : rows.map(function(row){return row.id }), action : "power-off"}, function(){
                    	rows.forEach(function(row){
							row.running_count = 0;
							// row._selected = false;
						});
			        })		
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	$scope.active = function(id,event){
		var _this = this;
		
		if(_this.item.active){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='取消场景激活'>"+
						"取消场景激活</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='SCENE_CANCEL_COMFIRM'>取消激活该场景会同时关闭该场景内的所有桌面，是否确定?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
				        $modalInstance.close();
				        _this.item.active_loadding= true;
				       	scene.active({id :id},function(res){
							_this.item.active = _this.item.active ? false : true;
						}).$promise.finally(function(){
							_this.item.active_loadding= false;
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}else{
			_this.item.active_loadding= true;
			scene.active({id :id},function(res){
				_this.item.active = _this.item.active ? false : true;
			}).$promise.finally(function(){
				_this.item.active_loadding= false;
			});
		}
	};
	$scope.sortScene = function(){
		var modal = $modal.open({
			templateUrl:"views/vdi/dialog/desktop/scene_sort.html",
			controller:"sortSceneDialog",
			resolve:{param:function(){
				return {scenes:angular.copy(_controllerScope.rows),schoolroom:angular.copy(_controllerScope.select)}
			}}
		});
		modal.result.then(function(res){
			getList();
		});
	};
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && !(row.active); });
		var has_running = rows.some(function(row){ return row.running_count});
		var has_active = $scope.rows.some(function(row){ return row._selected && row.active; });
		if(rows.length==0){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopSceneList_TIP1"),
				timeout : 6000
			});
		} else {
			if(has_active) {
				$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("只有未激活状态下的场景才能被删除"),
					timeout : 6000
				});
			}
			$modal.open({
				template: "<section id='widget-grid'>"
						+ " <div class='modal-content'>"
						+ "  <div class='modal-header'>"
						+ "   <button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button>"
						+ "   <h4 class='modal-title' id='mySmallModalLabel' localize='删除场景'></h4>"
						+ "  </div>"
						+ "  <div class='modal-body'>"
						+ "   <form class='form-horizontal'>"
						+ "    <p ng-show='has_run' style='margin-bottom:10px;' localize='存在未关机的桌面,仍然删除场景吗'></p>"
						+ "    <p ng-show='!has_run' style='margin-bottom:10px;' localize='删除场景无法恢复，确定删除场景吗'></p>"
						+ "    <footer class='text-right'>"
						+ "     <button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button>"
						+ "     <button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>"
						+ "    </footer>"
						+ "   </form>"
						+ "  </div>"
						+ " </div>"
						+ "</section>",
				
				controller : function($scope, $modalInstance){
					$scope.has_active = has_active;
					$scope.has_run =  has_running;
					$scope.ok = function(){
						$modalInstance.close();
						scene.delete({ids : rows.map(function(row){return row.id }), action : "delete"}, function(){
							getList();
				        })		
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.restartScene = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.running_count > 0 && row.status!=="making" && row.status!=="updating" && row.status!=="setting-recoverable" && row.status!=='recovering'});
		if(!rows.length){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopPersonalList_TIP7"),
				timeout : 6000
			});
			return;
		}
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
						"场景桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启场景下的桌面吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					rows.map(function(row){
						row._selected = false;
					});
					scene.reboots({ids: rows.map(function(row){ return row.id; })},function(){
						getList();
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

.controller("newSceneDialog", ["$scope", "$modalInstance", "Host", "Scene", "SchoolRoom", "Network", "TeachTemplate", "HardwareTemplate","TeachDesktop","Server","$$$I18N","$$$MSG", "UserRole","$filter","ResourcePool","$modal","VMCommon","PersonDesktop",
	function($scope, $modalInstance, host, scene, schoolroom, net, teach, hardwares,list,server,$$$I18N,$$$MSG, UserRole,$filter,ResourcePool,$modal,vm, PersonDesktop){
	let user = UserRole.currentUser;
	if(!user){ return }

	$scope.regXP = /WindowsXP|WindowsXP_64/;
	$scope.reg = /windows\s*(7|8|10)/i;
	$scope.regWin = /Windows/;
	// 第一步
	$scope.step1 = {};
	$scope.classrooms = angular.copy($scope.$parent.classrooms);
	$scope.step1.classroom = $scope.classrooms[0];
	
	server.query(function(data){
		$scope.domains = data.servers;
	});

	ResourcePool.query(function(res){
		$scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.step1.resource = $scope.resources[0];
		$scope.resource_update();
	});
	$scope.resource_update = function(){
		$scope.get_teach_template();
	};

	$scope.get_teach_template = function(){
		$scope.allImages = [];
		$scope.templateNum = undefined;
		$scope.step1.image = undefined;
		$scope.loading_template = true;
		vm.list_template({type:1,virtual_type:$scope.step1.resource.type,rbd_enabled:$scope.step1.resource.rbd_enabled}, function(data){
			$scope.loading_template = false;
			$scope.winTable = data.win_images
				.filter(function(item){ return item.status == "alive" });
			$scope.linTable = data.linux_images
				.filter(function(item){ return item.status == "alive" });
			$scope.otherTable = data.other_images
				.filter(function(item){ return item.status == "alive" });
			$scope.image = $scope.winTable[0];
			$scope.allImages = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
			$scope.templateNum = $scope.allImages.length;
			$scope.step1.image = $scope.allImages[0];
		});
	};
	// 第二步
	$scope.step2 = {};
	$scope.step2.loading_server = true;
	PersonDesktop.share_servers(function(res){
		$scope.step2.loading_server = false;
		var servers = [];
		res.servers.forEach(function(server){
			server.nets.forEach(function(net){
				servers.push({id: server.id, net: {ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id}})
			})
		});
		$scope.share_servers = servers;
		$scope.step2.share_server = $scope.share_servers[0];
	})
	$scope.updateHardware = function(){
		var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
		var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
		var is_win = $scope.regWin.test($scope.step1.image.os_type);
		$scope.step2.usb_version = "2.0";
		if(is_win7UP){
			$scope.step2.usb_redir = true;
			$scope.step2.usb_version = "3.0";
		}else if(is_winXP){
			$scope.step2.usb_redir = true;
		}else{
			// $scope.step2.usb_redir = false;
		}
		$scope.step2.usb3_disabled = !is_win7UP ? true : false;
		$scope.step2.isWin = is_win;
	}
	// 第三步
	$scope.step3 = {};
	$scope.step3.desktopNum2 = 0;
	$scope.get_host = function(){
		$scope.hosts = undefined;
		$scope.loading_host = true;
		$scope.step3.is_all = undefined;
		$scope.step3.desktopNum = undefined;
		// $scope.bodyForm3.$setPristine();
		if($scope.step1.resource.type=='hyper-v'){
			host.query_gpu_agent({
				id: $scope.step1.resource.id,
				network_id: $scope.step1.classroom.network_id,
				enable_gpu: $scope.step2.has_gpu
			},function(data){
				$scope.hosts = data.hosts_list.map(function(item){
					if(item.disabled_tips !== ''){
						item.disabled_desc = $$$I18N.get(item.disabled_tips);
					}
					return item;
				});
			}).$promise.finally(function(){
				$scope.loading_host = false;
			});
		}else{
			host.query_agent({
				id: $scope.step1.resource.id,
				network_id: $scope.step1.classroom.network_id,
				enable_gpu: $scope.step2.gpu_auto_assignment
			},function(data){
				$scope.hosts = data.hosts_list.filter(function(h){ return h.status === 'active'});
			}).$promise.finally(function(){
				$scope.loading_host = false;
			});
		}
	};
	var host_storages = {};
	$scope.openMoreDialog = function(){
		var _hostids = $scope.hosts.filter(function(h){ return h._selected}).map(function(h){ return h.storage_uuid });
		var moreDialog = $modal.open({
			templateUrl:"views/vdi/dialog/desktop/host_config.html",
			controller:"hostConfigDialog",
			resolve:{param:function(){return {
				"phostids":angular.copy(_hostids),
				"pstore":host_storages
			}}}
		});
	};
	// 第四步
	$scope.step4 = {};
	$scope.selectAllHost = function(bool){
		var _hosts = $scope.hosts.filter(function(h){
			if($scope.step1.resource.type=='hyper-v'){
				return h.disabled_tips=='';
			}else{
				return true;
			}
		});
		_hosts.map(function(item){
			item._selected = bool;
			return item;
		});
		var num = $filter("selectedFilter")(_hosts,'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
	};
	$scope.selectOneHost = function(){
		var _hosts = $scope.hosts.filter(function(h){
			if($scope.step1.resource.type=='hyper-v'){
				return h.disabled_tips=='';
			}else{
				return true;
			}
		});
		$scope.step3.is_all = _hosts.every(function(item){
			return item._selected === true;
		});
		var num = $filter("selectedFilter")(_hosts,'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
	};
	$scope.getDesktopNumber2 = function(){
		var _lis = angular.copy($scope.hosts.filter(function(item){ return item.instance_num > 0 }));
		if(_lis.length > 0){
			$scope.step3.desktopNum2 = _lis.reduce(function(a,b){
				a.instance_num += b.instance_num;
				return a;
			}).instance_num;
		}else{
			$scope.step3.desktopNum2 = 0;
		}
	};
	
	$scope.clearRDP = function(scope){
		scope.RDP = false;
		$scope.userNameType = 1;
		$scope.userNamePre = "K";
		$scope.userNameBegin = 1;
	};
	$scope.clearDomain = function(scope){
		if(scope.has_domain){
			scope.domain = $scope.domains[0];
		}else{
			scope.domain = null;
		}
	};
	$scope.addZero = function(len,str_begin,str_end){
		if(str_end && str_begin){
			var end_len = str_end.toString().length;
			if(end_len < len){
				return  str_begin + new Array(len - end_len+1).join("0") + str_end;
			}else{
				return str_begin + str_end;
			}
		}
	};	
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.$on("WizardStep_0", function(e, step, scope){
		setTimeout(function(){
			$("[rel=popover-hover]").popover({
				trigger : "hover"
			});
		})
		var sameSceneName = $scope.rows.filter(function(item){return item.name == $scope.step1.sceneName}).length;
		scope.error = step.is_dirty;
		step.done = scope.bodyForm1.$valid && !sameSceneName;
		if(sameSceneName){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("SAME_SCENE_NAME"),
				timeout	: 6000
			});
		}
		if(step.done && !sameSceneName){
			hardwares.filter({
				"system_gb": $scope.step1.image.system_alloc_disk,
				"local_gb": $scope.step1.image.data_alloc_disk,
				"local_gb1": $scope.step1.image.data_alloc_disk_2,
			},function(data){
				$scope.hardwareList = data.result.map(function(data){
					data.memory_mb = data.memory_mb/1024;
					return data;
				});
				$scope.step2.hardware = $scope.hardwareList[0];
				$scope.updateHardware();
			});
		}
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		$scope.get_host();
		scope.error = step.is_dirty;
		step.done = scope.bodyForm2.$valid;
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		if($scope.step1.resource.type =='hyper-v'){
			$scope.step4.MORE = true;
			$scope.step4.RDP = true;
		}else{
			$scope.step4.MORE = false;
			$scope.step4.RDP = false;
		}
		scope.error = step.is_dirty;
		if($scope.step3.hostType == 0){
			step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts,'max_instance');
		}
		if($scope.step3.hostType==1){
			step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
		}
	});
	$scope.$on("WizardStep_3", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm4.$valid;
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var regWin10 = /Windows10/;
		var postData = {};
		postData.name          = $scope.step1.sceneName;
		postData.image_id      = $scope.step1.image.id;
		postData.pool          = $scope.step1.classroom.id;
		postData.resource_pool_uuid  = $scope.step1.resource.uuid;
		if($scope.step1.domain){
			postData.domain          = $scope.step1.domain.id;}
		if($scope.step1.resource.type === "hyper-v")
			postData.enable_gpu      = $scope.step2.has_gpu;
		if($scope.step1.resource.type === "kvm"){
			postData.gpu_auto_assignment = $scope.step2.gpu_auto_assignment;
			if(regWin10.test($scope.step1.image.os_type)){
				postData.firmware_type = 'uefi';
			}
		}
		postData.instance_type       = $scope.step2.hardware.id;
		postData.usb_redir    = $scope.step2.usb_redir;
		postData.usb_version  = ($scope.step2.usb_redir && $scope.step1.resource.type=='kvm') ? $scope.step2.usb_version : null;
		postData.rollback      = Number($scope.step2.rollback);
		postData.data_rollback = $scope.step2.hardware.local_gb>1 ? Number($scope.step2.data_rollback) : undefined;
		if(postData.rollback === 2){
			postData.rollback_weekday = $scope.step2.rollback_weekday;}
		if(postData.rollback === 3){
			postData.rollback_monthday = $scope.step2.rollback_monthday;}
		if(postData.data_rollback === 2){
			postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;}
		if(postData.data_rollback === 3){
			postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;}
		
		if($scope.step3.hostType == 0){
			postData.servers = $scope.hosts.filter(function(item){ return item._selected }).map(function(item){
				return {"uuid": item.id}
			});
			postData.instance_max = $scope.step3.desktopNum;
		}
		if($scope.step3.hostType == 1){
			postData.servers = $scope.hosts.filter(function(item){ return item.instance_num > 0 }).map(function(item){
				return { "uuid":item.id,"vm_count":item.instance_num }
			});
			postData.instance_max = $scope.step3.desktopNum2;
		}
		postData.servers_storage = Object.keys(host_storages).map(function(key){
			var host = host_storages[key];
			return {
				uuid:host.id,
				image_storage_capacity: host.image_storage_capacity,
				image_storage_performance: host.image_storage_performance,
				storage_capacity: host.storage_capacity,
				storage_performance: host.storage_performance
			}
		});
		postData.hostname_type      = Number($scope.step4.hostNameType);
		postData.hostname_prefix    = $scope.step4.hostNamePre;
		postData.hostname_beginwith = $scope.step4.hostNameBegin;
		if($scope.step1.resource.type === "kvm"){
			postData.is_exam 			= $scope.step4.RDP;
			if($scope.step4.MORE){
				postData.username_type         = $scope.step4.userNameType;
				postData.username_prefix       = $scope.step4.userNamePre;
				postData.username_beginwith    = $scope.step4.userNameBegin;
			}
		}
		if($scope.step1.resource.type === "hyper-v"){
			postData.is_exam 			= true;
		}
		postData.enable_share = $scope.step2.enable_share;
		if($scope.step2.enable_share){
			postData.share_server_ip = $scope.step2.share_server.net.ip_address;
			postData.share_server_id = $scope.step2.share_server.id;
		}
		postData.expand_enabled = $scope.step2.expand_enabled;
		$scope.submitting = true; 
		scene.save(postData,function(res){
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function(){
			$scope.submitting = false;
		});
		
	});
}])
.controller("alterSceneDialog", ["$scope", "$modalInstance", "SchoolRoom", "Scene","Host","Server", "PersonDesktop",function($scope, $modalInstance, schoolroom, scene,host,server,personDesktop){
	$scope.need_ha = false;
	var selectedServer,raw_need_ha;
	$scope.rollbackChange = function(value){
		if(value != "1"){
			$scope.need_ha = false;
		}else{
			if(selectedServer&&selectedServer.length>0){
				$scope.need_ha = angular.copy(raw_need_ha);
				$scope.servers = selectedServer;
			}
		}
	};
	$scope.name = $scope.currentItem.name;
	$scope.desktopNum = $scope.currentItem.instance_max ;
	$scope.min_instances = $scope.currentItem.instance_max;
	$scope.rollback = $scope.currentItem.rollback;
	$scope.rollback_monthday = $scope.currentItem.rollback_monthday ? $scope.currentItem.rollback_monthday : "1";
	$scope.rollback_weekday = $scope.currentItem.rollback_weekday ? $scope.currentItem.rollback_weekday :"1";

	$scope.disk_type = $scope.currentItem.disk_type;
	$scope.local_gb = $scope.currentItem.local_gb;
	$scope.data_rollback = $scope.currentItem.data_rollback;
	$scope.data_rollback_monthday = $scope.currentItem.data_rollback_monthday || "1";
	$scope.data_rollback_weekday = $scope.currentItem.data_rollback_weekday || "1";

	$scope.usb_redir = $scope.currentItem.usb_redir;
	$scope.usb3_disabled = !$scope.currentItem.usb3_editable;
	$scope.usb_version = $scope.currentItem.usb_version || "2.0";

	$scope.running_count = $scope.currentItem.running_count;
	$scope.has_domain=$scope.currentItem.has_domain||false;
	$scope.domain = $scope.currentItem.domain;
	$scope.need_ha = false;
	// $scope.enable_gpu = $scope.currentItem.enable_gpu;
	$scope.enable_share = $scope.currentItem.enable_share;
	$scope.share_server_ip = $scope.currentItem.share_server_ip;
	$scope.loading_server = true;
	personDesktop.share_servers(function(res){
		$scope.loading_server = false;
		var servers = [];
		res.servers.forEach(function(server){
			server.nets.forEach(function(net){
				servers.push({id: server.id, net: {ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id}})
			})
		});
		$scope.share_servers = servers;
		if($scope.enable_share){
			$scope.share_server = $scope.share_servers.filter(function(item){ return item.net.ip_address==$scope.share_server_ip })[0]
		}else{
			$scope.share_server = $scope.share_servers[0];
		}
	})
	$scope.is_windows = $scope.currentItem.is_windows;
	$scope.expand_enabled = $scope.currentItem.expand_enabled;
	$scope.ok = function(){
		var _rollback = parseInt(this.rollback);
		var _data_rollback = parseInt(this.data_rollback) >= 0 ? Number(this.data_rollback) : undefined;
		var item = {};
		item.id = $scope.currentItem.id;
		item.pool = $scope.currentItem.pool;
		item.name = this.name;
		item.instance_max          = $scope.currentItem.instance_max;
		item.rollback              = _rollback;
		item.rollback_monthday 	   = _rollback == 3 ? this.rollback_monthday : undefined;
		item.rollback_weekday      = _rollback == 2 ? this.rollback_weekday : undefined;
		item.data_rollback         = _data_rollback;
		item.data_rollback_monthday= _data_rollback === 3 ? this.data_rollback_monthday : undefined;
		item.data_rollback_weekday = _data_rollback === 2 ? this.data_rollback_weekday : undefined;
		item.usb_redir 			   = this.usb_redir;
		item.usb_version  		   = (item.usb_redir && $scope.currentItem.virtual_type=='kvm') ? this.usb_version : null;
		item.has_domain            = this.has_domain;
		// if($scope.currentItem.virtual_type === 'hyper-v')
		// 	item.enable_gpu			   = this.enable_gpu;
		item.domain                = this.domain;
		item.need_ha               = item.rollback==1 &&  this.need_ha;
		item.enable_share = this.enable_share;
		item.share_server_ip = this.enable_share?this.share_server.net.ip_address:undefined;
		item.share_server_id = this.enable_share?this.share_server.id:undefined;
		item.expand_enabled = this.expand_enabled;
		if(item.rollback ==1 && item.need_ha){
			item.server_ids = $scope.servers.filter(function(value){
				return value._selected;
			}).map(function(value){
				return value.id;
			});
			if(item.server_ids<1){
				return false;
			}
			item.server_ids = item.server_ids.join(',');
		}
		$scope.loading = true;
		scene.update(item, function(){
			$modalInstance.close();
			$scope.refresh();
		},function(){
			$scope.refresh();
		}).$promise.finally(res => {
			$scope.loading = false;
		});	
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller('sortSceneDialog', ['$scope','param','$modalInstance','Scene', function($scope,param,$modalInstance,Scene){

	$scope.schoolroom = param.schoolroom;
	$scope.scenes = param.scenes;
	$scope.auto_scene = $scope.scenes.filter(function(s){ return s.is_auto })[0];
	// $scope.is_auto_enter = $scope.auto_scene ? true: false;
	function move(num){
		var cur = $scope.scenes.filter(function(item){ return item._actived })[0];
		var cur_idx = $scope.scenes.indexOf(cur);
		var pre_idx = null;
		if(cur_idx + num < 0){
			pre_idx = $scope.scenes.length -1;
		}else if(cur_idx + num > $scope.scenes.length -1){
			pre_idx = 0;
		}else{
			pre_idx = cur_idx + num;
		}
		var t = $scope.scenes.splice(cur_idx,1)[0];
		$scope.scenes.splice(pre_idx,0,t);
	};
	$scope.up = function(){
		move(-1);
	};
	$scope.down = function(){
		move(1);
	};

	$scope.select = function(item){
		$scope.scenes.map(function(i){
			if(i.id === item.id){
				i._actived = true;
				return i;
			}
			i._actived = false;
			return i;
			
		})
	};
	$scope.ok = function(){
		var _this = this;
		var postData = $scope.scenes.map(function(s,idx){
			var _item = {
				order:idx+1,
				name:s.name,
				id:s.id,
				is_auto:Boolean(_this.auto_scene && (_this.auto_scene.id === s.id)),
			};
			return _item;
		});
		Scene.sort({order_data:postData},function(){
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller("newPersonDialog", ["$scope", "$modalInstance", "Host","Network", "HardwareTemplate","PersonTemplate","User","Admin","Domain","PersonDesktop","Server","$$$I18N","$$$MSG","ResourcePool","$filter","$modal","VMCommon","checkIP",
	function($scope, $modalInstance, host, networks, hardwares, images,user,admin, domain,Person,server, $$$I18N, $$$MSG,ResourcePool,$filter, $modal, vm, checkIP){
	$scope.desktopNum = 1;
	$scope.max_instance = 0;
	$scope.host_loading = true;
	$scope.regXP = /WindowsXP|WindowsXP_64/;
	$scope.reg = /(windows\s*7|8|10)/i;
	$scope.regWin = /Windows/;
	// 第一步
	$scope.step1 = {};
	$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
	$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
	$scope.get_subnet = function(network){
		if(network.subnets.length){
			networks.query_sub({
				id:network.id
			},function(res){
				$scope.subnetworks = res.result.map(function(n){
					n._desc = n.start_ip ?(n.name + " (" + n.start_ip +" - "+ n.end_ip + ") ") :  n.name;
					return n;
				});
				$scope.step1.subnetwork = $scope.subnetworks[0];
				$scope.clearBindIp();
			});
		}else{
			$scope.subnetworks = [];
			$scope.step1.subnetwork = null;
			$scope.clearBindIp();
		}
	};
	networks.query(function(data){
		// $scope.networks = data.networks.filter(function(n){ return n.subnets.length > 0});
		$scope.networks = data.networks;
		if($scope.networks.length){
			$scope.step1.network = $scope.networks[0];
			$scope.get_subnet($scope.step1.network);
		}
	});
	ResourcePool.query(function(res){
		$scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.step1.resource = $scope.resources[0];
		$scope.resource_update();
	});
	$scope.resource_update = function(){
		$scope.get_personal_template();
	};
	$scope.get_personal_template = function(){
		$scope.templates = [];
		$scope.templateNum = undefined;
		$scope.step1.image = undefined;
		$scope.loading_template = true;
		vm.list_template({type:2,virtual_type:$scope.step1.resource.type,rbd_enabled:$scope.step1.resource.rbd_enabled}, function(data){
			$scope.loading_template = false;
			$scope.winTable = data.win_images
				.filter(function(item){ return item.status === "alive" })

			$scope.linTable = data.linux_images
				.filter(function(item){ return item.status === "alive" })
			$scope.otherTable = data.other_images
				.filter(function(item){ return item.status === "alive" })
			$scope.templates = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
			$scope.templateNum = $scope.templates.length;
			$scope.step1.image = $scope.templates[0];
		});
	};
	$scope.clearBindIp = function(){
		if($scope.step1.subnetwork){
			$scope.IPmodes = $scope.IPmodes2;
		}else{
			$scope.IPmodes = $scope.IPmodes1;
		}
		$scope.step1.IPmode= $scope.IPmodes[0];
		$scope.step1.ip = null;
	};
	// 第二步
	$scope.step2 = {};
	$scope.step2.loading_server = true;
	Person.share_servers(function(res){
		$scope.step2.loading_server = false;
		var servers = [];
		res.servers.forEach(function(server){
			server.nets.forEach(function(net){
				servers.push({id: server.id, net: {ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id}})
			})
		});
		$scope.share_servers = servers;
		$scope.step2.share_server = $scope.share_servers[0];
	})
	$scope.updateHardware = function(){
		var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
		var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
		var is_win = $scope.regWin.test($scope.step1.image.os_type);
		$scope.step2.usb_version = "2.0";
		if(is_win7UP){
			$scope.step2.usb_redir = true;
			$scope.step2.usb_version = "3.0";
		}else if(is_winXP){
			$scope.step2.usb_redir = true;
		}else{
			// $scope.step2.usb_redir = false;
		}
		$scope.step2.usb3_disabled = !is_win7UP ? true : false;
		$scope.step2.isWin = is_win;
	}
	// 第三步
	$scope.step3 = {};
	$scope.step3.desktopNum2 = 0;
	$scope.get_host = function(){
		var uuid = $scope.step1.resource.uuid;
		var netid = $scope.step1.network.id;
		var is_gpu = $scope.step2.has_gpu;
		$scope.host_loadding = true;
		$scope.step3.is_all = undefined;
		$scope.hosts = undefined;
		if($scope.step1.resource.type=='hyper-v'){
			host.query_gpu_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: is_gpu
			},function(data){
				$scope.host_loadding = false;
				$scope.hosts = data.hosts_list.map(function(item){
					if(item.disabled_tips !== ''){
						item.disabled_desc = $$$I18N.get(item.disabled_tips);
					}
					return item;
				});
			});
		}else{
			host.query_agent({
				id: uuid,
				network_id: netid,
				enable_gpu: $scope.step2.gpu_auto_assignment
			},function(res){
				$scope.host_loadding = false;
				$scope.hosts = res.hosts_list.filter(function(h){ return h.status === 'active'});
			});
		}
	};

	var host_storages = {};
	$scope.openMoreDialog = function(){
		var _hostids;
		if($scope.step3.hostType=='0'){
			_hostids = $scope.hosts.filter(function(h){ return h._selected}).map(function(h){ return h.storage_uuid });
		}else{
			_hostids = $scope.hosts.filter(function(h){ return h.instance_num}).map(function(h){ return h.storage_uuid });
		}
		var moreDialog = $modal.open({
			templateUrl:"views/vdi/dialog/desktop/host_config.html",
			controller:"hostConfigDialog",
			resolve:{param:function(){return {
				"phostids":angular.copy(_hostids),
				"pstore":host_storages
			}}}
		});
		moreDialog.result.then(function(){
		});
	};
	
	$scope.selectAllHost = function(bool){
		var _hosts = $scope.hosts.filter(function(h){
			if($scope.step1.resource.type=='hyper-v'){
				return h.disabled_tips=='';
			}else{
				return true;
			}
		});
		_hosts.map(function(item){
			item._selected = bool;
			return item;
		});
		var num = $filter("selectedFilter")(_hosts,'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
	};
	$scope.selectOneHost = function(){
		var _hosts = $scope.hosts.filter(function(h){
			if($scope.step1.resource.type=='hyper-v'){
				return h.disabled_tips=='';
			}else{
				return true;
			}
		});
		$scope.step3.is_all = _hosts.every(function(item){
			return item._selected === true;
		});
		var num = $filter("selectedFilter")(_hosts,'max_instance');
		$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
	};
	$scope.getDesktopNumber2 = function(){
		var _lis = angular.copy($scope.hosts.filter(function(item){ return item.instance_num > 0 }));
		if(_lis.length > 0){
			$scope.step3.desktopNum2 = _lis.reduce(function(a,b){
				a.instance_num += b.instance_num;
				return a;
			}).instance_num;
		}else{
			$scope.step3.desktopNum2 = 0;
		}
	};

	$scope.step4 = {};
	$scope.$on("selectStepChange", function(e, arg){
		if(arg.index==0){
			arg.stepScope.$$nextSibling.error = false;
		}
	})
	$scope.$on("WizardStep_0", function(e, step, scope){
		setTimeout(function(){
			$("[rel=popover-hover]").popover({
				trigger : "hover"
			});
		})
		scope.error = step.is_dirty;
		function toStrLong(ip){
			var ips;
			ips = ip.split(".").map(function(item,idx){
				var _prefix = '';
				for(var i = 0;i < 8 - Number(item).toString(2).length;i++){
					_prefix += "0";
				}
				return _prefix + Number(item).toString(2);
			});
			return ips.join("");
		}
		function check_net(){
			// 返回值为true时，invalid
			if($scope.step1.subnetwork && $scope.step1.subnetwork.netmask && $scope.step1.subnetwork.enable_dhcp && $scope.step1.ip){
				var _startIP = toStrLong($scope.step1.subnetwork.start_ip);
				var _endIP = toStrLong($scope.step1.subnetwork.end_ip);
				var _bindStartIP = toStrLong($scope.step1.ip);
				return (_bindStartIP < _startIP || _bindStartIP > _endIP);
			}
			return false;
		}

		if(check_net()){
			$.bigBox({
				title	:$$$I18N.get("INFOR_TIP"),
				content	:$$$MSG.get(12061),
				timeout	:5000
			});
		}
		var sameDesktopName = $scope.rows.filter(function(item){return item.display_name == $scope.step1.desktopName}).length;
		var is_valid = scope.bodyForm1.$valid && !check_net();
		step.done = is_valid  && !sameDesktopName;
		if(sameDesktopName){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("SAME_PERSONAL_NAME"),
				timeout	: 6000
			});
		}
		if(step.done && !sameDesktopName){
			hardwares.filter({
				"system_gb": $scope.step1.image.system_alloc_disk,
				"local_gb": $scope.step1.image.data_alloc_disk,
				"local_gb1": $scope.step1.image.data_alloc_disk_2,
			},function(data){
				$scope.hardwareList = data.result.map(function(data){
					data.memory_mb = data.memory_mb/1024;
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
	$scope.$on("WizardStep_1", function(e, step, scope){
		scope.error = step.is_dirty;
		var is_valid = scope.bodyForm2.$valid;
		if(is_valid){
			$scope.step3.desktopNum = undefined;
			$scope.step3.desktopNum2 = 0;
			$scope.get_host();
		}
		step.done = is_valid;
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		scope.error = step.is_dirty;
		// number类型的input ，max属性是变量，不生效，手动判断
		if($scope.step3.hostType == 0){
			step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts,'max_instance');
		}
		if($scope.step3.hostType==1){
			step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
		}
	});
	$scope.$on("WizardStep_3", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = $scope.step4.select_users.length?true:false;
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		 var postData = {};
		 var regWin10 = /Windows10/;
		 	postData.display_name = $scope.step1.desktopName;
			postData.network_id = $scope.step1.network.id;
			postData.resource_pool	  = $scope.step1.resource.uuid;

		 if($scope.step1.subnetwork){
		 	postData.subnet_id = $scope.step1.subnetwork.id;
		 }else{ postData.subnet_id = ''; }
		 	postData.ip_choose = Number($scope.step1.IPmode.value) ? true : false;
		 if(postData.ip_choose && Number($scope.step1.IPmode.value) === 2){
		 	postData.start_ip = $scope.step1.ip;}
		 // if($scope.step1.domain){
			// postData.ad_server_id = $scope.step1.domain.id;}
			postData.image_id     = $scope.step1.image.id;
			
			postData.rollback      = Number($scope.step2.rollback);
			postData.data_rollback = $scope.step2.hardware.local_gb>1 ? Number($scope.step2.data_rollback) : undefined;
			if(postData.rollback === 2){
				postData.rollback_weekday = $scope.step2.rollback_weekday;}
			if(postData.rollback === 3){
				postData.rollback_monthday = $scope.step2.rollback_monthday;}
			if(postData.data_rollback === 2){
				postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;}
			if(postData.data_rollback === 3){
				postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;}

			postData.instance_type_id = $scope.step2.hardware.id;
			postData.usb_redir 		  = $scope.step2.usb_redir;
			postData.usb_version      = ($scope.step2.usb_redir && $scope.step1.resource.type=='kvm') ? $scope.step2.usb_version : null;
			if($scope.step1.resource.type === "hyper-v")
				postData.enable_gpu       = $scope.step2.has_gpu;
			if($scope.step1.resource.type === "kvm"){
				postData.gpu_auto_assignment = $scope.step2.gpu_auto_assignment;
				if(regWin10.test($scope.step1.image.os_type)){
					postData.firmware_type = 'uefi';
				}
			}
			
		if($scope.step3.hostType == 0){
			postData.servers = $scope.hosts.filter(function(item){ return item._selected }).map(function(item){
				return {"uuid": item.id}
			});
			postData.count = $scope.step3.desktopNum;
		}
		if($scope.step3.hostType == 1){
			postData.servers = $scope.hosts.filter(function(item){ return item.instance_num > 0 }).map(function(item){
				return { "uuid":item.id,"vm_count":item.instance_num }
			});
			postData.count = $scope.step3.desktopNum2;
		}
		postData.servers_storage = Object.keys(host_storages).map(function(key){
			var host = host_storages[key];
			return {
				uuid:host.id,
				image_storage_capacity: host.image_storage_capacity,
				image_storage_performance: host.image_storage_performance,
				storage_capacity: host.storage_capacity,
				storage_performance: host.storage_performance
			}
		});
		postData.user_id = $scope.step4.select_users.map(function(item){ return item.id?item.id:item.user_id });
		postData.rule_id = $scope.step4.rule;

		postData.enable_share = $scope.step2.enable_share;
		if($scope.step2.enable_share){
			postData.share_server_ip = $scope.step2.share_server.net.ip_address;
			postData.share_server_id = $scope.step2.share_server.id;
		}
		postData.expand_enabled = $scope.step2.expand_enabled;
		$scope.submitting = true;
		Person.save(postData, function(res){
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function(){
			$scope.submitting = false;
		});
	});
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("alterPersonalDialog", ["$scope","$modalInstance","Network","HardwareTemplate","User","Admin" ,"PersonDesktop","Domain","$q","$$$I18N",
	function($scope, $modalInstance,net,hardwrare,user,admin,personDesktop,domain,$q,$$$I18N){
	$scope.IPs = [];
	$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
	$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
	$scope.datas = angular.copy($scope.currentItem);
	if($scope.datas.ips){
		$scope.IPmodes = $scope.IPmodes2;
		$scope.datas.IPmode = $scope.IPmodes[1];
	}else{
		$scope.IPmodes = $scope.IPmodes1;
		$scope.datas.IPmode = $scope.IPmodes[0];
	}
	$scope.datas.usb_version = $scope.datas.usb_redir?$scope.datas.usb_version:'2.0';
	$scope.datas.memory_mb = $scope.datas.memory_mb/1024;
	$scope.btndisks = [];
	personDesktop.list_detail({id:$scope.datas.id},function(res){
		$scope.detailData = res.result;
		["data_rollback_weekday","data_rollback_monthday","rollback_weekday","rollback_monthday"].forEach(key => {
			$scope.detailData[key] = $scope.detailData[key] || 1;
		});
		$scope.get_net(true);
		$scope.loading_server = true;
		personDesktop.share_servers(function(res){
			$scope.loading_server = false;
			var servers = [];
			res.servers.forEach(function(server){
				server.nets.forEach(function(net){
					servers.push({id: server.id, net: {ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id}})
				})
			});
			$scope.share_servers = servers;
			if($scope.detailData.share_server_ip){
				$scope.detailData.share_server = $scope.share_servers.filter(function(item){ return item.net.ip_address==$scope.detailData.share_server_ip })[0]
			}else{
				$scope.detailData.share_server = $scope.share_servers[0];
			}
		})
	});
	
	$scope.get_net = function(flag){
		$scope.loading = true;
		net.query(function(res){
			// 过滤无子网网络
			$scope.loading = false;
			// $scope.networks = res.networks.filter(function(net){ return net.subnets.length > 0});
			$scope.networks = res.networks;
			$scope.datas._network = $scope.networks.filter(function(item){ return item.id === $scope.detailData.network.id })[0];
			$scope.get_sub_net($scope.datas._network, flag);
		});
	};

	$scope.get_sub_net = function(network, flag){
		if(network.subnets.length){
			$scope.loading = true;
			net.query_sub({id:network.id},function(res){
				$scope.loading = false;
				$scope.subnetworks = res.result;
				if(flag){
					$scope.datas._subnetwork = $scope.subnetworks.filter(function(item){ return item.id === $scope.detailData.subnet_id })[0]
				}else{
					$scope.datas._subnetwork = $scope.subnetworks[0];
				}
				$scope.clearBindIp();
			});
		}else{
			$scope.subnetworks = [];
			$scope.datas._subnetwork = null;
			$scope.clearBindIp();
		}
		
	};
	var first = true;
	$scope.clearBindIp = function(){
		if(first){
			first = false;
		}else{
			if($scope.datas._subnetwork){
				$scope.IPmodes = $scope.IPmodes2;
			}else{
				$scope.IPmodes = $scope.IPmodes1;
			}
			$scope.datas.IPmode= $scope.IPmodes[0];
			$scope.datas.ips = null;
		}
	};
	$scope.get_disks = function(){
		$scope.loading_disk = true;
		personDesktop.list_passive_disk({
			user_id:$scope.datas._user.id,
			instance_id:$scope.datas.instance_id
		},function(res){
			$scope.loading_disk = false;
			$scope.disks = res.result;
		});
	};
	$scope.$watch("datas._user",function(newval){
		if(newval){
			$scope.get_disks();
		}
	});
	$scope.expandedNodes = [];
	function formatData(d,name){
	    iteration(d,name);
	    return d;
	}
	function iteration(data,childName,list){
	    for(var i = 0 ; i < data.length ; i++){
	        $scope.expandedNodes.push(data[i]);
	        if(data[i][childName] && data[i][childName].length){
	            var len = iteration(data[i][childName],childName);
	            if(len === 0){
	                data[i] = undefined;
	            }
	        }
	        if(!data[i]) { continue; }
	        if(data[i].users && data[i].users.length > 0){
	            data[i].users.map(user => {
	                user.name = user.name || user.user_name;
	                user._is_last = true;
	                return user;
	            });
	            data[i][childName] = data[i].users;
	        }
	        if(data[i][childName] && data[i][childName].length === 0){
	            data[i]= undefined;
	        }
	    }
	    while(data.length > 0) {
	        // 如果有数组元素为空，每次删除一个
	        var oldlen = data.length;
	        for(i = 0 ; i < oldlen ; i++){
	            if(data[i] === undefined){
	                data.splice(i,1);
	                break;
	            }
	        }
	        if(oldlen === data.length) {
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
	        if(!node.dept_id) { return; }
	        // 用户上级是没有 children 的
	        if(node.children) {
	            node.children = node.children.filter(noUserFilter);
	            node.children.forEach(walk);
	        }
	    }
	    function noUserFilter(node) {
	        if(node.dept_id && !node.children && node.users.length === 0) {
	            return false;
	        }
	        return true;
	    }
	}
	$scope.$on('selectCommonUser', function(e, user){
		$scope.datas._is_open = false;
		$scope.datas._user = user;
	})
	$q.all([admin.query().$promise,user.query_tree().$promise,domain.list().$promise]).then(function(arr){
		$scope.admin_users = arr[0].users;
		$scope.common_users = arr[1].result;
		$scope.common_users = formatData(removeNoChildrenDeparts($scope.common_users),"children");
		$scope.domain_users = arr[2].result;
		var commonUser = [];
		$scope.expandedNodes.forEach(function(node){
			node.children.forEach(function(user){
				if(user.user_id && !user.dept_id){
					user.id = user.user_id;
					commonUser.push(user);
				}
			})
		})
		var dus = $scope.domain_users.reduce(function(arr,b){
			b.groups.forEach(function(g){
				[].push.apply(arr,g.users);
			});
			return arr;
		},[]);
		var all_users = $scope.admin_users
			.concat(commonUser)
			.concat(dus)
		$scope.datas._user = all_users.filter(function(user){ return user.id == $scope.datas.user_id})[0];
	})
	$scope.name = function(net){
		var is_dhcp = net.enable_dhcp;
		if(is_dhcp){
			return net.name + " ( " + net.start_ip + " - " + net.end_ip + " ) ";
		}else{
			return net.name;
		}
	};
	$scope.user_name = function(user){
		return user.name + " ( " + user.real_name +" ) ";
	};
	$scope.ok = function(){
		$scope.loading = true;
		var volumes = $scope.disks.filter(function(d){ return d._selected});
		var _local_gb = $scope.btndisks.length ? $scope.btndisks[0].local_gb : undefined
		var is_data_disk = Boolean(_local_gb || $scope.datas.local_gb);
		var postData = {
			id:$scope.datas.id,
			display_name:$scope.datas.display_name,
			user_id:$scope.datas._user.id,
			vcpu:$scope.datas.vcpu,
			memory_mb:$scope.datas.memory_mb*1024,
			network_id:$scope.datas._network.id,
			subnet_id:$scope.datas._subnetwork?$scope.datas._subnetwork.id:'',
			local_gb:_local_gb,
			ip:$scope.datas.ips?$scope.datas.ips: undefined,
			gpu_auto_assignment: $scope.datas.enable_gpu,
			vm_hostname:$scope.datas.vm_hostname,
			rollback:$scope.detailData.rollback,
			rollback_weekday:$scope.detailData.rollback == 2 ? $scope.detailData.rollback_weekday : undefined,
			rollback_monthday:$scope.detailData.rollback == 3 ? $scope.detailData.rollback_monthday : undefined,
			attach_volumes:volumes,
			usb_redir:$scope.datas.usb_redir,
			usb_version:($scope.datas.usb_redir && $scope.datas.virtual_type == 'kvm') ? $scope.datas.usb_version : undefined,
			data_rollback:is_data_disk ? $scope.detailData.data_rollback : undefined,
			enable_share: $scope.detailData.enable_share,
			share_server_ip: $scope.detailData.enable_share?$scope.detailData.share_server.net.ip_address:undefined,
			share_server_id: $scope.detailData.enable_share?$scope.detailData.share_server.id:undefined,
			expand_enabled: $scope.datas.expand_enabled
		};
		if(postData.data_rollback == 2){
			postData.data_rollback_weekday = $scope.detailData.data_rollback_weekday;
		}
		if(postData.data_rollback == 3){
			postData.data_rollback_monthday = $scope.detailData.data_rollback_monthday;
		}
		personDesktop.update(postData,function(res){
			$modalInstance.close();
			$scope.refresh();
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("snapshotPersonalDialog", ["$scope", "$modalInstance", "PersonDesktop", "VMCommon","$$$I18N",function($scope, $modalInstance, personDesktop, vm, $$$I18N){
	$scope.rows = [];
	function get_list(){
		$scope.loading = true;
		vm.list_snapshot({ instance_id: $scope.currentItem.instance_id },function(res){
			$scope.rows = res.snapshots.map(function(item,index){
				item.snapshot_name = item.name;
				item.display_description = item.desc;
				item.editable = false;
				return item;
			}).sort(function(a,b){
				return (new Date(b.create_at)).getTime() - (new Date(a.create_at)).getTime() > 0 ? 1 : -1;
			});
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	}
	get_list();
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.hasSaveButton = function(){
		return $scope.rows.filter(function(item){ return item.editable }).length
	};
	$scope.hasSubmit = function(){
		return $scope.rows.filter(function(item){ return item._submitting }).length
	};
	$scope.save = function(cur){
		cur._submitting = true;
		vm.take_snapshot({
			method:"save",
			name:cur.snapshot_name,
			instance_id:$scope.currentItem.instance_id,
			desc:cur.display_description
		}).$promise.then(function(){
			$modalInstance.close();
			get_list();
		})
		.finally(function(){
			cur._submitting = false;
		});		
	}

	$scope.addNew = function(){
		var manuals = $scope.rows.filter(function(item){ return item.created_by == 'manual' }).length;
		if(manuals==2){
			$.bigBox({
			    title : $$$I18N.get("INFOR_TIP"),
			    content : $$$I18N.get("只能创建两个手动快照"),
			    icon : "fa fa-warning shake animated",
			    timeout : 6000
			});
		}else{
			$scope.rows.unshift({"editable":true});
		}
	};
	$scope.delete = function(cur){
		cur._submitting = true;
		if(cur.editable){
			var idx = $scope.rows.indexOf(cur);
			$scope.rows.splice(idx,1);
		}else{
			vm.delete_snapshot({
				snapshot_name:cur.snapshot_name,
				snapshot_volumes:cur.snapshot_volumes,
				instance_id:$scope.currentItem.instance_id
			},function(res){
				var idx = $scope.rows.indexOf(cur);
				$scope.rows.splice(idx,1); 
			}).$promise.finally(function(){
				cur._submitting = false;
			});
		}
	};
	$scope.restore = function(cur){
		cur._submitting = true;
		vm.restore_snapshot({
			method:"restore",
			snapshot_volumes:cur.snapshot_volumes,
			snapshot_name:cur.snapshot_name,
			instance_id:$scope.currentItem.instance_id
		}, function() {
			$modalInstance.close();
			get_list();
		}).$promise.finally(function(){
			cur._submitting = false;
			get_list();
		});
	}
}])
.controller('sceneAddServerDialog', ['$scope', 'Server','$modalInstance','param',function($scope,Server,$modalInstance,param){
	Server.query(function(res){
		$scope.servers = res.servers;
		$scope.server = $scope.servers[0];
	});
	$scope.post = function(){
		var _this = this;
		$scope.submiting = true;
		Server.domain_set_scene({
			id:param.id,
			has_domain:true,
			ad_server_id:_this.server.id,
			recreate_sid:_this.is_sid
		},function(res){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submiting = false;
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('personalAddServerDialog', ['$scope', 'Server','$modalInstance','param',function($scope,Server,$modalInstance,param){
	Server.query(function(res){
		$scope.servers = res.servers;
		$scope.server = $scope.servers[0];
	});
	$scope.post = function(){
		var _this = this;
		$scope.submiting = true;
		Server.domain_set_person({
			instance_ids:param.map(function(p){ return p.id }),
			has_domain:true,
			ad_server_id:_this.server.id,
			recreate_sid:_this.is_sid
		},function(res){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submiting = false;
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('hostConfigDialog', ['$scope','Storage','param','$modalInstance','Host', function($scope,Storage,param,$modalInstance,Host){
	var host_ids = param.phostids;
	var datas = {};
	$scope.datas = datas = param.pstore;
	Object.keys(datas).forEach(function(key){
		if(host_ids.indexOf(datas[key].storage_uuid) === -1){
			datas[key] = undefined;
			delete datas[key];
		}
	});
	$scope.loading = true;
	Storage.get_luns({
		storage_hosts:host_ids
	},function(res){
		res.result.forEach(function(host){
			if(!datas[host.storage_uuid]){
				host.storages.forEach(function(sto){
					try{
						sto._total_size = Number(sto.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
						sto._free_size = Number(sto.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
						sto._used_size = Number(sto._total_size - sto._free_size).toFixed(0);
					}catch(err){}
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
	$scope.filterStorage = function(_s,type,_scope){
		$scope.loading_lun = true;
		Host.filter_storage({
			storage_id:_s.uuid,
			device_type:_s.device_type,
			node_uuid:_s.node_uuid
		}).$promise.then(function(res){
			$scope.loading_lun = false;
			res.result.forEach(function(s){
				try{
					s._total_size = Number(s.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
					s._free_size =  Number(s.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
					s._used_size =  Number(s._total_size - s._free_size).toFixed(0);
				}catch(err){}
			});
			switch(type){
				case 1:
					$scope.sys_luns = res.result;
					break;
				case 2:
					$scope.data_luns = res.result;
					break;
				default:
					break;
			}
			_scope.storage_performance = ($scope.sys_luns.filter(function(item){ return item.uuid ===_scope.host.storage_performance })[0]) || $scope.sys_luns[0];
			_scope.storage_capacity = ($scope.data_luns.filter(function(item){ return item.uuid === _scope.host.storage_capacity})[0]) || $scope.data_luns[0];
		});
	};
	$scope.change_host = function(_scope){
		_scope.image_storage_performance = _scope.host.storages.filter(function(sto){ return sto.uuid === _scope.host.image_storage_performance})[0];
		_scope.image_storage_capacity = _scope.host.storages.filter(function(sto){ return sto.uuid === _scope.host.image_storage_capacity})[0];
		$scope.filterStorage(_scope.image_storage_performance,1,_scope);
		$scope.filterStorage(_scope.image_storage_capacity,2,_scope);
	};
	$scope.ok = function(_scope){
		var d = _scope.host;
		d._changed = true;
		d.storage_performance = _scope.storage_performance.uuid;
		d.storage_capacity = _scope.storage_capacity.uuid;
		d.image_storage_performance = _scope.image_storage_performance.uuid;
		d.image_storage_capacity = _scope.image_storage_capacity.uuid;
	}
	$scope.okAll = function(){
		$scope.ok(this);
		$scope.close();
	}
	$scope.close = function(){
		$modalInstance.close();
	}
	$scope.dismiss = function(){
		$modalInstance.dismiss();
	}
}])
.controller("saveTemplatePersonalDialog", [
	"$scope", "$modalInstance", "Admin", "PersonDesktop","HardwareTemplate", "$$$os_types","virtualHost","networkWithHost","Network","$$$I18N",
	function($scope, $modalInstance, admin, personDesktop,hardwares,$$$os_types,virtualHost,networkWithHost,network,$$$I18N){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	var currentItem = $scope.currentItem = angular.copy($scope.currentItem);
	$scope.type = 2;
	$scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
	$scope.types2 = [{name: $$$I18N.get('固定IP'), value: 'static'},{name: $$$I18N.get('系统分配'), value: 'auto'}];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[1];
	admin.query(function(res){
		$scope.owners = res.users;
		$scope.owner = $scope.owners.filter((o) => o.id === currentItem.user_id)[0] || $scope.owners[0];
	});
	personDesktop.list_detail({id:currentItem.instance_id}, function(res){
		$scope.currentItemDetail = res.result;
	}).$promise.then(function(){
		$scope.getVirtualHost($scope.type, currentItem.rbd_enabled);
	})
	$scope.getVirtualHost = function (type,rbd_enabled){
		$scope.host_loading = true;
		virtualHost.query({
			virtual_type: currentItem.virtual_type,
			rbd_enabled: rbd_enabled
			// enable_gpu: currentItem.enable_gpu
		},function(res){
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts.filter((h) => h.host_name === currentItem.hostname)[0] || $scope.hosts[0];
			$scope.host && $scope.getNetwork($scope.host, true);
		});
	}
	

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
	$scope.switchIps = function(subnet,_scope){
		// _scope.bind_ip_loading = true;
		if(subnet){
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[1];
		}
			
		else{
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network,_scope, isFirst){
		if(Network.subnets.length){
			$scope.network_loading = true;
			// $scope.bind_ip_loading = true;
			network.query_sub({id: Network.id }, function(res){
				_scope.subnets = res.result;
				if(isFirst){
					_scope.subnet = _scope.subnets.filter((s) => s.id === $scope.currentItemDetail.subnet_id)[0]
				}else{
					_scope.subnet = _scope.subnets[0];
				}
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			})
		}else{
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}
		
	};
	$scope.getNetwork = function(host, isFirst){
		if(host){
			$scope.net_loading = true;
			networkWithHost.query({host: host.host_uuid}, function(res){
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks.filter((n) => n.id === $scope.currentItemDetail.network.id)[0];
				getSubnets($scope.network, $scope, isFirst);
			}).$promise.finally(function(){
				$scope.net_loading = false;
			});
		}
	}
	$scope.switchSubnet = function(val, _scope){
		getSubnets(val,_scope);
	}

	$scope.ok = function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
		var _this = this;
		if(this.saveTemplate.$valid){
			var postData = {
				instance_id:currentItem.instance_id,
				owner:_this.owner.id,
				type_code:_this.type,
				name:_this.name,
				description:_this.description,
				network:_this.network.id,
				subnet:_this.subnet ? _this.subnet.id : "",
				band_type:_this.bind_ip_type.value,
				band_ip:_this.bind_ip_type.value === 'static'? _this.bind_ip.value : undefined,
				host_uuid:_this.host.host_uuid,
				username: currentItem.virtual_type=='hyper-v'?_this.username:undefined,
				userPassword: currentItem.virtual_type=='hyper-v'?_this.userPassword:undefined,
				userPasswordConfirm: currentItem.virtual_type=='hyper-v'?_this.userPasswordConfirm:undefined
				// enable_gpu:currentItem.enable_gpu
			};
			personDesktop.saveAsTemplate(postData, function(res){
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				$modalInstance.close();
			},function(){
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
		}
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
/* 个人桌面池 */
.controller("vdiDesktopPoolController", ["$scope","DeskPool","$modal","$timeout","$interval","$filter","$$$I18N", function($scope,DeskPool,$modal,$timeout,$interval,$filter,$$$I18N){
	var _scope=$scope;
	$scope.rows=[],$scope.loading=true;

	//刷新机器执行后的状态
	$interval(function(){
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("personpools", filterSearchPage.map(item => item.id));
	}, 1000);
	$scope.$on("personpoolsRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(item.status == 'updating'){
				item._ignore = true;
			}else{
				item._ignore = false;
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	/*获取桌面池列表*/
	$scope.refresh=function(_s = $scope){
		DeskPool.query(function(res){
			$scope.loading=false;
			$scope.rows=res.result;
		});
	}
	$scope.refresh();
	$scope.pagesize = Number($$$storage.getSessionStorage('pool_pagesize')) || 30;
	$scope.currentPage = 1;
 	$scope.$watch("pagesize",function(newvalue){
 		$$$storage.setSessionStorage('pool_pagesize', newvalue);
	});


	//删除个人桌面池
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>"+
					"个人桌面池删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='确定删除此个人桌面池吗？'>确定删除此个人桌面池吗？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					DeskPool.delete({
						ids: rows.map(function(row){ return row.id; }),
					}, function(data){
						rows.forEach(function(r){
							_scope.refresh();
						});
					}, function(error){
						rows.forEach(function(r){
							_scope.refresh();
						});
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});			
	};

	//获取选中item的id
	function getIds(){
		var params={};
		var rows = $scope.rows.filter(function(row){ return row._selected && row.online_count<row.total_count ;});
		params={
			ids:rows.map(it => it.id)
		}
		return params;
	}

	//桌面池开机
	$scope.start=function(item){
		var params=getIds();
		params.action='power-on';
		DeskPool.start(params,function(res){
			if(res.result){
				_scope.refresh();
			}
		})
	}

	//桌面池强制关机
	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.online_count > 0;});
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						var params={
							ids:rows.map(it => {return it.id}),
							action:"force-power-off"
						}
						$scope.ok = function(){
							$modalInstance.close();
							DeskPool.shutdown(params,() => { _scope.refresh(); });
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
			});
		}
	};

	//桌面池自然关机
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.online_count>0; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						var params={
							ids:rows.map(it => {return it.id}),
							action:"power-off"
						}
						$modalInstance.close();
						DeskPool.shutdown(params,function(){
							_scope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
}])
/* 个人桌面池二级列表*/
.controller("vdiDesktopPoolListController", ["$scope","$modal","$interval","$filter","DeskPool","DeskPoolSecond","$$$I18N","UserRole", function($scope,$modal,$interval,$filter,DeskPool,DeskPoolSecond,$$$I18N,UserRole){
	var model_name,url,_scope=$scope,cid,carr,searchName,breadPoolName;
	let hasTerminalpermission = UserRole.currentUserRoles.filter(function(role){ return role=='Terminal' }).length;
	let hasTerminalManagepermission = UserRole.currentUserRoles.filter(function(role){ return role=='Terminal_Manage' }).length;
	let hasClassroompermission = UserRole.currentUserRoles.filter(function(role){ return role=='Classroom' }).length;
	$scope.linkTerminal = hasTerminalpermission && hasTerminalManagepermission && hasClassroompermission ? true:false;
	$scope.inCurrentUserPool = function(pool){
		if($$$storage.getSessionStorage("loginInfo"))
			return JSON.parse($$$storage.getSessionStorage("loginInfo")).pool.indexOf(pool)>-1
	};
	url=decodeURIComponent(location.href);
	if(url.indexOf('client')>=0){
		searchName=model_name=url.split('?')[1].split('&')[0];
		// breadPoolName=url.split('=')[1];
		// $scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", breadPoolName]);
	} else {
		// model_name=url.split('?')[1];
		// $scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", model_name]);
	}
	carr=url.split('?')[0].split('/');
	cid=carr[carr.length-1];
	$scope.rows=[],$scope.loading=true;

	//tasklog刷新机器执行后的状态
	$interval(function(){
		var filterSearch = $filter("filter")($scope.rows || [], $scope.searchText);
		var filterSearchPage = $filter("paging")(filterSearch, $scope.currentPage, $scope.pagesize);
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", filterSearchPage.map(item => item.id));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(item.status == 'updating'){
				item._ignore = true;
			}else{
				item._ignore = false;
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});

	//桌面名排序
	$scope.sortDesktopName = function(name,bool){
		$scope.rows.sort(function(a,b){
			var _numa,_numb;
			var get_num = function(tar){
				for(var i = tar.length - 1 ; i-- ; i >= 0 ){
					if(!Number(tar[i])){
						return Number(tar.substring(i + 1,tar.length));
					}
				}
			};
			_numa = get_num( a[name] );
			_numb = get_num( b[name] );
			return (_numa - _numb) * (bool ? -1 : 1);
		});
	};

	$scope.getObjLength = function(obj){
		try{
			return Object.keys(obj).length;
		}catch(err){
			return 0;
		}
	};

	//获取桌面列表|更新桌面列表
	_scope.refresh=function(){
		DeskPoolSecond.get({id:cid},function(res){
			_scope.loading=false;
			_scope.rows=res.result;
			$scope.$root.$broadcast("navItemSelected", ["桌面", "个人桌面池", res.person_pool_name]);
			_scope.sortDesktopName('display_name');
			_scope.searchText=searchName;
			_scope.loading=false;	
		})
	}

	_scope.refresh();

	$scope.pagesize    = Number($$$storage.getSessionStorage('pool_details_pagesize')) || 30;
	$scope.currentPage = 1;
 	$scope.$watch("pagesize",function(newvalue){
 		$$$storage.setSessionStorage('pool_details_pagesize', newvalue);
	});
	// $scope.rows=mockData.result;

	//获取桌面池详情信息
	$scope.getDetail = function(it){
		$scope.loading_detail = true;
		DeskPool.list_detail({id:it.id},function(res){
			it.detailData = res.result;
		}).$promise.finally(function(){
			$scope.loading_detail = false;
		});
	};

	//桌面池详情展开收起
	$scope.expand = function(row){
		$scope.rows.forEach(r => {
			if(row.id === r.id){
				r._expand = !row._expand;
				if(r._expand){
					$scope.getDetail(row);
				}
			}else{
				r._expand = false;
			}
		})
	};

	//searchText输入搜索
	$scope.updateData = function(text,select){
		$scope.rows = $scope.rows.filter(function(row){
			row._selected = false;
			if(select){
				if(text && text.trim()){
					return row.status === select;
				}
				return row.status === select;
			}
			return true;
		});
	};

	//操作--查看桌面
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};

	//获取选中item的id
	function getIds(item){
		var params={};
		var rows = item ? [item] :$scope.rows.filter(function(row){ return row._selected  });
		params={
			ids:rows.map(it => it.id)
		}
		return params;
	}

	//个人桌面池开机
	$scope.start = function(item) {
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended') && !row.task_state; });
		var params={
			instance_ids:rows.map(it => {it._selected=false; return it.id})
		}
		if(rows.length==0){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout:6000
			});
		}else{
			DeskPoolSecond.start(params,function(res){
				// _scope.refresh();//tasklog刷新，这里不需要再拉取列表
			});
		}
	};

	//桌面池强制关机
	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
						var params={
							instance_ids:rows.map(it => {it._selected=false; return it.id})
						}
							$modalInstance.close();
							DeskPoolSecond.shutdown(params,() => {});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
					},
					size : "sm"
			});
		}
	};
	//桌面池自然关机
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						var params={
							instance_ids:rows.map(it => {it._selected=false; return it.id})
						}
						$modalInstance.close();
						DeskPoolSecond.shutdown(params,function(){
							// _scope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	//桌面池重启
	$scope.restart = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended') && !row.task_state; })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout:6000
			});
		}else{
		
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
							"桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						var params={
							instance_ids:rows.map(it=> {it._selected=false; return it.id})
						}
						$modalInstance.close();
						DeskPoolSecond.reboots(params,function(){
							// _scope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	//挂起状态
	$scope.pause = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout:6000
			});
		}else{

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>"+ 
						"桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						var params={
							instance_ids:rows.map(it=> {it._selected=false; return it.id})
						}
						$modalInstance.close();
						DeskPoolSecond.pause(params,function(){
							// _scope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	}
	//唤醒
	$scope.resume = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused' && !row.task_state; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>"+
						"桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						var params={
							instance_ids:rows.map(it=> {it._selected=false; return it.id})
						}
						DeskPoolSecond.resume(params,function(){
							// _scope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
}])
/*新增个人桌面池dialog控制器*/
.controller("newDeskPoolDialog", ["$scope", "$modalInstance","$q","DeskPool", "Host","Network", "HardwareTemplate","PersonTemplate","User","Admin","Depart","PersonDesktop","Server","$$$I18N","$$$MSG","ResourcePool","$filter","$modal","VMCommon",
	function($scope, $modalInstance,$q,DeskPool, host, networks, hardwares, images,user,Admin, Depart,Person,server, $$$I18N, $$$MSG,ResourcePool,$filter, $modal, vm){
		var _scope=$scope;
		$scope.desktopNum = 1;
		$scope.max_instance = 0;
		$scope.host_loading = true;
		$scope.regXP = /WindowsXP|WindowsXP_64/;
		$scope.reg = /(windows\s*7|8|10)/i;
		$scope.depart = {name: '全部', id: -1, full_path: 'root'};
		/**
		* [selectMode 部门域选择]
		*/
		function traverse(ids, obj){
		 	if(obj.children && obj.children.length>0){
		 		obj.children.forEach(function(item){
		 			ids.push(item.id);
		 			traverse(ids, item)
		 		})
		 	}
		}
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

	    //初始化树状图
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

	    $scope.getUserGroup = function(){
	    	Depart.query(function(res){
	    		DATA = res.result;
	    		$scope.treedata = newData = DATA.length?setTreeData(DATA):[];
	    		$scope.treedata.sort(function(a,b){ return a.full_path>b.full_path?-1:1 });
	    		$scope.expandnodes = DATA;
	    		var selected = {};
	    		if($scope.selected){
	    			var _selected = DATA.filter(function(item){ return item.id==$scope.selected.id })[0];
	    			selected = _selected?_selected:newData[0];
	    		}else{
	    			selected = DATA.filter(function(item){ return item.name=='default' })[0];
	    		}
	    		$scope.selected = selected;
	    		if($scope.selected){
	    			$scope.selected._selected = true;
	    		}
	    	},function(err){

	    	});
	    }


		// 第一步
		$scope.step1 = {};
		$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
		$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
		$scope.get_subnet = function(network){
			if(network.subnets.length){
				networks.query_sub({
					id:network.id
				},function(res){
					$scope.subnetworks = res.result.map(function(n){
						n._desc = n.start_ip ?(n.name + " (" + n.start_ip +" - "+ n.end_ip + ") ") :  n.name;
						return n;
					});
					$scope.step1.subnetwork = $scope.subnetworks[0];
					$scope.clearBindIp();
				});
			}else{
				$scope.subnetworks = [];
				$scope.step1.subnetwork = null;
				$scope.clearBindIp();
			}
		};
		networks.query(function(data){
			// $scope.networks = data.networks.filter(function(n){ return n.subnets.length > 0});
			$scope.networks = data.networks;
			if($scope.networks.length){
				$scope.step1.network = $scope.networks[0];
				$scope.get_subnet($scope.step1.network);
			}
		});
		ResourcePool.query(function(res){
			$scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
			$scope.step1.resource = $scope.resources[0];
			$scope.resource_update();
		});
		$scope.resource_update = function(){
			$scope.get_personal_template();
		};
		$scope.get_personal_template = function(){
			$scope.templates = [];
			$scope.templateNum = undefined;
			$scope.step1.image = undefined;
			$scope.loading_template = true;
			vm.list_template({type:2,virtual_type:$scope.step1.resource.type,rbd_enabled:$scope.step1.resource.rbd_enabled}, function(data){
				$scope.loading_template = false;
				$scope.winTable = data.win_images
					.filter(function(item){ return item.status === "alive" })

				$scope.linTable = data.linux_images
					.filter(function(item){ return item.status === "alive" })
				$scope.otherTable = data.other_images
					.filter(function(item){ return item.status === "alive" })
				$scope.templates = $scope.winTable.concat($scope.linTable).concat($scope.otherTable);
				$scope.templateNum = $scope.templates.length;
				$scope.step1.image = $scope.templates[0];
			});
		};
		$scope.clearBindIp = function(){
			if($scope.step1.subnetwork){
				$scope.IPmodes = $scope.IPmodes2;
			}else{
				$scope.IPmodes = $scope.IPmodes1;
			}
			$scope.step1.IPmode= $scope.IPmodes[0];
			$scope.step1.ip = null;
		};
		// 第二步
		$scope.step2 = {};
		$scope.updateHardware = function(){
			var is_win7UP = $scope.reg.test($scope.step1.image.os_type);
			var is_winXP = $scope.regXP.test($scope.step1.image.os_type);
			$scope.step2.usb_version = "2.0";
			if(is_win7UP){
				$scope.step2.usb_redir = true;
				$scope.step2.usb_version = "3.0";
			}else if(is_winXP){
				$scope.step2.usb_redir = true;
			}else{
				// $scope.step2.usb_redir = false;
			}
			$scope.step2.usb3_disabled = !is_win7UP ? true : false;
		}
		// 第三步
		$scope.step3 = {};
		$scope.step3.desktopNum2 = 0;
		$scope.get_host = function(){
			$scope.getUserGroup();
			var uuid = $scope.step1.resource.uuid;
			var netid = $scope.step1.network.id;
			var is_gpu = $scope.step2.has_gpu;
			$scope.host_loadding = true;
			$scope.step3.is_all = undefined;
			$scope.hosts = undefined;
			if($scope.step1.resource.type=='hyper-v'){
				host.query_gpu_agent({
					id: uuid,
					network_id: netid,
					enable_gpu: is_gpu
				},function(data){
					$scope.host_loadding = false;
					$scope.hosts = data.hosts_list.map(function(item){
						if(item.disabled_tips !== ''){
							item.disabled_desc = $$$I18N.get(item.disabled_tips);
						}
						return item;
					});
				});
			}else{
				host.query_agent({
					id: uuid,
					network_id: netid,
					enable_gpu: false
				},function(res){
					$scope.host_loadding = false;
					$scope.hosts = res.hosts_list.filter(function(h){ return h.status === 'active'});
				});
			}
		};

		var host_storages = {};
		$scope.openMoreDialog = function(){
			var _hostids;
			if($scope.step3.hostType=='0'){
				_hostids = $scope.hosts.filter(function(h){ return h._selected}).map(function(h){ return h.storage_uuid });
			}else{
				_hostids = $scope.hosts.filter(function(h){ return h.instance_num}).map(function(h){ return h.storage_uuid });
			}
			var moreDialog = $modal.open({
				templateUrl:"views/vdi/dialog/desktop/host_config.html",
				controller:"hostConfigDialog",
				resolve:{param:function(){return {
					"phostids":angular.copy(_hostids),
					"pstore":host_storages
				}}}
			});
			moreDialog.result.then(function(){
			});
		};
		
		$scope.selectAllHost = function(bool){
			var _hosts = $scope.hosts.filter(function(h){
				if($scope.step1.resource.type=='hyper-v'){
					return h.disabled_tips=='';
				}else{
					return true;
				}
			});
			_hosts.map(function(item){
				item._selected = bool;
				return item;
			});
			var num = $filter("selectedFilter")(_hosts,'max_instance');
			$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
		};
		$scope.selectOneHost = function(){
			var _hosts = $scope.hosts.filter(function(h){
				if($scope.step1.resource.type=='hyper-v'){
					return h.disabled_tips=='';
				}else{
					return true;
				}
			});
			$scope.step3.is_all = _hosts.every(function(item){
				return item._selected === true;
			});
			var num = $filter("selectedFilter")(_hosts,'max_instance');
			$scope.step3.desktopNum = $scope.step2.has_gpu=="through"?num:0;
		};
		$scope.getDesktopNumber2 = function(){
			var _lis = angular.copy($scope.hosts.filter(function(item){ return item.instance_num > 0 }));
			if(_lis.length > 0){
				$scope.step3.desktopNum2 = _lis.reduce(function(a,b){
					a.instance_num += b.instance_num;
					return a;
				}).instance_num;
			}else{
				$scope.step3.desktopNum2 = 0;
			}
		};

		$scope.step4 = {};
		$scope.$on("selectStepChange", function(e, arg){
			if(arg.index==0){
				arg.stepScope.$$nextSibling.error = false;
			}
		})
		$scope.$on("WizardStep_0", function(e, step, scope){
			setTimeout(function(){
				$("[rel=popover-hover]").popover({
					trigger : "hover"
				});
			})
			scope.error = step.is_dirty;
			function toStrLong(ip){
				var ips;
				ips = ip.split(".").map(function(item,idx){
					var _prefix = '';
					for(var i = 0;i < 8 - Number(item).toString(2).length;i++){
						_prefix += "0";
					}
					return _prefix + Number(item).toString(2);
				});
				return ips.join("");
			}
			function check_net(){
				// 返回值为true时，invalid
				if($scope.step1.subnetwork && $scope.step1.subnetwork.netmask && $scope.step1.subnetwork.enable_dhcp && $scope.step1.ip){
					var _startIP = toStrLong($scope.step1.subnetwork.start_ip);
					var _endIP = toStrLong($scope.step1.subnetwork.end_ip);
					var _bindStartIP = toStrLong($scope.step1.ip);
					return (_bindStartIP < _startIP || _bindStartIP > _endIP);
				}
				return false;
			}

			if(check_net()){
				$.bigBox({
					title	:$$$I18N.get("INFOR_TIP"),
					content	:$$$MSG.get(12061),
					timeout	:5000
				});
			}
			var sameDesktopName = $scope.rows.filter(function(item){return item.pool_name == $scope.step1.desktopName}).length;
			var is_valid = scope.bodyForm1.$valid && !check_net();
			step.done = is_valid  && !sameDesktopName;
			if(sameDesktopName){
				$.bigBox({
					title	: $$$I18N.get("INFOR_TIP"),
					content	: $$$I18N.get("SAME_POOL_NAME"),
					timeout	: 6000
				});
			}
			if(step.done && !sameDesktopName){
				hardwares.filter({
					"system_gb": $scope.step1.image.system_alloc_disk,
					"local_gb": $scope.step1.image.data_alloc_disk,
					"local_gb1": $scope.step1.image.data_alloc_disk_2,
				},function(data){
					$scope.hardwareList = data.result.map(function(data){
						data.memory_mb = data.memory_mb/1024;
						return data;
					});
					$scope.step2.hardware = $scope.hardwareList[0];
					$scope.step2.hardware && $scope.updateHardware();
				});
			}	
		});
		$scope.$on("WizardStep_1", function(e, step, scope){
			scope.error = step.is_dirty;
			var is_valid = scope.bodyForm2.$valid;
			if(is_valid){
				$scope.step3.desktopNum = undefined;
				$scope.step3.desktopNum2 = 0;
				$scope.get_host();
			}
			step.done = is_valid;
		});
		$scope.$on("WizardStep_2", function(e, step, scope){
			scope.error = step.is_dirty;
			// number类型的input ，max属性是变量，不生效，手动判断
			if($scope.step3.hostType == 0){
				step.done = scope.bodyForm3.$valid && $scope.step3.desktopNum <= $filter("selectedFilter")($scope.hosts,'max_instance');
			}
			if($scope.step3.hostType==1){
				step.done = scope.bodyForm3.$valid && Boolean($scope.step3.desktopNum2);
			}
		});
		$scope.$on("WizardStep_3", function(e, step, scope){
			scope.error = step.is_dirty;
			// step.done = $scope.step4.select_users.length?true:false;
			step.done=$scope.selected?true:false;
		});
		$scope.$on("WizardDone", function(e, steps, scopes){
			 var postData = {};
			 	postData.display_name = $scope.step1.desktopName;
			 	postData.pool_name=$scope.step1.desktopName;
				postData.network_id = $scope.step1.network.id;
				postData.resource_pool	  = $scope.step1.resource.uuid;

			 if($scope.step1.subnetwork){
			 	postData.subnet_id = $scope.step1.subnetwork.id;
			 }else{ postData.subnet_id = ''; }
			 	postData.ip_choose = Number($scope.step1.IPmode.value) ? true : false;
			 if(postData.ip_choose && Number($scope.step1.IPmode.value) === 2){
			 	postData.start_ip = $scope.step1.ip;}
			 // if($scope.step1.domain){
				// postData.ad_server_id = $scope.step1.domain.id;}
				postData.image_id     = $scope.step1.image.id;
				
				postData.rollback      = Number($scope.step2.rollback);
				postData.data_rollback = $scope.step2.hardware.local_gb>1 ? Number($scope.step2.data_rollback) : undefined;
				if(postData.rollback === 2){
					postData.rollback_weekday = $scope.step2.rollback_weekday;}
				if(postData.rollback === 3){
					postData.rollback_monthday = $scope.step2.rollback_monthday;}
				if(postData.data_rollback === 2){
					postData.data_rollback_weekday = $scope.step2.data_rollback_weekday;}
				if(postData.data_rollback === 3){
					postData.data_rollback_monthday = $scope.step2.data_rollback_monthday;}

				postData.instance_type_id = $scope.step2.hardware.id;
				postData.usb_redir 		  = $scope.step2.usb_redir;
				postData.usb_version      = ($scope.step2.usb_redir && $scope.step1.resource.type=='kvm') ? $scope.step2.usb_version : null;
				if($scope.step1.resource.type === "hyper-v")
					postData.enable_gpu       = $scope.step2.has_gpu;
				
			if($scope.step3.hostType == 0){
				postData.servers = $scope.hosts.filter(function(item){ return item._selected }).map(function(item){
					return {"uuid": item.id}
				});
				postData.count = $scope.step3.desktopNum;
			}
			if($scope.step3.hostType == 1){
				postData.servers = $scope.hosts.filter(function(item){ return item.instance_num > 0 }).map(function(item){
					return { "uuid":item.id,"vm_count":item.instance_num }
				});
				postData.count = $scope.step3.desktopNum2;
			}
			postData.servers_storage = Object.keys(host_storages).map(function(key){
				var host = host_storages[key];
				return {
					uuid:host.id,
					image_storage_capacity: host.image_storage_capacity,
					image_storage_performance: host.image_storage_performance,
					storage_capacity: host.storage_capacity,
					storage_performance: host.storage_performance
				}
			});
			// postData.user_id = $scope.step4.select_users.map(function(item){ return item.id?item.id:item.user_id });
			postData.user_group_id = $scope.selected.id;
			//相比个人桌面的新增 多了个人桌面池name，分组id参数
			$scope.submitting = true;
			if(!postData.user_group_id){
				console.log('用户分组ID"user_group_id"不能为空');
				return ;
			}
			DeskPool.save(postData, function(res){
				$modalInstance.close();
				$scope.refresh();
			}).$promise.finally(function(){
				$scope.submitting = false;
			});
		});
		$scope.close = function(){
			$modalInstance.close();
		};
}])
/*修改桌面池*/
.controller('editPoolDialog', ["$scope","$modal","$modalInstance","DeskPool" ,function($scope,$modal,$modalInstance,DeskPool){
	$scope.need_ha = false;
	var selectedServer,raw_need_ha;
	$scope.rollbackChange = function(value){
		if(value != "1"){
			$scope.need_ha = false;
		}else{
			if(selectedServer&&selectedServer.length>0){
				$scope.need_ha = angular.copy(raw_need_ha);
				$scope.servers = selectedServer;
			}
		}
	};
	$scope.name = $scope.currentItem.name;
	$scope.desktopNum = $scope.currentItem.instance_max ;
	$scope.min_instances = $scope.currentItem.instance_max;
	$scope.rollback = $scope.currentItem.rollback;
	$scope.rollback_monthday = $scope.currentItem.rollback_monthday ? $scope.currentItem.rollback_monthday : "1";
	$scope.rollback_weekday = $scope.currentItem.rollback_weekday ? $scope.currentItem.rollback_weekday :"1";

	$scope.disk_type = $scope.currentItem.disk_type;
	$scope.local_gb = $scope.currentItem.local_gb;
	$scope.data_rollback = $scope.currentItem.data_rollback;
	$scope.data_rollback_monthday = $scope.currentItem.data_rollback_monthday || "1";
	$scope.data_rollback_weekday = $scope.currentItem.data_rollback_weekday || "1";

	$scope.usb_redir = $scope.currentItem.usb_redir;
	// $scope.usb3_disabled = !$scope.currentItem.usb3_editable;
	$scope.usb_version = $scope.currentItem.usb_version || "2.0";

	$scope.running_count = $scope.currentItem.running_count;
	$scope.has_domain=$scope.currentItem.has_domain||false;
	$scope.domain = $scope.currentItem.domain;
	$scope.need_ha = false;
	// $scope.enable_gpu = $scope.currentItem.enable_gpu;

	$scope.ok = function(){
		var _rollback = parseInt(this.rollback);
		var _data_rollback = parseInt(this.data_rollback) >= 0 ? Number(this.data_rollback) : undefined;
		var item = {};
		item.id = $scope.currentItem.id;
		item.pool = $scope.currentItem.pool;
		item.name = this.name;
		item.instance_max          = $scope.currentItem.instance_max;
		item.rollback              = _rollback;
		item.rollback_monthday 	   = _rollback == 3 ? this.rollback_monthday : undefined;
		item.rollback_weekday      = _rollback == 2 ? this.rollback_weekday : undefined;
		item.data_rollback         = _data_rollback;
		item.data_rollback_monthday= _data_rollback === 3 ? this.data_rollback_monthday : undefined;
		item.data_rollback_weekday = _data_rollback === 2 ? this.data_rollback_weekday : undefined;
		item.usb_redir 			   = this.usb_redir;
		item.usb_version  		   = (item.usb_redir && $scope.currentItem.virtual_type=='kvm') ? this.usb_version : null;
		item.has_domain            = this.has_domain;
		// if($scope.currentItem.virtual_type === 'hyper-v')
		// 	item.enable_gpu			   = this.enable_gpu;
		item.domain                = this.domain;
		item.need_ha               = item.rollback==1 &&  this.need_ha;
		if(item.rollback ==1 && item.need_ha){
			item.server_ids = $scope.servers.filter(function(value){
				return value._selected;
			}).map(function(value){
				return value.id;
			});
			if(item.server_ids<1){
				return false;
			}
			item.server_ids = item.server_ids.join(',');
		}
		$scope.loading = true;
		DeskPool.update(item, function(){
			$modalInstance.close();
			$scope.refresh();
		},function(){
			$scope.refresh();
		}).$promise.finally(res => {
			$scope.loading = false;
		});	
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])