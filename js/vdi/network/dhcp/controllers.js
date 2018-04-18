angular.module("vdi.network.dhcp", [])
.factory("DHCP", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/dhcp", null, {
		query: { method: "GET", isArray: false},
		update: { method: "POST"}
	});
}])
.controller("vdiDHCPController", ["$scope",'$modal','DHCP',function($scope,$modal,DHCP){
	var DHCPCtrl = this;
	DHCPCtrl.data = {};
	var initData = {
		start: '192.168.68.50',
		end: '192.168.68.254',
		netmask: '255.255.255.0',
		gateway: '192.168.68.1',
		dns: ['114.114.114.114']
	}

	DHCPCtrl.changeModify = function(val){
		DHCPCtrl.updateDHCP(true);
	}
	DHCPCtrl.loadDHCP = function(){
		DHCP.query(function(res){
			DHCPCtrl.data.enable_dhcp = res.enable_dhcp;
			// 第一次没有值传默认值
			// if(!res.enable_dhcp && res.start==''){
			// 	for(var i in initData){
			// 		if(i=='dns'){
			// 			DHCPCtrl['data'][i] = initData[i][0];
			// 		}else{
			// 			DHCPCtrl['data'][i] = initData[i]
			// 		}
			// 	}
			// }else{
				for(var i in res){
					if(i!=='code'){
						if(i=='dns'){
							DHCPCtrl['data'][i] = res[i][0];
						}else{
							DHCPCtrl['data'][i] = res[i]
						}
					}
				}
			// }

		},function(){})
	}
	DHCPCtrl.loadDHCP();
	DHCPCtrl.updateDHCP = function(onlyEnable){
		var postData = { enable_dhcp: DHCPCtrl.data.enable_dhcp };
		if(DHCPCtrl.data.enable_dhcp){
			//第一次没有值传默认值
			if(DHCPCtrl.data.start==''){
				for(var i in initData){
					if(i=='dns'){
						DHCPCtrl['data'][i] = initData[i][0];
					}else{
						DHCPCtrl['data'][i] = initData[i]
					}
				}
			}else{
				for(var i in initData){
					postData[i] = DHCPCtrl['data'][i];
				}
			}
		};
		if(onlyEnable){
			DHCPCtrl.enabling = true;
			DHCP.update(postData,function(res){
				DHCPCtrl.enabling = false;
				DHCPCtrl.loadDHCP();
				if(!DHCPCtrl.data.enable_dhcp){
					DHCPCtrl.modify = false;
				}
			},function(){ DHCPCtrl.enabling = false; })
		}
		else{
			DHCPCtrl.updating = true;
			DHCP.update(postData,function(res){
				DHCPCtrl.modify = false;
				DHCPCtrl.updating = false;
			},function(){ DHCPCtrl.updating = false; })
		}
	}
}])
