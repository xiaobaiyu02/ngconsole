angular.module("vdi.system", [])

/* 系统 */
.factory("SystemISO", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/isos", null, {
		query: { method: "GET", isArray: false},
		update: { method: "PUT" }
//        loadISO: {method: "POST", url:  $Domain + "/thor/image/loadISO"}
	});
}])
.factory("FenTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image?type_code=3&type_code=4&type_code=5", isArray: false }
	});
}])
.factory("PuTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/4", isArray: false }
	});
}])
.factory("addTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "get", url: $Domain + "/thor/image/register" },
		update:
			{ method: "POST", url: $Domain + "/thor/image/register" }
	});
}])
.factory("SystemDesktop", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/sysInsts", null, {
		get_instances:{ method: "GET", url: $Domain + "/thor/sysInsts/:id",params:{id:"@id"}},
		add_instances:{ method: "POST", url: $Domain + "/thor/sysInsts/:id",params:{id:"@id"}},
		config_instances:{ method: "PUT", url: $Domain + "/thor/sysInst/:id",params:{id:"@id"}},
		config_template:{ method: "PUT", url: $Domain + "/thor/create_distribute_template"},
		get_devices:{ method:"POST", url: $Domain + "/thor/get_pci_devices"},
		register:{ method:"POST", url: $Domain + "/thor/register_system_template" },
		add:{ method:"POST", url: $Domain + "/thor/system_template" },
		edit:{ method:"PUT", url: $Domain + "/thor/system_template" }
	});
}])
.factory("SystemBackup", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/admin/backup", null, {
		query: { method: "GET", isArray: false},
		backup:
			{ method: "POST"},
		restore :
			{ method: "POST"},
		delete :
			{ method: "DELETE"},
		get_config : 
			{ method: "GET", url: $Domain + "/thor/admin/backup_config"},
		alter_config:
			{ method: "PUT", url: $Domain + "/thor/admin/backup_config"}
	});
}])

.factory("SystemUpgrade", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/admin/upgrade", null, {
		query: { method: "GET", isArray: false},
		upload: { method: "POST"},
		upgrade:
			{ method: "PUT" },
		delete :
			{ method: "DELETE"}

	});
}])
.factory("SystemLog", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/log", null, {
		query: { method: "GET", isArray: false},
		delete :
			{ method: "DELETE"}
	});
}])
.factory("SystemUSB", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/usb", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" },
		update: { method: "PUT" },
		delete: { method: "DELETE"}
	});
}])
.factory("CreateDistribute", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/create_distribute_template", null, {
		post: { method: "POST"}
	});
}])
.factory("Outside", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/haproxy", null, {
		query: { method: "GET", url: $Domain + "/thor/haproxy/info", isArray: false },
		start: { method: "POST", url: $Domain + "/thor/haproxy/start" },
		stop: { method: "POST", url: $Domain + "/thor/haproxy/stop" },
		save: { method: "POST", url: $Domain + "/thor/haproxy/save" }
	});
}])
//系统资源回收接口
.factory('RecycleTech', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/recycle/public", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" }
	});
}])
.factory('RecyclePer', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/recycle/person", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" }
	});
}])
//系统时间同步接口
.factory('SystemTime', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/system-time", null, {
		getInternetSync: { method: "GET", url: $Domain + "/thor/system-time/internet", isArray: false}, // 获取Internet时间服务器同步
		internetSync: { method: "POST", url: $Domain + "/thor/system-time/internet"}, // 与Internet时间服务器同步
		querySyncServer: { method: "GET", url: $Domain + "/thor/system-time/sync", isArray: false }, // 获取同步服务列表
		updateSyncServer: { method: "POST", url: $Domain + "/thor/system-time/sync"}, // 立即同步
		queryZone: { method: "GET", url: $Domain + "/thor/system-time", isArray: false }, // 系统当前时间，以及时区列表
		updateZone: { method: "POST", url: $Domain + "/thor/system-time"} // 更新操作系统时区、日期、时间
		
	});
}])
// 快速部署
.factory('SystemDeploy', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/init", null, {
		quickstart: {method: "GET", url: $Domain + "/thor/init/quickstart"},
		query_data_network: {method: "GET", url: $Domain + "/thor/networks"},
		// 导入模板镜像
        scan_iso: {method: "GET", url: $Domain + "/thor/init/prepare_import_img"},
        import_iso: {method: "POST", url: $Domain + "/thor/init/prepare_import_img"},
        complete_import: {method: "POST", url: $Domain + "/thor/init/import_img"},
        import_progress: {method: "POST", url: $Domain + "/thor/init/check_file"},
        // 注册教学模板
        list_system_images: { method: "get", url: $Domain + "/thor/image/register" },
        list_sub_networks: { method: "GET", url:$Domain + "/thor/network/:id/subnets", params: { id: "@id" }},
        list_ports: { method: "GET", url:$Domain + "/thor/network/subnet/:id/ports", params: { id: "@id" }},
        register_template: {method: "POST", url: $Domain + "/thor/init/regit_template"},
        // 创建教学场景
        create_scene: {method: "POST", url: $Domain + "/thor/init/create_mode"},
        first_deploy: {method: "GET", url: $Domain + "/thor/init/first_deploy"},
        //系统模块快速部署的界面展现
        quick_deploy_page:{method:"GET",url:$Domain + "/thor/controller/ha_storage_state"}
    });
}])
.factory('AutoSnapshot', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/admin/auto_snapshot", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" },
		update: { method: "PUT", url: $Domain + "/thor/admin/auto_snapshot/detail/:id", params: { id: "@id" } },
		active: { method: "POST", url: $Domain + "/thor/admin/auto_snapshot/detail/:id", params: { id: "@id" } },
		delete: { method: "DELETE"}
	});
}])
.factory('USBPassThrough', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/admin/thor/usb_pass_through", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" },
		cancel: { method: "DELETE"}
	});
}])
.factory('TreeInstances', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/tree_instances", null, {
		query: { method: "GET", isArray: false}
	});
}])
.factory('Spice', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/spice_image_compression", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" }
	});
}])
.factory('Share', ["$resource","$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/share/settings", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" }
	});
}])
.controller("vdiSystemDesktopListController", ["$scope", "$modal", "SystemDesktop", "FenTemplate", "PuTemplate", "$$$os_types", "$Domain", "$interval","$$$I18N",function($scope, $modal, SystemDesktop, FenTemplate, PuTemplate, $$$os_types, $Domain, $interval,$$$I18N){
	$scope.domain = $Domain;
	$scope.rows = [];
	
	$scope.images = [];
	$scope.loading = true;

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

    $interval(function(){
    	$scope.rows && $scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows.map(function(item){ return item.id }));
    }, 1000);
    $scope.$on("imagesRowsUpdate", function($event, data){
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
    	$scope.rows.forEach(function(row){
    		var updateInfor = row.sync_status && row.sync_status.filter(function(item){ return item.type === "image" });
    		if(updateInfor && updateInfor.length!==0)
    			row.updateSize = (updateInfor[0].size/1024/1024/1024).toFixed(2);
    	})

    });
    $scope.editSysdesktop = function(item){
    	var ins = $modal.open({
    		templateUrl:"views/vdi/dialog/system/template_config.html",
    		controller:"systemTemplateConfigDialog",
    		size:"lg",
    		resolve:{param: function(){ return item }}
    	});
    	ins.result.then(function(){
    		// $scope.changeType($scope.select);
    	});
    }
    function get_rows(){
    	FenTemplate.query(function(res){
    		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);

    		$scope.rows.forEach(function(row){
    			var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
    			os && os.icon && (row.icon = os.icon);
    			if(row.os_type && row.os_type.indexOf("_64")>-1)
    				row.os_type = row.os_type.slice(0,row.os_type.indexOf("_64"));
    			if(row.os_type && row.os_type.indexOf("(64 bit)")>-1)
    				row.os_type = row.os_type.slice(0,row.os_type.indexOf("(64 bit)"));
    		});
    		$scope.rows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
    		$scope.running = res.running;
    		$scope.shutoff = res.shutoff;
    		$scope.sync_mode = res.sync_mode;
    		$scope.loading = false;
    		$scope.teachNames = $scope.rows.map(function(item){ return item.name });
    		$scope.sameName = false;
    	});
    }
    get_rows();

	var _controllerScope = $scope;
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除系统桌面'>删除系统桌面"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_SYSDESK_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance,$q){
				$scope.name = rows.map(function(row){ return row.name }).join(', ');
				$scope.ok = function(){
					FenTemplate.delete({ id: rows.map(function(item){ return item.id }) },function(res){
						rows.forEach(function(row){
							_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
						});
					},function(error){
						template.query(function(res){
							var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
							newRows.forEach(function(row){
								var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
								os && os.icon && (row.icon = os.icon);
								if(row.os_type.indexOf("_64")>-1)
									row.os_type = row.os_type.slice(0,row.os_type.indexOf("_64"));
								if(row.os_type.indexOf("(64 bit)")>-1)
									row.os_type = row.os_type.slice(0,row.os_type.indexOf("(64 bit)"));

							});
							newRows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows,newRows);
						});
					});
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};
}])
.controller("addTemplateDialog", [
"$scope", "$modalInstance", "Admin", "addTemplate", "$$$os_types", "UserRole", "FenTemplate", "PuTemplate", "ResourcePool", "Host","Network", "SystemISO", "SystemDesktop", "$filter","CreateDistribute","virtualHost","$$$I18N",
function($scope, $modalInstance, admin, addTemplate, $$$os_types, UserRole, FenTemplate, PuTemplate, ResourcePool, host, Network, iso, SystemDesktop, $filter, CreateDistribute, virtualHost, $$$I18N){
	let user = UserRole.currentUser;
	$scope.nets = [];
	$scope.min_namelength=2;
	$scope.max_namelength=20;
	$scope.vcpus = 1;
	$scope.ram = 32;
	$scope.system_gb = 10;
	$scope.local_gb = 5;
	
	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	$scope.get_host = function(uuid){
		host.query_agent({ id:uuid },function(res){
			$scope.hosts = res.hosts_list.filter(function(h){ return h.status === 'active'});
			$scope.node = $scope.hosts[0];
			$scope.get_devices($scope.node.host);
		});
	}
	ResourcePool.query(function(res){
		$scope.pools = res.result.filter(function(item){ return item.hosts.length > 0 && item.type=='kvm' });
		if($scope.pools.length){
			$scope.source_pool = $scope.pools[0];
			$scope.get_host($scope.source_pool.uuid);			
		}
		else{
			$scope.hosts = [];
		}
	});

	$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
	$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
	function getNetwork(key){
		$scope.loading = true;
		Network.query(function(data){
			if(data.networks.length){
				$scope.nets.push({key: key, networks: data.networks, network: data.networks[0]});
				$scope.get_subnet(data.networks[0], key);
			}
		});
	}
	getNetwork(new Date());
	$scope.get_subnet = function(network, key){
		if(network.subnets.length){
			Network.query_sub({
				id:network.id
			},function(res){
				var subnetworks = [];
				subnetworks = res.result.map(function(n){
					n._desc = n.start_ip ?(n.name + " (" + n.start_ip +" - "+ n.end_ip + ") ") :  n.name;
					return n;
				});
				$scope.nets.forEach(function(item){
					if(item.key===key){
						item.subnetworks = subnetworks;
						item.subnetwork = subnetworks[0];
						$scope.clearBindIp(key);
					}
				});
				$scope.loading = false;
			});
		}else{
			$scope.loading = false;
			$scope.nets.forEach(function(item){
				if(item.key===key){
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(key);
				}
			});
		}
	};
	$scope.clearBindIp = function(key){
		$scope.nets.forEach(function(item){
			if(item.key===key){
				if(item.subnetwork){
					item.IPmodes = $scope.IPmodes2;
				}else{
					item.IPmodes = $scope.IPmodes1;
				}
				item.IPmode= item.IPmodes[0];
				item.ip = null;
			}
		});
	};

	$scope.host_loading = true;
	
	$scope.get_devices = function(hostname){
		SystemDesktop.get_devices({host:hostname},function(res){
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function(item){ return item.status === "available"});
		});
	};
	$scope.selectAllHost = function(bool){
		$scope.devices.map(function(item){
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function(){
		$scope.is_all = $scope.devices.every(function(item){
			return item._selected === true;
		});
	};

	iso.query(function(res){
		$scope.isos = res.isos.filter(function(iso){ return iso.os_type && iso.type!=="package" && iso.type!=="other" });
		$scope.isos.forEach(function(item){
			item.os_type = item.os_type.split(",");
		});
		$scope.iso = $scope.isos[0];
	});

	$scope.addNet = function(){
		getNetwork(new Date());
	};
	$scope.minusNet = function(i){
		var idx = $scope.nets.indexOf(i)
		$scope.nets.splice(idx,1);
	};
	var newWindow;
	setTimeout(function(){
		$("#finish").on('click',function(){
		    newWindow = window.open('templateModifybt.html#0');
		})
	});

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array){
		var flag = false;
		array.forEach(function(item, index){
		 for(var i=index+1; i<array.length; i++){
			console.log(array[index],array[i]);
			if(array[index]['subnetwork'] && array[i]['subnetwork'] && array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']){
				flag = true;
			}
		  }
		});
		return flag;
	}
	$scope.ok = function(){
		$scope.devices_selected = $filter("selectedFilter")($scope.devices);
		// if($scope.devices_selected.length!==0){
			var me = this;
			$scope.submiting = true ;
			$scope.afterSubmiting =false ;
			var postData = {
				display_name: this.display_name,
				type_code: this.type,
				source_pool: this.source_pool.uuid,
				node: this.node.id,
				network: this.nets.map(function(item){ if(!item.network.id) return ""; else return item.network.id }),
				subnet: this.nets.map(function(item){ if(!item.subnetwork) return ""; else return item.subnetwork.id }),
				band_ip: this.nets.map(function(item){ if(!item.ip) return ""; else return item.ip }),
				iso_path:this.iso.name,
				iso_id:this.iso.id,
				vcpus: this.vcpus,
				ram: this.ram*1024,
				pci_devices_node:$scope.devices_selected.map(function(item){ return item.compute_node_id }),
				pci_devices_address:$scope.devices_selected.map(function(item){ return item.address}),
				system_gb: this.system_gb,
				local_gb: this.local_gb,
				start_on_host_boot: this.start_on_host_boot,
				virtual_type: this.source_pool.type
			};
			//需求1651,新增和编辑模板都在新打开的vnc页面提示IP重复
			// if(giveTip(this.nets)){
			// 	$.bigBox({
			// 		title: $$$I18N.get("INFOR_TIP"),
			// 		content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
			// 		timeout:6000
			// 	});
			// }
			SystemDesktop.add(postData, function(res){
				var alertFlag = giveTip(me.nets);
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				FenTemplate.query(function(res){
					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
					newRows.forEach(function(row){
						var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
						os && os.icon && (row.icon = os.icon);
					});
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,newRows);
					var template = $scope.rows.filter(function(temp){ return temp.name ==  postData.display_name})[0];
					if(res.sync_mode==='scp')
						newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name + '&sytem_desktop'+'&sameIp='+alertFlag);
					else
						newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name + '&sytem_desktop'+'&sameIp='+alertFlag);
				});
				$modalInstance.close();
			},function(res){
				newWindow.close();
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
		// }

	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("systemTemplateRegisterDialog", [
"$scope", "$modalInstance", "Admin", "addTemplate", "$$$os_types", "UserRole", "FenTemplate", "PuTemplate", "ResourcePool", "Host","Network", "SystemISO", "SystemDesktop", "$filter","CreateDistribute","virtualHost","$$$I18N","registerTemplate",
function($scope, $modalInstance, admin, addTemplate, $$$os_types, UserRole, FenTemplate, PuTemplate, ResourcePool, host, Network, iso, SystemDesktop, $filter, CreateDistribute, virtualHost, $$$I18N, registerTemplate){
	let user = UserRole.currentUser;
	$scope.nets = [];
	$scope.min_namelength=2;
	$scope.max_namelength=20;
	$scope.vcpus = 1;
	$scope.ram = 32;
	$scope.system_gb = 10;
	$scope.local_gb = 5;

	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	$scope.get_host = function(uuid){
		host.query_agent({ id:uuid },function(res){
			$scope.hosts = res.hosts_list.filter(function(h){ return h.status === 'active'});
			$scope.node = $scope.hosts[0];
			$scope.get_devices($scope.node.host);
		});
	}
	ResourcePool.query(function(res){
		$scope.pools = res.result.filter(function(item){ return item.hosts.length > 0 && item.type=='kvm' });
		if($scope.pools.length){
			$scope.source_pool = $scope.pools[0];
			$scope.get_host($scope.source_pool.uuid);			
		}
		else{
			$scope.hosts = [];
		}
	});

	registerTemplate.query(function(res){
		$scope.sys_isos = res.system_image.filter(function(item){ return item.virtual_type=='kvm' });
		$scope.sys_iso = res.system_image[0];
		$scope.old_data_isos = res.data_image;
		if($scope.sys_iso){
			$scope.getDataImgs($scope.sys_iso);
		}
	})
	$scope.filterDataISO = function(data_iso, data_iso2){
		if(data_iso){
			$scope.data_isos2 = $scope.data_isos.filter(function(item){ return item.name !== data_iso.name });
		}
		else{
			$scope.data_isos2 = $scope.data_isos;
		}
		if(data_iso2){
			$scope.data_isos1 = $scope.data_isos.filter(function(item){ return item.name !== data_iso2.name });
		}
		else{
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function(systemImg, is_init){
		if(systemImg){
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function(item){ return item.virtual_type == systemImg.virtual_type });
		}
	};

	$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
	$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
	function getNetwork(key){
		$scope.loading = true;
		Network.query(function(data){
			if(data.networks.length){
				$scope.nets.push({key: key, networks: data.networks, network: data.networks[0]});
				$scope.get_subnet(data.networks[0], key);
			}
		});
	}
	getNetwork(new Date());
	$scope.get_subnet = function(network, key){
		if(network.subnets.length){
			Network.query_sub({
				id:network.id
			},function(res){
				var subnetworks = [];
				subnetworks = res.result.map(function(n){
					n._desc = n.start_ip ?(n.name + " (" + n.start_ip +" - "+ n.end_ip + ") ") :  n.name;
					return n;
				});
				$scope.nets.forEach(function(item){
					if(item.key===key){
						item.subnetworks = subnetworks;
						item.subnetwork = subnetworks[0];
						$scope.clearBindIp(key);
					}
				});
				$scope.loading = false;
			});
		}else{
			$scope.loading = false;
			$scope.nets.forEach(function(item){
				if(item.key===key){
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(key);
				}
			});
		}
	};
	$scope.clearBindIp = function(key){
		$scope.nets.forEach(function(item){
			if(item.key===key){
				if(item.subnetwork){
					item.IPmodes = $scope.IPmodes2;
				}else{
					item.IPmodes = $scope.IPmodes1;
				}
				item.IPmode= item.IPmodes[0];
				item.ip = null;
			}
		});
	};

	$scope.host_loading = true;
	
	$scope.get_devices = function(hostname){
		SystemDesktop.get_devices({host:hostname},function(res){
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function(item){ return item.status === "available"});
		});
	};
	$scope.selectAllHost = function(bool){
		$scope.devices.map(function(item){
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function(){
		$scope.is_all = $scope.devices.every(function(item){
			return item._selected === true;
		});
	};

	iso.query(function(res){
		$scope.isos = res.isos.filter(function(iso){ return iso.os_type && iso.type!=="package" && iso.type!=="other" });
		$scope.isos.forEach(function(item){
			item.os_type = item.os_type.split(",");
		});
		$scope.iso = $scope.isos[0];
	});

	$scope.addNet = function(){
		getNetwork(new Date());
	};
	$scope.minusNet = function(i){
		var idx = $scope.nets.indexOf(i)
		$scope.nets.splice(idx,1);
	};

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array){
		var flag = false;
		array.forEach(function(item, index){
		 for(var i=index+1; i<array.length; i++){
			if(array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']){
				flag = true;
			}
		  }
		});
		return flag;
	}

	$scope.ok = function(){
		$scope.devices_selected = $filter("selectedFilter")($scope.devices);
		// if($scope.devices_selected.length!==0){
			var me = this, alertTip;
			alertTip = giveTip(me.nets);
			var postData = {
				display_name: this.display_name,
				type_code: this.type,
				source_pool: this.source_pool.uuid,
				node: this.node.id,
				network: this.nets.map(function(item){ if(!item.network.id) return ""; else return item.network.id }),
				subnet: this.nets.map(function(item){ if(!item.subnetwork) return ""; else return item.subnetwork.id }),
				band_ip: this.nets.map(function(item){ if(!item.ip) return ""; else return item.ip }),
				vcpus: this.vcpus,
				ram: this.ram*1024,
				system_image_file: this.sys_iso,
				data_image_file: this.data_iso?this.data_iso:undefined,
				pci_devices_node:$scope.devices_selected.map(function(item){ return item.compute_node_id }),
				pci_devices_address:$scope.devices_selected.map(function(item){ return item.address}),
				start_on_host_boot: this.start_on_host_boot,
				virtual_type: this.source_pool.type
			};
			if(alertTip){
				$.bigBox({
					title: $$$I18N.get("INFOR_TIP"),
					content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
					timeout:6000
				});
				return false;
			}
			$scope.afterSubmiting =false ;
			$scope.submiting = true ;
			SystemDesktop.register(postData, function(res){
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				FenTemplate.query(function(res){
					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
					newRows.forEach(function(row){
						var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
						os && os.icon && (row.icon = os.icon);
					});
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,newRows);
				});
				$modalInstance.close();
			},function(){
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
		// }

	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("vdiSystemBackupListController", ["$scope","$modal", "SystemBackup", "$Domain",function($scope,$modal, backup, $Domain){
	$scope.rows = [];$scope.loading = true;
	
	$scope.getList = function(){
		backup.query(function(data){
			$scope.allRows = data.ret;
			$scope.rows = data.ret;
			$scope.loading = false;
		})
	};
	$scope.getList();
	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	var controller_scope = $scope;
	$scope.getURL = function(item){
		return $Domain + "/thor/admin/download?file_name=" + item.name;
	};
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(item => item._selected);
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='BACKUP_DE'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='BACKUP_DE_CONTENT'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						backup.delete({name:rows.map(row => row.name)}, function(data){
							controller_scope.getList();
						})
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
	};
	$scope.backup = function(){
		$scope.submitting = true;
		backup.backup({method:"backup"}, function(data){
			controller_scope.getList();
		}).$promise.finally(function(){
			$scope.submitting  = false;
		})
	};
	$scope.config = function(){
		$modal.open({
			controller:"systemBackupConfigController",
			templateUrl:"views/vdi/dialog/system/system_backup_config.html",
			size:"md"
		});
	};
}])
.controller("vdiSystemISOListController", [
	"$scope", "SystemISO", "$modal","$rootScope", "$filter", "$$$os_types","$Domain",
	function($scope, iso, $modal, $rootScope, $filter, $$$os_types,$Domain){
	$$$os_types = $$$os_types.filter(function(type){ return type.key !== 'Windows 7' });
	$scope.rows = [];$scope.loading = true;$scope.domain = $Domain;
	var rows = [];
	function loadIso(){
		iso.query(function(res){
			$scope.rows = res.isos;
			$scope.loading = false;
			var test = /Windows 7/;
			$scope.rows.forEach(function(item){
				//item.os_type = $$$os_types[Math.random() * $$$os_types.length ^ 0].key;
				item.origin_os_type = item.os_type;
				if(item.os_type){
					var type = $$$os_types.filter(function(type){ return type.key === item.os_type; })[0];
					if(type){
						item.os_type = type;
					}else if (test.test(item.os_type)){
						item.os_type = {"key": "Windows 7","value": "Windows 7 series"};
					}
				}
				// item.editable = false;
				item.old_type = item.type;
				item.old_os_type = item.os_type;
				item.type_editable = false;
				item.os_editable = false;
			});
			angular.copy($scope.rows,rows);
			$scope.select = "";
		});		
	}
	loadIso();
	var upload_id = 'system_iso_upload';
	var uploadModal;
	$scope.$on("progress", function(e,size){
		 if(size.id === upload_id){
		 	if(uploadModal){
		 		uploadModal.close();
		 		uploadModal = undefined;
		 	}
            $scope.progressName = size.name
            $scope.isUploading = true;
            $scope.progressPercent = (size.loaded / size.total * 100).toFixed(2) + "%";
            if($scope.progressPercent === "100.00%"){ 
            	$scope.isUploading = false;
            }
        }
	});
	$scope.$on("finishISOUpload",function(){
		console.log("finished refresh")
		loadIso();
	});
	$scope.upload = function(){
		uploadModal = $modal.open({
			templateUrl:"./views/vdi/dialog/system/upload_iso.html",
			controller:"systemUploadIsoDialog",
			resolve: {
				param: function(){
					return {"upload_id":upload_id}
				}
			}
		});
	};
	$scope.abortUpload = function(){
		var xhr = $rootScope.uploadPool[upload_id];
        xhr && xhr.abort();
        $scope.isUploading = false;
	};
	$scope.filter_iso = function(item){
		if(!item){
			$scope.rows = rows;
			return true;
		}
		$scope.rows = rows.filter(function(row){
			return row.type == $scope.select;
		});
	};
	$scope.updateData = function(text,select){
		$scope.rows = rows.filter(function(row){
			if(select){
				return row.type === select;
			}
			return true;
		});
	};
	$scope.os_types = $$$os_types;
	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.change = function(item){
		var new_item = JSON.parse(JSON.stringify(item));
		if(new_item.os_type){
			new_item.os_type = item.support_auto_install ? item.origin_os_type : item.os_type.key;
		}
		iso.update(new_item, function(res){
			rows.map(function(row){
				if(res.result && row.id == res.result.id){
					row.os_type = item.os_type;
					row.type = item.type;
					row.old_type = item.type;
					row.old_os_type = item.os_type;
					row.type_editable = false;
					row.os_editable = false;
				}
				return row;
			})
		}).$promise.finally(function(){
			loadIso();
		});
		$scope.filter_iso($scope.select);
	};
	$scope.hideButton = function(){
		$scope.uploadStart = false;
	}
	var _scope = $scope;
	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='ISO_DELETE'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ISO_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.name = item.name;
				$scope.ok = function(){
					iso.delete({
						ids: [item.id]
					}, function(res){
						loadIso();
					});
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};

	$scope.edit = function(item){
		item.os_editable = !item.support_auto_install;
		item.type_editable = true;
	};
	$scope.cancel = function(item){
		item.type = item.old_type;
		item.os_type = item.old_os_type;
		if(!item.support_auto_install)
			item.os_editable = !item.os_editable;
		item.type_editable = !item.type_editable;
	};
}])
.controller("vdiSystemLogListController", ["$scope", "SystemLog", "$modal", function($scope, log, $modal){
	$scope.rows = [];
	$scope.loading = true;

    $scope.currentPage = 1;
    $scope.pagesize = Number($$$storage.getSessionStorage('log_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('alarm_pagesize', newvalue ? newvalue : 0);
	});

	var last;
	$scope.search = function(e){
		last = e.timeStamp;
		setTimeout(function(){
			if(last-e.timeStamp==0){
				fn_get_logs($scope.searchText)
			}
		}, 500)
	}

	var _start = 0;
	var fn_get_logs = function(searchText){
		var size = Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
		log.query({
			displayLength: size,
			displayStart: ($scope.currentPage - 1) * size,
			search: searchText?searchText:""
		}, function(data){
			$scope.rows = data.data.sort(function(a,b){
				return b.datetime - a.datetime;
			});
			$scope.totalCount = searchText?data.totalDisplayRecords:data.totalRecords;
			$scope.loading = false;
			_start = data.displayStart;
		});
	};
	fn_get_logs();

	$scope.logPageSizeChange = function(){
		$scope.currentPage = $scope.pagesize ? Math.floor(_start / $scope.pagesize) + 1 : 0;
		fn_get_logs();
	};
	$scope.logPageChange = function(){
		fn_get_logs($scope.searchText);
	};

	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });

		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_LOG'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_LOG_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					log.delete({ids:rows.map(function(row){ return row.id })},function(data){
						fn_get_logs();
					});
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	$scope.deleteAll = function(){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_RIZHI'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_RIZHI_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					log.delete({ids:'all'}, function(data){
						fn_get_logs();
					});
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});

	};
}])
// .controller("vdiSystemEndlogListController", ["$scope", "$modal", function($scope, $modal){
// 	$scope.rows = [];
// 	$scope.loading = true;

//     $scope.currentPage = 1;
//     $scope.pagesize = Number(localStorage.log_pagesize) || 30;
// 	$scope.$watch("pagesize" , function(newvalue){
// 		$scope.pagesize = newvalue || 0;
// 		localStorage.log_pagesize = newvalue ? newvalue : 0;
// 	});

// 	var _start = 0;
// 	var fn_get_logs = function(){
// 		var size = Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
// 		// log.query({
// 		// 	displayLength: size,
// 		// 	displayStart: ($scope.currentPage - 1) * size,
// 		// 	search: ""
// 		// }, function(data){
// 		// 	$scope.rows = data.data.sort(function(a,b){
// 		// 		return b.datetime - a.datetime;
// 		// 	});
// 		// 	$scope.totalCount = data.totalRecords;
// 		// 	$scope.loading = false;
// 		// 	_start = data.displayStart;
// 		// });
// 	};
// 	fn_get_logs();

// 	$scope.logPageSizeChange = function(){
// 		$scope.currentPage = $scope.pagesize ? Math.floor(_start / $scope.pagesize) + 1 : 0;
// 		fn_get_logs();
// 	};
// 	$scope.logPageChange = function(){
// 		fn_get_logs();
// 	};

// 	$scope.delete = function(item){
// 		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });

// 		$modal.open({
// 			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_LOG'>"+
// 						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_LOG_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
// 			controller : function($scope, $modalInstance){
// 				$scope.ok = function(){
// 					// log.delete({ids:rows.map(function(row){ return row.id })},function(data){
// 					// 	fn_get_logs();
// 					// });
// 					$modalInstance.close();
// 				},
// 				$scope.close = function(){
// 					$modalInstance.close();
// 				}
// 			},
// 			size : "sm"
// 		});
// 	};
// 	$scope.deleteAll = function(){
// 		$modal.open({
// 			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_RIZHI'>"+
// 						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_RIZHI_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
// 			controller : function($scope, $modalInstance){
// 				$scope.ok = function(){
// 					// log.delete({ids:'all'}, function(data){
// 					// 	fn_get_logs();
// 					// });
// 					$modalInstance.close();
// 				},
// 				$scope.close = function(){
// 					$modalInstance.close();
// 				}
// 			},
// 			size : "sm"
// 		});

// 	};
// }])
.controller("vdiSystemUpgradeListController", ["$scope","SystemUpgrade","$modal","$$$I18N", "$$$MSG", function($scope, upgrade, $modal,$$$I18N, $$$MSG){
	function getList(){
		$scope.loading = true;
		$scope.rows = [];
		upgrade.query(function(data){
			var _data = data.versions;
			var new_data = {};
			 _data.forEach(function(d,idx){
			 	d._idx = idx;
			 	// 上传包类型
			    // d.packtype = d.owner === 'win_client' ? 'zip' : 'bin';
				if(d.owner === 'win_client'){
					d.packtype = 'zip';
				}
				else if(d.owner === 'android_client'){
					d.packtype = 'apk';
				}
				else if(d.owner.indexOf('guesttool') !== -1){
					d.packtype = 'iso';
				}
				else{
					d.packtype = 'bin';
				}
			 	if(new_data[d.owner]){
			 		new_data[d.owner].push(d);
			 	}else{
			 		new_data[d.owner] = [d];
			 	}
			 });
			 Object.keys(new_data).forEach(function(i){
			 	$scope.rows.push(new_data[i]);
			 });
			$scope.loading = false;
		});
	}
	getList();
	$scope.viewDetail = function(witch){
		$modal.open({
			resolve:{
				modal_data: function(){
					return witch;
				}
			},
			backdrop:'static',
			controller:"systemUpgradeDetailDialog",
			templateUrl:"views/vdi/dialog/system/system_upgrade_detail.html",
			size:'lg'
		});
	}


	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.finish = function(){
		getList();
	};
	$scope.upgrade = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='升级'>"+
							"升级</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;'>{{ MESS }}</p><footer class='text-right'><button ng-if='!submitting' class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><img src='img/loadingtext.gif' ng-if='submitting' height='24' width='24' alt=''><button  ng-if='!submitting'  class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
			controller : function($scope, $modalInstance){
				switch(item.owner){
					case 'win_client':
					case 'lin_client':
					case 'arm_client':
					case 'android_client':
							$scope.MESS = $$$I18N.get("2UPGRADEMESS");
							break;
					case 'console':
					case 'agent'  :
							$scope.MESS = $$$I18N.get("UPGRADEMESS");
							break;
					default : 
							$scope.MESS = $$$I18N.get("UPGRADEMESS");
							break;		
				}
				$scope.ok = function(){
					$scope.submitting = true;
					item['auto'] = true;
					upgrade.upgrade(item, function(){
						getList();
						$modalInstance.close();
					}).$promise.finally(function(){
						$scope.submitting = false;
					});
					
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "md"
		});
	};
}])
.controller("vdiSystemUSBListController", ["$scope", "$modal", "SystemUSB", "$$$I18N", function($scope, $modal, systemusb, $$$I18N){
	$scope.rows = [];
	// var allRows = [];
	$scope.loading = true;
	systemusb.get(function(res){
		//$scope.rows = [{id: 1, class_id: '0x00', priority: 2, rule_name: "ffff", product_id: "0x1111", vendor_id: "0x1234", allow: true}];
		$scope.rows = res.result;
		$scope.rows.forEach(function(item){
			item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
		});
		$scope.loading = false;
		// angular.copy($scope.rows,allRows);
	})
	
	$scope.sortClass_id = function(order){
    	$scope.rows.sort(function(a, b){
			return (a.class_id.key > b.class_id.key) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
    };

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		var rows = $scope.rows;
		
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELE_USB'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELE_USB_TIP'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						systemusb.delete({ids: selected_rows.map(function(row){ return row.id; })},function(res){
							selected_rows.forEach(function(item){
								var index = rows.indexOf(item);
								rows.splice(index, 1);
							});
						})

						$modalInstance.close();
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
		
	};
	// $scope.updateData = function(text){
	// 	$scope.rows = allRows.filter(function(row){
	// 		if(text.trim()){
	// 			return row.rule_name.indexOf(text.trim()) !== -1;
	// 		}
	// 		return true;
	// 	});
	// };
}])
// .controller("vdiSystemDeviceListController", ["$scope", "$modal", "$$$I18N", function($scope, $modal, $$$I18N){
// 	$scope.rows = [];

// 	var get_rows = function(){
// 		$scope.rows = [{name: 'iToken S3000', made: '天地融', PID: '3d45', VID: 'df45', host: "agent1", desktop: "zhujianchen", desc: "是的法规法规"}];
// 	};
// 	get_rows();

// 	$scope.transmission = function(){
// 		var device = this.item;
// 		var dialog = $modal.open({
// 			templateUrl: "views/vdi/dialog/system/transmission.html",
// 			controller: "transmissionDialog",
// 			size: "sm",
// 			resolve:{
// 				params : function(){
// 					return { device: angular.copy(device) };
// 				}
// 			}
// 		});
// 		dialog.result.then(function(data){
// 			if(data){
// 				get_rows();
// 			}
// 		});
// 	}

// 	$scope.currentPage = 1;
// 	$scope.pagesizes = [10,20,30];
// 	$scope.pagesize = $scope.pagesizes[0];
// }])
.controller("transmissionDialog",["$scope","$modalInstance", "$$$I18N", "params",function($scope,$modalInstance,$$$I18N,params){
	$scope.device = params.device;

	$scope.desktops = [{id: "df", name: 'zhujianchen'},{id: "fg", name: 'egg'}];

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("addSystemUSBDialog",["$scope","$modalInstance", "SystemUSB","$$$I18N", function($scope,$modalInstance,systemusb, $$$I18N){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = { allow: 'true' };
	$scope.types = [];
	var keys = ['0x01','0x02','0x03','0x05','0x06','0x07','0x08','0x09','0x0A','0x0B','0x0D','0x0E','0x0F','0x10','0x11','0xDC','0xE0','0xEF','0xFE','0xFF','-1'];
	keys.forEach(function(item){
		$scope.types.push({key: item, value: $$$I18N.get(item)})
	});
	$scope.data.class_id = $scope.types[0];
	$scope.master = { allow: true, class_id: $scope.types[0]};
	$scope.reset = function() {
		$scope.data = $scope.master;
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}
	$scope.ok = function(){
		systemusb.save({
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1'? $scope.data.product_id: "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1'? $scope.data.vendor_id: "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow=="true"?true:false
		}, function(res){
			systemusb.get(function(res){
				res.result.forEach(function(item){
					item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
				})
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows,res.result);
			})
			
		});
		$modalInstance.close();
	}

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editSystemUSBDialog",["$scope","$modalInstance", "SystemUSB","$$$I18N", function($scope,$modalInstance,systemusb, $$$I18N){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.types = [];
	var keys = ['0x01','0x02','0x03','0x05','0x06','0x07','0x08','0x09','0x0A','0x0B','0x0D','0x0E','0x0F','0x10','0x11','0xDC','0xE0','0xEF','0xFE','0xFF','-1'];
	keys.forEach(function(item){
		$scope.types.push({key: item, value: $$$I18N.get(item)})
	});
	var item = $scope.item || $scope.currentItem;
	if(item.product_id.indexOf("0x")>-1){
		item.product_id = item.product_id == -1? "-1": item.product_id.substring(2);
	}
	if(item.vendor_id.indexOf("0x")>-1){
		item.vendor_id = item.vendor_id == -1? "-1": item.vendor_id.substring(2);
	}
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
	};

	$scope.ok = function() {
		systemusb.update(
		{	
			group_id: $scope.data.id,
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1'? $scope.data.product_id: "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1'? $scope.data.vendor_id: "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow
		},
			function(res){
				systemusb.get(function(res){
					res.result.forEach(function(item){
						item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
					})
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,res.result);
				})
				$modalInstance.close();
			},
			function(){  }
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("systemUpgradeDetailDialog", ["$scope", "SystemUpgrade","modal_data","$modalInstance",function($scope, SystemUpgrade,modal_data,$modalInstance){

	SystemUpgrade.query({owner:modal_data},function(res){
		$scope.rows = res.result;
	});
	$scope.close = function(){
		$modalInstance.close();
	}
}])
.controller('vdiSystemDesktopDetailController', ['$scope','$modal','SystemDesktop','$routeParams','$interval','$filter','$$$os_types','VMCommon','PersonDesktop','$$$I18N',
	function($scope,$modal,SystemDesktop,$routeParams,$interval,$filter,$$$os_types,vm, person_desktop,$$$I18N){
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["系统", "系统桌面","桌面详情"]);

    $interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("instanceIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(item => item.id));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
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
	
	$scope.refresh = (_s = $scope) => {
		var _id = $routeParams.id;
		_s.select = ''
		SystemDesktop.get_instances({id: _id}, res => {
			_s.rows = res.result.result;
			_s.allRows = res.result.result;
			_s.rows.forEach(row => {
				let os = $$$os_types.filter(item => item.key === row.os_type)[0];
				os && os.icon && (row.icon = os.icon);
			});
			_s.loading = false;
		});
	};

	$scope.pagesize = Number($$$storage.getSessionStorage('personl_pagesize')) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize",function(newvalue){
		$$$storage.setSessionStorage('personl_pagesize', newvalue);
	});

	$scope.loading = true;
	$scope.rows = [];
	$scope.refresh();

	$scope.changeStatus = function(){
		$scope.rows = $filter("filter")($scope.allRows,$scope.select).map(item => { item._selected = false;return item });
	};

	var _controllerScope = $scope;	
	$scope.start = item => {
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended'); });
		if(rows.length==0){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout:6000
			});
		}else{
			vm.start({instance_ids: rows.map(row => 
				{row.status = "building";return row.instance_id})}, () => 
			{$scope.refresh();});
		}
	};

	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); });
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
									row.status = "building";
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
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
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
							row.status = "building" ;
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
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
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
							row.status = "building";
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
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running'; })
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
							row.status = "building";
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
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused'; })
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
							row.status = "building";
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
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		var is_running = rows.some(function(row){ return row.status == 'running'});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>"+
					"桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.is_run = is_running;
				$scope.ok = function(){
					$modalInstance.close();
					person_desktop.delete({instance_ids: rows.map(function(row){ return row.instance_id; })}, function(data){
						rows.forEach(function(r){
							_controllerScope.refresh();
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

	$scope.add = function(){
		var instance = $modal.open({
				templateUrl:"views/vdi/dialog/system/system_desktop_add.html",
				controller:"systemDesktopAddDialog",
				size:"md"
			});
			instance.result.then(function(){
				_controllerScope.refresh();
			});
		};
	
	$scope.config = function(item){
		var instance = $modal.open({
			templateUrl:"views/vdi/dialog/system/system_desktop_config.html",
			controller:"systemDesktopConfigDialog",
			size:"md",
			resolve:{param:function(){
				return item;
			}}
		});
		instance.result.then(function(){
			_controllerScope.refresh();
		});
	};
}])
.controller('systemDesktopConfigDialog', ['$scope','param','SystemDesktop','Host','$filter','$modalInstance',
 function($scope, param, SystemDesktop,Host,$filter,$modalInstance){
	$scope.data = {
		id:param.id,
		memory_mb:param.memory_mb/1024,
		cpu_num:param.vcpu,
		hostname:param.hostname
	};
	$scope.host_loading = true;
	

	$scope.get_devices = function(hostname){
		SystemDesktop.get_devices({host:hostname},function(res){
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function(item){ return item.status === "available"});
		});
	};
	$scope.get_devices($scope.data.hostname);
	$scope.selectAllHost = function(bool){
		$scope.devices.map(function(item){
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function(){
		$scope.data.is_all = $scope.devices.every(function(item){
			return item._selected === true;
		});
	};
	$scope.ok = function(){
		var devices = $filter("selectedFilter")($scope.devices);
		var node = $scope.data.is_cancel ? -1 : devices.map(function(item){ return item.compute_node_id });
		var addr = $scope.data.is_cancel ? -1 : devices.map(function(item){ return item.address});
		var postData ={
			id:$scope.data.id,
			is_auto_up:$scope.data.is_on,
			pci_devices_node:node,
			pci_devices_address:addr,
			cpu:$scope.data.cpu_num,
			ram:$scope.data.memory_mb
		};
		$scope.loading = true;
		SystemDesktop.config_instances(postData,function(res){
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('systemDesktopAddDialog', ['$scope','Host','$filter','SystemDesktop','$modalInstance','$routeParams',
	function($scope, Host ,$filter,SystemDesktop, $modalInstance, $routeParams){
		
	$scope.data = {};
	$scope.host_loading = true;
	Host.query({ type: 'kvm' }, function(res){
		$scope.hosts = res.hosts_list.filter(function(host){ return host.status == 'active'});
	}).$promise.finally(function(){
		$scope.host_loading = false;
	});
	$scope.selectAllHost = function(bool){
		$scope.hosts.map(function(item){
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function(){
		$scope.data.is_all = $scope.hosts.every(function(item){
			return item._selected === true;
		});
	};
	$scope.ok = function(){
		var _id = $routeParams.id ? $routeParams.id : $scope.creat_item.id;
		var postData = {
			id:_id,
			name: $scope.data.name,
			host_ids: $filter("selectedFilter")($scope.hosts).map(function(item){ return item.id }),
			cpu: $scope.data.cpu_num,
			ram: $scope.data.memory_mb
		};
		$scope.loading = true;
		SystemDesktop.add_instances(postData,function(res){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.close =function(){
		$modalInstance.dismiss();
	};
	
}])

.controller('systemTemplateConfigDialog', ['$scope','$modalInstance','param','SystemDesktop','$filter','TeachTemplate', "Network", "$$$I18N",function($scope, $modalInstance, param, SystemDesktop, $filter, TeachTemplate, Network, $$$I18N){
	var me = this;
	$scope.min_namelength=2;
	$scope.max_namelength=20;
	$scope.data = {
		instance_id:param.instance_id,
		id:param.id,
		cpu_num: 1,
		memory_mb: 1
	};
	$scope.host_loading = true;
	
	$scope.multifyNetsTips = $$$I18N.get('multifyNetsTips');

	TeachTemplate.infor({image_id:$scope.data.id},function(res){
		$scope.data.cpu_num = res.vcpus;
		$scope.data.memory_mb = res.ram/1024;
		$scope.data.display_name = res.name;
		$scope.data.type = res.type_code;
		$scope.data.host = res.host;
		$scope.data.start_on_host_boot = res.start_on_host_boot;
		$scope.get_devices($scope.data.host);
		res.nets.forEach(function(net){
			getNetwork(net, new Date());
		});
	});

	$scope.nets = [];
	$scope.IPmodes1 = [{name: $$$I18N.get('不分配'), value: 0}];
	$scope.IPmodes2 = [{name: $$$I18N.get('系统分配'), value: 1},{name: $$$I18N.get('固定IP'), value: 2}];
	function getNetwork(net, key){
		$scope.network_loading = true;
		Network.query(function(data){
			if(data.networks.length){
				var _network = net?data.networks.filter(function(n){ return n.id == net.network_id })[0]:data.networks[0];
				$scope.nets.push({key: key, networks: data.networks, network: _network});
				$scope.get_subnet(net, _network, key);
			}
		});
	}
	
	$scope.get_subnet = function(net, network, key){
		if(network.subnets.length){
			Network.query_sub({
				id:network.id
			},function(res){
				var subnetworks = [];
				subnetworks = res.result.map(function(n){
					n._desc = n.start_ip ?(n.name + " (" + n.start_ip +" - "+ n.end_ip + ") ") :  n.name;
					return n;
				});
				$scope.nets.forEach(function(item){
					if(item.key===key){
						item.subnetworks = subnetworks;
						var _subnetwork;
						if(net){
							 _subnetwork = net.subnet_id?subnetworks.filter(function(n){ return n.id == net.subnet_id })[0]:null;
						}else{ _subnetwork = subnetworks[0] };
						item.subnetwork = _subnetwork;
						$scope.clearBindIp(net, key);
					}
				});
				$scope.network_loading = false;
			});
		}else{
			$scope.network_loading = false;
			$scope.nets.forEach(function(item){
				if(item.key===key){
					item.subnetworks = [];
					item.subnetwork = null;
					$scope.clearBindIp(net,key);
				}
			});
		}
	};
	$scope.clearBindIp = function(net, key){
		$scope.nets.forEach(function(item){
			if(item.key===key){
				if(item.subnetwork){
					item.IPmodes = $scope.IPmodes2;
					if(net.ip_address){
						item.IPmode= item.IPmodes[1];
					}else{
						item.IPmode= item.IPmodes[0];
					}
				}else{
					item.IPmodes = $scope.IPmodes1;
					item.IPmode= item.IPmodes[0];
				}
				
				item.ip = net.ip_address;
			}
		});
	};

	$scope.addNet = function(){
		getNetwork(false, new Date());
	};
	$scope.minusNet = function(i){
		var idx = $scope.nets.indexOf(i)
		$scope.nets.splice(idx,1);
	};
	$scope.get_devices = function(hostname){
		SystemDesktop.get_devices({host:hostname},function(res){
			$scope.host_loading = false;
			$scope.devices = res.result.filter(function(item){ return item.status === "available"});
		});
	};
	$scope.selectAllHost = function(bool){
		$scope.devices.map(function(item){
			item._selected = bool;
			return item;
		});
	};
	$scope.selectOneHost = function(){
		$scope.data.is_all = $scope.devices.every(function(item){
			return item._selected === true;
		});
	};

	// 判断网络数组中两两是否有两个相同的子网id
	function giveTip(array){
		var flag = false;
		array.forEach(function(item, index){
		 for(var i=index+1; i<array.length; i++){
			console.log(array[index],array[i]);
			if(array[index]['subnetwork']['id'] == array[i]['subnetwork']['id']){
				flag = true;
			}
		  }
		});
		return flag;
	}

	$scope.ok = function(){
		var me = this, alertTip = giveTip(me.nets);
		var devices = $filter("selectedFilter")($scope.devices);
		var node = $scope.data.is_cancel ? -1 : devices.map(function(item){ return item.compute_node_id });
		var addr = $scope.data.is_cancel ? -1 : devices.map(function(item){ return item.address});
		var postData = {
			image_id:$scope.data.id,
			instance_id:$scope.data.instance_id,
			display_name:$scope.data.display_name,
			type_code: this.data.type,
			network: this.nets.map(function(item){ if(!item.network.id) return ""; else return item.network.id }),
			subnet: this.nets.map(function(item){ if(!item.subnetwork) return ""; else return item.subnetwork.id }),
			band_ip: this.nets.map(function(item){ if(!item.ip) return ""; else return item.ip }),
			pci_devices_node:node,
			pci_devices_address:addr,
			vcpus:$scope.data.cpu_num,
			ram:$scope.data.memory_mb,
			start_on_host_boot: $scope.data.start_on_host_boot
		};
		if(alertTip){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("不同网卡上不能存在相同网段的IP"),
				timeout:6000
			});
			return false ;
		}
		$scope.loading = true;
		SystemDesktop.edit(postData,function(res){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.loading = false;
		});
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('systemBackupConfigController', ['$scope','$modalInstance','SystemBackup', function($scope, $modalInstance,SystemBackup){
	$scope.data = {};
	SystemBackup.get_config(function(res){
		$scope.data = res.result;
		var initTime = new Date();
		$scope.data.backup_weekday = $scope.data.backup_weekday  || "";
		$scope.data.backup_time = $scope.data.backup_time  || initTime;
	});
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.ok = function(){
		$scope.submiting = true;
		SystemBackup.alter_config($scope.data , function(){
			$modalInstance.close();
		}).$promise.finally(function(){
			$scope.submiting = false;
		});
	};
}])
.controller("vdiSystemOutsideController", ["$scope", "$modal", "$$$I18N", "Outside", 'AlarmPlicy', function($scope, $modal, $$$I18N, Outside, AlarmPlicy){
	$scope.enable_loading = false;
	$scope.save_loading = false;
	$scope.ips_loading = true;

	Outside.query(function(res){
		// var res = {
		// 	enable: true,
		// 	proxy_ip: "10.1.41.188",
		// 	computer_ips: ["10.1.41.17"]
		// };
		// var res = {
		// 	enable: false,
		// 	proxy_ip: "",
		// 	computer_ips: []
		// };
		$scope.enable = res.enable;
		$scope.IP = res.proxy_ip;
		$scope.hasIP = res.proxy_ip==''?false:true;
		$scope.computer_ips = res.computer_ips;

		AlarmPlicy.get_hosts(function(result){
			$scope.ips_loading = false;
			// var consoleIP = result.result.filter(function(r){ return r.type=="control"; })[0].hosts[0].ip;
			// result.result.forEach(function(item){
			// 	item.hosts = item.hosts.filter(function(i){ return i.ip!==consoleIP })
			// });
			$scope.pools = result.result.filter(function(r){
				return r.hosts.length && r.type!=="control";
			});
		});
	})

	$scope.start = function(){
		if(!$scope.enable){
			$scope.enable_loading = true;
			Outside.stop(function(res){
				$scope.enable_loading = false;
				$scope.IP = null;
				$scope.computer_ips = [];
			},function(error){
				$scope.enable_loading = false;
				$scope.enable = !$scope.enable;
			})
		}
	}
	$scope.save = function(){
		var computer_ips = [];
		if(!$scope.hasIP){
			$scope.pools.forEach(function(item){
				item.hosts.forEach(function(host){
					computer_ips.push(host.ip);
				})
			});

		}
		else{
			$scope.pools.forEach(function(item){
				item.hosts.forEach(function(host){
					var is_selected = $scope.computer_ips.filter(function(i){ return i === host.ip }).length;
					if(is_selected){
						computer_ips.push(host.ip)
					}
				})
			});
		}
		if(computer_ips.length){
			$scope.save_loading = true;
			Outside.save({
				proxy_ip: $scope.IP,
				computer_ips: computer_ips
			}, function(res){
				$scope.hasIP = true;
				$scope.save_loading = false;
				$scope.computer_ips = computer_ips;
			},function(error){
				$scope.save_loading = false;
			})
		}
		else{
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("NO_OUSIDEIP"),
				timeout	: 6000
			});
		}
	}
}])
.controller('outsideAdvancedDialog', ['$scope','$modalInstance', 'AlarmPlicy', "Outside", function($scope, $modalInstance, AlarmPlicy, Outside){
	$scope.ips_loading = true;
	$scope.isSubmiting = false;
	AlarmPlicy.get_hosts(function(result){
		$scope.ips_loading = false;

		// var consoleIP = result.result.filter(function(r){ return r.type=="control"; })[0].hosts[0].ip;
		// result.result.forEach(function(item){
		// 	item.hosts = item.hosts.filter(function(i){ return i.ip!==consoleIP })
		// });
		var pools = result.result.filter(function(r){
			return r.hosts.length && r.type!=="control";
		});
		$scope.pools.splice(0);
		Array.prototype.push.apply($scope.pools, pools);

		if(!$scope.hasIP){
			$scope.pools.forEach(function(item){
				item.hosts.forEach(function(host){
					host._selected = true;
				})
			});
		}
		else{
			$scope.pools.forEach(function(item){
				item.hosts.forEach(function(host){
					var is_selected = $scope.computer_ips.filter(function(i){ return i === host.ip }).length;
					if(is_selected){
						host._selected = true;
					}
				})
			});
		}
		$scope.pools.forEach(function(item){
			var selected_length = item.hosts.filter(function(host){ return host._selected }).length;
			if(selected_length == item.hosts.length){
				item._selected = true;
			}
		});
	});

	$scope.checkOne = function(pool){
	    pool._selected = pool.hosts.every(function(h){ return h._selected});
	};
	$scope.checkAll = function(pool){
	    pool.hosts.forEach(function(h){
	        h._selected = pool._selected;
	    });
	};
	$scope.checked = function(){
		var computer_ips = []
		$scope.pools && $scope.pools.forEach(function(item){
			item.hosts.forEach(function(host){
				if(host._selected){
					computer_ips.push(host.ip)
				}
			})
		});
		return computer_ips.length?true:false;
	};
	$scope.ok = function(){
		var computer_ips = []
		$scope.pools.forEach(function(item){
			item.hosts.forEach(function(host){
				if(host._selected){
					computer_ips.push(host.ip)
				}
			})
		});
		$scope.isSubmiting = true;
		Outside.save({
			proxy_ip: $scope.IP,
			computer_ips: computer_ips
		}, function(res){
			$scope.hasIP = true;
			$scope.computer_ips.splice(0);
			Array.prototype.push.apply($scope.computer_ips,computer_ips);
			$modalInstance.close();
			$scope.isSubmiting = false;
		},function(error){

		})
	};
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller("systemUploadIsoDialog", ['$scope','$modalInstance','param','$rootScope',function($scope,$modalInstance,param,$rootScope){
	$scope.id = param.upload_id;
	$scope.finishUpload = function(){
		$rootScope.$broadcast("finishISOUpload");
	};
	$scope.close = function(){
		$modalInstance.close();
	}
}])
/**
 * [description vdiSystemRecycleController 系统资源回收控制器]
 */
.controller('vdiSystemRecycleController', ['$scope','$modal','$location','$route','RecycleTech','RecyclePer',function($scope,$modal,$location,$route,RecycleTech,RecyclePer){
	var RecycleCtrl=this;
	RecycleCtrl.data={},RecycleCtrl.submit={};

	RecycleCtrl.setTechDefault = function(val){
		RecycleCtrl.tecSave(true);
	}
	RecycleCtrl.getTech = function(){
		RecycleCtrl.techLoading = true;
		RecycleTech.query(function(res){
			RecycleCtrl.data.tecOpen = res.value.active;
			RecycleCtrl.data.tecDesk = res.value.broken_min;
			RecycleCtrl.data.tecStatus = res.value.run;
			RecycleCtrl.techLoading = false;
		},function(){ RecycleCtrl.techLoading = false; })
	}
	RecycleCtrl.getTech();
	RecycleCtrl.tecSave=function(onlyEnable){
		//提交请求
		if(onlyEnable){
			RecycleCtrl.techenabling = true;
			RecycleTech.save({value: {active:RecycleCtrl.data.tecOpen}},function(res){
				RecycleCtrl.techenabling = false;
				RecycleCtrl.getTech();
				if(!RecycleCtrl.data.tecOpen){
					RecycleCtrl.techEdit = false;
				}
			},function(){ RecycleCtrl.techenabling = false; })
		}else{
			RecycleCtrl.data.tecDesk = Number(RecycleCtrl.data.tecDesk);
			var params={
				active:RecycleCtrl.data.tecOpen,
				broken_min:RecycleCtrl.data.tecDesk,
				run:RecycleCtrl.data.tecStatus
			};
			RecycleCtrl.techSave = true;
			RecycleTech.save({value:params},function(res){
				RecycleCtrl.techSave = false;
				RecycleCtrl.techEdit = false;
			},function(){ RecycleCtrl.techSave = false; })
		}
	}

	RecycleCtrl.setPerDefault = function(val){
		RecycleCtrl.perSave(true);
	}
	RecycleCtrl.getPerson = function(){
		RecycleCtrl.personLoading = true;
		RecyclePer.query(function(res){
			RecycleCtrl.submit.perOpen = res.value.active;
			RecycleCtrl.submit.perDesk = res.value.broken_min/60;
			RecycleCtrl.submit.perStatus = res.value.run;
			RecycleCtrl.personLoading = false;
		},function(){ RecycleCtrl.personLoading = false; })
	}
	RecycleCtrl.getPerson();
	RecycleCtrl.perSave = function(onlyEnable){
		//提交请求
		if(onlyEnable){
			RecycleCtrl.perenabling = true;
			RecyclePer.save({value: {active:RecycleCtrl.submit.perOpen}},function(res){
				RecycleCtrl.perenabling = false;
				RecycleCtrl.getPerson();
				if(!RecycleCtrl.submit.perOpen){
					RecycleCtrl.personEdit = false;
				}
			},function(){ RecycleCtrl.perenabling = false; })
		}else{
			RecycleCtrl.submit.perDesk = Number(RecycleCtrl.submit.perDesk);
			var params={
				active:RecycleCtrl.submit.perOpen,
				broken_min:RecycleCtrl.submit.perOpen?RecycleCtrl.submit.perDesk*60:undefined,
				run:RecycleCtrl.submit.perOpen?RecycleCtrl.submit.perStatus:undefined
			};
			RecycleCtrl.personSave = true;
			RecyclePer.save({value:params},function(res){
				RecycleCtrl.personSave = false;
				RecycleCtrl.personEdit = false;
			},function(){ RecycleCtrl.personSave = false; })
		}
	}
}])

/**
 * [description vdiSystemtimeSyncController 系统时间同步控制器]
 */
.controller('vdiSystemtimeSyncController', ['$scope','$modal','$route','SystemTime','$$$I18N','formDate',function($scope,$modal,$route,SystemTime,$$$I18N,formDate){
	var SyncCtrl=this;
	// var oldSyncServer;
	SystemTime.getInternetSync(function(res){
		SyncCtrl.internetSync = res.enable;
	},function(){});

	SyncCtrl.setInternetSync = function(value){
		SyncCtrl.loading_internet = true;
		SystemTime.internetSync({enable: value}, function(){
			SyncCtrl.loading_internet = false;
		},function(){ SyncCtrl.loading_internet = false; })
		if(value){
			SyncCtrl.updateSyncServer();
		}
	};
	
	SystemTime.querySyncServer(function(res){
		SyncCtrl.servers = res.result;
		SyncCtrl.server = res.used!==''?res.used:res.result[0];
		// 保持对旧 server 引用
        // oldSyncServer = res.used;
	},function(){});

	// SyncCtrl.isSyncServerChanged = function(){
	// 	// 不允许选择空值
	// 	if(!this.server) { return false; }
	// 	// 判断变化
	// 	if(oldSyncServer) {
	// 		return oldSyncServer !== this.server;
	// 	}
	// };

	SyncCtrl.updateSyncServer = function(){
		SyncCtrl.loading_updateServer = true;
		SystemTime.updateSyncServer({time_server: SyncCtrl.server},function(res){
			// oldSyncServer = SyncCtrl.server;
			SyncCtrl.loading_updateServer = false;
			SyncCtrl.loadZone();
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("同步时间成功"),
				timeout : 6000
			});
		},function(){
			SyncCtrl.loading_updateServer = false;
			SyncCtrl.loadZone();
		})
	}
	
	// 时区
	SyncCtrl.startDateOptions = {
		formatYear: 'yyyy-MM-dd',
		startingDay: 1
	};
	SyncCtrl.openStartDate=function($event){
		$event.preventDefault();
		$event.stopPropagation();
		SyncCtrl.startDateOpened = true;
	}
	$scope.$on('matchInput', function(e,v){
		$scope.matchInput = v;
	})
	var timeID;
	function updateTime(time){
		var new_time = time;
		var timeArray = formDate.format(new Date(time), "hh:mm:ss").split(':');
		if(SyncCtrl.loopTime){
			SyncCtrl.hours = timeArray[0];
			SyncCtrl.minutes = timeArray[1];
			SyncCtrl.seconds = timeArray[2];
			new_time = time+1000;
			timeID = setTimeout(function(){
				updateTime(new_time);
			}, 1000);
		}
		else{
			clearTimeout(timeID);
		}
	};

	SyncCtrl.loadZone = function(){
		clearTimeout(timeID);
		SyncCtrl.loading_zone = true;
		SystemTime.queryZone(function(res){
			SyncCtrl.choose_time = res.date;
			SyncCtrl.loopTime = true;
			updateTime(res.timestamp);
			SyncCtrl.zones = res.timezones.map(function(item){
				item.value = $$$I18N.get(item.zones[0]);
				return item;
			});
			SyncCtrl.zone = SyncCtrl.zones.filter(function(item){ return item.offset == res.zone })[0];
			SyncCtrl.loading_zone = false;
		},function(){ SyncCtrl.loading_zone = false; })
	};
	SyncCtrl.loadZone();
	SyncCtrl.updateZone = function(){
		SyncCtrl.updating_zone = true;
		// 格式化时间，0-9时前面加0
		if(SyncCtrl.hours.length==1 && Number(SyncCtrl.hours)>=0 && Number(SyncCtrl.hours)<=9){
			SyncCtrl.hours = "0"+SyncCtrl.hours
		}
		if(SyncCtrl.minutes.length==1 && Number(SyncCtrl.minutes)>=0 && Number(SyncCtrl.minutes)<=9){
			SyncCtrl.minutes = "0"+SyncCtrl.minutes
		}
		if(SyncCtrl.seconds.length==1 && Number(SyncCtrl.seconds)>=0 && Number(SyncCtrl.seconds)<=9){
			SyncCtrl.seconds = "0"+SyncCtrl.seconds
		}
		var time = formDate.format(new Date(SyncCtrl.choose_time), "yyyy-MM-dd");
		SystemTime.updateZone({
			"date": time,
			"time": SyncCtrl.hours+':'+SyncCtrl.minutes+":"+SyncCtrl.seconds,
			"zone": SyncCtrl.zone.offset
		},function(res){	
			SyncCtrl.updating_zone = false;
			SyncCtrl.modifyTime = false;
			SyncCtrl.loadZone();
		},function(){ SyncCtrl.updating_zone = false; SyncCtrl.modifyTime = false; SyncCtrl.loadZone();})

	}

}])
.controller('vdiSystemSetController', ['$scope', '$modal', function($scope, $modal){
}])
// 快速部署
.directive('htmlpopover', ['$tooltip', function ($tooltip) {
    return $tooltip( 'htmlpopover', 'htmlpopover', 'mouseenter' );
}])
.directive('htmlpopoverPopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
        template: "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
        "  <div class=\"arrow\"></div>\n" +
        "\n" +
        "  <div class=\"popover-inner\">\n" +
        "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
        "      <div class=\"popover-content\" bind-html-unsafe=\"content\"></div>\n" +
        "  </div>\n" +
        "</div>"
    };
})
.filter("filename", function(){
    return function(text){
        if(!text) { return text; }
        var pos = text.lastIndexOf("/");
        if(pos === -1) {
            pos = text.lastIndexOf("\\");
        }
        if(pos > -1) {
            return text.substring(pos + 1);
        } else {
            return text;
        }
    }
})
.filter("filesize", function(){
	return function(num){
		var units = ['B', 'KB', 'MB', 'GB', 'TB'];
		var index = 0;
		num = num || 0;
		while(num > 1024) {
			num = num / 1024;
			index++;
		}
		return num.toFixed(2) + units[index];
	};
})
.service('quickMaskModel', ["$$$I18N", "$location", "$compile", "$rootScope", "$controller", function($$$I18N, $location, $compile, $rootScope, $controller){
    this.open = function(){
    	var $body = $(document.body);
    	$body.css('overflow', 'hidden');
        var modalRootElement = angular.element(""
        	+ "<div id='quickMaskModel'>"
        	+ "  <div class='content'>"
        	+ "    <p localize='quickstartTip'></p>"
        	+ "    <footer class='text-right'>"
        	+ "      <a ng-click='ok()' class='btn btn-md btn-primary deploy'><i class='fa-arrow-right fa'></i> <span localize='快速部署'></span></a>"
        	+ "      <a ng-click='close()' class='btn btn-md btn-default nodeploy'><span localize='暂不部署'></span></a>"
        	+ "    </footer>"
        	+ "  </div>"
        	+ "  <span class='jiantou'></span>"
        	+ "</div>"
        );
        modalRootElement.appendTo($body);
        var modalScope = $rootScope.$new();
        $compile(modalRootElement)(modalScope);
        $controller("quickstartController", {$scope: modalScope, $element: modalRootElement});
    	modalScope.$on("$destroy", function(){
    		$body.css('overflow', 'auto');
    	});
    }
}])
.controller('vdiSystemDeployController', ['$scope', '$interval', '$q', '$location', '$modal', '$$$os_types', '$filter', 'localize', 'TeachTemplate', 'SystemDeploy', 'quickMaskModel', function($scope, $interval, $q, $location, $modal, $$$os_types, $filter, localize, TeachTemplate, init, quickMaskModel){
	$scope.currentIndex = 0;
	$scope.unknowStep = true;
	$scope.showMask = false;
	$scope.firstDeployTips = true;
	$scope.hideStep = false;
	//系统模块快速部署的界面展现
	init.quick_deploy_page(function(res){
		if(res.result.ha_mode==="active_passive" && res.result.storage_type==="local" && res.result.ha_triggered){
			$scope.showMask = true;
			$scope.firstDeployTips = false;
		}
		$scope.hideStep = true;
	});
	// 设置当前步骤
	init.quickstart(function(res){
		var step = parseInt(res.step);
		if(step && step > 1) {
			$scope.$broadcast("currentStepChange", step - 1);
			$scope.$broadcast("browser refresh", step - 1, res);
		} else {
			$scope.unknowStep = false;
		}
	});

	$scope.knowStep = function(){
		$scope.unknowStep = false;
	};
	$scope.setStep = function(i){
		$scope.$broadcast("currentStepChange", i);
	};

	$scope.$on("WizardStep_0", function(e, step, scope){
		var formScope = scope.$$childHead;
    	step.done = formScope.imgForm.$valid && !!formScope.selectedSysImage
    	if(!step.done) { return; }
    	$scope.$broadcast("deploy:set", "system-image", formScope.selectedSysImage.filename);
    });

	$scope.$on("WizardStep_1", function(e, step, scope){
		var formScope = scope.$$childHead;
		step.done = formScope.registerForm.$valid  && !formScope.network_loading
    	if(!step.done) {
    		angular.forEach(formScope.registerForm.$error, function(arr){
    			arr && arr.forEach(function(ctrl){ ctrl.$setViewValue(""); });
    		});
    		return;
    	}
    	var wizardScope = e.targetScope;
    	step.done = false;
    	step.showLoading = true;
    	formScope.ok(function(res){
    		step.showLoading = false;
    		if(res === null) { return; }
    		formScope.showTemplateBlock(res);
    	});
    });

    $scope.$on("WizardStep_2", function(e, step, scope){
    	var formScope = scope.$$childHead;
    	step.done = formScope.createForm.$valid;
    	if(!step.done) {
    		angular.forEach(formScope.createForm.$error, function(arr){
    			arr.forEach(function(ctrl){ ctrl.$setViewValue(""); });
    		});
    		return;
    	}
    	var data = formScope.getValues();
    	init.create_scene(data, function(res){
    		$$$storage.setSessionStorage('scene_page_classroom', '');
    		$location.url("/desktop/scene");
    	});
    });

    var countArr = [0, 0, 0];
	$scope.$on("selectStepChange", function(e, arg){
		var index = arg.index;
		$scope.currentIndex = index;
		countArr[index]++;
		if(countArr[index] > 1) {
			$scope.$broadcast("deploy:step" + index + ".refresh");
		}
	});
}])
// 第一步：导入模板镜像
.controller('importImageStepController', ['$scope', '$modal', 'SystemDeploy', '$timeout', function($scope, $modal, init, $timeout){
	// = 导入模板镜像 =
    // 扫描后产生的镜像列表
    $scope.imglist = [];
    // 选中的镜像
	var autoSelect = true;
    $scope.selectedSysImage;


    $scope.listSystemImages = function(){
    	init.list_system_images(function(res){
    		var imgmap = {};
    		angular.forEach($scope.imglist, function(img){
    			imgmap[img.name] = img;
    		});
    		angular.forEach(res.system_image, function(img){
    			if(img.name in imgmap) {
    				angular.extend(imgmap[img.name], img);
    			} else {
    				img.filename = img.name;
    				$scope.imglist.push(img);
    			}
    		});
			if(autoSelect) {
				$scope.selectedSysImage = $scope.imglist[0];
			}
    	}).$promise.finally(function(){
    		$scope.loading = false;
    	});
    	$scope.loading = true;
    };

    $scope.selectSysImage = function(img){
    	$scope.selectedSysImage = img;
		$scope.autoSelect = false;
    };

    $scope.importByServer = function(){
    	$modal.open({
    		templateUrl: "/views/vdi/dialog/system/system_deploy_import_by_server.html",
    		controller: "importByServerController as ctrl"
    	}).result.then(function(imgs){
    		(imgs.length > 0) && $scope.listSystemImages();
    	});
    };

    $scope.listSystemImages();

    $scope.$on("finishUpload", function(e, suc, filename){
        $scope.listSystemImages();
    });

    $scope.$on("deploy:step0.refresh", function(){
    	$scope.listSystemImages();
    });
}])
// 第二步：注册教学模板
.controller('registerTeachTemplateStepController', [
	'$scope', '$interval', '$modal', 'SystemDeploy', "registerTemplate", "TeachTemplate", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types","$$$I18N", "UserRole","Network", "virtualHost", "networkWithHost", "$rootScope",
	function($scope, $interval, $modal, init, registerTemplate, TeachTemplate, hardware, iso, admin, $$$os_types,$$$I18N, UserRole, network, virtualHost, networkWithHost, $root){
	let user = UserRole.currentUser;
	$scope.min_namelength = 2;
	$scope.max_namelength = 20;
	$scope.type = '1';
	$scope.name = "default";
	$scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
	$scope.types2 = [{name: $$$I18N.get('系统分配'), value: 'auto'},{name: $$$I18N.get('固定IP'), value: 'static'}];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];

	// controller 实例化的时候不应当获取数据，每次 $scope 收到 deploy:set 事件的时候初始化
	function loadData(){
		admin.query(function(res){
			$scope.users = res.users;
			angular.forEach($scope.users, function(item){
				if(item.name === user.name)
					$scope.owner = item;
			})
		});
		registerTemplate.query(function(res){
			$scope.sys_isos = res.system_image;
			if($scope.selectIsoName && !selectIsoByName($scope.selectIsoName)) {
				$scope.sys_iso = res.system_image[0];
			}
			$scope.old_data_isos = res.data_image;
			if($scope.sys_iso){
				$scope.getDataImgs($scope.sys_iso);
			}
		})
	}
	
	$scope.filterDataISO = function(data_iso, data_iso2){
		if(data_iso){
			$scope.data_isos2 = $scope.data_isos.filter(function(item){ return item.name !== data_iso.name });
		}
		else{
			$scope.data_isos2 = $scope.data_isos;
		}
		if(data_iso2){
			$scope.data_isos1 = $scope.data_isos.filter(function(item){ return item.name !== data_iso2.name });
		}
		else{
			$scope.data_isos1 = $scope.data_isos;
		}
	};
	$scope.getDataImgs = function(systemImg, is_init){
		if(systemImg){
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function(item){ return item.virtual_type == systemImg.virtual_type });
			// $scope.data_iso = $scope.data_isos[0];
			// $scope.data_iso2 = $scope.data_isos[0];
			$scope.getVirtualHost(systemImg.virtual_type, systemImg.rbd_enabled);			
		}
	};

	var lastType;
	$scope.getVirtualHost = function (type, rbd_enabled){
		if(type === lastType) { return; }
		$scope.host_loading = true;
		virtualHost.query({virtual_type: type, rbd_enabled: rbd_enabled}, function(res){
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts[0];
			$scope.getNetwork($scope.host);
			lastType = type;
		}, function(){

		});
	}

	$scope.os_types = $$$os_types.filter(function(item){ return item.key!=="package" });
	$scope.os_type = $scope.os_types[0];
	// $scope.enable_gpu = false;
	$scope.bind_ip_type = "static";

	$scope.switchIps = function(subnet,_scope){
		// _scope.bind_ip_loading = true;
		if(subnet){
			// getIps(subnet.id, _scope);
			_scope.types = _scope.types2;
			_scope.bind_ip_type = _scope.types2[0];
		}
		else{
			_scope.types = _scope.types1;
			_scope.band_ips = [];
			_scope.bind_ip_type = _scope.types1[0];
			// _scope.bind_ip_loading = false;
		}
	};
	function getSubnets(Network,_scope){
		if(Network.subnets.length){
			$scope.network_loading = true;
			$scope.bind_ip_loading = true;
			network.query_sub({id: Network.id }, function(res){
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			})
		}
		else{
			_scope.subnets = [];
			_scope.subnet = null;
			_scope.switchIps(_scope.subnet, _scope);
		}

	};
	$scope.getNetwork = function(host){
		if(host){
			networkWithHost.query({host: host.host_uuid}, function(res){
				// $scope.networks = res.result.filter(function(item){ return item.subnets.length!==0 });
				$scope.networks = res.result;
				$scope.network = $scope.networks[0];
				getSubnets($scope.network, $scope);
			}, function(){});
		}

	}
	$scope.switchSubnet = function(val, _scope){
		getSubnets(val,_scope);
	}

	$scope.ok = function(callback){
		// if(this.bind_ip_type.value === 'static' && this.bind_ip === '无可用IP'){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("hasStaticIP_TIP"),
		// 		timeout	: 6000
		// 	});
		// } else{
			$scope.submiting = true ;
			$scope.afterSubmiting =false ;
			var _ip = this.bind_ip_type.value === 'static' ? this.bind_ip.value : undefined;
			var host_uuid = this.host.host_uuid;
			var postData = {
				system_image_file: this.sys_iso,
				name: this.name,
				os: this.os_type.key,
				owner: this.owner.id,
				network: this.network.id,
				subnet: this.subnet?this.subnet.id:"",
				band_ip: _ip,
				band_type: this.bind_ip_type.value,
				host_uuid: host_uuid
			};
			init.register_template(postData, function(res){
				$scope.submiting = false;
				$scope.afterSubmiting = true;
				callback({
					image_id: res.image_id,
					servers: [{uuid: host_uuid}]
				});
			}, function(){
				callback(null);
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
		// }
	};

    
    $scope.$on("deploy:set", function(e, name, value){
    	if(name === "system-image") {
    		$scope.selectIsoName = value;
    		loadData();
    		// if(selectIsoByName(value)) {
    		// 	$scope.getVirtualHost($scope.sys_iso.virtual_type, $scope.sys_iso.rbd_enabled);
    		// }
    	}
    });

    function selectIsoByName(name) {
    	var iso = $scope.sys_iso;
    	var hit = false;
    	if(iso && iso.name === name) {
    		return true;
    	}
    	angular.forEach($scope.sys_isos, function(iso){
    		if(iso.name === name) {
    			this.sys_iso = iso;
    			hit = true;
    		}
    	}, $scope);
    	return hit;
    }

    $scope.showTemplateBlock = function(data, browserRefresh){
    	// 切换视图
    	$scope.registerFormLoading = true;
    	$scope.loadingTeachTemplates = true;
    	TeachTemplate.query({ids: [data.image_id]}, function(res){
    		var teachTemplates = res.win_images.concat(res.linux_images).concat(res.other_images);

    		teachTemplates.forEach(function(row){
    			var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
    			os && os.icon && (row.icon = os.icon);
    			if(row.os_type.indexOf("_64")>-1)
    				row.os_type = row.os_type.slice(0,row.os_type.indexOf("_64"));
    			if(row.os_type.indexOf("(64 bit)")>-1)
    				row.os_type = row.os_type.slice(0,row.os_type.indexOf("(64 bit)"));
    		});
    		teachTemplates.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });

    		$scope.teachTemplates = teachTemplates;
    		if(testTempateCreateDone(teachTemplates)) {
    			data.xp = isXP(teachTemplates[0]);
    			onCreateTemplateDone(data, browserRefresh);
    		} else {
    			if(browserRefresh) {
    				$scope.$eval("knowStep()");
    			}
    			loopTemplateStatus(data).then(function(v){
    				data.xp = v;
    				onCreateTemplateDone(data, browserRefresh);
    			}).catch(function(err){
    				$.bigBox({
    					title	: $$$I18N.get("INFOR_TIP"),
    					color : "#C46A69",
    					content	: err,
    					timeout	: 6000
    				});
    			});
    		}
    	}).$promise.finally(function(){
    		$scope.loadingTeachTemplates = false;
    	});
    };

	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教学模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: ["$scope", "$modalInstance", function(modalScope, $modalInstance){
				var template = TeachTemplate;
				var rows = [item];
				modalScope.name = rows.map(function(row){ return row.name }).join(', ');
				modalScope.ok = function(){
					template.delete({ id: [item.id] }, function(res){
	                	$scope.$eval("setStep(0)");
	                	$scope.registerFormLoading = false;
					});
					$modalInstance.close();
				};
				modalScope.close = function(){
					$modalInstance.close();
				}
			}],
			size: "sm"
		});
	};

    function loopTemplateStatus(res){
    	var timer = $interval(function(){
			var root = $scope.$root;
			// TODO: 某些情况这里还是会报错
			if(root) {
				root.$broadcast("imageIDS", [res.image_id]);
			} else {
				$interval.cancel(timer);
				timer = null;
			}
			
		}, 1000);
		return new Promise(function(resolve, reject){
			var dereg = $scope.$on("imagesRowsUpdate", function(e, data){
				var templates = $scope.teachTemplates;
				var _rows = {};
				templates.forEach(function(item){
					_rows[item.id] = item;
				});
				data.forEach(function(item){
					if(_rows[item.id]){
						for(var k in item){
							_rows[item.id][k] = item[k];
						}
					}
				});
				templates = templates.filter(function(item){ return item.type_code ===1 });
				templates.forEach(function(row){
					if(row.sync_status){
						var updateInfor = row.sync_status.filter(function(item){ return item.type === "image" });
						if(updateInfor.length!==0)
							row.updateSize = (updateInfor[0].size/1024/1024/1024).toFixed(2);
					}
				})
				$scope.teachTemplates = templates;
				if(testTempateCreateDone(templates)) {
					$interval.cancel(timer);
					dereg();
					timer = null;
					resolve(isXP(templates[0]));
				}
				if(templates[0].status === "register failed") {
					$interval.cancel(timer);
					dereg();
					timer = null;
					reject($$$I18N.get("REGISTER_FAILED"));
				}
			});
		});
		$scope.$on("$destroy", function(){
			timer && $interval.cancel(timer);
		});
    };

    function testTempateCreateDone(templates){
    	return templates && templates.length > 0 && templates[0].status === "alive";
    }

    function onCreateTemplateDone(res, browserRefresh){
    	var root = $scope.$root;
    	root.$broadcast("currentStepChange", 2);
		root.$broadcast("deploy:set", "image_id", res.image_id);
		root.$broadcast("deploy:set", "servers", res.servers);
		root.$broadcast("deploy:set", "isxp", res.xp);
		if(res.max_instance) {
			root.$broadcast("deploy:set", "max_instance", res.max_instance);
		} else {
			// force trigger request `/thor/init/quickstart`
			root.$broadcast("deploy:set", "max_instance", false);
		}
		
		$scope.registerFormLoading = false;
		if(browserRefresh === true) {
			$scope.$eval("knowStep()");
		}
    }

    function isXP(template) {
    	var ostype = template.os_type || "";
    	return /^Windows\s*XP/.test(ostype);
    }
    // 快速部署过程中浏览器重新刷新，自动进入轮训
    $scope.$on("browser refresh", function(e, step, res){
    	if(step !== 1) { return; }
    	// 显示模板
    	$scope.showTemplateBlock(res, true);
    });
}])
// 第三步：创建教学场景
.controller('createTeachSceneController', [
	'$scope', '$modal', 'SystemDeploy', "TeachTemplate", "SchoolRoom", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types","$$$I18N", "UserRole","Network", "virtualHost", "networkWithHost", "$rootScope", "$q",
	function($scope, $modal, init, teach, SchoolRoom, hardware, iso, admin, $$$os_types,$$$I18N, UserRole, network, virtualHost, networkWithHost, $root, $q){
		$scope.min_namelength=2;
		$scope.max_namelength=20;

		var data = $scope.data = {
			name: "default",
			cpu_num: 2,
			memory_mb: 2,
			system_gb: 20,
			kwargs: {
				data_rollback: 1,
				hostname_beginwith: 1,
				hostname_prefix: "PC",
				hostname_type: 1,
				is_exam: false,
				rollback: 1,
				usb_redir: true
			}
		};

		$scope.btndisks = [];
		$scope.master = {};

		SchoolRoom.querywithSimple(function(res){
			$scope.classrooms = res.pools_.concat([{
				id: -1,
				name: $$$I18N.get("新增自定义教室")
			}]);
			$scope.classroom = $scope.classrooms[0];
		});

		hardware.query(function(res){
			$scope.hardwareList = res.result.concat([{
				id: -1,
				name: $$$I18N.get("新增自定义模板")
			}]);
			$scope.hardware = $scope.hardwareList[0];
		});

		network.query(function(data){
			$scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
			$scope.data.network = $scope.networks[0];
			getSubnets($scope.data.network);
		});

		$scope.addbtndisk = function(){
			$scope.btndisks.push({local_gb: 5});
		};
		$scope.minusbtndisk = function(){
			// var idx = $scope.btndisks.indexOf(i)
			$scope.btndisks.splice($scope.btndisks.length-1,1);
		};

		$scope.switchSubnet = function(val){
			getSubnets(val);
		};
			

		function getSubnets(Network){
			$scope.network_loading = true;
			network.query_sub({id: Network.id }, function(res){
				$scope.subnets = res.result;
				$scope.data.subnet = $scope.subnets[0];
				$scope.network_loading = false;
			});
		}
			
		
		$scope.getValues = function(){
			var values = angular.extend({
				name: data.name,
				instance_max: data.instance_max,
				servers: data.servers,
				image_id: data.image_id
			}, data.kwargs);
			if($scope.classroom.id === -1) {
				angular.extend(values, {
					pool_name: data.classroomName,
					desc: data.desc,
					network_id: data.network.id,
					subnet_id: data.subnet.id
				});
			} else {
				values.pool = $scope.classroom.id;
			}
			if($scope.hardware.id === -1) {
				angular.extend(values, {
					instance_type_name: data.hardwareName,
					cpu_num: data.cpu_num,
					memory_mb: data.memory_mb * 1024,
					system_gb: data.system_gb
				});
				angular.forEach([0, 1], function(i){
					var disk = $scope.btndisks[i];
					if(i === 0) {
						values.local_gb = disk ? disk.local_gb : 0;
					} else {
						values['local_gb' + i] = disk ? disk.local_gb : 0;
					}
				});
			} else {
				values.instance_type = $scope.hardware.id;
			}
			return values;
		};

		$scope.showAdvanceSceneOptionDialog = function(){
			var isxp = data.isxp;
		    $modal.open({
		        templateUrl: "views/vdi/dialog/system/system_deploy_advance_options.html",
		        controller: "teachSceneOptionDialog",
		        resolve: {
		        	isxp: function(){ return isxp; },
		        	kwargs: function(){ return data.kwargs; }
		        }
		    }).result.then(function(options){
		    	data.kwargs = options;
		    });
		};

		$scope.getMaxInstance = function(){
			init.quickstart(function(res){
				data.max_instance = res.max_instance;
			});
		};

		$scope.$on("deploy:set", function(e, name, value){
			data[name] = value;
			if(value === false && name === "max_instance") {
				$scope.getMaxInstance();
			}
		});
	}])
// 高级 dialog
.controller("teachSceneOptionDialog", ["$scope", "$modalInstance", "$rootScope", "localize", "isxp", "kwargs", "PersonDesktop", function(scope, modalInstance, rootScope, localize, isxp, kwargs, PersonDesktop){
	var defaults = {
        usb_redir: true,
        usb_version: isxp ? '2.0' : '3.0',
        rollback: '1',
        rollback_weekday: '1',
        rollback_monthday: '1',
        data_rollback: '1',
        data_rollback_weekday: '1',
        data_rollback_monthday: '1',
        hostname_type: '1',
        hostname_prefix: 'PC',
        hostname_beginwith: 1,
        username_type: '1',
        username_prefix: 'K',
        username_beginwith: 1,
        isxp: isxp,
        enable_share: false
    };
	var data = scope.data = angular.extend(defaults, kwargs || {});
	scope.loading_server = true;
	PersonDesktop.share_servers(function(res){
		scope.loading_server = false;
		var servers = [];
		res.servers.forEach(function(server){
			server.nets.forEach(function(net){
				servers.push({id: server.id, net: {ip_address: net.ip_address, network_id: net.network_id, subnet_id: net.subnet_id}})
			})
		});
		scope.share_servers = servers;
		scope.data.share_server = scope.share_servers[0];
	})

	scope.USBRedictTips = localize.localizeText("USBRedictTips");
	scope.auto_mountPersonalTips = localize.localizeText("auto_mountPersonalTips");
    data.RDP = kwargs.is_exam;
    if(kwargs.username_prefix) {
    	data.MORE = true;
    	angular.forEach(["username_prefix", "username_beginwith", "username_type"], function(s){
    		scope[s] = kwargs[s];
    	});
    }
    if(kwargs.hostname_prefix) {
    	angular.forEach(["hostname_beginwith", "hostname_prefix", "hostname_type"], function(s){
    		scope[s] = kwargs[s];
    	});
    }
    angular.forEach({
    	rollback_weekday: "2",
    	rollback_monthday: "3",
    }, function(v, k){
    	if(kwargs.hasOwnProperty(k)) {
    		scope.rollback = v;
    		scope[k] = kwargs[k];
    	}
    });
    angular.forEach({
    	data_rollback_weekday: "2",
    	data_rollback_monthday: "3",
    }, function(v, k){
    	if(kwargs.hasOwnProperty(k)) {
    		scope.data_rollback = v;
    		scope[k] = kwargs[k];
    	}
    });
    scope.addZero = function(len,str_begin,str_end){
        if(str_end && str_begin){
            var end_len = str_end.toString().length;
            if(end_len < len){
                return  str_begin + new Array(len - end_len+1).join("0") + str_end;
            }else{
                return str_begin + str_end;
            }
        }
    };
    
    scope.ok = function () {
        var postData = {};
        // 这里的 this 引用了真正的 scope
        postData.enable_share = data.enable_share,
        postData.share_server_ip = data.enable_share ? data.share_server.net.ip_address : undefined;
        postData.share_server_id =  data.enable_share ? data.share_server.id : undefined;
        postData.usb_redir    = data.usb_redir;
        postData.usb_version  = data.usb_redir ? data.usb_version : null;
        postData.rollback      = data.rollback;
        postData.data_rollback = data.data_rollback;
        if(postData.rollback === "2"){
            postData.rollback_weekday = data.rollback_weekday;
        }
        if(postData.rollback === "3"){
            postData.rollback_monthday = data.rollback_monthday;
        }
        if(postData.data_rollback === "2"){
            postData.data_rollback_weekday = data.data_rollback_weekday;
        }
        if(postData.data_rollback === "3"){
            postData.data_rollback_monthday = data.data_rollback_monthday;
        }

        angular.forEach(["hostname_beginwith", "hostname_prefix", "hostname_type"], function(s){
    		postData[s] = data[s];
    	});
        postData.is_exam = !!data.RDP;
        if(data.MORE){
            angular.forEach(["username_prefix", "username_beginwith", "username_type"], function(s){
            	postData[s] = data[s];
            });
        }
        rootScope.$broadcast("scene-options", postData);
        modalInstance.close(postData);
    };
    scope.close = function () {
        modalInstance.dismiss();
    };
}])
.controller("importByServerController", ["$scope", "$timeout", "$modalInstance", "SystemDeploy", function($scope, $timeout, $modalInstance, init){
	var importedImgs = [];
	var self = this;
	self.selected = null;
	self.remote_imgs = [];
	self.loading = false;

	self.refreshImgs = function(){
		init.scan_iso(function (res) {
			var imgs = {};
		    angular.forEach(self.remote_imgs, function(img){
		    	imgs[img.path] = img;
		    });
		    angular.forEach(res.result, function(img){
		    	if(imgs.hasOwnProperty(img.path)) {
		    		angular.extend(imgs[img.path], img);
		    	} else {
		    		self.remote_imgs.push(img);
		    	}
		    });
		}).$promise.finally(function(){
			self.loading = false;
		});
		self.loading = true;
	};

	self.importSelected = function () {
		var img = self.selected;
		if(!img) { return; }
	    init.import_iso({
	        upload_type: 'local',
	        src_file: [img.path]
	    }, function (res) {
	    	loopImportProgress(angular.copy(img), function(){
	    		importedImgs.push(img);
	    		self.is_importing = false;
	    		img.imported = true;
	    		delete self.selected;
	    		self.close();
	    	}, function(){
	    		self.is_importing = false;
	    	});
	    }, function(){
	    	self.is_importing = false;
	    });
	    self.is_importing = true;
	};
	
	self.close = function(){
		$modalInstance.close(importedImgs);
	};

	self.isAjaxOn = function(){
		return self.loading || self.is_importing;
	};

	self.showRemain = function(){
		var yes = self.is_importing;
		yes = yes && self.hasOwnProperty("remain");
		if(yes) {
			yes = self.remain.hasOwnProperty("hour");
		}
		return yes;
	};

	self.refreshImgs();

	function loopImportProgress(img, doneCallback, failCallback){
		var time = self.remain = {};
		img.total = img.size;
		img.startTime = Date.now();
		var hasFeature = !!console.time;
		var label = "[upload " + img.path + "]";
		hasFeature && console.time(label);
		loop();
		function loop(){
			init.import_progress(function(res){
				var filemap = {};
				angular.forEach(res.result, function(item){
					if(item.filename === img.filename) {
						angular.extend(img, item);
					}
				});
				// 还没有开始导入，此时不显示数据
				if(img.size === 0) {
					$timeout(loop, 1000);
					return;
				}
				var remainSize = img.total - img.size;
				var speed = img.size / (Date.now() - img.startTime);
				var remainTime = Math.floor(remainSize / speed / 1000);
				time.hour = Math.floor(remainTime / 3600);
				time.minute = Math.floor(remainTime / 60);
				time.second = Math.floor(remainTime % 60);
				if(img.total === img.size) {
					hasFeature && console.timeEnd(label);
					doneCallback();
				} else {
					$timeout(loop, 1000);
				}
			}, failCallback);
		}
	}
}])
.controller("quickstartController", ["$scope", "$element", "$location", function($scope, $element, $location){
	var menuWidth = 220;
	// 循环计时器
	var updateTimer;
	// 缓存的样式
	var oldContentStyles = {};
	var oldArrowStyles = {};
	// 是否需要手动点击快速部署父菜单的标记
	var opened = false;
	$scope.ok = function(){
		cleanDOM();
		$location.url("/system/deploy");
	};
	$scope.close = function(){
		cleanDOM();
		$location.url("/summary");
	};
	$scope.$on("NOAUTH", cleanDOM);

    updatePosition();

	function updatePosition(){
		var alignTarget = $("li[nav-title='快速部署']");
		if(alignTarget.length === 0) {
			updateTimer = setTimeout(updatePosition, 100);
			return;
		}
		// 高亮 快速部署 菜单项
		alignTarget.addClass("left-menu-item-on");
		// 如果父菜单没有展开，手动展开
		var pmenu = alignTarget.parents("li");
		if(!pmenu.hasClass("open") && !opened) {
			pmenu.children("a")[0].click();
			opened = true;
			setTimeout(function(){
				if(!pmenu.hasClass("opened")) {
					opened = false;
				}
			}, 300);
		}
		var targetOffset = alignTarget.offset();
		var totalWidth = $(window).width();
		var totalHeight = $(window).height();
	    var $content = $("#quickMaskModel .content");
	    var $arrow = $("#quickMaskModel .jiantou");
	    if(!$content || !$arrow) { return; }
	    // 水平垂直居中
	    var contentStyles = {
			'margin-left': $content.outerWidth() / -2,
			'margin-top': $content.outerHeight() / -2
		};
		if(!equalsRoughly(contentStyles, oldContentStyles)) {
			$content.css(contentStyles);
			oldContentStyles = contentStyles;
		}
		$arrow[totalWidth < 979 ? 'hide' : 'show']();
		var btn = $content.find(".btn-primary");
		var btnOffset = btn.offset();
		var contentLeft = $content.offset().left;
		var arrowTop = btnOffset.top + btn.outerHeight() + 5;
		// var arrowRight = (btnOffset.left - contentLeft) / 2 + contentLeft;
		var arrowRight = btnOffset.left + btn.outerWidth() / 2;
		if(totalWidth > 1460) {
			arrowRight = $content.offset().left + parseInt($content.css("padding-left"));
		}
		var arrowWidth = arrowRight - menuWidth;
		var arrowHeight = targetOffset.top + alignTarget.outerHeight() / 2 - arrowTop;
		var arrowStyles = {
			left: menuWidth,
			top: arrowTop + 6,
			width: arrowWidth,
			height: arrowHeight > 0 ? arrowHeight : 0,
			"background-position-x": totalWidth > 1460 ? "right" : "left"
		};
		// 仅在计算的样式与之上一次计算的样式不同时才应用样式
		if(!equalsRoughly(arrowStyles, oldArrowStyles)) {
			$arrow.css(arrowStyles);
			oldArrowStyles = arrowStyles;
		}
		updateTimer = setTimeout(updatePosition, 100);
	}

	function cleanDOM() {
		$element.remove();
		$scope.$destroy();
		$("li[nav-title='快速部署']").removeClass("left-menu-item-on");
		clearTimeout(updateTimer);
	}

	function equalsRoughly(obj1, obj2) {
		var eq = true;
		var keys = Object.keys(obj1);
		angular.forEach(keys, function(key){
			var v1 = obj1[key] || 0;
			var v2 = obj2[key] || 0;
			if(typeof v1 !== "number" || typeof v2 !== "number") {
				return;
			}
			if(Math.abs(v1 - v2) >= 5) {
				eq = false;
			}
		});
		return eq;
	}
}])
.controller("vdiSystemUSBThroughController", ["$scope", "$modal", "USBPassThrough",function($scope, $modal,USBPassThrough){

	$scope.rows = [];
	$scope.loading = true;

	var get_rows = function(){
		USBPassThrough.query(function(res){
			$scope.rows = res.devices_info.sort(function(a,b){ return a.manufacturer>b.manufacturer?1:-1 });
			$scope.loading = false;
		});
	};
	get_rows();
	
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;
	var _SCOPE = $scope;

	$scope.through = function(item){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/through_add.html",
			controller: "USBthroughDialog",
			scope: $scope,
			size: "md",
			resolve:{
				params : function(){
					return { throughItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function(data){
			if(data){
				get_rows();
			}
		});
	}
	$scope.editThrough = function(item){
		item.edit = true;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/through_add.html",
			controller: "USBthroughDialog",
			scope: $scope,
			size: "md",
			resolve:{
				params : function(){
					return { throughItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function(data){
			if(data){
				get_rows();
			}
		});
	}
	$scope.cancelThrough = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='取消绑定'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='CANCEL_THROUGH'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					$scope.loading = true;
					var data = {
						compute_node_id: item.compute_node_id,
						identify: item.identify,
						instance_id: item.instance_id
					}
					USBPassThrough.cancel(data,function(res){
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
	};
}])
.controller('USBthroughDialog', ['$scope',"$modalInstance","AutoSnapshot","ResourcePool", "params", "Scene","TeachDesktop","FenTemplate","$$$I18N","TreeInstances","USBPassThrough",function($scope,$modalInstance,AutoSnapshot,ResourcePool,params,Scene,TeachDesktop,FenTemplate,$$$I18N,TreeInstances,USBPassThrough){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = params.throughItem;
	if(!$scope.data.edit){
		$scope.data.type = null;
		$scope.data.scene_id = null;
	}
	var old_instance_id = $scope.data.instance_id;
	$scope.data.expandedNodes = [];
	$scope.all_users = [];
	$scope.selectedUsers = {};

	$scope.changeType = function(type, flag){
		if(!flag){
			$scope.data.scene_id = null;
			$scope.data.instance_id = null;
			$scope.data.selected_desktop = null;
		}
		if(type=='2'){
			getScenesDektop();
		}else if(type=='1'){
			getCommonDektop();
		}else{
			getSystemDektop();
		}
	}
	if($scope.data.edit){
		$scope.changeType($scope.data.type, true)
	}
	function getScenesDektop(){
		Scene.query(function(res){
			$scope.scenes = res.modes.filter(function(item){ return item.virtual_type == 'kvm' });
			if($scope.data.scene_id){
				$scope.data.scene = $scope.scenes.filter(function(item){ return item.id == $scope.data.scene_id })[0];
			}else{ $scope.data.scene = $scope.scenes[0]; }
			$scope.getTeaches($scope.data.scene);
		},function(){  })
	}
	$scope.getTeaches = function(scene){
		if(scene){
			$scope.teachLoading = true;
			TeachDesktop.query({ id : scene.id },function(res){
				$scope.teachLoading = false;
				$scope.teaches = res.result;
				if($scope.data.instance_id){
					$scope.data.teach = $scope.teaches.filter(function(item){ return item.instance_id == $scope.data.instance_id })[0];
				}else{
					$scope.data.teach = $scope.teaches[0];
				}
			},function(){ $scope.teachLoading = false; })
		}
	}
	function getCommonDektop(){
		$scope.loadDesktops = true;
		TreeInstances.query({resource_pool: $scope.data.resource_pool_uuid}, function(res){
			var adminUsers = res.result.filter(function(u){ return u.type=='admin'&&u.desktop_num });
			var adminDesktops = [];
			adminUsers.forEach(function(u){
				u.desktops.forEach(function(desk){adminDesktops.push(desk)})
			})
			var datas = [];
			if(getAdminNum(adminUsers)){
				datas.push({name: $$$I18N.get('管理用户关联桌面'),desktop_num: getAdminNum(adminUsers), desktops: adminDesktops})
			}
			res.result.forEach(function(item){
				if(item.type=='common' && item.desktop_num){
					datas.push(item);
				}else if(item.type=='domain' && item.desktop_num){
					datas.push(item);
				}else{}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas),"children");
			if($scope.data.instance_id){
				$scope.data.selected_desktop = $scope.all_users.filter(d => {
					return d.desktop_id === $scope.data.instance_id;
				})[0];
			}
			$scope.loadDesktops = false;
		});
	}
	function getSystemDektop(){
		FenTemplate.query(function(res){
			$scope.sys_desktops = res.win_images.concat(res.linux_images).concat(res.other_images);
			if($scope.data.instance_id){
				$scope.data.sys_desktop = $scope.sys_desktops.filter(function(item){ return item.id == $scope.data.instance_id })[0];
			}else{
				$scope.data.sys_desktop = $scope.sys_desktops[0];
			}
			$scope.data.sys_desktop = $scope.sys_desktops[0];
		},function(){})

	}

	/* 个人桌面数据拉取及配置 */
	$scope.desktopsTreeOptions = {
         dirSelectable:false,
         injectClasses:{
         	"liSelected":"tree-leaf-active"
         }
    };
	function getAdminNum(rows){
		return rows.reduce(function(count, item){
			return count + item.desktop_num;
		}, 0);
	}
	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if(!node.dept_id) { return; }
			if(node.children) {
                node.children = node.children.filter(noUserFilter);
                node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
            if(node.dept_id && !node.children && node.desktops.length === 0) {
                return false;
            }
            return true;
        }
    }
	function formatData(d,name){
		iteration(d,name);
		return d;
	}
	function iteration(data,childName,list){
		for(var i = 0 ; i < data.length ; i++){
			$scope.data.expandedNodes.push(data[i]);
			if(data[i][childName] && data[i][childName].length){
				var len = iteration(data[i][childName],childName);
				if(len === 0){
					data[i] = undefined;
				}
			}
			if(!data[i]) { continue; }
			if(data[i].desktops && data[i].desktops.length > 0){
				data[i].desktops.map(user => {
					user.name = user.name || user.user_name;
					user.id = user.id || user.desktop_id;
					user._is_last = true;
					$scope.all_users.push(user);
					return user;
				});
				data[i][childName] = data[i].desktops;
			}
			if(data[i][childName] && data[i][childName].length === 0){
				data[i]= undefined;
			}
		}
		while(data.length > 0) {
			// 如果有数组元素为空，每次删除一个
			var oldlen = data.length;
			for(var i = 0 ; i < oldlen ; i++){
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
	/* 个人桌面数据拉取及配置---------------end */

	$scope.ok = function(){
		$scope.submiting = true;
		var instance_id = "";
		if(this.data.type=='2'){
			instance_id = this.data.teach.instance_id;
		}else if(this.data.type=='1'){
			instance_id = this.data.selected_desktop.desktop_id;
		}else{
			instance_id = this.data.sys_desktop.instance_id;
		}
		var data = {
			compute_node_id: this.data.compute_node_id,
			identify: this.data.identify,
			instance_id: instance_id,
			old_instance_id: this.data.edit?old_instance_id:undefined
		};
		console.log(11111, data)
		USBPassThrough.save(data,function(res){
			$scope.submiting = false;
			$modalInstance.close(res);
		},function(){
			$scope.submiting = false;
		})

	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller("vdiSystemAutoSnapshotController", ["$scope", "AutoSnapshot", "$modal",function($scope, AutoSnapshot, $modal){
	$scope.rows = [];
	$scope.loading = true;
	var get_rows = function(){
		AutoSnapshot.query(function(res){
			$scope.rows = res.result.sort(function(a,b){ return a.name>b.name?1:-1 });
			$scope.rows.forEach(function(item){
				if(item.period=='weekly'){
					item.date = 'weekly' + item.week_date;
				}else if(item.period=='monthly'){
					item.date = 'monthly' + item.month_date;
				}
			})
			$scope.loading = false;
		});
	};
	get_rows();
	
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;
	var _SCOPE = $scope;

	$scope.active = function(snapshot){
		$scope.rows.forEach(function(item){
			if(item.id == snapshot.id){
				item.active_loadding = true;
			}
		});
		AutoSnapshot.active({ id: snapshot.id, active: !snapshot.active }, function(res){
			get_rows();
			$scope.rows.forEach(function(item){
				if(item.id == snapshot.id){
					item.active = !snapshot.active;
					item.active_loadding = false;
				}
			});
		}, function(err){
			get_rows();
			$scope.rows.forEach(function(item){
				if(item.id == snapshot.id){
					item.active = snapshot.active;
					item.active_loadding = false;
				}
			});
		});
	}
	$scope.add = function(){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_add.html",
			controller: "addSnapshotDialog",
			size: "md"
		});
		dialog.result.then(function(res){
			if(res){
				get_rows();
			}
		});
	}
	$scope.edit = function(item){
		item.edit = true;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_edit.html",
			controller: "editSnapshotDialog",
			scope: $scope,
			size: "md",
			resolve:{
				params : function(){
					return { snapshotItem: angular.copy(item) };
				}
			}
		});
		dialog.result.then(function(data){
			if(data){
				get_rows();
			}
		});
	}
	$scope.view = function(item){
		item.edit = false;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/system/snapshot_edit.html",
			controller: "editSnapshotDialog",
			scope: $scope,
			size: "md",
			resolve:{
				params : function(){
					return { snapshotItem: angular.copy(item) };
				}
			}
		});
	}
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除自动快照策略'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p localize='DELETE_AUTO_SNAPSHOT'></p><footer class='text-right'><img src='img/loadingtext.gif' ng-if='loading' height='24' width='24' alt=''><button class='btn btn-primary' ng-if='!loading' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					$scope.loading = true;
					AutoSnapshot.delete({ids: selected_rows.map(function(row){ return row.id; })},function(res){
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
	};
}])
.controller('addSnapshotDialog', ['$scope',"$modalInstance","AutoSnapshot","ResourcePool","$$$I18N","TreeInstances",function($scope,$modalInstance,AutoSnapshot,ResourcePool,$$$I18N,TreeInstances){
	$scope.min_namelength=2;$scope.max_namelength=20;

	$scope.data = {expandedNodes: []};

	ResourcePool.query(function(res){
		// $scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.resources = res.result
		$scope.data.resource = $scope.resources[0];
		$scope.data.resource && $scope.queryTreeInstances($scope.data.resource)
	});

	/* 个人桌面数据拉取及配置 */
	$scope.selectedUsers = {};
	function getAdminNum(rows){
		return rows.reduce(function(count, item){
			return count + item.desktop_num;
		}, 0);
	}
	
	$scope.queryTreeInstances = function(resource){
		$scope.loadDesktops = true;
		TreeInstances.query({resource_pool: resource.id, need_rollback_desktops: 0}, function(res){
			var adminUsers = res.result.filter(function(u){ return u.type=='admin'&&u.desktop_num });
			var adminDesktops = [];
			adminUsers.forEach(function(u){
				u.desktops.forEach(function(desk){
					adminDesktops.push(desk);
				})
			})
			var datas = [];
			if(getAdminNum(adminUsers)){
				datas.push({name: $$$I18N.get('管理用户关联桌面'),desktop_num: getAdminNum(adminUsers), desktops: adminDesktops})
			}
			res.result.forEach(function(item){
				if(item.type=='common' && item.desktop_num){
					datas.push(item);
				}else if(item.type=='domain' && item.desktop_num){
					datas.push(item);
				}else{}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas),"children");
			$scope.loadDesktops = false;
			console.log(1111111, $scope.data.expandedNodes)
		});
	}
	
	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if(!node.dept_id) { return; }
			if(node.children) {
                node.children = node.children.filter(noUserFilter);
                node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
            if(node.dept_id && !node.children && node.desktops.length === 0) {
                return false;
            }
            return true;
        }
    }
	function formatData(d,name){
		iteration(d,name);
		return d;
	}

	function iteration(data,childName,list){
		for(var i = 0 ; i < data.length ; i++){
			$scope.data.expandedNodes.push(data[i]);
			if(data[i][childName] && data[i][childName].length){
				var len = iteration(data[i][childName],childName);
				if(len === 0){
					data[i] = undefined;
				}
			}
			if(!data[i]) { continue; }
			if(data[i].desktops && data[i].desktops.length > 0){
				data[i].desktops.map(user => {
					user.name = user.name || user.user_name;
					user._is_last = true;
					return user;
				});
				data[i][childName] = data[i].desktops;
			}
			if(data[i][childName] && data[i][childName].length === 0){
				data[i]= undefined;
			}
		}
		while(data.length > 0) {
			// 如果有数组元素为空，每次删除一个
			var oldlen = data.length;
			for(var i = 0 ; i < oldlen ; i++){
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

	function recursionNode(obj, selected,name){
		if(obj[name]){
			obj[name].forEach(function(item){
				item._selected = selected;
				recursionNode(item, selected,name);
			});
		}
	}

	function calculateSelectedLeafs(node,cName,leafs){
		// 计算每一次点击有多少用户被选中
		var _id = node.id || node.desktop_id;
		if(node[cName] && node[cName].length){
			node[cName].forEach(n => {
				calculateSelectedLeafs(n,cName,leafs)
			})
		}else{
			node._selected ? ($scope.selectedUsers[_id] = node) : (delete $scope.selectedUsers[_id]);
		}
	}

	$scope.showManageSelected = function(node, selected, $parentNode, $index, $first, $middle, $last, $odd, $even, $path,nodeChildren){
		var childName = nodeChildren || "children";
		node._selected = !node._selected;
		recursionNode(node, node._selected,childName);
		calculateSelectedLeafs(node,childName,$scope.selectedUsers);
		$path().forEach(function(item,index){
			if(index!==0){
				var _selectedNum = item[childName].filter(function(item){ return item._selected==true }).length;
				var _middSelectedNum = item[childName].filter(function(item){ return item._selected=='middle' }).length;
				if(!_selectedNum){
					item._selected = false;
				}
				if(_selectedNum == item[childName].length){ item._selected = true; }
				if(_middSelectedNum || (_selectedNum && _selectedNum !== item[childName].length)){ item._selected = 'middle'; }
			}
		});
	}

	$scope.selectedUsersNums = function(){
		return Object.keys($scope.selectedUsers).length;
	}
	$scope.ok = function(){
		$scope.submiting = true;
		var data = {
			name: this.data.name,
			description: this.data.description,
			resource_pool: this.data.resource.uuid,
			period: this.data.period,
			week_date: this.data.period=='weekly'?this.data.week_date:undefined,
			month_date: this.data.period=='monthly'?this.data.month_date:undefined,
			instances: Object.keys($scope.selectedUsers)
		};
		AutoSnapshot.save(data,function(res){
			$scope.submiting = false;
			$modalInstance.close(res);
		},function(){
			$scope.submiting = false;
		})
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller('editSnapshotDialog', ['$scope',"$modalInstance","AutoSnapshot","ResourcePool","$$$I18N","TreeInstances","params",function($scope,$modalInstance,AutoSnapshot,ResourcePool,$$$I18N,TreeInstances,params){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = params.snapshotItem;
	$scope.data.expandedNodes = [];
	$scope.all_desktops = [];

	ResourcePool.query(function(res){
		// $scope.resources = res.result.filter(function(item){ return item.hosts.length > 0});
		$scope.resources = res.result
		$scope.data.resource = $scope.resources.filter(function(item){ return item.uuid == $scope.data.resource_pool })[0];
		$scope.data.resource && $scope.queryTreeInstances($scope.data.resource);
	});
	$scope.initPeriod = function(period){
		if(period=='weekly'){
			$scope.data.week_date = '1';
		}else if(period=='monthly'){
			$scope.data.month_date = '1';
		}
	}
	/* 个人桌面数据拉取及配置 */
	$scope.selectedUsers = {};
	if($scope.data.edit){
		$scope.desktopTreeOptions = {
			isSelectable: function(node) {
				return true;
			}
		};
	}else{
		$scope.desktopTreeOptions = {
			isSelectable: function(node) {
				return false;
			}
		};
	}
	function getAdminNum(rows){
		return rows.reduce(function(count, item){
			return count + item.desktop_num;
		}, 0);
	}

	$scope.queryTreeInstances = function(resource){
		$scope.loadDesktops = true;
		TreeInstances.query({resource_pool: resource.id, need_rollback_desktops: 0}, function(res){
			var adminUsers = res.result.filter(function(u){ return u.type=='admin'&&u.desktop_num });
			var adminDesktops = [];
			adminUsers.forEach(function(u){
				u.desktops.forEach(function(desk){
					adminDesktops.push(desk);
				})
			})
			var datas = [];
			if(getAdminNum(adminUsers)){
				datas.push({name: $$$I18N.get('管理用户关联桌面'),desktop_num: getAdminNum(adminUsers), desktops: adminDesktops})
			}
			res.result.forEach(function(item){
				if(item.type=='common' && item.desktop_num){
					datas.push(item);
				}else if(item.type=='domain' && item.desktop_num){
					datas.push(item);
				}else{}
			});
			$scope.desktops = formatData(removeNoChildrenDeparts(datas),"children");
			$scope.all_desktops.forEach(function(item){
				$scope.data.instances.forEach(function(instance){
					if(instance.instance_id == item.desktop_id){
						item._selected = true;
						$scope.selectedUsers[item.desktop_id] = item;
					}
				})
			});
			checkNodeSelected($scope.desktops)
			$scope.loadDesktops = false;
		});
	}
	
	function removeNoChildrenDeparts(data) {
		data = data.filter(noUserFilter);
		data.forEach(walk);
		return data;
		function walk(node) {
			if(!node.dept_id) { return; }
			if(node.children) {
                node.children = node.children.filter(noUserFilter);
                node.children.forEach(walk);
			}
		}
		function noUserFilter(node) {
            if(node.dept_id && !node.children && node.desktops.length === 0) {
                return false;
            }
            return true;
        }
    }
	function formatData(d,name){
		iteration(d,name);
		return d;
	}
	function checkNodeSelected(arr) {
		arr.forEach(function(node){
			if(node.children) {
				checkNodeSelected(node.children);
				var isAllSelected = true;
				var hasSelected = false;
				var hasMiddle = false;
				node.children.forEach(function(subNode){
					if(subNode._selected == 'middle') {
						hasMiddle = true;
						isAllSelected = false;
						return;
					}
					if(subNode._selected) {
						hasSelected = true;
					}
					isAllSelected = isAllSelected && subNode._selected;
				});
				if(isAllSelected) {
					node._selected = true;
				} else if(hasMiddle) {
					node._selected = "middle";
				} else if(hasSelected) {
					node._selected = "middle";
				}
			}
		})
		return arr;
	}
	function iteration(data,childName,list){
		for(var i = 0 ; i < data.length ; i++){
			$scope.data.expandedNodes.push(data[i]);
			if(data[i][childName] && data[i][childName].length){
				var len = iteration(data[i][childName],childName);
				if(len === 0){
					data[i] = undefined;
				}
			}
			if(!data[i]) { continue; }
			if(data[i].desktops && data[i].desktops.length > 0){
				data[i].desktops.map(user => {
					user.name = user.name || user.user_name;
					user.id = user.id || user.desktop_id;
					user._is_last = true;
					$scope.all_desktops.push(user);
					return user;
				});
				data[i][childName] = data[i].desktops;
			}
			if(data[i][childName] && data[i][childName].length === 0){
				data[i]= undefined;
			}
		}
		while(data.length > 0) {
			// 如果有数组元素为空，每次删除一个
			var oldlen = data.length;
			for(var i = 0 ; i < oldlen ; i++){
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
	function recursionNode(obj, selected,name){
		if(obj[name]){
			obj[name].forEach(function(item){
				item._selected = selected;
				recursionNode(item, selected,name);
			});
		}
	}
	function calculateSelectedLeafs(node,cName,leafs){
		// 计算每一次点击有多少用户被选中
		var _id = node.id || node.desktop_id;
		if(node[cName] && node[cName].length){
			node[cName].forEach(n => {
				calculateSelectedLeafs(n,cName,leafs)
			})
		}else{
			node._selected ? ($scope.selectedUsers[_id] = node) : (delete $scope.selectedUsers[_id]);
		}
	}
	$scope.showManageSelected = function(node, selected, $parentNode, $index, $first, $middle, $last, $odd, $even, $path,nodeChildren){
		var childName = nodeChildren || "children";
		node._selected = !node._selected;
		recursionNode(node, node._selected,childName);
		calculateSelectedLeafs(node,childName,$scope.selectedUsers);
		$path().forEach(function(item,index){
			if(index!==0){
				var _selectedNum = item[childName].filter(function(item){ return item._selected==true }).length;
				var _middSelectedNum = item[childName].filter(function(item){ return item._selected=='middle' }).length;
				if(!_selectedNum){
					item._selected = false;
				}
				if(_selectedNum == item[childName].length){ item._selected = true; }
				if(_middSelectedNum || (_selectedNum && _selectedNum !== item[childName].length)){ item._selected = 'middle'; }
			}
		});
	}

	$scope.selectedUsersNums = function(){
		return Object.keys($scope.selectedUsers).length;
	}
	$scope.ok = function(){
		$scope.submiting = true;
		var data = {
			id: this.data.id,
			name: this.data.name,
			description: this.data.description,
			resource_pool: this.data.resource.uuid,
			period: this.data.period,
			week_date: this.data.period=='weekly'?this.data.week_date:undefined,
			month_date: this.data.period=='monthly'?this.data.month_date:undefined,
			instances: Object.keys($scope.selectedUsers)
		};
		AutoSnapshot.update(data,function(res){
			$scope.submiting = false;
			$modalInstance.close(res);
		},function(){
			$scope.submiting = false;
		})
	}
	$scope.close = function(){
		$modalInstance.dismiss();
	};
}])
.controller("spiceConnectController", ["$scope", "$modal", "$$$I18N", "Spice",function($scope, $modal, $$$I18N, Spice){
	var spiceCtrl = this;
	spiceCtrl.getSpiceConnect = function(){
		spiceCtrl.loading = true;
		Spice.query(function(res){
			spiceCtrl.mode = res.spice_jpeg_compression;
			spiceCtrl.loading = false;
		},function(error){
			spiceCtrl.loading = false;
		})
	};
	spiceCtrl.getSpiceConnect();
	spiceCtrl.saveSpiceConnect = function(){
		spiceCtrl.save = true;
		Spice.save({spice_jpeg_compression: spiceCtrl.mode},function(res){
			spiceCtrl.save = false;
			spiceCtrl.getSpiceConnect();
			spiceCtrl.edit = false;
		},function(error){
			spiceCtrl.save = false;
		})
	};
}])
.controller("vdiSystemAutoclearController", ["$scope", "$modal", "$$$I18N", "Share",function($scope, $modal, $$$I18N, Share){
	var clearCtrl = this;
	clearCtrl.getClearTime = function(){
		clearCtrl.loading = true;
		Share.query(function(res){
			clearCtrl.day = res.value.day;
			var time = res.value.time.split(":");
			clearCtrl.hours = time[0];
			clearCtrl.minutes = time[1];
			clearCtrl.seconds = time[2];
			clearCtrl.loading = false;
		},function(error){
			clearCtrl.loading = false;
		})
	};
	clearCtrl.getClearTime();
	clearCtrl.saveClearTime = function(){
		if(clearCtrl.hours.length==1 && Number(clearCtrl.hours)>=0 && Number(clearCtrl.hours)<=9){
			clearCtrl.hours = "0"+clearCtrl.hours
		}
		if(clearCtrl.minutes.length==1 && Number(clearCtrl.minutes)>=0 && Number(clearCtrl.minutes)<=9){
			clearCtrl.minutes = "0"+clearCtrl.minutes
		}
		if(clearCtrl.seconds.length==1 && Number(clearCtrl.seconds)>=0 && Number(clearCtrl.seconds)<=9){
			clearCtrl.seconds = "0"+clearCtrl.seconds
		}
		var time = clearCtrl.hours + ":" + clearCtrl.minutes + ":" + clearCtrl.seconds;
		clearCtrl.save = true;
		Share.save({value: {day: clearCtrl.day, time: time}},function(res){
			clearCtrl.save = false;
			clearCtrl.getClearTime();
			clearCtrl.edit = false;
		},function(error){
			clearCtrl.save = false;
		})
	};
}])
