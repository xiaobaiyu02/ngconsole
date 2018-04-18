/**
*  Module
*
* Description 资源-资源池模块
*/
angular.module('vdi.resource.pool', [])
.factory("Host", ["$resource", "$Domain","$location","$interfaceDomain","$controllerDomain", function($resource, $Domain, $location,$interfaceDomain,$controllerDomain){
	return $resource($Domain + "/thor/hosts", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/hosts", isArray: false },
		query_agent:
			{ method: "GET", url: $Domain + "/thor/hosts/:id", params:{id: "@id"},isArray: false },
		query_gpu_agent:
			{ method: "GET", url: $Domain + "/thor/hosts/gpu/:id", params:{id: "@id"},isArray: false },
		// 根据虚拟化类型返回可用主机列表
		query_with_virtual_type:
			{ method: "GET", url: $Domain + "/thor/hosts_with_virtual_type"},
		add_agent:
			{ method: "POST", url: $Domain + "/thor/hosts/:id", params:{id: "@id"}, isArray: false },
		delete_agent:
			{ method: "DELETE", url: $Domain + "/thor/hosts/:id", params:{id: "@id"}, isArray: false },
		// 维护主机（可恢复删除） 
		// action ：reboot_host（重启主机），poweroff_host（关闭主机），maintenance_host（维护主机），recovery_host（恢复主机）
		maintain_host:
			{ method: "POST", url: $Domain + "/thor/host/maintainHost" },
		shutdown:
			{ method: "POST", url: $Domain + "/thor/shutdown" },
		config_storage:
			{ method: "POST", url: $Domain + "/thor/host/config_storage"},
		filter_storage: 
			{ method: "GET", url: $Domain + "/thor/filter_available_storages"},
		//获取可用网络信息
        // get_interfaces : 
        // 	{ method:"GET", url: $interfaceDomain + "/v1/network/interface/list"},
        node_ping:
			{ method: "POST", url: $Domain + "/check_ping"},
		// 校验主控节点root账号
	    check_root:
	        { method: "POST", url: $Domain + "/check_root"},
	    // 获取节点服务
	    service_status:
	    	{ method: "GET", url: $Domain + "/thor/host/get_service_status", isArray: false },
	    // 重启或者启动服务
	    restartService:
	    	{ method: "POST", url: $Domain + "/thor/host/restartService" }
	});
}])
.factory('HostManage', ["$resource", "$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/hosts", null, {
		config_desktop:
			{ method: "POST", url: $Domain + "/thor/host/config_desktop"},
		network_info:
			{ method: "GET", url: $Domain + "/thor/host/networkInfo"},
		network_edit:
			{ method: "POST", url: $Domain + "/thor/host/networkInfo"},
		storage_info:
			{ method: "GET", url: $Domain + "/thor/host/local_storage"},
		hardware_info:
			{ method: "GET", url: $Domain + "/thor/host/hardware"},
		//获取物理网络信息 
		physic_netword_info:
			{ method: "GET",url: $Domain + "/thor/host/get_node_physical_network"},
		//获取指定节点支持的网络类型  host_ip:主机ip
		network_types:
			{ method: "GET", url: $Domain + "/thor/host/get_node_available_network_types"},
		//添加网卡绑定
		new_bond:
			{ method: "POST", url: $Domain + "/thor/host/bondnetwork"},
		//修改bond
		alter_bond:
			{ method: "PUT", url: $Domain + "/thor/host/bondnetwork"},
		//解除网卡绑定
		delete_bond:
			{ method: "DELETE", url: $Domain + "/thor/host/bondnetwork"},
		//主机网关及DNS修改
		alter_gatedns:
			{ method: "POST", url: $Domain + "/thor/host/gatedns"}
		
	});
}])
.factory('ResourcePool', ["$resource", "$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/resource", null, {
		query:
			{ method: "GET"},
		add:
			{ method: "POST"},
		delete: 
			{ method: "DELETE",url:$Domain + "/thor/resource", params:null},
		edit:
			{ method: "PUT"}

	});
}])
.factory('HostGPU', ["$resource", "$Domain", function($resource,$Domain){
	return $resource($Domain + "/compute/v1/nodes", null, {
		info:
			{ method: "GET", url: $Domain + "/compute/v1/nodes/:id/gpu/info", params:{id: "@id"},isArray: false },
		state:
			{ method: "GET", url: $Domain + "/compute/v1/nodes/:id/gpu/state", params:{id: "@id"},isArray: false },
		config: 
			{ method: "GET", url: $Domain + "/compute/v1/nodes/:id/gpu/config", params:{id: "@id"},isArray: false },
		update:
			{ method: "PUT", url: $Domain + "/compute/v1/nodes/:id/gpu/update", params:{id: "@id"},isArray: false },
		enable:
			{ method: "PUT", url: $Domain + "/compute/v1/nodes/:id/gpu/enable", params:{id: "@id"},isArray: false },
		disable:
			{ method: "PUT", url: $Domain + "/compute/v1/nodes/:id/gpu/disable", params:{id: "@id"},isArray: false },

	});
}])
.controller('vdiResourcePoolListController', ['$scope', '$modal','$$$I18N','ResourcePool',function($scope,$modal,$$$I18N,ResourcePool){

	$scope.rows = [];
	$scope.loading = true;
	ResourcePool.query({'check_host_service':true},function(res){
		$scope.rows = res.result;
		$scope.loading = false;
	});
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = 30;

	$scope.edit = function(item){
		item.is_edit = true;
		$modal.open({
			controller:"alterPoolDialog",
			templateUrl:"views/vdi/dialog/resource/pool/new_pool.html",
			resolve:{param:function(){
				return item;
			},rows:function(){
				return $scope.rows
			}}
		});
	};
	var _SCOPE = $scope;
	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除资源池'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p data-localize='DELETE_POOL_COMFIRM'>确定删除资源池吗？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){

				$scope.ok = function(){
					$modalInstance.close();
					var postData = {
						id:item.uuid
					};
					ResourcePool.delete(postData,function(res){
						ResourcePool.query(function(res){
							_SCOPE.rows.splice(0,_SCOPE.rows.length);
							[].push.apply(_SCOPE.rows,res.result);
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
}])
.controller('vdiResourcePoolHostController', ['$scope','$routeParams','$modal','$$$I18N','Host','$interval', '$rootScope',
	function($scope,$routeParams,$modal,$$$I18N,Host,$interval,$rootScope){
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["资源", "资源池管理","计算节点"]);

	$scope.rows = [];
	$scope.vtype = $routeParams.type;

	$scope.orders = [ {name: $$$I18N.get("按添加时间排序"), val: 'time'}, {name: $$$I18N.get("按名称排序"), val: 'name'}];
	$scope.order = $scope.orders[0];
	$scope.sortTem = function(val){
		if(val == 'time'){
			$scope.rows.sort(function(a,b){ return a.created_at<b.created_at? -1:1 });
		}
		else{
			$scope.rows.sort(function(a,b){ return a.host>b.host? 1:-1 });
		}
	}

	$interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("nodes", $scope.rows.map(item => item.id));
	}, 1000);
	$scope.$on("nodesRowsUpdate", function($event, data){
		$rootScope.activeHostIds = $scope.rows.filter(row => { return row.status === 'active'}).map(row => { return row.id});
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	$scope.$on("update_host_data",function(){
		$scope.get_list();
	});

	var get_list = function(){
		$scope.loading = true;
		$scope.rows = [];
		Host.query_agent({id:$routeParams.id},function(res){
			$scope.loading = false;
			$scope.rows = res.hosts_list.sort(function(a,b){ return a.created_at<b.created_at? -1:1 });
			$scope.all_data = res;
		});
	};
	get_list();
	$scope.get_list = get_list;
	$scope.configStorage = function(item){
		var ins = $modal.open({
			templateUrl:"views/vdi/dialog/resource/pool/config_storage.html",
			controller:"configStorageDialog",
			resolve:{param:function(){return item}}
		});
		ins.result.then(function(){
			get_list();
		});
	};
	// 	  #    active - 活动
	//    #    maintenance - 维护模式
	//    #    offline - 离线
	//    #    building - 正在添加中
	$scope.restart = function(){
		var rows = $scope.rows.filter(function(item) {return item._selected && item.status === 'active'});
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='重启主机'>"+
						"重启主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启主机吗?'>确定重启主机吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
	                    $modalInstance.close();
	                    Host.maintain_host({
	                    	host_ips:rows.map(function(item){ return item.ip }),
	                    	action:"reboot_host"
	                    },function(res){
	                    	if(rows.some(function(item){ return item.is_console})){
	                    		$rootScope.$broadcast('NOAUTH');
								location.reload();
	                    	}
	                    });
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiResourceHostList_TIP1"),
				timeout:6000
			});
		}
	};

	$scope.poweroff = function(){
		var rows = $scope.rows.filter(function(item) {return item._selected && item.status === 'active'});
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='关闭主机'>"+
						"关闭主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定关闭主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						Host.maintain_host({
							host_ips:rows.map(function(item){ return item.ip }),
							action:"poweroff_host"
						});
						$modalInstance.close();
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiResourceHostList_TIPACTIVE"),
				timeout:6000
			});
		};
	};
	
	$scope.maintain = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status === "active" });
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='维护主机'>"+
						"维护主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='MAINTAIN_HOST_COMFIRM'>进入维护模式时，会关闭当前计算节点上的所有桌面，是否确定？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						var postData ={
							action:"maintenance_host",
							host_ips:rows.map(function(item){ return item.ip })
						};
						Host.maintain_host(postData);
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiResourceHostList_TIPACTIVE"),
				timeout:6000
			});
		};
	};
	$scope.recovery = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status === 'maintenance'; });
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='恢复主机'>"+
						"恢复主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定恢复主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						var postData ={
							action:"recovery_host",
							host_ips:rows.map(function(item){ return item.ip })
						};
						Host.maintain_host(postData);
					};
					$scope.close = function(){
						$modalInstance.close();
					};
				},
				size : "sm"
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiResourceHostList_TIPRECOVER"),
				timeout:6000
			});
		}
	};
	$scope.delete = function(item){
		var rows = $scope.rows.filter(function(item) {return item._selected});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除主机'>"+
					"删除主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='DELETE_HOST_COMFIRM?'></p><footer class='text-right'> <img ng-show='loadding' src='img/loadingtext.gif' width='24px' height='24px'/><button ng-show='!loadding' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button ng-show='!loadding' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$scope.loadding = true;
                    Host.delete_agent({
                    	host_ids:rows.map(function(item){ return item.id }),
                    	id:$routeParams.id
                    },function(res){
                    	get_list();
                    }).$promise.finally(function(){
                    	$scope.loadding = false;
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

	$scope.openHostMoreDialog = function(p){
		var _dialog = $modal.open({
			controller:"hostMoreDialog",
			templateUrl:"views/vdi/dialog/resource/pool/host_more.html",
			size:"lg",
			resolve:{
				param:function(){
					return p;
				}
			}
		});
	};
	
}])
.controller('newPoolDialog', ['$scope','$modalInstance','ResourcePool', function($scope,$modalInstance,ResourcePool){
	setTimeout(function(){
		$("[rel=popover-hover]").popover({ trigger : "hover" });
	})
	$scope.rbd_enabled = false;
	$scope.template_type = 'add';
	$scope.virtual_type = "kvm";
	$scope.ok = function(){
		var postData = {
			name:this.name,
			virtual_type:this.virtual_type,
			rbd_enabled: this.rbd_enabled,
			description:this.des
		};
		$scope.loadding = true;
		ResourcePool.add(postData,function(res){
			$modalInstance.close();
			ResourcePool.query(function(res){
				$scope.rows.splice(0,$scope.rows.length);
				[].push.apply($scope.rows,res.result);
			});
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller('alterPoolDialog', ['$scope','$modalInstance','param','rows','ResourcePool', function($scope,$modalInstance,param,rows,ResourcePool){
	setTimeout(function(){
		$("[rel=popover-hover]").popover({ trigger : "hover" });
	})
	$scope.template_type = 'alter';
	$scope.name = param.name;
	$scope.virtual_type = param.type;
	$scope.rbd_enabled = param.rbd_enabled;
	$scope.des = param.description;
	$scope.is_edit = param.is_edit;
	$scope.is_default = param.name === 'default'? true:false;
	$scope.hostnum = param.hosts.length;
	$scope.ok = function(){
		var postData = {
			id:param.uuid,
			name:this.name,
			rbd_enabled: this.rbd_enabled,
			description:this.des
		};
		$scope.loadding = true;
		ResourcePool.edit(postData,function(res){
			$modalInstance.close();
			ResourcePool.query(function(res){
				rows.splice(0,rows.length);
				[].push.apply(rows,res.result);
			});
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	}
}])
.controller("hostMoreDialog", ["$scope","$modalInstance", "Host", "HostManage","$$$I18N", "$Domain","param","Storage","Console","$modal","maskModel","$rootScope","HostGPU","$q",
	function($scope, $modalInstance,Host,HostManage, $$$I18N, $Domain,param,Storage,Console,$modal,maskModel,$rootScope,HostGPU,$q){
    //查询网卡
    $scope.max_instance = param.max_instance;
    var param_host =angular.copy(param);
    $scope.virtual_type = param_host.virtual_type;
	$scope.rbd_enabled = param_host.rbd_enabled;
	$scope.enable_gpu_module = param_host.enable_gpu_module;

    $scope.get_nic = function(){
    	$scope.loading_nic = true;
    	HostManage.network_info({
	    	host:param.ip,
	    	id:param.id || ''
	    },function(res){
	    	$scope.dev_states = res.dev_states;
	    	$scope.networks = res.networks.map(function(item){
	    		item.ips = item.ips.map(function(sub,idx){
	    			return {
	    				ip:sub,
	    				netmask:item.netmasks[idx],
	    				ip_editable:item.ips_editable[idx],
	    				uneditable:item.ips_editable[idx].is_management || item.ips_editable[idx].is_image
	    			}
	    		});
	    		item._ips = item.ips.map(function(sub){
	    			return {
	    				value:sub,
	    				model:angular.copy(sub)
	    			};
	    		});
	    		item.readonly = true;
	    		return item;
	    	}).sort(function(a,b){
		 		return a.name > b.name;
		 	});
		 	$scope.data = {
		 		_dnss: [{},{}].map((d,idx) => {
		 			return {
		 				model:res.dns[idx],
		 				value:res.dns[idx]
		 			};
		 		}),
		 		_gateway: {
		 			model:res.gateway,
		 			value:res.gateway
		 		},
		 		_readonly:true

		 	};
		 	$scope.bond_types = res.bond_types;
		 	$scope.bond_networks = res.bond_networks.map(function(item){
	    		item.ips = item.ips.map(function(sub,idx){
	    			return {
	    				ip:sub,
	    				netmask:item.netmasks[idx],
	    				ip_editable:item.ips_editable[idx],
	    				uneditable:item.ips_editable[idx].is_management || item.ips_editable[idx].is_image
	    			}
	    		});
	    		item._ips = item.ips.map(function(sub){
	    			return {
	    				value:sub,
	    				model:angular.copy(sub)
	    			};
	    		});
	    		item.readonly = true;
	    		return item;
	    	});
	    }).$promise.finally(function(){
	    	$scope.loading_nic = false;
	    });
    };
    $scope.get_nic();
    //修改网卡
	$scope.ok = function(item){
		item.submiting = true;
		var all_cidr = $scope.networks.concat($scope.bond_networks).reduce((arr,net) =>{
			let cidr = net._ips.map( (ip) => {
				return ip.model.ip + "/" + ip.model.netmask;
			});
			arr.push.apply(arr,cidr);
			return arr;
		},[]);
		var before_cidr = $scope.networks.concat($scope.bond_networks).reduce((arr,net) =>{
			let cidr = net.ips.map( (ip) => {
				return ip.ip + "/" + ip.netmask;
			});
			arr.push.apply(arr,cidr);
			return arr;
		},[]);
		var backItem = {
			id:param.id,
			is_console:param.is_console,
			iface:item.name,
			ips:item._ips.map(function(i){ return i.model.ip}),
			netmasks:item._ips.map(function(i){ return i.model.netmask}),
			ips_editable:item._ips.map(function(i){ return i.model.ip_editable}),
			before_cidr:before_cidr,
			all_cidr:all_cidr
		};
		var is_alter = item._ips.every(it => {
			return it.model.ip === it.value.ip && it.model.netmask === it.value.netmask
		});
		if(is_alter && item._ips.length === item.ips.length){
			// 修改后的值和初始值相等时，不提交数据
			item.submiting = false;
			item.readonly = true;
		}else{
			HostManage.network_edit(backItem, function(){
				item._ips.forEach(i => {i.value = angular.copy(i.model)});
				item.submiting = false;
				item.readonly = true;
				location.reload();
			},function(){
				item.submiting = false;
				item.readonly = false; 
			});
		}
	};
	$scope.okDns = function(d){
		d.submiting = true;
		var postData = {
			id:param.id,
			gateway:d._gateway.model,
			dns:d._dnss.filter(i => { return Boolean(i.model) }).map(i => { return i.model})
		};
		var no_alter = d._dnss.concat(d._gateway).every(it => {
			return it.model === it.value
		});
		if(no_alter){
			d.submiting = false;
			d._readonly = true;
		}else{
			HostManage.alter_gatedns(postData, function(res){
				d._dnss.forEach(dns => {
					dns.value = dns.model;
				});
				d._gateway.value = d._gateway.model;
				d._readonly = true;
				// FIX #6061
				// maskModel.open(angular.copy($rootScope.activeHostIds));
			}).$promise.finally(function(){
				d.submiting = false;
			})
		}
	};
	$scope.cancel = function(item){
		item.readonly = true;
		item._ips = item.ips.map(function(sub){
			return {
				value:sub,
				model:angular.copy(sub)
			};
		});
	};
	$scope.cancelDns = function(d){
		d._readonly = true;
		d._dnss.forEach(dns => {
			dns.model = dns.value?dns.value:null;
		});
		d._gateway.model = d._gateway.value;
	};
	$scope.add_ip = function(item){
		item._ips.push({
			model:{
				ip_editable:{
					is_management:false,
					is_image:false
				},
				uneditable:false
			},
			value:{
				ip_editable:{
					is_management:false,
					is_image:false
				},
				uneditable:false
			}
		});
	};
	$scope.minus_ip = function(per,all){
		all.splice(all.indexOf(per),1);
	};
	$scope.bound_netcard = function(){
		var dialog = $modal.open({
			controller:"boundNetcardDialog",
			templateUrl:"views/vdi/dialog/resource/pool/bound_netcard.html",
			resolve:{param:function(){
				return {
					p_host:angular.copy(param_host),
					p_networks:angular.copy($scope.networks),
					p_bondtypes:angular.copy($scope.bond_types),
					p_bondnetworks:angular.copy($scope.bond_networks),
					p_dev_states:angular.copy($scope.dev_states),
				}
			}}
		});
		dialog.result.then(function(){
			getNetcardList();
		});
	};
	$scope.edit_bond = function(item){
		var dialog = $modal.open({
			controller:"editboundNetcardDialog",
			templateUrl:"views/vdi/dialog/resource/pool/bound_netcard.html",
			resolve:{param:function(){
				return {
					p_host:angular.copy(param_host),
					p_networks:angular.copy($scope.networks),
					p_bondtypes:angular.copy($scope.bond_types),
					p_bondnetworks:angular.copy($scope.bond_networks),
					p_dev_states:angular.copy($scope.dev_states),
					p_item :angular.copy(item)
				}
			}}
		});
		dialog.result.then(function(){
			getNetcardList();
		});
	};
	$scope.unbundle_netcard = function(item){
		var dialog = $modal.open({
			controller:"unbundleNetcardDialog",
			templateUrl:"views/vdi/dialog/resource/pool/unbundle_netcard.html",
			resolve:{param:function(){
				return {
					p_host:angular.copy(param_host),
					p_net:angular.copy(item),
					p_dev_states:angular.copy($scope.dev_states),
				}
			}}
		});
		dialog.result.then(function(){
			getNetcardList();
		});
	};
	// 是否能编辑，同时只能有一行可以编辑
	$scope.netEditable = function(net){
		var hit = false;
		angular.forEach($scope.networks, function(item){
			if(item.readonly === false) {
				hit = true;
			}
		});
		return !hit;
	};
	// 本地存储信息
	HostManage.storage_info({
		host:param.ip,
		id:param.id || ''
	},function(res){
		$scope.storages = res.result;
	});

	//硬件信息
	HostManage.hardware_info({
		host: param.ip,
		id:param.id || ''
	},function(res){
		$scope.hardware = res;
	});

   
    //窗口关闭按钮
	$scope.close = function(){
		$modalInstance.close();
	};
   
    //修改最大实例数
    $scope.insBtn_unable = false;
	$scope.saveMaxInstance = function(){
		$scope.insBtn_unable = true;
		var _this = this;
		HostManage.config_desktop({
            "host":param.id,
			"max_instance":_this.max_instance
		},function(res){
			$scope.insBtn_unable = false;
			$scope.insForm_suc = true;
			setTimeout(function(){
				$scope.insForm_suc = false;
				// 通知父scope,更新数据
				$scope.$root.$broadcast('update_host_data');
			},1000);
			// _this.max_instance = null;
		});
	};
	$scope.save_outer_IP = function(){
		$scope.IP_Btn_unable = true;
		Console.save_ip({host:param.id,external_ip:this.outerIP},function(){
			$scope.outerIPForm_suc = true;
			setTimeout(function(){
				$scope.outerIPForm_suc = false;
			},1000);
		}).$promise.finally(function(){
			$scope.IP_Btn_unable = false;
		});
	};

	function getServer(){
		$scope.loading_server = true;
		Host.service_status({ip: param_host.ip}, function(res){
			var services = [];
			for(var name in res.result){
				services.push({name: name, status: res.result[name]})
			}
			$scope.servers = services;
			$scope.loading_server = false;
		},function(error){ $scope.loading_server = false; })
	}
	getServer();
	$scope.recover = function(item){
		var dialog = $modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重启服务'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='确定重启服务吗' param1='"+item.name+"'></p><footer class='text-right'><img data-ng-if='sending' src='./img/HLloading.gif' width='24px'><button data-ng-if='!sending' class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button data-ng-if='!sending' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller:function($scope, $modalInstance){
				$scope.ok = function(){
					$scope.sending = true;
					Host.restartService({
						host_ip: param_host.ip,
						service: item.name,
						action: 'restart'
					},function(){
						$scope.sending = false;
						$modalInstance.close();
					},function(error){
						$scope.sending = false;
					})
				};
				$scope.close = function(){
					$modalInstance.dismiss();
				}
			},
			size: "sm"
		});
		dialog.result.then(function(){
			getServer();
		});
	};
	$scope.start = function(item){
		var dialog = $modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='启动服务'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='确定启动服务吗' param1='"+item.name+"'></p><footer class='text-right'><img data-ng-if='sending' src='./img/HLloading.gif' width='24px'><button data-ng-if='!sending' class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button data-ng-if='!sending' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller:function($scope, $modalInstance){
				$scope.ok = function(){
					$scope.sending = true;
					Host.restartService({
						host_ip: param_host.ip,
						service: item.name,
						action: 'start'
					},function(){
						$scope.sending = false;
						$modalInstance.close();
					},function(error){
						$scope.sending = false;
					})
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
		dialog.result.then(function(){
			getServer();
		});
	};
	var _scope = $scope;
	/* GPU显卡Tab页 */
	function getHostGPU(){
		$scope.loading_GPU = true;
		$q.all([HostGPU.state({id:param.id}).$promise,HostGPU.config({id:param.id}).$promise,HostGPU.info({id:param.id}).$promise]).then(function(arr){
			$scope.GPU_V = arr[0].state.flag=='defined';
			$scope.GPU_V_num = arr[1].config.vf_num;
			var totalNum = arr[2].info.reduce(function(count, item){
				return count + item.SRIOVTotalVFS;
			}, 0);
			$scope.GPU_V_max = totalNum;
			$scope.GPU_V_min = arr[2].info.length;
			$scope.loading_GPU = false;
		})
	}
	if($scope.enable_gpu_module){
		getHostGPU();
	}
	function queryConfig(){
		HostGPU.config({id:param.id},function(r){
			$scope.GPU_V_num = r.config.vf_num;
		})
	}
	$scope.changeGPU_V = function(val){
		$scope.GPU_V_loading = true;
		if(val){
			HostGPU.enable({id:param.id},function(res){
			},function(error){
				_scope.GPU_V = !val;
			}).$promise.finally(function(){
				$scope.GPU_V_loading = false;
			})
		}else{
			HostGPU.disable({id:param.id},function(res){
			},function(error){
				_scope.GPU_V = !val;
			}).$promise.finally(function(){
				$scope.GPU_V_loading = false;
			})
		}
	}
	$scope.saveGPUV = function(){
		$scope.saving = true;
		HostGPU.update({id:param.id,data:{vf_num:this.GPU_V_num}},function(res){
			$scope.sav_suc = true;
		},function(error){
			$scope.GPU_V = !$scope.GPU_V;
			$scope.sav_suc = false;
		}).$promise.finally(function(){
			$scope.saving = false;
			queryConfig();
		})
	}
}])
.controller('addHostDialog', ['$scope','$modalInstance','Host','$routeParams','Network','Manage','HA','$http',"$Domain","$$$I18N","HostManage","$location",function($scope,$modalInstance,Host,$routeParams,Network,Manage,HA,$http,$Domain,$$$I18N,HostManage,$location){
	var $s = $scope;
	$s.step = 1;
	$s.host = {};
	$s.quorum = {};
    function getDataNetwork(){
    	$s.loading_network = true;
    	return Network.query().$promise;
    }
    function formatIP(cidr){
	    var ip = cidr.split("/")[0];
	    var masklen = Number(cidr.split("/")[1]);
	    var binaryMask = 0xFFFFFFFF << (32 - masklen);
	    var arrmask = [];
	    for(var i = 32/8; i > 0 ;i--){
	        arrmask.push(binaryMask >>> 8 * (i-1) & 0xff);
	    }
	    return {
	        cidr:cidr,
	        ip:ip,
	        netmask:arrmask.join(".")
	    };
	}
	function get_interfaces(){
		$s.loading_interface = true;
		$s.interfaces = [];
		return HostManage.network_info({
			host:$s.host.ip,
			id:null
		},function(res){
			$s.interfaces = res.networks.concat(res.bond_networks).map(dev => {
				dev._cidrs = (dev.ips || dev.ip).map((ip,idx) => {
					return {
						ip:ip,
	        			netmask: (dev.netmasks || dev.netmask)[idx]
					}
				});
				dev._dev = dev.name;
				dev._selected = false;
				return dev;
			});
		}).$promise.finally(function(){
			$s.loading_interface = false;
		});
	}
	$s.close = function(){
		$modalInstance.close();
	};
	$s.go_next = function(){
		$s.loading = true;
		Host.check_root({
			username: $s.host.username,
			root_password:$s.host.root_password,
			node_ip:$s.host.ip,
			force: $s.host.force
		},function(res){
			$s.agent_detail = res.result;
			$s.enter_step2();
		}).$promise.finally(res => {
			$s.loading = false;
		});
	};
	$s.go_pre = function(){
		$s.step = 1;
		$s.dataNets = [];
		$s.interfaces = [];
		$s.agent_detail = {};
	};
	$s.enter_step2 = function(){
		$s.step = 2;
	    get_interfaces().then(getDataNetwork).then(function(res){
	    	$s.loading_network = false;
	    	var nets = res.networks.reduce((obj,it) => {
	    		if(obj[it.switch_name]){
	    			obj[it.switch_name]['name'] += "/" + it.name;
	    		}else{
	    			obj[it.switch_name] = it;
	    		}
	    		return obj;
	    	},{});
	    	$s.dataNets = Object.keys(nets).map((key,idx) => {
	    		nets[key]._data_dev = $s.interfaces[idx];
	    		return nets[key];
	    	});
	    });
	};
	$s.ok = function(type){
		var _this = this;
		var h = _this.host;
		this.loadding = true;
		var postData = {
			id:$routeParams.id || $s.item.id,
			ip:h.ip,
			username: h.username,
			root_password:h.root_password,
			virtual_type:type,
			force: $s.host.force,
			management_dev:$s.agent_detail.node_manage_dev,
			management_ip:$s.agent_detail.node_manage_ip,
			management_netmask:$s.agent_detail.node_manage_netmask,
			bond_switch_infos:$s.dataNets.map(n => {
				return {
					dev:n._data_dev ? n._data_dev._dev : null,
					switch:n.switch_name
				}
			})
		}
		Host.add_agent(postData,function(){
			$modalInstance.close();
			if($s.item){
				$location.url("/resource/pool/"+$s.item.id+"/"+type)
			}else{
				$s.get_list();
			}
		}).$promise.finally(function(){
			_this.loadding = false;
		});
	}
}])
.controller('configPubStorageDialog', ['$scope','$modalInstance','Storage', function($scope,$modalInstance,Storage){
	
	$scope.ok = function(){
		$modalInstance.close();
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller('configStorageDialog', ['$scope','param','$modalInstance','Host', 'Storage', function($scope,param,$modalInstance,Host,Storage){
	$scope.host = param.host;
	$scope.loading = true;
	$scope.sys_luns = [];
	$scope.data_luns =[];
	Storage.query({storage_uuid:param.storage_uuid},function(res){
		$scope.loading = false;
		// res.host_storages.unshift({name:"本地存储",uuid:undefined});
		$scope.luns = res.storages.map(function(s){
			try{
				s._total_size = Number(s.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
				s._free_size =  Number(s.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
				s._used_size =  Number(s._total_size - s._free_size).toFixed(0);
			}catch(err){}
			return s;
		});
		$scope.hostluns = res.host_storages.map(function(s){
			try{
				s._total_size = Number(s.storage_metadata.capabilities.total_capacity_gb).toFixed(0);
				s._free_size =  Number(s.storage_metadata.capabilities.free_capacity_gb).toFixed(0);
				s._used_size =  Number(s._total_size - s._free_size).toFixed(0);
			}catch(err){} 
			return s;
		});
		$scope.imagePropertyLun = $scope.luns.filter(function(item){ return item.uuid === param.image_storage_performance})[0];
		$scope.imageCapacityLun = $scope.luns.filter(function(item){ return item.uuid === param.image_storage_capacity})[0];
		$scope.hostLun = $scope.hostluns.filter(function(item){ return res.choosed_storage === 'local' ? item.uuid == undefined : item.uuid === res.choosed_storage})[0];
		$scope.filterStorage($scope.imagePropertyLun,1);
		$scope.filterStorage($scope.imageCapacityLun,2);
	});
	$scope.filterStorage = function(_s,type){
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
				case 1: {
					$scope.sys_luns = res.result;
					$scope.propertyLun = ($scope.sys_luns.filter(function(item){ return item.uuid === param.storage_performance})[0]) || $scope.sys_luns[0];
					break;
				};
				case 2: {
					$scope.data_luns = res.result;
					$scope.capacityLun = ($scope.data_luns.filter(function(item){ return item.uuid === param.storage_capacity})[0]) || $scope.data_luns[0];
					break;
				};
				default:{
					break;
				}
			}
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
	$scope.ok = function(){
		var _this = this;
		$scope.loading = true;
		Host.config_storage({
			host:param.id,
			// storage_base:this.baseLun.uuid,
			storage_performance: $scope.propertyLun.uuid,
			storage_capacity: $scope.capacityLun.uuid,
			cache_storage: _this.hostLun.uuid,
			image_storage_performance: $scope.imagePropertyLun.uuid,
			image_storage_capacity:$scope.imageCapacityLun.uuid
		}).$promise.then(function(){
			$modalInstance.close();
		}).finally(function(){
			$scope.loading = false;
		});
	};
	// 过滤远端存储
	function filter_data(rsts){
		var ip = param.ip;
		var _storages = rsts.filter(function(item){
			if(item.device_type === 'local' && item.ip !== ip){
				return false;
			}
			return true;
		});
		return _storages;
	}
}])
.controller('boundNetcardDialog', ['$scope','param','$modalInstance','HostManage','$filter','$$$I18N','maskModel','$rootScope', '$modal', function($scope,param,$modalInstance,HostManage,$filter,$$$I18N,maskModel,$rootScope,$modal){
	// 主控和计算节点公用
	var host_mess = param.p_host;
	var net_mess = param.p_networks;
	var dev_status = param.p_dev_states;
	var temp = {
		ip: null,
		netmask: null,
		uneditable:false,
		ip_editable:{
			is_management:false,
			is_image:false
		}
	};
	$scope.type = 'add';
	$scope.bond_types = param.p_bondtypes;
	$scope.netcards = net_mess.filter(function(n){ return n.has_bond === false });
	$scope.ips = [angular.copy(temp)];
	$scope.data = {};

	// HostManage.network_info({
	// 	host:host_mess.ip,
	//     id:host_mess.id || ''
	// },function(res){
	// 	$scope.netcards = res.networks.filter(function(net){
	// 		return net.has_bond === false;
	// 	});
	// 	all_nets = res.networks.concat(res.bond_networks);
	// });

	// HostManage.network_types({host_ip:host_mess.ip},function(res){
	// 	$scope.types = res.result;
	// });
	$scope.update_ip = function(){
		// var eth0 = $filter("selectedFilter")($scope.netcards).filter(function(n){ return n.iface === "eth0" })[0];
		var manage_image_ips = $filter("selectedFilter")($scope.netcards).reduce((arr,netcard) => {
			netcard.ips.forEach(ip => {
				if(ip.uneditable){
					arr.push(ip);
				}
			});
			return arr;
		},[]);
		if(manage_image_ips.length){
			$scope.ips = angular.copy(manage_image_ips);
		}else{
			$scope.ips = [angular.copy(temp)];
		}
	};
	$scope.selectAllHost = function(bool){
		$scope.netcards.map(function(item){
			item._selected = bool;
			return item;
		});
		$scope.update_ip();
	};
	$scope.selectOneHost = function(){
		$scope.data.is_all = $scope.netcards.every(function(item){
			return item._selected === true;
		});
		$scope.update_ip();
	};
	$scope.add_ip = function(){
		$scope.ips.push(angular.copy(temp));
	};
	$scope.minus_ip = function(idx){
		$scope.ips.splice(idx,1);
	};
	$scope.get_select_nets_length = function(){
		return $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface }).length
	};
	var parentScope = $scope;
	$scope.ok = function(){
		var _this = this;
		var select_nets = $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface });
		if(select_nets.every(card => dev_status[card])){
			parentScope.okPost(_this);
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='INFOR_TIP'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='DELETE_BOND_IVALID_CONFIRM'></p><footer class='text-right'> <img ng-show='loadding' src='img/loadingtext.gif' width='24px' height='24px'/><button ng-show='!loadding' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button ng-show='!loadding' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						parentScope.okPost(_this);
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			})
		}
	};
	$scope.okPost = function(scope){
		var _this = scope;
		var select_nets = $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface });
		var postData = {
			id:host_mess.id,
			is_console:host_mess.is_console,
			bond_name:_this.name,
			bond_type:_this.bond_type,
			ifaces:select_nets,
			ips:$scope.ips.map(ip => { return ip.ip}),
			netmasks:$scope.ips.map(ip => { return ip.netmask}),
			ips_editable:$scope.ips.map(ip => { return ip.ip_editable})
		};
		if(postData.ifaces && postData.ifaces.length > 1){
			$scope.loadding = true;
			HostManage.new_bond(postData,function(res){
				// maskModel.open(angular.copy($rootScope.activeHostIds));
				location.reload();
			}).$promise.finally(function(){
				$scope.loadding = false;
			});
		}
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiBondNetcard_TIP1"),
				timeout:6000
			});
		}
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('editboundNetcardDialog', ['$scope','param','$modalInstance','HostManage','$filter','$$$I18N','maskModel','$rootScope','$modal', function($scope,param,$modalInstance,HostManage,$filter,$$$I18N,maskModel,$rootScope,$modal){
	// 主控和计算节点公用
	var currentItem = param.p_item;
	var host_mess = param.p_host;
	var dev_status = param.p_dev_states;
	var net_mess = param.p_networks.concat(currentItem.member.map(it => {
		return {
			iface:it,
			name:it,
			ips:[]
		}
	}));
	
	var temp = {
		ip:"",
		netmask:"",
		uneditable:false,
		ip_editable:{
			is_management:false,
			is_image:false
		}
	};
	$scope.type = 'edit';
	$scope.bond_types = param.p_bondtypes;
	$scope.netcards = net_mess.map(n => {
		n._selected = currentItem.member.indexOf(n.iface) > -1; 
		return n;
	});

	$scope.data = {};
	$scope.ips = currentItem.ips;

	$scope.name = currentItem.name;
	$scope.bond_type = currentItem.mode;
	$scope.update_ip = function(){
		var manage_image_ips = $filter("selectedFilter")($scope.netcards).reduce((arr,netcard) => {
			netcard.ips.forEach(ip => {
				if(ip.uneditable){
					arr.push(ip);
				}
			});
			return arr;
		},[]);
		if(manage_image_ips.length){
			$scope.ips = angular.copy(manage_image_ips).concat(currentItem.ips);
		}else{
			$scope.ips = currentItem.ips;
		}
	};
	$scope.selectAllHost = function(bool){
		$scope.netcards.map(function(item){
			item._selected = bool;
			return item;
		});
		$scope.update_ip();
	};
	$scope.selectOneHost = function(){
		$scope.data.is_all = $scope.netcards.every(function(item){
			return item._selected === true;
		});
		$scope.update_ip();
	};
	$scope.add_ip = function(){
		$scope.ips.push(angular.copy(temp));
	};
	$scope.minus_ip = function(idx){
		$scope.ips.splice(idx,1);
	};
	$scope.get_select_nets_length = function(){
		return $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface }).length
	}
	var parentScope = $scope;
	$scope.ok = function(){
		var _this = this;
		var select_nets = $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface });
		if(select_nets.every(card => dev_status[card])){
			parentScope.okPost(_this);
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='INFOR_TIP'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='DELETE_BOND_IVALID_CONFIRM'></p><footer class='text-right'> <img ng-show='loadding' src='img/loadingtext.gif' width='24px' height='24px'/><button ng-show='!loadding' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button ng-show='!loadding' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						parentScope.okPost(_this);
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			})
		}
	};
	$scope.okPost = function(scope){
		var _this = scope;
		var select_nets = $filter("selectedFilter")($scope.netcards).map(function(n){ return n.iface });
		var postData = {
			id:host_mess.id,
			is_console:host_mess.is_console,
			bond_name:_this.name,
			bond_type:_this.bond_type,
			ifaces:select_nets,
			ips:$scope.ips.map(ip => { return ip.ip}),
			netmasks:$scope.ips.map(ip => { return ip.netmask}),
			ips_editable:$scope.ips.map(ip => { return ip.ip_editable})
		};
		if(postData.ifaces && postData.ifaces.length > 1){
			$scope.loadding = true;
			HostManage.alter_bond(postData,function(res){
				location.reload();
			}).$promise.finally(function(){
				$scope.loadding = false;
			});
		}
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiBondNetcard_TIP1"),
				timeout:6000
			});
		}
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('unbundleNetcardDialog', ['$scope','$modalInstance','param','HostManage','maskModel','$rootScope','$modal', function($scope,$modalInstance,param,HostManage,maskModel,$rootScope,$modal){
	var host = param.p_host;
	var data = $scope.data = param.p_net;
	var dev_status = param.p_dev_states;
	data.ips.forEach(d => {
		if(d.uneditable){
			data._has_inherit_net = true;
			d._inherit_menber  = data.member[0];
		}else{
			d._inherit_menber = "";
		}
		
	});
	data.is_inherit = data._has_inherit_net;
	$scope.okPost = function(){
		var d = data;
		var _inherit_infos = d.ips.map(val => {
			return {
				ip:val.ip,
				netmask:val.netmask,
				dev:val._inherit_menber,
				is_management:val.ip_editable.is_management,
				is_image:val.ip_editable.is_image
			}
		});
		var postData = {
			id:host.id,
			is_console:host.is_console,
			bond_name:d.name,
			is_inherit:d.is_inherit,
			inherit_infos:d.is_inherit ? _inherit_infos : []
		};
		$scope.submiting = true;
		HostManage.delete_bond(postData).$promise.then(function(){
			location.reload();
		}).finally(function(){
			$scope.submiting = false;
		});
	};
	var parentScope = $scope;
	$scope.ok = function(){
		if(check_inherit()){
			parentScope.okPost();
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='INFOR_TIP'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='DELETE_BOND_IVALID_CONFIRM'></p><footer class='text-right'> <img ng-show='loadding' src='img/loadingtext.gif' width='24px' height='24px'/><button ng-show='!loadding' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button ng-show='!loadding' class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						parentScope.okPost();
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			})
		}
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
	function check_inherit(){
		var ips = data.ips;
		var valid = true;
		ips.forEach(ip => {
			if(dev_status[ip._inherit_menber] === false){
				valid = false;
			}
		});
		return valid;
	}
}])
