angular.module("vdi.template.person", ["vdi.template"])
.factory("PersonTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/2", isArray: false },
		update:
			{ method: "POST", url: $Domain + "/thor/image/modify_template/:id", params: { id: "@id" } },
		listModes:
			{ method: "GET", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" }, isArray: false },
		applyTemplate:
			{ method: "POST", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" } },
		status:
			{ method: "GET", url: $Domain + "/thor/image/status/:id", params: { id: "@id" } },
		copy:
			{ method: "POST", url: $Domain + "/thor/image/clone_template"},
		modify:
			{ method: "PUT", url: $Domain + "/thor/image/2", isArray: false },
		download:
			{ method: "GET", url: $Domain + "/thor/image/download/:id", params: { id: "@id" } },
		reset:
			{ method: "post", url: $Domain + "/thor/image/reset_template" },
		get_image_vnc_info:
			{ method: "GET", url: $Domain + "/thor/image/get_image_vnc_info" },
		get_image_rdp_info:
			{ method: "GET", url: $Domain + "/thor/image/get_image_rdp_info" },
		update_tpl_tip:
			{method:"GET",url:$Domain + "/thor/controller/ha_storage_state"}
	});
}])

.controller("vdiTemplatePresonalDesktopListController",[
"$scope", "$modal", "TeachTemplate", "PersonTemplate", "Admin", "$interval", "$filter", "$$$os_types", "$Domain", "Network", "$$$I18N", "ResourcePool", "manageTemplate", "VMCommon", "networkWithHost", "virtualHost","UserRole", 
function($scope, $modal, template, tmpl, admin, $interval, $filter, $$$os_types, $Domain, network, $$$I18N, ResourcePool, manageTemplate, vm, networkWithHost, virtualHost, UserRole){
	$scope.domain = $Domain;
	$scope.rows = []; $scope.allrows = [];
	var _controllerScope = $scope;
	$scope.loading = true;
	let user = UserRole.currentUser;
    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

    $scope.orders = [ {name: $$$I18N.get("按创建时间排序"), val: 'time'}, {name: $$$I18N.get("按模板名称排序"), val: 'name'}];
    $scope.order = $scope.orders[0];
    $scope.sortTem = function(val){
    	if(val == 'time'){
    		$scope.rows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
    	}
    	else{
    		$scope.rows.sort(function(a,b){ return a.name>b.name? 1:-1 });
    	}
    }

	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows && $scope.rows.map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows && $scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
		$scope.rows = $scope.rows.filter(function(item){ return item.type_code ===2 });
		$scope.rows.forEach(function(row){
			if(row.sync_status){
				var updateInfor = row.sync_status.filter(function(item){ return item.type === "image" });
				if(updateInfor.length!==0)
					row.updateSize = (updateInfor[0].size/1024/1024/1024).toFixed(2);				
			}
		});
		$scope.$root.$broadcast("syncTempl", $scope.rows);
	});

	tmpl.query(function(res){
		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);
		$scope.rows.forEach(function(row){
			var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
			os && os.icon && (row.icon = os.icon);
			if(row.os_type.indexOf("_64")>-1)
				row.os_type = row.os_type.slice(0,row.os_type.indexOf("_64"));
			if(row.os_type.indexOf("(64 bit)")>-1)
				row.os_type = row.os_type.slice(0,row.os_type.indexOf("(64 bit)"));
		});
		$scope.rows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
		$scope.loading = false;
		$scope.personalNames = $scope.rows.map(function(item){ return item.name });
		$scope.sameName = false;

		$scope.allrows = $scope.rows;
		if($$$storage.getSessionStorage('virtual_type_P')!=='all')
			$scope.rows = $scope.allrows.filter(function(item){ return item.virtual_type === $$$storage.getSessionStorage('virtual_type_P') });
	});

	$scope.select = $$$storage.getSessionStorage('virtual_type_P') || 'all';
	$scope.$watch("select",function(newvalue){
		if(newvalue){
			if(newvalue!=='all'){
				$scope.rows = $scope.allrows.filter(function(item){ return item.virtual_type === newvalue });
			}
			else{
				$scope.rows = $scope.allrows;
			}
			$$$storage.setSessionStorage('virtual_type_P', newvalue);
		}
	});

	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除个人模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_P' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance,$q){
				$scope.name = rows.map(function(row){ return row.name }).join(', ');
				$scope.ok = function(){
					tmpl.delete({ id: rows.map(function(item){ return item.id }) },function(res){
	                	tmpl.query(function(res){
	                		_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
	                		var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
    							if(_controllerScope.select === 'all'){
    								return item;
    							}
    							else{
    								return item.virtual_type === _controllerScope.select;
    							}
    						});
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
					},function(error){
						tmpl.query(function(res){
	                		_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
	                		var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
    							if(_controllerScope.select === 'all'){
    								return item;
    							}
    							else{
    								return item.virtual_type === _controllerScope.select;
    							}
    						});
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
	$scope.shutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var rows_active = rows.filter(function(item){ return item.instance_status === 'running' });
		if(!rows_active.length){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("SHUTOFF_TIP"),
				timeout	: 6000
			});
		}
		else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='shutdown_TEMPLATE_T' param1='{{name}}'></p><footer class='text-right'><img data-ng-if='loading' src='./img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance,$q){
					$scope.name = rows_active.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						$scope.loading = true;
						vm.shutdowns({ instance_ids: rows_active.map(function(item){ return item.instance_id }) },function(res){
							rows.forEach(function(row){
								_controllerScope.rows.forEach(function(item){
									if(item.id === row.id){
										item.instance_status = "shutdown";
									}
								})
							});
							$scope.loading = false;
						},function(error){
							$scope.loading = false;
						});
						$modalInstance.close();
					};
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size: "sm"
			});			
		}
	};
	$scope.copy = function(item){
		 $modal.open({
                templateUrl: "views/vdi/dialog/template/template_copy.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
                    $scope.min_namelength=2;$scope.max_namelength=20;
                    $scope.is_copy = true;
                    $scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
                    $scope.types2 = [{name: $$$I18N.get('系统分配'), value: 'auto'},{name: $$$I18N.get('固定IP'), value: 'static'}];
                    $scope.types = $scope.types2;
                    $scope.bind_ip_type = $scope.types2[0];
                    admin.query(function(res){
                        $scope.owners = res.users;
                        angular.forEach($scope.owners, function(item){
                        	if(item.name == user.name){
                        		$scope.owner = item;
                        	}
                        });
                        if(!$scope.owner) {
                        	$scope.owner = $scope.users[0]
                        }
                    });
                    $scope.type = '2';
                    $scope.temCopy = false;

                    $scope.temData = item;
                    $scope.getVirtualHost = function (type,rbd_enabled){
                    	$scope.host_loading = true;
                    	virtualHost.query({
                    		virtual_type: type,
                    		rbd_enabled: rbd_enabled
                    		// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
                    	},function(res){
                    		$scope.host_loading = false;
                    		$scope.hosts = res.result;
                    		$scope.host = $scope.hosts[0];
                    		$scope.getNetwork($scope.host);
                    	},function(){

                    	});
                    }
                    $scope.getVirtualHost(item.virtual_type,item.rbd_enabled);

                    // function getIps(subnet_id, _scope){
                    // 	if(subnet_id)
                    // 		network.ports({ id: subnet_id },function(res){
                    // 			_scope.band_ips = res.unused_ips;
                    // 			_scope.bind_ip = _scope.band_ips[0];
                    // 			_scope.bind_ip_loading = false;
                    // 		})
                    // };
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
                    		// $scope.bind_ip_loading = true;
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
                    $scope.ok = function(){
                		$scope.temCopy = true;
                		var _ip = this.bind_ip_type.value === 'static' ? this.bind_ip.value : undefined;
                        tmpl.copy({
                    		name: this.name,
                    		description: this.description,
                    		image_id : item.id,
                    	    type_code: this.type,
                    	    owner: $scope.owner.id,
                    	    network: this.network.id,
                    	    subnet: this.subnet?this.subnet.id:"",
                    	    band_ip: _ip,
                    	    band_type: this.bind_ip_type.value,
                    	    host_uuid: this.host.host_uuid
                    	    // enable_gpu: item.virtual_type == 'hyper-v'?this.enable_gpu:undefined
                        }, function(res){
                        	tmpl.query(function(res){
                        		_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
		                		var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
        							if(_controllerScope.select === 'all'){
        								return item;
        							}
        							else{
        								return item.virtual_type === _controllerScope.select;
        							}
        						});
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
                        	$modalInstance.close();
                        }, function(){
                        	$scope.temCopy = false;
                        });
                    	}
                    $scope.close = function(){
                        $modalInstance.close();
                    };
                } ]
            });
	};
	$scope.modify = function(item){
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_modify.html",
			controller: function($scope, $modalInstance){
				$scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
				$scope.types = $scope.types2 = [{name: $$$I18N.get('系统分配'), value: 'auto'},{name: $$$I18N.get('固定IP'), value: 'static'}];
				$scope.virtual_type = item.virtual_type;
				$scope.disabled_gpu = item.disabled_gpu;
				$scope.data = {vcpus: 1, ram: 1.5, system_alloc_disk: 10, bind_ip_type: $scope.types2[1]};
				var oldData = {};
				function getSubnets(Network, subnet_id, flag){
					if(Network.subnets.length){
						$scope.network_loading = true;
						network.query_sub({id: Network.id }, function(res){
							$scope.data.subnets = res.result;
							if(flag){
								oldData.subnets = $scope.data.subnets;
								oldData.subnet = $scope.data.subnet = $scope.data.subnets.filter(function(data){ return data.id === subnet_id })[0];
							}
							else{
								$scope.data.subnet = $scope.data.subnets[0];
								if($scope.data.subnet)
									getIps($scope.data.subnet.id, $scope.cur_imgInfor.nets.ip_address, false);
								else
									$scope.data.band_ips = [];
							}
							$scope.network_loading = false;
						})
					}else{
						$scope.data.subnets = [];
						$scope.data.subnet = null;
						$scope.switchIps($scope.data.subnet);
					}
				};
				function getIps(subnet_id, curr_ip, flag){
					if(subnet_id){
						$scope.types = $scope.types2;
						if(flag){
							oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[1];
							oldData.band_ips = $scope.data.band_ips;
							oldData.band_ip = $scope.data.band_ip = curr_ip;
						}
						else{
							$scope.data.bind_ip_type = $scope.types[0];
							$scope.data.band_ip = null;
						}
					}else{
						$scope.types = $scope.types1;
						oldData.bind_ip_type = $scope.data.bind_ip_type = $scope.types[0];
					}
				};
				$scope.switchSubnet = function(val){
					getSubnets(val, $scope.cur_imgInfor.nets.network_id, false);
				}
				$scope.switchIps = function(subnet){
					if(subnet)
						getIps(subnet.id,$scope.cur_imgInfor.nets.ip_address, false)
					else{
						$scope.types = $scope.types1;
						$scope.data.bind_ip_type = $scope.types[0];
						$scope.data.band_ips = [];
						$scope.data.band_ip = null;
					}
				};
				$scope.addbtndisk = function(){
					if(!$scope.data.data_alloc_disk){
						$scope.data.data_alloc_disk = 1;
						return false;
					}
					if(!$scope.data.data_alloc_disk_2){
						$scope.data.data_alloc_disk_2 = 1;
						return false;
					}
				};
				$scope.minusbtndisk = function(){
					if($scope.old_data_alloc_disk && !$scope.old_data_alloc_disk_2){
						if($scope.data.data_alloc_disk_2){
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
					}
					else{
						if($scope.data.data_alloc_disk_2){
							$scope.data.data_alloc_disk_2 = 0;
							return false;
						}
						if($scope.data.data_alloc_disk){
							$scope.data.data_alloc_disk = 0;
							return false;
						}						
					}

				};
				template.infor({ image_id: item.id }, function(templateInfor){
					$scope.cur_imgInfor = templateInfor;
					oldData.name = $scope.data.name = templateInfor.name;
					oldData.description = $scope.data.description = templateInfor.description;
					getIps(templateInfor.nets[0].subnet_id, templateInfor.nets[0].ip_address, true);
					network.query(function(data){
						// $scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
						$scope.networks = data.networks;
						oldData.network = $scope.data.network = $scope.networks.filter(function(data){ return data.id===templateInfor.nets[0].network_id })[0];
						getSubnets($scope.data.network,templateInfor.nets[0].subnet_id, true);
					})
					oldData.enable_gpu = $scope.data.enable_gpu= templateInfor.enable_gpu;
					oldData.vcpus = $scope.data.vcpus= templateInfor.vcpus;
					oldData.ram = $scope.data.ram= templateInfor.ram/1024;
					oldData.system_alloc_disk = $scope.data.system_alloc_disk= templateInfor.system_alloc_disk;
					oldData.data_alloc_disk = $scope.data.data_alloc_disk= templateInfor.data_alloc_disk;
					oldData.data_alloc_disk_2 = $scope.data.data_alloc_disk_2= templateInfor.data_alloc_disk_2;
					$scope.old_data_alloc_disk = templateInfor.data_alloc_disk;
					$scope.old_data_alloc_disk_2 = templateInfor.data_alloc_disk_2;
				})
				$scope.min_namelength=2;$scope.max_namelength=20;
				$scope.oldData = angular.copy($scope.data);
				$scope.isUnchanged = function(){
					return angular.equals(oldData,$scope.data)
				}
				$scope.reset = function(){
					if(oldData.bind_ip_type.value!=='none'){
						$scope.types = $scope.types2;
					}else{
						$scope.types = $scope.types1;
					}
					$scope.data = angular.copy(oldData);
				}
				$scope.ok = function(){
					// if($scope.data.system_alloc_disk < oldData.system_alloc_disk || $scope.data.data_alloc_disk_2 < oldData.data_alloc_disk_2 || $scope.data.data_alloc_disk < oldData.data_alloc_disk){
					// 	$.bigBox({
					// 			title : $$$I18N.get("INFOR_TIP"),
					// 			content : $$$I18N.get("modifyTemTip"),
					// 			timeout : 6000
					// 		});
					// }
					// else{
						$scope.submit_loading = true;
						tmpl.modify({
							image_id: item.id,
							instance_id: item.instance_id,
							template_name: $scope.data.name,
							description: $scope.data.description,
							network: $scope.data.network.id,
							subnet: $scope.data.subnet?$scope.data.subnet.id:"",
							band_ip: $scope.data.bind_ip_type.value === 'static' ? $scope.data.band_ip:undefined,
							band_type: $scope.data.bind_ip_type.value,
							vcpus: $scope.data.vcpus,
							ram: $scope.data.ram,
							enable_gpu: item.virtual_type=='hyper-v' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
							gpu_auto_assignment: item.virtual_type=='kvm' && !item.disabled_gpu ? $scope.data.enable_gpu : undefined,
							system_alloc_disk: $scope.data.system_alloc_disk,
							data_alloc_disk: $scope.data.data_alloc_disk,
							data_alloc_disk_2: $scope.data.data_alloc_disk_2
						}, function(res){
							$scope.submit_loading = false;
							tmpl.query(function(res){
	                    		_controllerScope.allrows = res.win_images.concat(res.linux_images).concat(res.other_images);
		                		var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
        							if(_controllerScope.select === 'all'){
        								return item;
        							}
        							else{
        								return item.virtual_type === _controllerScope.select;
        							}
        						});
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
							$modalInstance.close();
						},function(){ $scope.submit_loading = false; });
					// }
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			}
			
		})
	};
	$scope.resetTemp = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重置模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='REST_TEMP_TIP' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					tmpl.reset({ image_id: item.id },
					function(res){
					},function(error){

					})
					
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};
	$scope.imgManage = function(IMG){
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_imgManage.html",
			size: "md",
			controller: function($scope, $modalInstance){
				$scope.imgType = IMG.virtual_type;
				function formLocalData(dataResource){
					let arry = []; 
					dataResource.forEach(function(item){
						if(!arry[item.host_ip]){
							let obj = {host_ip: item.host_ip, hostname: item.hostname, resource_pool_uuid: item.resource_pool_uuid, storages: []};
							arry[item.host_ip] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function(item){
						let hostArry = dataResource.filter(function(data){ return data.host_ip == item.host_ip });
						hostArry.forEach(function(data){
							if(!item.storages[data.storage_name]){
								let obj = {storage_name: data.storage_name, storage_uuid: data.storage_uuid, storage_type: data.storage_type, imgs: []};
								item.storages[data.storage_name] = obj;
								item.storages.push(obj);
							}
						})
					});
					arry.forEach(function(item){
						item.storages.forEach(function(data){
							let storageArry = dataResource.filter(function(d){ return item.host_ip == d.host_ip && d.storage_name == data.storage_name });
							storageArry.forEach(function(d){
								data.imgs.push({image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status})
							});
						});
						item.storages.sort(function(a,b){ return a.storage_name>b.storage_name?1:-1 });
					});
					return arry;
				};
				function formRemoteData(dataResource){
					let arry = []; 
					dataResource.forEach(function(item){
						if(!arry[item.storage_name+"_remote"]){
							let obj = {storage_name: item.storage_name, storage_uuid: item.storage_uuid, storage_type: item.storage_type, host_ip: item.host_ip, imgs: []};
							arry[item.storage_name+"_remote"] = obj;
							arry.push(obj);
						}
					});
					arry.forEach(function(item){
						let imgArry = dataResource.filter(function(d){ return item.storage_name == d.storage_name });
						imgArry.forEach(function(d){
							item.imgs.push({image_uuid: d.image_uuid, image_type: d.image_type, image_type_desc: d.image_type_desc, has_image: d.has_image, has_instance: d.has_instance, volume_type: d.volume_type, volume_uuid: d.volume_uuid, volume_status: d.volume_status})
						});
					});
					return arry;
				};
				function getLocal(resource_pool_uuid){
					$scope.local_loading = true;
					manageTemplate.query({id: IMG.id, storage_type: 'local', resource_pool_uuid: resource_pool_uuid},function(res){
						$scope.local_loading = false;
						$scope.locals = formLocalData(res.result.sort(function(a,b){ return a.image_type>b.image_type?-1:1 }));
					},function(err){
						$scope.local_loading = false;
					})
				};
				function getRemote(){
					$scope.remote_loading = true;
					manageTemplate.query({id: IMG.id, storage_type: 'remote'},function(res){
						console.log(res.result);
						$scope.remote_loading = false;
						$scope.remotes = formRemoteData(res.result.sort(function(a,b){ return a.image_type>b.image_type?-1:1 }));
					},function(err){
						$scope.remote_loading = false;
					})
				};
				var new_pool = {};
				getRemote();
				ResourcePool.query(function(res){
					$scope.pools = res.result.filter(function(p){ return p.type == IMG.virtual_type });
					new_pool = $scope.pool = $scope.pools[0];
					getLocal($scope.pool.uuid);
				});
				
				$scope.getlocalImages = function(pool){
					new_pool = pool;
					getLocal(pool.uuid);
				};
				$scope.$on("syncTempl", function($event, data){
					var updateVolume = data.filter(function(item){ return item.id==IMG.id })[0].volume;
					if(updateVolume.length!==0){
						updateVolume.forEach(function(volume){
							if(volume.storage_type=='local'){
								$scope.locals && $scope.locals.forEach(function(local){
									local.storages.forEach(function(storage){
										storage.imgs.forEach(function(img){
											if(img.volume_uuid==volume.volume_uuid){
												img.volume_status = volume.volume_status;
												if(volume.volume_status=='available'){
													img.has_image = true;
												}
												if(volume.volume_status=='deleted'){
													img.has_image = false;
												}
											}
										});
									});
								});
							}
							else{
								$scope.remotes && $scope.remotes.forEach(function(remote){
									remote.imgs.forEach(function(img){
										if(img.volume_uuid==volume.volume_uuid){
											img.volume_status = volume.volume_status;
											if(volume.volume_status=='available'){
												img.has_image = true;
											}
											if(volume.volume_status=='deleted'){
												img.has_image = false;
											}
										}
									});
								});
							}
						});
					}
				})
				$scope.sendImg = function(storage_type, resource_pool_uuid, image_type, image_uuid, storage_uuid, img, pool){
					img.volume_status = 'sending';
					manageTemplate.handout({
						id: IMG.id,
						resource_pool_uuid: storage_type=='local'?resource_pool_uuid:undefined,
						image_type: image_type,
						image_uuid: image_uuid,
						storage_uuid: storage_uuid,
						storage_type: storage_type
					},function(res){
						if(storage_type=='local'){
							manageTemplate.query({id: IMG.id, storage_type: 'local', resource_pool_uuid: pool.uuid},function(res){
								var newData = formLocalData(res.result.sort(function(a,b){ return a.image_type>b.image_type?-1:1 }));
								$scope.locals.splice(0, $scope.locals.length);
								Array.prototype.push.apply($scope.locals,newData);
							})
						}
						else{
							manageTemplate.query({id: IMG.id, storage_type: 'remote'},function(res){
								var newData = formRemoteData(res.result.sort(function(a,b){ return a.image_type>b.image_type?-1:1 }));
								$scope.remotes.splice(0, $scope.remotes.length);
								Array.prototype.push.apply($scope.remotes,newData);
							})
						}
					},function(){
						// img.status = 'sended failed';
					})
				};
				$scope.deleteImg = function(storage_type, volume_uuid, img, storage_uuid, pool){
					if(!img.has_instance){
						img.volume_status = 'deleting';
						manageTemplate.delete({
							storage_type: storage_type,
							id: IMG.id,
							volume_uuid: volume_uuid,
							image_uuid: img.image_uuid,
							storage_uuid: storage_uuid
						},function(res){
							
						},function(){
							img.volume_status = 'delete failed';
						})
					}
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			}
			
		})
	};
	$scope.detail = function(item){
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_detail.html",
			size: "md",
			controller: function($scope, $modalInstance){
				template.infor({ image_id: item.id }, function(infor){
					$scope.data = infor;
					function formData(obj){
						obj.imgs = [];
						for(var i in obj){
							if(i!=='imgs'){
								var img = {};
								img.location = i;
								img.volumeId = obj[i];
								obj.imgs.push(img);
							}
						}
					};
					for(var i in $scope.data.inst_volumes){
						formData($scope.data.inst_volumes[i]);
					};
					network.query(function(data){
						$scope.data.network = data.networks.filter(function(data){ return data.id===infor.nets[0].network_id })[0];
						if(infor.nets[0].subnet_id){
							network.query_sub({id: infor.nets[0].network_id }, function(res){
								var subnet = res.result.filter(function(data){ return data.id === infor.nets[0].subnet_id })[0];
								$scope.data.subnet = subnet.name +" ("+ subnet.start_ip + "~" + subnet.end_ip +")"
							})
						}
					})
				}, function(){});
				$scope.close = function(){
					$modalInstance.close();
				};
			}
		})
	}
}])

.controller("addPersonalTemplateDialog", [
"$scope", "$modalInstance", "PersonTemplate", "HardwareTemplate", "SystemISO", "Admin", "$$$os_types","$$$I18N", "UserRole","Network", "virtualHost", "networkWithHost", "checkIP",
function($scope, $modalInstance, personal, hardware, iso, admin, $$$os_types,$$$I18N, UserRole, network, virtualHost, networkWithHost, checkIP){
	let user = UserRole.currentUser;
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.auto_isos = [];$scope.all_isos = [];
	$scope.iso = [];
	$scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
	$scope.types2 = [{name: $$$I18N.get('系统分配'), value: 'auto'},{name: $$$I18N.get('固定IP'), value: 'static'}];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types[0];
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name == user.name)
				$scope.owner = item;
		});
		if(!$scope.owner) $scope.owner = $scope.users[0]
	});
	hardware.query(function(res){
		$scope.hardware_templates = res.result;
		$scope.template = $scope.hardware_templates[0];
	});
	iso.query(function(res){
		$scope.all_isos = res.isos.filter(function(iso){ return iso.type && iso.type!=="package" && iso.type!=="other"; });
		$scope.all_isos.forEach(function(item){
			item.os_type = item.os_type.split(",");
		});
		$scope.isos = $scope.all_isos;
		$scope.iso = [$scope.isos[0]];
		angular.forEach($scope.isos, function(item){
			if(item.support_auto_install == true)
				$scope.auto_isos.push(item);
		})
	});

	$scope.type = 'kvm';
	$scope.enable_gpu = false;
	$scope.getVirtualHost = function (type){
		var _this = this;
		$scope.host_loading = true;
		var data = {};
		data.type = type;
		if(type=='hyper-v'){
			data.enable_gpu = _this.enable_gpu;
			_this.gpu_auto_assignment = false;
		}else{
			data.enable_gpu = _this.gpu_auto_assignment;
			_this.enable_gpu = false;
		}
		virtualHost.query(data,function(res){
			$scope.host_loading = false;
			$scope.hosts = res.result;
			_this.host = $scope.hosts[0];
			_this.host && $scope.getNetwork(_this.host);
		},function(){

		});
	}
	$scope.getVirtualHost($scope.type);
	
	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip = _scope.band_ips[0];
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
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
			// $scope.bind_ip_loading = true;
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
	$scope.names = $scope.rows.map(function(item){ return item.name });
	$scope.sameName = false;
	var _scope = $scope;
	$scope.install = "manualinstall";
	$scope.isOther = false;
	$scope.$on("selectStepChange", function(e, arg){
		if(arg.index==0){
			arg.stepScope.$$nextSibling.error = false;
		}
	})
	$scope.$on("WizardStep_0", function(e, step, scope){
		scope.error = step.is_dirty;
		_scope.type = scope.type;
		var flag = false;
		_scope.names.forEach(function(item){
			if(scope.name == item){ flag = true; }
		})
		if(flag){
			_scope.sameName = true;
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("WRONG_NAME"),
				timeout	: 6000
			});
		}
		else { _scope.sameName = false; }
		step.done = !scope.step_pane0.$invalid && !_scope.sameName && !scope.network_loading;

		if(step.done && scope.$$childTail && scope.$$childTail.bind_ip){
			step.showLoading = true;
			step.done = false;
			checkIP.check({ip: scope.$$childTail.bind_ip, subnet_id: scope.subnet.id},function(res){
				if(!res.result){
					$.bigBox({
						title	: $$$I18N.get("INFOR_TIP"),
						content	: $$$I18N.get("USEDIP"),
						timeout	: 6000
					});
				}else{
					$scope.$broadcast("currentStepChange", 1);
				}
				step.showLoading = false;
			},function(error){ step.showLoading = false; });
		}
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		if(scope.template.system_gb == 0)
			$.bigBox({
					title	: $$$I18N.get("INFOR_TIP"),
					content	: $$$I18N.get("模板系统盘不能为0"),
					color	: "#C46A69",
					icon	: "fa fa-warning shake animated",
					timeout	: 6000
				});
		step.done = !(scope.template.system_gb == 0);
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		setTimeout(function(){
			$("[rel=popover-hover]").popover({
				trigger : "hover"
			});
		})
		_scope.install = scope.install;
		if(scope.iso != undefined && scope.iso[0] != undefined){
			if(scope.iso[0].os_type[0] == 'other'){
				_scope.isOther = true;
				scope.$parent.system_versions = $$$os_types;
				scope.$parent.system_version1 = scope.$parent.system_versions[0];
			}
			else{
				var _types = [];
				scope.iso[0].os_type.forEach(function(item){
					var _obj = {};
					_obj.key = item;
					_obj.value = item;
					_types.push(_obj);
				})
				scope.$parent.system_versions = _types;
				scope.$parent.system_version1 = _types[0];
			}
		}
		scope.error = step.is_dirty;
		step.done = (scope.iso != undefined && scope.iso[0] != undefined);
		
	});
	var newWindow;
	var FLAG = false;
	function gotoUrl(val){
		if(val){
			newWindow = window.open('templateModify.html#0');
			// newWindow = window.open('js/vdi-spice/spiceModify.html#?id=0');
		}
	}
	setTimeout(function(){
		$("#finish").on('click',function(){
		    gotoUrl(FLAG);
		})
	})

	$scope.$on("WizardStep_3", function(e, step, scope){
		if(scope.step_pane3.$invalid){
			scope.error = step.is_dirty;
			step.done = false;
		}
		else if(scope.userPassword && scope.userPasswordConfirm && scope.userPassword !== scope.userPasswordConfirm){
			step.done = false;
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("两次输入密码不一致"),
				timeout	: 6000
			});
		}
		else
			step.done = true;
		FLAG = step.done;
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var auto_install = scopes[2].install === "autoinstall" ? true : false;
		var _ip = scopes[0].bind_ip_type.value === 'static' ? scopes[0].$$childHead.bind_ip : undefined;
		var testWin10 = /Windows10/;
		var item = {
			template_name: scopes[0].name,
			description: scopes[0].description,
			owner: scopes[0].owner.id,
			type_code : 2,
			vcpus: scopes[1].template.cpu_num,
			system_gb: scopes[1].template.system_gb,
			local_gb: scopes[1].template.local_gb,
			memory_mb: scopes[1].template.memory_mb,
			iso_path:scopes[2].iso[0].name,
			iso_id:scopes[2].iso[0].id,
			os_type: scopes[3].system_version1.key,
			instance_type: scopes[1].template.id,
			auto_install: auto_install,
			network: scopes[0].network.id,
			subnet: scopes[0].subnet?scopes[0].subnet.id:'',
			band_ip: _ip,
			band_type: scopes[0].bind_ip_type.value,
			key:scopes[3].key,
			username:scopes[3].userName,
			userPassword:scopes[3].userPassword,
			userPasswordConfirm:scopes[3].userPasswordConfirm,
			virtual_type: scopes[0].type,
			enable_gpu: scopes[0].type == 'hyper-v'? scopes[0].enable_gpu:undefined,
			gpu_auto_assignment: scopes[0].type == 'kvm'? scopes[0].gpu_auto_assignment:undefined,
			firmware_type: scopes[0].type == 'kvm' && testWin10.test(scopes[3].system_version1.key)?'uefi':undefined,

			host_uuid: scopes[0].host.host_uuid
		};
		function updateTem(isSuccess){
			personal.query(function(res){
				$scope.allrows.splice(0, $scope.allrows.length);
				Array.prototype.push.apply($scope.allrows,res.win_images.concat(res.linux_images).concat(res.other_images));
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
					if($scope.select === 'all'){
						return item;
					}
					else{
						return item.virtual_type === scopes[0].type;
					}
				});
				newRows.forEach(function(row){
					var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
					os && os.icon && (row.icon = os.icon);
				});
				newRows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows,newRows);
				// if(!auto_install){
					var template = $scope.rows.filter(function(temp){ return temp.name ==  item.template_name})[0];
					if(template && isSuccess){
						if(scopes[0].type == "hyper-v"){
							if(res.sync_mode==='scp'){
								newWindow.location.replace('templateModify_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
							}
							else{
								newWindow.location.replace('templateModifybt_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
							}
						}
						else{
							if(res.sync_mode==='scp'){
								newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
								newWindow.location.reload();
							}
							else{
								newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name + '&personal');
							}
						}
						// if(scopes[0].type == "hyper-v"){
						// 	if(res.sync_mode==='scp'){
						// 		// newWindow.location.replace('templateModify_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
						// 		//novnc-->spice-html5
						// 		newWindow.location.replace('js/vdi-spice/spiceModify_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						// 	}
						// 	else{
						// 		// newWindow.location.replace('templateModifybt_rdp.html#' + template.id + '&' + template.os_type + '&' + template.name);
						// 		//novnc-->spice-html5
						// 		newWindow.location.replace('js/vdi-spice/spiceModifybt_rdp.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						// 	}
						// }
						// else{
						// 	if(res.sync_mode==='scp'){
						// 		// newWindow.location.replace('templateModify.html#' + template.id + '&' + template.os_type + '&' + template.name);
						// 		// newWindow.location.reload();
						// 		//novnc-->spice-html5
						// 		newWindow.location.replace('js/vdi-spice/spiceModify.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						// 		newWindow.location.reload();
						// 	}
						// 	else{
						// 		// newWindow.location.replace('templateModifybt.html#' + template.id + '&' + template.os_type + '&' + template.name);
						// 		//novnc-->spice-html5
						// 		newWindow.location.replace('js/vdi-spice/spiceModifybt.html#?id=' + template.id + '&os_type=' + template.os_type + '&name=' + encodeURIComponent(template.name)+"&instance_id="+template.instance_id);
						// 	}
						// }
					}
				// }
			});
		};
		e.targetScope.currentStep.showLoading = true;
		$modalInstance.close();
		personal.save(item, function(res){ updateTem(true); }, function(){ newWindow.close(); updateTem(); }).$promise.finally(function(){
			e.targetScope.currentStep.showLoading = false;
		});;
	});

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.cpu_num = 1;
}])

.controller("registerPersonalTemplateDialog", [
"$scope", "$modalInstance", "Admin", "registerTemplate", "PersonTemplate", "$$$os_types", "UserRole", "Network", "virtualHost","networkWithHost", "$$$I18N",
function($scope, $modalInstance, admin, registerTemplate, personal, $$$os_types, UserRole, network, virtualHost, networkWithHost, $$$I18N){
	let user = UserRole.currentUser;
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.type = '2';
	$scope.types1 = [{name: $$$I18N.get('不分配'), value: 'none'}];
	$scope.types2 = [{name: $$$I18N.get('系统分配'), value: 'auto'},{name: $$$I18N.get('固定IP'), value: 'static'}];
	$scope.types = $scope.types2;
	$scope.bind_ip_type = $scope.types2[0];
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name === user.name)
				$scope.owner = item;
		})
	});
	registerTemplate.query(function(res){
		$scope.sys_isos = res.system_image;
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
	$scope.getDataImgs = function(systemImg){
		if(systemImg){
			this.data_iso = undefined;
			this.data_iso2 = undefined;
			$scope.data_isos = $scope.data_isos2 = $scope.data_isos1 = $scope.old_data_isos.filter(function(item){ return item.virtual_type == systemImg.virtual_type });
			// $scope.data_iso = $scope.data_isos[0];
			// $scope.data_iso2 = $scope.data_isos[0];
			$scope.getVirtualHost(systemImg.virtual_type, systemImg.rbd_enabled);			
		}
	};
	$scope.getVirtualHost = function (type, rbd_enabled){
		$scope.host_loading = true;
		virtualHost.query({
			virtual_type: type,
			rbd_enabled: rbd_enabled
			// enable_gpu: type == 'hyper-v'?enable_gpu:undefined
		},function(res){
			$scope.host_loading = false;
			$scope.hosts = res.result;
			$scope.host = $scope.hosts[0];
			$scope.getNetwork($scope.host);
		},function(){
			$scope.host_loading = false;
		});
	}

	$scope.os_types = $$$os_types.filter(function(item){ return item.key!=="package" });
	$scope.os_type = $scope.os_types[0];
	// $scope.enable_gpu = false;
	$scope.bind_ip = {value: null};

	// function getIps(subnet_id, _scope){
	// 	if(subnet_id){
	// 		network.ports({ id: subnet_id },function(res){
	// 			if(res.unused_ips.length){
	// 				_scope.band_ips = res.unused_ips;
	// 			}
	// 			else{
	// 				_scope.band_ips = ["无可用IP"];
	// 			}
	// 			_scope.bind_ip = _scope.band_ips[0];
	// 			_scope.bind_ip_loading = false;
	// 		})
	// 	}
	// };
	$scope.switchIps = function(subnet,_scope){
		// _scope.bind_ip_loading = true;
		if(subnet){
			// getIps(subnet.id, _scope)
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
			// $scope.bind_ip_loading = true;
			network.query_sub({id: Network.id }, function(res){
				_scope.subnets = res.result;
				_scope.subnet = _scope.subnets[0];
				_scope.switchIps(_scope.subnet, _scope);
				$scope.network_loading = false;
			}, function(){ $scope.network_loading = false; })
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

	$scope.ok = function(){
		var bindIP = this.bind_ip.value;
		// if(this.bind_ip_type.value === 'static' && this.bind_ip === '无可用IP'){
		// 	$.bigBox({
		// 		title	: $$$I18N.get("INFOR_TIP"),
		// 		content	: $$$I18N.get("hasStaticIP_TIP"),
		// 		timeout	: 6000
		// 	});
		// }
		// else{
			$scope.submiting = true ;
			$scope.afterSubmiting =false ;
			var _ip = this.bind_ip_type.value === 'static' ? bindIP : undefined;
			var postData = {
				system_image_file: this.sys_iso,
				data_image_file: this.data_iso?this.data_iso:undefined,
				data_image_file_2: this.data_iso2?this.data_iso2:undefined,
				name: this.name,
				description: this.description,
				type_code: this.type,
				os: this.os_type.key,
				is_64: this.os_type.value.indexOf("64 bit")>-1?true: false,
				owner: this.owner.id,
				network: this.network.id,
				subnet: this.subnet?this.subnet.id:'',
				band_ip: _ip,
				band_type: this.bind_ip_type.value,
				host_uuid: this.host.host_uuid,
				username: this.sys_iso.virtual_type=='hyper-v'?this.username:undefined,
				userPassword: this.sys_iso.virtual_type=='hyper-v'?this.userPassword:undefined,
				userPasswordConfirm: this.sys_iso.virtual_type=='hyper-v'?this.userPasswordConfirm:undefined
				// enable_gpu: this.sys_iso.virtual_type == 'hyper-v'?this.enable_gpu:undefined
			};
			console.log(postData)
			registerTemplate.update(postData, function(res){
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				personal.query(function(res){
					$scope.allrows.splice(0, $scope.allrows.length);
					Array.prototype.push.apply($scope.allrows,res.win_images.concat(res.linux_images).concat(res.other_images));
					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){
						if($scope.select === 'all'){
							return item;
						}
						else{
							return item.virtual_type === $scope.select;
						}
					});
					newRows.forEach(function(row){
						var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
						os && os.icon && (row.icon = os.icon);
					});
					newRows.sort(function(a,b){ return a.created_at>b.created_at? -1:1 });
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

