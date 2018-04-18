/**
*  Module
*
* Description
*/
angular.module('vdi.HA', [])
.factory('HA', ['$resource','$Domain', function($resource,$Domain){
	return $resource($Domain + "/thor/controller/ha", null, {
		get_console_ha:
			{ method: "GET", url:$Domain + "/thor/controller/ha"},
		set_console_ha:
			{ method: "PUT",url: $Domain + "/thor/controller/ha"},
		query:
			{ method: "GET", url: $Domain + "/thor/ha/instances"},
		delete:
			{ method: "DELETE", url: $Domain + "/thor/ha/instances",params:{ id:"@id" }},
		add:
			{ method: "POST", url: $Domain + "/thor/ha/instances"},
		get:
			{ method: "GET", url: $Domain + "/thor/ha/instance/:id",params:{ id:"@id"}},
		edit:
			{ method: "PUT", url: $Domain + "/thor/ha/instance/:id",params:{ id:"@id"}},
		console_ha_ping:
			{ method: "GET", url: $Domain + "/ping"},
		get_hosts:
			{ method: "GET", url: $Domain + "/thor/ha/instance/get_vm_hosts"}
	})
}])
.filter('filterChecked',function(){
	return function(rows){
		return rows.filter(function(item){
			return item._checked;
		});
	}
})
.controller('vdiDesktopHAViewController', ['$scope','$modal','HA', function($scope,$modal,HA){
	var haScope = $scope;
	$scope.currentPage = 1;
	$scope.pagesize = 30;

	
	$scope.get_list = function(){
		HA.query(function(res){
			$scope.rows = res.result;
		});
	};
	$scope.get_list();
	$scope.add = function(){
		var dialog = $modal.open({
			templateUrl:'views/vdi/dialog/HA/new_ha.html',
			controller:'newDesktopHADialog',
			resolve:{
				param:function(){
					return haScope.rows
				}
			}
		});
		dialog.result.then(function(){
			HA.query(function(res){
				$scope.rows = res.result;
			});
		});
	};
	$scope.edit = function(item){
		var modal = $modal.open({
			templateUrl:'views/vdi/dialog/HA/new_ha.html',
			controller:'editDesktopHADialog',
			resolve:{param:function(){
				return {item:item,HaList:haScope.rows}
			}}
		});
		modal.result.then(function(res){
			if(res){
				HA.query(function(res){
					$scope.rows = res.result;
				});
			}
		})
	};
	$scope.view = function(item){
		$modal.open({
			templateUrl:'views/vdi/dialog/HA/view_ha.html',
			controller:"viewDesktopHADialog",
			resolve:{
				param:function(){ return item }
			}
		});
	};
	$scope.active = function(item){
		item.active_loadding = true;
		HA.edit({
			"id":item.id,
			"enable_ha":!item.enable_ha, 
			"action":"simple_update"
		},function(res){
			item.enable_ha = !item.enable_ha;
		}).$promise.finally(function(){
			item.active_loadding = false;
		});
	};
	var parentScope = $scope;
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除HA策略'>"+
					"删除HA策略</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定删除HA策略吗'>确定删除HA策略吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					HA.delete({
						ids:rows.map(function(item){ return item.id })
					},function(res){
						parentScope.get_list();
					});
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			},
			size : "sm"
		});
		
	};
}])
.controller('newDesktopHADialog', ['$scope','$modalInstance','HA','ResourcePool','UserRole', 'Scene','PersonDesktop', "param", "$$$I18N",
	function($scope,$modalInstance,HA,ResourcePool,UserRole,Scene,PersonDesktop, param, $$$I18N){
	$scope.min_namelength=2;
	$scope.max_namelength=20;
	var HaList = param;
	$scope.data = {
		type_code:1,
		priority:2,
		ha_response_time: 60
	};
	var _scope = $scope;
	var allScenes = [];
	var allInstances = [];
	ResourcePool.query(function(res){
		$scope.resources = res.result.filter(function(r){ return r.type === 'kvm'});
		$scope.data.resource_pool_id = $scope.resources[0] ? $scope.resources[0].id : undefined;
		HA.get({id:-1},function(res){
			$scope.ready = true;
			allScenes = res.unused_modes;
			allInstances = res.unused_vms;
			$scope.scenes = allScenes.filter(function(mode){ return mode.mode_resource_pool_id === $scope.data.resource_pool_id});
			$scope.instances = allInstances.filter(function(ins){ return ins.vm_resource_pool_id === $scope.data.resource_pool_id});
			$scope.data.scene = $scope.scenes[0];
		});
	});

	$scope.updateHaList = function(){
		$scope.scenes = allScenes.filter(function(mode){ return mode.mode_resource_pool_id === $scope.data.resource_pool_id});
		$scope.instances = allInstances.filter(function(ins){ return ins.vm_resource_pool_id === $scope.data.resource_pool_id});
		$scope.data.scene = $scope.scenes[0];
	};

	var get_ins_ids = function(){
		return $scope.instances.filter(function(ins){ return ins._used }).map(function(ins){ return ins.vm_id});
	};
	// var get_mode_ids = function(){
	// 	return $scope.scenes.filter(function(scene){ return scene._used }).map(function(scene){ return scene.mode_id});
	// };
	var get_host_names = function(){
		return $scope.ha_hosts.filter(function(host){ return host._used}).map(function(host){ return host.name });
	};

	$scope.checked = function(key,alls){
		$scope.data[key] = alls.every(function(ins){ return Boolean(ins._used)});
	};
	$scope.checkedAll = function(key,alls){
		if(alls){
			alls.forEach(function(item){
				item._used = Boolean($scope.data[key]);
			});
		}
	};
	$scope.next = function(){
		//新增时点击下一步再返回上一步，重置上次的操作
		$scope.data.selectAllHost = false;
		var flag = false;
		HaList.forEach(function(it){
			if(it.name === _scope.data.name){
				flag = true;
				return;
			}
		});
		if(flag){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("HA_SAME_NAME_TIP"),
				timeout:6000
			});
			return;
		}
		$scope.data.step = 2;
		var d = $scope.data;
		var postData = {
			resource_pool_id:d.resource_pool_id,
			type_code:d.type_code,
			instance_ids:d.type_code == 2 ? get_ins_ids() : undefined,
			mode_ids: d.type_code == 1 ? [d.scene.mode_id] : undefined
		};
		$scope.host_ready = false;
		$scope.hosts = [];
		$scope.ha_hosts =[];
		HA.get_hosts(postData,function(res){
			$scope.host_ready = true;
			$scope.hosts = res.use_host_result;
			$scope.ha_hosts = Object.keys(res.host_result).map(function(key){
				return {
					name:key,
					num:res.host_result[key]
				};
			});
		});
	};

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.ok = function(){
		var _this = this;
		var _ins_ids = get_ins_ids();
		// var _mode_ids = get_mode_ids();
		var _host_names = get_host_names();

		var d = $scope.data;
		var postData = {
			name:d.name,
			desc:d.desc,
			resource_pool_id:d.resource_pool_id,
			type_code:d.type_code,
			instance_ids:d.type_code == 2 ? _ins_ids : undefined,
			mode_ids: d.type_code == 1 ? [d.scene.mode_id] : undefined,
			priority:d.priority,
			ha_response_time:Number(d.ha_response_time),
			host_scope:_host_names,
			enable_ha:true
		};
		$scope.submiting = true;
		HA.add(postData,function(res){
			$modalInstance.close(res);
		},function(){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submiting = false;
			$scope.get_list();
		});
	};
}])
.controller('editDesktopHADialog', ['$scope','HA','$modalInstance','param','ResourcePool','$$$I18N', function($scope,HA,$modalInstance,param, ResourcePool,$$$I18N){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = angular.copy(param.item);
	var _scope = $scope;
	var filterHaList = param.HaList.filter(it => it.name != param.item.name);
	var get_ins_ids = function(){
		return $scope.instances.filter(function(ins){ return ins._used }).map(function(ins){ return ins.vm_id});
	};
	// var get_mode_ids = function(){
	// 	return $scope.scenes.filter(function(scene){ return scene._used }).map(function(scene){ return scene.mode_id});
	// };
	var get_host_names = function(){
		return $scope.ha_hosts.filter(function(host){ return host._used}).map(function(host){ return host.name });
	};
	var allScenes = [];
	var allInstances = [];
	ResourcePool.query(function(res){
		$scope.resources = res.result.filter(function(r){ return r.type === 'kvm'});
		HA.get({id:param.item.id},function(res){
			$scope.ready = true;
			allScenes = res.used_modes.map(function(item){ item._used = true;return item}).concat(res.unused_modes);
			allInstances = res.used_vms.map(function(item){ item._used = true;return item}).concat(res.unused_vms);
			$scope.scenes = allScenes.filter(function(mode){ return mode.mode_resource_pool_id === $scope.data.resource_pool_id});
			$scope.instances = allInstances.filter(function(ins){ return ins.vm_resource_pool_id === $scope.data.resource_pool_id});
			$scope.data.scene = $scope.scenes[0];
		});
	});
	$scope.updateHaList = function(){
		$scope.scenes = allScenes.filter(function(mode){ return mode.mode_resource_pool_id === $scope.data.resource_pool_id});
		$scope.instances = allInstances.filter(function(ins){ return ins.vm_resource_pool_id === $scope.data.resource_pool_id});
		$scope.data.scene = $scope.scenes[0];
	};
	
	$scope.checked = function(key,alls){
		$scope.data[key] = alls.every(function(ins){ return Boolean(ins._used)});
	};
	$scope.checkedAll = function(key,alls){
		if(alls){
			alls.forEach(function(item){
				item._used = Boolean($scope.data[key]);
			});
		}
	};

	//编辑的时候是否为全选
	$scope.isSelectedAll = function(hosts){
		var isAllchecked = false;
		isAllchecked = hosts.every(it => it._used);
		return isAllchecked;
	}

	$scope.next = function(){
		var flag = false, isAllchecked = false;
		filterHaList.forEach(function(it){
			if(it.name === _scope.data.name){
				flag = true;
				return;
			}
		});
		if(flag){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("HA_SAME_NAME_TIP"),
				timeout:6000
			});
			return;
		}
		$scope.data.step = 2;
		var d = $scope.data;
		var postData = {
			resource_pool_id:d.resource_pool_id,
			type_code:d.type_code,
			instance_ids:d.type_code == 2 ? get_ins_ids() : undefined,
			mode_ids: d.type_code == 1 ? [d.scene.mode_id] : undefined
		};
		$scope.host_ready = false;
		$scope.hosts = [];
		$scope.ha_hosts =[];
		HA.get_hosts(postData,function(res){
			$scope.host_ready = true;
			$scope.hosts = res.use_host_result;
			$scope.ha_hosts = Object.keys(res.host_result).map(function(key){
				return {
					name:key,
					num:res.host_result[key],
					_used: d.load_host_scope[key] ? true : false
				};
			});
			isAllchecked = $scope.isSelectedAll($scope.ha_hosts);
			$scope.data.selectAllHost = isAllchecked;
		});
	};

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.ok = function(){
		var _this = this;
		var _ins_ids = get_ins_ids();
		// var _mode_ids = get_mode_ids();
		var _host_names = get_host_names();

		var d = $scope.data;
		var postData = {
			id:d.id,
			name:d.name,
			desc:d.desc,
			resource_pool_id:d.resource_pool_id,
			type_code:d.type_code,
			instance_ids:d.type_code == 2 ? _ins_ids : undefined,
			mode_ids:d.type_code == 1 ? [d.scene.mode_id] : undefined,
			priority:d.priority,
			ha_response_time:Number(d.ha_response_time),
			host_scope:_host_names,
			action:"update",
			enable_ha:d.enable_ha
		};
		$scope.submiting = true;
		HA.edit(postData,function(res){
			$modalInstance.close(res);
		},function(){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submiting = false;
			$scope.get_list();
		});
	};
}])
.controller('viewDesktopHADialog', ['$scope', 'HA','$modalInstance','param',function($scope,HA,$modalInstance,param){
	HA.get({id:param.id},function(res){
		$scope.ready = true;
		$scope.data = res;
	});
	$scope.close = function(){
		$modalInstance.close();
	};
}])
