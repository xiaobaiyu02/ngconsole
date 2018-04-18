angular.module("vdi.network.virtualSwitch", [])
.factory("Switch", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/switchs", null, {
		query: { method: "GET", isArray: false},
		add: { method: "POST"},
		put: { method: "PUT"},
		delete: { method: "DELETE"}
	});
}])
.factory("SwitchItem", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/switch", null, {
		query: { method: "GET", isArray: false},
		put: { method: "PUT"},
		add: { method: "POST"},
		delete: { method: "DELETE"}
	});
}])
.factory("Switchdevice", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/list_devices_for_switch", null, {
		query: { method: "GET", isArray: false}
	});
}])
.factory("AvailableNodes", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/list_available_nodes_for_switch", null, {
		query: { method: "GET", isArray: false}
	});
}])
.controller("vdiVirtualSwitchListController", ["$scope",'$modal',"Switch", "isHAEnabled", "$$$I18N",function($scope,$modal,Switch, isHAEnabled,$$$I18N){
	$scope.hasHA_loading = true;
	isHAEnabled().then(function(enabled){
		$scope.hasHA_loading = false;
        $scope.hasHA = enabled;
    });
	$scope.rows = [];$scope.loading = true;

	var get_rows = function(){
		Switch.query(function(res){
			$scope.rows = res.result;
			$scope.rows.map(function(item){ item.decodeName = encodeURIComponent(item.name) })
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
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/virtualSwitch/addVirtualSwitch.html",
				controller: "addVirtualSwitchDialog",
				size: "md"
			});
			dialog.result.then(function(res){
				if(res){
					get_rows();
				}
			});
		}
	}

	$scope.edit = function(){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var virtualSwitch = this.item;
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/virtualSwitch/editVirtualSwitch.html",
				controller: "editVirtualSwitchDialog",
				scope: $scope,
				size: "md",
				resolve:{
					params : function(){
						return { virtualSwitch: angular.copy(virtualSwitch) };
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
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除分布式虚拟交换机'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_VIRTUALSWITCH'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						$scope.loading = true;
						Switch.delete({name:item.name},function(res){
							get_rows();
							$modalInstance && $modalInstance.close();
						}).$promise.finally(res => {
							$scope.loading = false;
						});
					}
					$scope.close = function(){
						$modalInstance.close();
					};
				},
				size : "sm"
			});
		}
	};
}])
.controller('editVirtualSwitchDialog', ['$scope', 'params',"$modalInstance","Switch", "Switchdevice",function($scope,params,$modalInstance,Switch,Switchdevice){
	$scope.virtualSwitch = params.virtualSwitch;
	console.log($scope.virtualSwitch);
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.querySwitchdevice = function(type){
		$scope.loading_hosts = true;
		Switchdevice.query({ type: type },function(res){
			$scope.loading_hosts = false;
			$scope.hosts = res.result.filter(function(host){ return host.status === 'active' });
			$scope.hosts.forEach(function(item){
				var host = $scope.virtualSwitch.hosts.filter(function(host){ return host.host == item.hostname })[0];
				if(host){
					if(host.dev!==''){ item.devs.push(host.dev); };
					item._dev = host.dev;
				}
			})
		});
	};
	$scope.querySwitchdevice($scope.virtualSwitch.type);


	$scope.ok = function(){
		$scope.loading = true;
		var hosts = [];
		$scope.hosts.forEach(function(item){
			hosts.push({host_id: item.host_id, dev: item._dev?item._dev:""});
		});
		Switch.put({
			name: $scope.virtualSwitch.name,
			description: this.virtualSwitch.description,
			type: $scope.virtualSwitch.type,
			hosts: hosts
		},function(res){
			$scope.loading = false;
			$modalInstance.close(res);
		},function(){ $scope.loading = false; })
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('addVirtualSwitchDialog', ['$scope',"$modalInstance","Switchdevice","Switch",function($scope,$modalInstance,Switchdevice,Switch){
	$scope.type = 'flat';
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.querySwitchdevice = function(type){
		$scope.loading_hosts = true;
		Switchdevice.query({ type: type },function(res){
			$scope.loading_hosts = false;
			$scope.hosts = res.result.filter(function(host){ return host.status === 'active' });
			$scope.hosts.forEach(function(item){
				item._dev = item.devs[0];
			})
		});
	}
	$scope.querySwitchdevice($scope.type);

	$scope.ok = function(){
		$scope.loading = true;
		var hosts = [];
		$scope.hosts.forEach(function(item){
			hosts.push({host_id: item.host_id, dev: item._dev?item._dev:""});
		});
		Switch.add({
			name: this.name,
			description: this.description,
			type: this.type,
			hosts: hosts
		},function(res){
			$scope.loading = false;
			$modalInstance.close(res);
		},function(){
			$scope.loading = false;
		})
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])

.controller("vdiVirtualSwitchItemController", ["$scope",'$modal',"Switch","SwitchItem","isHAEnabled","$$$I18N",function($scope,$modal,Switch,SwitchItem,isHAEnabled,$$$I18N){
	$scope.hasHA_loading = true;
	isHAEnabled().then(function(enabled){
		$scope.hasHA_loading = false;
        $scope.hasHA = enabled;
    });
	
	var $hashstr = location.hash.substr(1) || "";
	var $hash = $hashstr.replace(/^\/+/, "").split("&");
	$scope.hostName = decodeURIComponent($hash[0].slice($hash[0].lastIndexOf("#")+1));
	$scope.type = $hash[1];

	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["网络管理", "分布式虚拟交换机", $scope.hostName]);

	$scope.rows = [];

	var get_rows = function(){
		$scope.loading = true;
		$scope.rows.splice(0);
		SwitchItem.query({switch_name: $scope.hostName}, function(res){
			for(var i in res.result){
				$scope.rows.push({
					'pool': i,
					'hosts': res.result[i]
				});
			}
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
			var virtualSwitchItem = this.host;
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/virtualSwitch/addVirtualSwitchItem.html",
				controller: "addVirtualSwitchItemDialog",
				scope: $scope,
				size: "md"
			});
			dialog.result.then(function(data){
				if(data){
					get_rows();
				}
			});
		}
	}
	$scope.edit = function(){
		if($scope.hasHA){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("ENABLEHA_TIP"),
				timeout	: 6000
			});
		}else{
			var virtualSwitchItem = this.host;
			var dialog = $modal.open({
				templateUrl: "views/vdi/dialog/network/virtualSwitch/editVirtualSwitchItem.html",
				controller: "editVirtualSwitchItemDialog",
				scope: $scope,
				size: "md",
				resolve:{
					params : function(){
						return { virtualSwitchItem: angular.copy(virtualSwitchItem) };
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
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除关联主机'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_VIRTUALSWITCHITEM'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' data-ng-click='ok()' ng-if='!loading' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' ng-if='!loading'  style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						$scope.loading = true;
						SwitchItem.delete({switch_name: _SCOPE.hostName, host_id:item.host_id},function(res){
							get_rows();
							$modalInstance && $modalInstance.close();
						}).$promise.finally(res => {
							$scope.loading = false;
						});
					}
					$scope.close = function(){
						$modalInstance.close();
					};
				},
				size : "sm"
			});
		}
	};
}])
.controller('editVirtualSwitchItemDialog', ['$scope',"$modalInstance","params","Switchdevice","SwitchItem",function($scope,$modalInstance,params,Switchdevice,SwitchItem){
	$scope.item = params.virtualSwitchItem;
	$scope.loading_hosts = true;
	$scope.old_dev = params.virtualSwitchItem.dev
	$scope.querySwitchdevice = function(type, node_id){
		$scope.loading_hosts = true;
		Switchdevice.query({ type: type, node_id: node_id },function(res){
			$scope.loading_hosts = false;
			$scope.item.devs = res.result.filter(function(host){ return host.status === 'active' && host.host_id == $scope.item.host_id })[0].devs;
			if($scope.item.dev!==""){
				$scope.item.devs.push($scope.item.dev);
			}
		});
	};
	$scope.querySwitchdevice($scope.type);
	
	$scope.ok = function(){
		$scope.loading = true;
		SwitchItem.put({
			switch_name: $scope.hostName,
			host_id: $scope.item.host_id,
			dev: $scope.item.dev?$scope.item.dev:""
		},function(res){
			$scope.loading = false;
			$modalInstance.close(res);
		},function(){
			$scope.loading = false;
		});
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('addVirtualSwitchItemDialog', ['$scope',"$modalInstance","SwitchItem","Switchdevice","AvailableNodes",function($scope,$modalInstance,SwitchItem,Switchdevice,AvailableNodes){
	$scope.item = {pools: [], devs: []};
	let relateHosts = [];
	$scope.loading_hosts = true;
	Switchdevice.query({ type: $scope.type },function(res){
		$scope.loading_hosts = false;
		relateHosts = res.result.filter(function(host){ return host.status === 'active' });
		$scope.queryPool($scope.hostName);
	});
	$scope.queryPool = function(name){
		AvailableNodes.query({switch_name: name}, function(res){
			for(var i in res.result){
				var hosts = res.result[i].filter(function(host){ return host.status==='active' });
				$scope.item.pools.push({name: i, hosts: hosts});
			};
			$scope.item.pool = $scope.item.pools[0];
			$scope.changePool();
		});
	};
	$scope.changePool = function(){
		if($scope.item.pool){
			$scope.item.host = $scope.item.pool.hosts[0];
			if($scope.item.host){
				$scope.changeHost();
			}
			else{ $scope.loading_hosts = false; }
		}
		else{ $scope.loading_hosts = false; }
	}
	$scope.changeHost = function(){
		if($scope.item.host){
			$scope.item.devs = relateHosts.filter(function(host){ return host.host_id == $scope.item.host.host_id })[0].devs;
			$scope.item.dev = $scope.item.devs[0];			
		}
	}
	
	$scope.ok = function(){
		$scope.loading = true;
		SwitchItem.add({
			switch_name: $scope.hostName,
			host_id: $scope.item.host.host_id,
			dev: $scope.item.dev?$scope.item.dev:""
		},function(res){
			$scope.loading = false;
			$modalInstance.close(res);
		},function(){
			$scope.loading = false;
		});
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
