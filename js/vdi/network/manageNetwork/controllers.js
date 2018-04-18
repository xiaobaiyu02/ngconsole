angular.module("vdi.network.manageNetwork", [])
.factory("Manage", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/management_networks", null, {
		query: { method: "GET", isArray: false},
		put: { method: "PUT"}
	});
}])
.factory("HostNetworkInfo", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/host/networkInfo", null, {
		query: { method: "GET", isArray: false}
	});
}])
.controller("vdiManageNetworkListController", ["$scope",'$modal','Manage','$interval','Host',function($scope,$modal,Manage,$interval,Host){
	$scope.rows = [];$scope.loading = true;
	$interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("manageNetworkIDS", $scope.rows.filter(item => item.status === 'active').map(it => it.id));
	}, 1000);
	$scope.$on("manage_networksRowsUpdate", function($event, data){
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
	function test_connect(remote_ip, item){
		Host.node_ping({ remote_ip:remote_ip, node_ip:item.ip },function(res){
			item._connect = res.result;
		});
	}
	var get_rows = function(){
		Manage.query(function(res){
			$scope.loading = false;
			$scope.rows = res.result;
			$scope.rows.forEach(function(item){
				item._connect = true;
			});
			var remote_ip = $scope.rows.filter(function(item){ return item.host_type=='controller' })[0].image_ip;
			$scope.rows.forEach(function(item){
				if(item.host_type=='compute' && item.status=='active'){
					test_connect(remote_ip, item);
				}
			});
			if(res.enable_ha){
				$scope.rows.forEach(function(item){
					if(item.host_type=='controller'){item.enable_ha = true;}
				})
			};
			$scope.source_controller_ip = $scope.rows.filter(function(item){ return item.host_type=='controller' })[0].management_ip;
			$scope.img_rows = $scope.rows.filter(function(item){ return item.host_type=='controller' });
			$scope.img_rowsHA = $scope.img_rows.filter(function(item){ return item.enable_ha });
			$scope.manage_rows = $scope.rows.filter(function(item){ return item.status === 'active' });
			$scope.manage_rowsHA = $scope.manage_rows.filter(function(item){ return item.enable_ha });
		});
	};
	get_rows();
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;

	$scope.modify = function(type){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/network/manageNetwork/modifyManageImgNetwork.html",
			controller: "modifyManageImgDialog",
			size: "md",
			scope: $scope,
			resolve:{
				params : function(){
					return { type: type };
				}
			}
		});
		dialog.result.then(function(data){
			if(data){
				get_rows();
			}
		});
	}

}])
.controller('modifyManageImgDialog', ['$scope','$modalInstance', 'HostNetworkInfo', "params", "Manage","maskModel", function($scope,$modalInstance,HostNetworkInfo,params,Manage,maskModel){
	$scope.type = params.type;
	$scope.lists = $scope.type=='image'?$scope.img_rows:$scope.manage_rows;
	$scope.controller_ip = $scope.source_controller_ip;
	$scope.loading = true;
	$scope.lists.forEach(function(item, i){
		HostNetworkInfo.query({id: item.host_id}, function(res){
			var bondNetworks = res.bond_networks.filter(function(network){ return network.ips.length!==0; });
			var networks = res.networks.filter(function(network){ return network.ips.length!==0; });
			item.allNetworks = networks.concat(bondNetworks);
			item.allNetworks.forEach(function(data){
				data.IP = [];
				for(var i=0; i<data.ips.length; i++){
					data.IP.push({ip: data.ips[i], mask: data.netmasks[i], editable: data.ips_editable[i]});
				}
			});
			item._selectNetwork = item.allNetworks.filter(function(n){ return n.name == item[$scope.type+'_dev'] })[0];
			item._selectIP = item._selectNetwork && item._selectNetwork.IP.filter(function(n){ return n.ip == item[$scope.type+'_ip'] })[0];

			if(i==$scope.lists.length-1){
				$scope.loading = false;
			}
		});
	});
	$scope.changeIP = function(host){
		$scope.lists.forEach(function(item){
			if(item.host_name == host.host_name){
				item._selectIP = item._selectNetwork && item._selectNetwork.IP[0];
			}
		});
	};

	$scope.isUnchanged = function(){
		var flag = true;
		$scope.lists.forEach(function(list){
			if(list._selectNetwork && list._selectIP){
				var host = $scope.rows.filter(function(item){ return item.host_name == list.host_name })[0];
				if(host._selectNetwork && host._selectIP){
					if(list._selectNetwork.name !== host[$scope.type+'_dev'] || list._selectIP.ip !== host[$scope.type+'_ip'] ){
						flag = false;
					}
				}
			}
		});
		return flag;
	}
	$scope.hasUnselect = function(){
		var flag = false;
		$scope.lists.forEach(function(item){
			if(!item._selectNetwork || !item._selectIP){
				flag = true;
			}
		});
		return flag;
	}

	$scope.ok = function(){
		$scope.loading = true;
		var data = {type: $scope.type, infos: {}, source_controller_ip: $scope.controller_ip};
		$scope.lists.forEach(function(item){
			//只要是主控节点id就传null
			data.infos[item.host_name] = {
				id: item.host_type === 'controller' ? null : item.host_id,
				dev: item._selectNetwork.name,
				ip: item._selectIP.ip,
				netmask: item._selectIP.mask
			}
		});
		Manage.put(data, function(res){
			$scope.loading = false;
			$modalInstance.close();
			maskModel.open(null,"manageNetwork");
			window.ignoreAnyRequestError = true;
		},function(error){ $scope.loading = false; });
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])