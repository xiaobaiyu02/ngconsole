/**
* vdi.resource.storage Module
*
* Description
*/

angular.module('vdi.resource.storage', [])
.factory('Storage', ['$resource','$Domain', function($resource,$Domain){
	return $resource($Domain + "/thor/storages", null, {
		query: 
			{ method: "GET"},
		get_iscsi:
			{ method: "GET",url:$Domain + "/thor/storage/getScsi"},
		// 删除存储
		delete:
			{ method: "DELETE", url: $Domain + "/thor/storage"},
		// 新增存储
		add: 
			{ method: "POST", url: $Domain + "/thor/storage"},
		get_lun:
			{ method: "GET", url: $Domain + "/thor/storages/:storage_type",params:{storage_type:"@storage_type"}},
		//获取管理节点
		get_node:
			{ method: "GET", url: $Domain + "/thor/resource/nodes"},
		//配置公共存储
		config_public_storage:
			{ method: "POST", url: $Domain + "/thor/storages"},
		//获取公共存储
		get_public_storage:
			{ method: "GET", url: $Domain + "/thor/storages"},
		//获取主机下的可用存储
		get_luns:
			{ method: "GET", url: $Domain + "/thor/list_storage_with_hosts"}
	});
}])
.filter('ObjectFilter',function(){
	return function(data,key){
		var rtn = {};
		if(key){
			data[key] && (rtn[key] = data[key]);
		}else{
			rtn = data;
		}
		return rtn;
	}
})
.controller('vdiResourceStorageListController', ['$scope','$http','Storage','$modal',"$filter",
	function($scope,$http,Storage,$modal,$filter){
	// 数据按照 资源池/主机分类
	var process_data = function(storages,_servers,_pools){
		var pools = angular.copy(_pools);
		var servers = angular.copy(_servers);
		var smap = storages.reduce(function(d,s){
			if(s.storage_type){
				d[s.storage_host_uuid] ? d[s.storage_host_uuid].push(s) : d[s.storage_host_uuid] = [s];
			}
			return d;
		},{});
		var hmap = servers.reduce(function(d,server){
			if(smap[server.id]){
				server.storages = smap[server.id].sort((a,b) => { return a.storage_order - b.storage_order });
				d[server.resource_pool_uuid] ?  d[server.resource_pool_uuid].push(server) : d[server.resource_pool_uuid] = [server];
			}
			return d;
		},{});
		var pmap = pools.reduce(function(d,pool){
			if(hmap[pool.id]){
				pool.servers = hmap[pool.id];
				d[pool.name] = pool;
			}
			return d;
		},{});
		return pmap;
	};
	// 数据按照 存储类型/服务器地址 分类
	var process_unsiggndata = function(storages){
		var datas = {};
		storages.forEach(function(o){
			if(datas[o.device_type]){
				if(datas[o.device_type][o.ip]){
					datas[o.device_type][o.ip].push(o)
				}else{
					datas[o.device_type][o.ip] = [o];
				}
			}else{
				datas[o.device_type] = {};
				datas[o.device_type][o.ip] = [o];
			}
		});
		return datas;
	};
	$scope.get_obj_length = function(data){
		if(data){
			return  Object.keys(data).length;
		}
	};
	$scope.filterLocalStorage = function(name){
		$scope.datas.local_storages = $filter('ObjectFilter')($scope.datas.bak_local_storages,name);
	};
	$scope.get_list = function(){
		$scope.loading = true;
		Storage.query(function(res){
			var local = [], 
				remote_assigned = [], 
				remote_unassigned = [];
			
			$scope.pools = res.pools.sort(function(a,b){ return a.name > b.name ? 1 : -1});
			res.storages.forEach(function(item){
			 	if(item.device_type === 'local'){
			 		local.push(item);
			 	}else{
			 		if(item.storage_type){
			 			remote_assigned.push(item)
			 		}else{
			 			remote_unassigned.push(item);
			 		}
			 	}
			 });
			$scope.datas = {
				storages:res.storages,
				local_storages:process_data(local,res.servers,res.pools),
				bak_local_storages : process_data(local,res.servers,res.pools),
				// local_unassigned_storages: local.filter(function(l){ return !l.storage_type }),
				remote_assigned_storages:process_data(remote_assigned,res.servers,res.pools),
				remote_unassigned_storages:process_unsiggndata(remote_unassigned)
			};
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.get_list();
	var get_list = $scope.get_list;
	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除存储'>"+
					"删除存储</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!has_run' style='margin-bottom:10px;' localize='确认删除存储吗'>确认删除存储吗</p><footer class='text-right'><button class='btn btn-primary ' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					Storage.delete({storage_id:item.uuid},function(){
						get_list();
					});
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			},
			size : "sm"
		});
	};
}])
.controller('addStorageDialog', ['$scope','Storage','$modalInstance','ResourcePool', function($scope,Storage,$modalInstance,ResourcePool){

	$scope.storage = {
		iscsi:{},
		fc:{}
	};
	$scope.loading = true;

	// $scope.datas为父scope中数据
	// $scope.has_remote_storage = Object.keys($scope.datas.remote_assigned_storages).length + Object.keys($scope.datas.remote_unassigned_storages).length > 0 ? true : false;
	$scope.storage.storage_usability = 'instance';

	ResourcePool.query(function(res){
		$scope.resource_pools = res.result.filter(function(p){
			 return p.type === 'kvm';
		});
		$scope.storage.resource_pool = $scope.resource_pools[0];
		$scope.get_nodes();
	});

	function get_manage_node_id(){
		return $scope.storage.manage_node.map(function(node){ return node.node_uuid })
	}

	$scope.get_nodes = function(){
		$scope.loading = true;
		var _resource_uuid = $scope.storage.storage_usability === 'instance' ? $scope.storage.resource_pool.uuid : undefined;
		Storage.get_node({
			storage_usability:$scope.storage.storage_usability,
			resource_pool_uuid: _resource_uuid
		},function(res){
			var firstKey = Object.keys(res.result)[0];
			$scope.nodes = res.result;
			$scope.storage.manage_node = $scope.nodes[firstKey];
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.searchISCSI = function(bool){
		$scope.loading = true;
		$scope.iscsi_luns = [];
		$scope.storage.iscsi.target = null;
		var postData = {};
		postData.storage_usability = $scope.storage.storage_usability;
		postData.host              = $scope.storage.iscsi.host;
		postData.node_uuid          = get_manage_node_id();
		if(bool){
			postData.to_redetect = true;
		}
		Storage.get_iscsi(postData,function(res){
			$scope.iscsi_targets        = res.iqn_list || [];
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.formatLun = function(_lun){
		return (_lun.vendor +　" lun-" + _lun.lun + " " + (_lun.size/Math.pow(1024,3)).toFixed(2) + "GB");
	};
	$scope.searchISCSIlun = function(){
		if(!$scope.storage.iscsi.target){
			$scope.iscsi_luns = [];
			$scope.storage.fc = null;
			return;
		}
		$scope.loading = true;
		var postData = {};
		postData.storage_usability  = $scope.storage.storage_usability;
		postData.storage_type       = 'iscsi';
		postData.host               =  $scope.storage.iscsi.host;
		postData.target_iqn         =  $scope.storage.iscsi.target;
		postData.node_uuid          = get_manage_node_id();
		Storage.get_lun(postData, function(res){
            $scope.iscsi_luns = res.data;
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	}
	$scope.searchFClun = function(bool){
		$scope.loading = true;
		$scope.storage.fc = null;
		var postData = {};
		postData.storage_type       = 'fc';
		postData.storage_usability  = $scope.storage.storage_usability;
		postData.node_uuid          = get_manage_node_id();
		if(bool){
			postData.to_redetect = true;
		}
		Storage.get_lun(postData, function(res){
            $scope.fc_luns = res.data;
            $scope.loadlun = false ;
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	}
	
	$scope.switchType = function(type){
		$scope.clear_luns();
		switch(type){
			//FC
			case 'fc': {
				$scope.searchFClun();
				break;
			};
			//iscsi
			case 'iscsi':{
				break;
			};
			// 分布式存储
			case '3':{
				break;
			};
		}
		setTimeout(function () {
			$("[rel=popover-hover]").popover({ trigger: "hover" });
		});
	};
	$scope.clear_luns = function(){
		$scope.storage.iscsi = null;
		$scope.storage.fc = null;
		$scope.iscsi_targets = null;
		$scope.iscsi_luns = null;
		$scope.fc_luns = null;
	}
	$scope.clear_mess = function(){
		$scope.storage.type = null;
		$scope.clear_luns();
	};
	$scope.ok = function(){
		$scope.loading = true;
		var postData = {
			name:$scope.storage.name,
			storage_type:$scope.storage.type,
			storage_usability:$scope.storage.storage_usability,
		};
		// if(postData.storage_usability === 'instance'){
			postData.node_uuid = $scope.storage.manage_node.map(function(node){ return [node.node_uuid,node.resource_pool_uuid] })
		// }
		if(postData.storage_type === 'fc'){
			postData.device_name = $scope.storage.fc.lun.device_name;
			postData.lun_id = $scope.storage.fc.lun.lun;
			postData.scsi_id = $scope.storage.fc.lun.scsi_id;
			postData.force = $scope.storage.fc.is_format;
			postData.dynamic_lv = $scope.storage.fc.dynamic_lv || false;
		}
		if(postData.storage_type === 'iscsi'){
			postData.device_name = $scope.storage.iscsi.lun.device_name;
			postData.provider = $scope.storage.iscsi.host;
			postData.force = $scope.storage.iscsi.is_format;
			postData.dynamic_lv = $scope.storage.iscsi.dynamic_lv || false;
			postData.target_iqn = $scope.storage.iscsi.target;
			postData.scsi_id= $scope.storage.iscsi.lun.scsi_id;
			postData.lun_id= $scope.storage.iscsi.lun.lun;
		}
		Storage.add({storage:postData},function(res){
			$scope.$parent.get_list();
			$modalInstance.close(res);
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller('configPublicStorageDialog', ['$scope', 'Storage','$modalInstance', function($scope,Storage,$modalInstance){
	Storage.get_public_storage({
		storage_usability:"local"
	},function(res){
		$scope.luns = res.host_storages;
		$scope.lun_id = res.choosed_storage === 'local' ? '' : res.choosed_storage;
		$scope.lun_type = res.choosed_storage === 'local' ? "local" : "remote";
	});
	$scope.clearlun = function(){
		var _this = this;
		this.lun_id = undefined;
	};
	$scope.ok = function(){
		var _this = this;
		$scope.submitting = true;
		Storage.config_public_storage({
			storage_id:_this.lun_id
		},function(){
			$scope.$parent.get_list();
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submitting = false;
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

