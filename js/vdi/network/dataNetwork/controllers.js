angular.module("vdi.network.dataNetwork", [])
.factory("Network", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/networks", null, {
		query:
			{ method: "GET", isArray: false, params: null},
		add:
			{ method: "POST", isArray: false},

		get:
			{ method: "GET", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},
		alter:
			{ method: "PUT", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},
		delete:
			{ method: "DELETE", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},

		query_sub:
			{ method: "GET", url:$Domain + "/thor/network/:id/subnets", params: { id: "@id" }},
		add_sub:
			{ method: "POST", url:$Domain + "/thor/network/:id/subnets", params: { id: "@id" }},

		get_sub:
			{ method: "GET", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},
		alter_sub:
			{ method: "PUT", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},
		delete_sub:
			{ method: "DELETE", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},

		ports:
			{ method: "GET", url:$Domain + "/thor/network/subnet/:id/ports", params: { id: "@id" }},
		ports_unused_ips:
			{ method: "GET", url:$Domain + "/thor/network/subnet/:id/ports?enable_unused_ips=false", params: { id: "@id" }}

	});
}])
.factory("Listswitchs", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/list_switchs_for_network", null, {
		query: { method: "GET", isArray: false}
	});
}])
.controller("vdiDataNetworkListController", ["$scope", "Network",'$modal','isHAEnabled','$$$I18N',function($scope,Network,$modal,isHAEnabled,$$$I18N){
	$scope.hasHA_loading = true;
	isHAEnabled().then(function(enabled){
		$scope.hasHA_loading = false;
        $scope.hasHA = enabled;
    });
	
	$scope.rows = [];$scope.loading = true;

	var get_rows = function(){
		Network.query(function(res){
			$scope.rows = res.networks.sort(function(a,b){ return a.name > b.name});
			$scope.loading = false;
		});
	};
	get_rows();
	
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;

	var _SCOPE = $scope;
	$scope.add = function(){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			$modal.open({
				templateUrl: "views/vdi/dialog/network/dataNetwork/new_network.html",
				controller: "newNetworkDialog",
				size: "dm"
			});
		}
	}
	$scope.alter = function(){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var network = this.item;
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/dataNetwork/alter_network.html",
				controller: "alterNetworkDialog",
				size: "dm",
				resolve:{
					params : function(){
						return {network:angular.copy(network)};
					}
				}
			});
			dialog.result.then(function(data){
				if(data){
					get_rows();
				}
			});
		}
	}
	$scope.delete = function(item){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除网络'>"+
						"删除网络</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_NETWORK_COMFIRM'>删除网络将删除该网络下的所有子网，桌面将无法使用该网络，确认删除吗</p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						Network.delete({id:item.id},function(res){
							Network.query(function(res){
								_SCOPE.rows = res.networks.sort(function(a,b){ return a.name > b.name});
							});
						});
					};
					$scope.close = function(){
						$modalInstance.close();
					};
				},
				size : "sm"
			});
		}
	};
	$scope.new_sub_network = function(id){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var modal = $modal.open({
				controller:"newSubNetworkDialog",
				templateUrl:"views/vdi/dialog/network/dataNetwork/new_sub_network.html",
				resolve:{params: function(){
					return angular.copy(id);
				}}
			});
			modal.result.then(function(res){
				if(res){
					get_rows();
				}
			});
		}
	};
}])
.controller('vdiDataNetworkSubNetworkListController', ['$scope',"$modal","$routeParams","Network", "isHAEnabled","$$$I18N",function($scope,$modal,$routeParams,Network,isHAEnabled,$$$I18N){
	$scope.hasHA_loading = true;
	isHAEnabled().then(function(enabled){
		$scope.hasHA_loading = false;
        $scope.hasHA = enabled;
    });
	
	var get_rows = function(){
		Network.query_sub({id:$routeParams.id},function(res){
			$scope.rows = res.result.sort(function(a,b){ return a.name > b.name});
		});
	};
	get_rows();

	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["网络", "数据网络","子网"]);
	$scope.cur_network_id = $routeParams.id;
	$scope.delete = function(item){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除网络'>"+
							"删除子网</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_SUB_NETWORK_COMFIRM'>删除子网后，桌面将无法使用该子网，确认删除吗</p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					controller: function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							Network.delete_sub({id: item.id},function(res){
								get_rows();
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						};
					},
					size : "sm"
			});
		}
	};
	$scope.alter_sub_network = function(item){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/dataNetwork/new_sub_network.html",
				controller: "alterSubNetworkDialog",
				size: "dm",
				resolve:{
					params : function(){
						return {network:angular.copy(item)};
					}
				}
			});
			dialog.result.then(function(res){
				if(res){
					get_rows();
				}
			});
		}
	};
	$scope.new_sub_network = function(){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var dialog = $modal.open({
				controller:"newSubNetworkDialog",
				templateUrl:"views/vdi/dialog/network/dataNetwork/new_sub_network.html",
				resolve:{params: function(){
					return angular.copy($scope.cur_network_id);
				}}
			});
			dialog.result.then(function(res){
				if(res){
					get_rows();
				}
			})
		}
	};
	$scope.enableDHCP = function(data){
		var postData = {
			id:data.id,
			name:data.name,
			start_ip:data.start_ip,
			end_ip:data.end_ip,
			netmask:data.netmask,
			gateway_ip: data.gateway_ip,
			dns1:data.dns1,
			dns2:data.dns2
		};
		Network.alter_sub(postData,function(res){
			get_rows();
		},function(){
		});
	};
}])
.controller("vdiDataNetworkIPListController", ["$scope", "$routeParams" ,"$modal","Network","$$$I18N",function($scope, $routeParams,$modal, Network,$$$I18N){
	$scope.rows =[];$scope.loading = true;
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["资源", "网络", "子网","IP池"]);
	$scope.cur_network_id = $routeParams.id;
	$scope.cur_subnet_id = $routeParams.sub_id;

	var get_rows = function(){
		Network.ports_unused_ips({id:$scope.cur_subnet_id},function(res){
			$scope.rows = res.result;
			$scope.loading = false;
		});
	};
	get_rows();
	
	// var fn_address_callback = function(res){
	// 	$scope.rows = res.data.map(function(item){
	// 		item.able = !item.disable;
	// 		return item;
	// 	});
	// 	$scope.loading = false;
	// 	$scope.rows.forEach(function(row){
	// 		var _ip = row.address.split(".");
	// 		row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
	// 	});
	// 	$scope.netmess = res.network;
	// };

	// $scope.pagesize = parseInt(localStorage.netIP_pagesize) || 30;
	// $scope.currentPage = 1;

	// $scope.$watch("pagesize" , function(newvalue){
	// 	newvalue && ( localStorage.netIP_pagesize = newvalue)
	// })
	// network.get({
	// 	id : $routeParams.id
	// }, fn_address_callback, function(err){ 
	// 	location.replace("#resource/network/");
	// 	$.bigBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content : "您所访问的网络IP池不存在",//$$$I18N.get("NOEXSIT_NETWORKIP_TIP")
	// 				timeout : 6000
	// 			});
	// });
	// $scope.parent_id = $routeParams.id;

	// $scope.switchable = function(ascope){
	// 	var item = ascope.item;
	// 	network.delete({ids:item.id} ,function(res){
	// 		network.get({
	// 			id : $routeParams.id
	// 		}, fn_address_callback);
	// 	} , function(){
	// 		network.get({
	// 			id : $routeParams.id
	// 		}, fn_address_callback);
	// 	})
	// };

	// $scope.sortUsed = function(order){
	// 	$scope.rows.sort(function(a, b){
	// 		return (a._ip > b._ip) ? 1 : -1;
	// 	});
	// 	var a = $scope.rows.filter(function(row){
	// 		return row.has_used;
	// 	});
	// 	a.forEach(function(row){
	// 		$scope.rows.splice($scope.rows.indexOf(row), 1);
	// 	});
	// 	$scope.rows.unshift.apply($scope.rows, a);
	// 	if(order){
	// 		$scope.rows.reverse();
	// 	}
	// };
	// $scope.sortUser = function(order){
	// 	$scope.rows.sort(function(a, b){
	// 		return (a.assignOwner > b.assignOwner) ? 1 : -1;
	// 	});
	// 	//assignOwner
	// };
	// $scope.sortAllocated = function(order){
	// 	$scope.rows.sort(function(a, b){
	// 		return (a._ip > b._ip) ? 1 : -1;
	// 	});
	// 	var a = $scope.rows.filter(function(row){
	// 		return row.allocated;
	// 	});
	// 	a.forEach(function(row){
	// 		$scope.rows.splice($scope.rows.indexOf(row), 1);
	// 	});
	// 	$scope.rows.unshift.apply($scope.rows, a);
	// 	if(order){
	// 		$scope.rows.reverse();
	// 	}
	// };
	// $scope.sortIP = function(order){
	// 	$scope.rows.sort(function(a, b){
	// 		return (a._ip > b._ip) ? 1 : -1;
	// 	});
	// 	if(order){
	// 		$scope.rows.reverse();
	// 	}
	// };
}])

//dialog controller
.controller("newNetworkDialog", ["$scope", "$modalInstance", "Network", "$$$I18N", "HostManage", "Listswitchs",
	function($scope, $modalInstance, Network, $$$I18N, HostManage, Listswitchs){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.network = {};
	$scope.loadding = false;

	$scope.close = function(){
		$modalInstance.close();
	};

	// HostManage.physic_netword_info(function(res){
	// 	$scope.physic_nets = res.result;
	// 	$scope.network.physic_net = $scope.physic_nets[0];
	// });
	var switches = [];
	Listswitchs.query(function(res){
		switches = res.result;
		$scope.getSwitch($scope.network.type);
	});
	$scope.getSwitch = function(type){
		$scope.network.switches = switches.filter(function(item){ return item.type == type });
		$scope.network.switch = $scope.network.switches[0];
	};

	$scope.ok = function () {
		var postData = {};
		$scope.loadding = true;
		var _netData = $scope.network;

		postData.name = _netData.name;
		postData.type = _netData.type;
		postData.create_subnet = _netData.has_sub;
		postData.switch_name = _netData.switch.name;
		postData.switch_type = _netData.switch.type;
		postData.switch_uuid = _netData.switch.uuid;
		if(postData.type === 'vlan'){
			postData.vlan_id = _netData.vlanid;
			postData.physical_network = "public";
		}
		if(postData.type === 'flat'){
			postData.physical_network = _netData.physic_net;
		}
		if(postData.create_subnet){
			postData.subnet_name = _netData.sub_name;
			postData.start_ip = _netData.dhcp_start;
			postData.end_ip = _netData.dhcp_end;
			postData.netmask = _netData.netmask;
			postData.gateway = _netData.gateway;
			postData.dns1 = _netData.dns1;
			postData.dns2 = _netData.dns2;
		}
		Network.add(postData,function(res){
			$modalInstance.close();
			Network.query(function(res){
				$scope.rows.splice(0,$scope.rows.length);
				[].push.apply($scope.rows,res.networks.sort(function(a,b){ return a.name > b.name}));
			});
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
}])
.controller('newSubNetworkDialog', ['$scope','Network','params','$modalInstance', function($scope,Network,params,$modalInstance){
	//新增子网
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.network = {};
	$scope.loadding = false;
	$scope.ok = function(){
		$scope.loadding = true;
		var _netData = $scope.network;
		var postData = {
			id:params,
			name:_netData.name,
			start_ip:_netData.dhcp_start,
			end_ip:_netData.dhcp_end,
			netmask:_netData.netmask,
			gateway_ip: _netData.gateway,
			dns1:_netData.dns1,
			dns2:_netData.dns2
		};
		Network.add_sub(postData,function(res){
			$modalInstance.close(res);
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('alterNetworkDialog', ['$scope', 'params',"$modalInstance","Network",function($scope,params,$modalInstance,Network){
	$scope.min_namelength=2;$scope.max_namelength=20;
	var oldName = params.network.name;
	$scope.network = params.network;
	$scope.loadding = false;
	$scope.isUnchanged = function(){
		return angular.equals($scope.network.name,oldName);
	}
	$scope.ok = function(){
		$scope.loadding = true;
		Network.alter({name:$scope.network.name,id:$scope.network.id},function(res){
			$modalInstance.close(res);
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('alterSubNetworkDialog', ['$scope','params',"$modalInstance","Network", function($scope,params,$modalInstance,Network){
	// 修改子网
	$scope.min_namelength=2;$scope.max_namelength=20;
	var _net = params.network;console.log(555555555, _net)
	$scope.network = {
		id:_net.id,
		name:_net.name,
		dhcp_start: _net.start_ip,
		dhcp_end:_net.end_ip,
		netmask:_net.netmask,
		gateway:_net.gateway_ip,
		dns1:_net.dns_nameservers[0],
		dns2:_net.dns_nameservers[1]
	};
	$scope.title_type = 'update';
	$scope.close = function(){
		$modalInstance.dismiss();
	};
	$scope.ok = function(){
		$scope.loadding = true;
		var _netData = $scope.network;
		var postData = {
			id:_netData.id,
			name:_netData.name,
			start_ip:_netData.dhcp_start,
			end_ip:_netData.dhcp_end,
			netmask:_netData.netmask,
			gateway_ip: _netData.gateway,
			dns1:_netData.dns1,
			dns2:_netData.dns2
		};
		Network.alter_sub(postData,function(res){
			$modalInstance.close(res);
		}).$promise.finally(function(){
			$scope.loadding = false;
		});
	};
}])