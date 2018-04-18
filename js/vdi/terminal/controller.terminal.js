angular.module("vdi.terminal", [])

.factory("Session", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/client/session", null, {
		query: { method: "GET", url: $Domain + "/thor/client/session", isArray: false },
		
		"delete": {method: "DELETE"}
		
	});
}])

.factory("Client", ["$resource", "$Domain", function($resource, $Domain){
	var res = $resource($Domain + "/thor/client", { id: "@id" }, {
		query:
			{ method: "GET", isArray: false, url: $Domain + "/thor/clients" },
		list:
			{ method: "GET", isArray: false, url: $Domain + "/thor/client/pool/:id" },
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/clients" },
		get:
			{ method: "GET", url: $Domain + "/thor/client/:id" },
		getConfig:
			{ method: "GET", url: $Domain + "/thor/client/config/:id", params: { "id": "@id" } },
		alive:
			{ method: "GET", url: $Domain + "/thor/client/alive" },
		assignIps:
			{ method: "POST", url: $Domain + "/thor/clients" },
		modifyConfig:
			{ method: "POST", url: $Domain + "/thor/client/config" },
		changeNames:
			{ method: "POST", url: $Domain + "/thor/client/changeNames" },
		changePools:
			{ method: "POST", url: $Domain + "/thor/client/changePools" },
		shutdowns:
			{ method: "POST", url: $Domain + "/thor/clients" },
		seePwd:
			{ method: "GET", url: $Domain + "/thor/client/seePwd" },
		wakeups:
			{ method: "POST", url: $Domain + "/thor/clients" },
		killSessions:
			{method: "DELETE", url: $Domain + "/thor/client/session"},
		polling:
			{method: "GET", url: $Domain + "/thor/client/order"},//轮询
		sorting:
			{method: "POST", url: $Domain + "/thor/client/order"},//开始排序
		setPlaceholder:
			{method: "PUT", url: $Domain + "/thor/client/order"},//设置占位
		cancelsort:
			{method: "DELETE", url: $Domain + "/thor/client/order"},//取消排序
		dynamicPasswd:
			{method: "POST", url: $Domain + "/thor/client/get_dynamic_passwd_for_client"}

	});
	return res;
}])

.controller("vdiTerminalClientManageController",[
"$scope", "$modal", "Client", "SchoolRoom", "$interval", "$filter", "$$$I18N", "UserRole","$location",
function($scope, $modal, client, schoolroom, $interval, $filter, $$$I18N, UserRole,$location){
	// let hasDesktop = UserRole.currentUserRoles.filter(function(role){ return role=='Desktop' }).length;
	// let hasDesktopTech = UserRole.currentUserRoles.filter(function(role){ return role=='Teaching_desktop' }).length;
	// let hasDesktopPerson = UserRole.currentUserRoles.filter(function(role){ return role=='Personal_desktop' }).length;
	// $scope.linkTech = hasDesktop && hasDesktopTech ? true:false;
	// $scope.linkPerson = hasDesktop && hasDesktopPerson ? true:false;

	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.rows = []; $scope.loading = true; $scope.sorttype = ""; var allrows = [];var _allrows = {};var loaded = false;var selectedRows = [];
	
	$interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("clientIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("clientsRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(loaded){
				if(!_allrows[item.id]){
					var addClient = {};
					for(var i in item){
						addClient[i] = item[i];
					}
					var _ipClient = addClient.client_ip.split(".");
					addClient._ipClient = (_ipClient[0] << 16) + (_ipClient[1] << 8) + Number(_ipClient[2]) + (_ipClient[3] / 1000);
					addClient._ipTarget = null;
					allrows.push(addClient);_allrows[addClient.id] = addClient;
					var storageClassroom = $scope.classrooms.filter(function(cla){ return cla.id == $$$storage.getSessionStorage('classroom')})[0].name;
					console.log("addClient and storageClassroom",addClient,storageClassroom);
					if(addClient.pool===storageClassroom){
						$scope.rows.push(addClient);
					}
				}				
			}
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
			
		});
	});
	client.query(function(res){
		allrows = res.clients;
		// allrows = res.clients.filter(function(item){ return item.order; }).sort(function(a,b){ return a.order>b.order?1:-1; }).concat(res.clients.filter(function(item){ return !item.order; }));
		allrows.forEach(function(item,index){
			_allrows[item.id] = item;
			if(index === allrows.length-1) loaded = true;
		});
		schoolroom.querywithSimple(function(res){

			var schoolrooms = [];
			res.pools_.forEach(function(item){
				if(item.user_ids.filter(function(data){ return data===JSON.parse($$$storage.getSessionStorage('loginInfo')).id }).length!==0){
					schoolrooms.push(item);
				}
			})
			$scope.classrooms = schoolrooms;
			var storageClassroom = $scope.classrooms.filter(function(cla){ return cla.id == $$$storage.getSessionStorage('classroom')})[0];
			var defaultClassroom = $scope.classrooms[0];
			$scope.select = storageClassroom || defaultClassroom;
			if($location.$$search.client_pool){
				var selectRoom = $scope.classrooms.filter(function(cla){ return cla.id == decodeURIComponent($location.$$search.client_pool)})[0];
				$scope.select = selectRoom?selectRoom:$scope.classrooms[0];
				if($location.$$search.ip){
					$scope.searchText = decodeURIComponent($location.$$search.ip);
				}
			}
			$scope.loading = false;
		});
		allrows.forEach(function(row){
			var _ipClient = row.client_ip.split(".");
			row._ipClient = (_ipClient[0] << 16) + (_ipClient[1] << 8) + Number(_ipClient[2]) + (_ipClient[3] / 1000);
			var _ipTarget;
			if(row.target_ip !== null){
				_ipTarget = row.target_ip.split(".");
				row._ipTarget = (_ipTarget[0] << 16) + (_ipTarget[1] << 8) + Number(_ipTarget[2]) + (_ipTarget[3] / 1000);
			}
			else{
				_ipTarget = null;
				row._ipTarget = null;
			}
		});
		$scope.running = res.running;
		$scope.shutoff = res.shutoff;

		
	});
	$scope.$watch("select",function(newvalue){
		if(newvalue){
			selectedRows = $scope.rows = allrows.filter(function(item){ return item.pool == newvalue.name});
			$$$storage.setSessionStorage('classroom', newvalue.id);
		}
	});	
	$scope.updateData = function(text,select){
		$scope.rows = selectedRows.filter(function(row){
			row._selected = false;
			if(select){
				if(text){
					return row.pool === select.name;
				}
				return row.pool === select.name;
			}
			return true;
		});
	};

	$scope.selecteds = [];
	$scope.addselect = function(item){
		$scope.selecteds.push(item);
	}
	$scope.sortClientIP = function(order){
		$scope.rows.sort(function(a, b){
			return (a._ipClient > b._ipClient) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};
	$scope.sortClientType = function(order){
		$scope.rows.forEach(function(item){
			if(item.client_type === 97){ item._client_type='android' }
			else if(item.client_type === 98){ item._client_type='arm' }
			else if(item.client_type === 99){ item._client_type='linux' }
			else if(item.client_type === 1){ item._client_type='windows' }
			else{  }
		});
		$scope.rows.sort(function(a, b){
			return (a._client_type > b._client_type) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};
	$scope.instNameSort = function(name, bool){
		console.log(11111,bool)
		var reg = /\d*$/;
		$scope.rows.sort(function(a,b){
			var num_a = a.inst_display_name ? Number(a.inst_display_name.match(reg)[0]) : -2;
			var num_b = b.inst_display_name ? Number(b.inst_display_name.match(reg)[0]) : -2;
			return (num_a > num_b) ? -1 : 1;
		});
		if(bool){
			$scope.rows.reverse();
		}
	};
	$scope.sortTargetIP = function(order){
		$scope.rows.sort(function(a, b){
			if(a._ipTarget === null)
				return 2;
			if(a._ipTarget != null && b._ipTarget != null && a._ipTarget > b._ipTarget)
				return 1;
			if(a._ipTarget != null && b._ipTarget != null && a._ipTarget <= b._ipTarget)
				return -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};

    $scope.currentPage = 1;
    $scope.pagesize = Number($$$storage.getSessionStorage('terminal_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('terminal_pagesize', newvalue ? newvalue : 0);
	});

    $scope.selectUp = function(){
        var rows = $scope.rows;
        return rows.some(function (row) {
            return row._selected && row.is_up;
        });
    };

	$scope.clientbind = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
	};

	$scope.clientManualSort = function(item){
		$scope.sorttype = "manual";
		// $scope.selected_rows = $scope.rows;
		$scope.selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
	};

	$scope.clientAutoSort = function(item){
		$scope.sorttype = "auto";
		$scope.selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
	};
	$scope.configure = function(item){
		$scope.isSingle = false;
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables != selected_rows.length){
			$.bigBox({
						title : $$$I18N.get("INFOR_TIP"),
						content : $$$I18N.get("vdiTerminalconfigure_TIP"),
						timeout : 6000
					});			
		}

	};
	$scope.setSingle = function(flag){
		$scope.isSingle = flag;
	};
	$scope.configurename = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables != selected_rows.length){
			$.bigBox({
						title : $$$I18N.get("INFOR_TIP"),
						content : $$$I18N.get("vdiTerminalconfigureName_TIP"),
						timeout : 6000
					});			
		}
		if(selected_rows.length==1){
			$modal.open({
				templateUrl: "views/vdi/dialog/terminal/terminal_changename.html",
				controller: "configureNameDialog",
				scope: $scope,
				size: "sm"
			});
		}else{
			$modal.open({
				templateUrl: "views/vdi/dialog/terminal/terminal_configurename_edit.html",
				controller: "configureNameDialog",
				scope: $scope,
				size: "sm"
			});
		}

	};
	$scope.wakeup = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经唤醒")
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiTerminalClientManage_TIP6"),
				timeout : 6000
			});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='唤醒确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller : function($scope, $modalInstance){
					$scope.name = selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name; }).join(', ');
					$scope.ok = function(){
						$modalInstance.close();
						client.wakeups({
							"method": "wakeup",
							macs: selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_mac; }),
							client_names: selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name; }),
							ids: selected_rows.filter(function(row){
								if(row.is_up == false){
									return row;
								}
							}).map(function(row){
								return row.id;
							})
						}, function(res){
							
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
	var _controllerScope = $scope;
	$scope.cancelBindingIp = function(item){
		var noIP = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(!item.target_ip)
				noIP ++;
		})
		if(noIP == selected_rows.length)
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("CANCELIP_TIP"),
				timeout : 6000
			});
		if(noIP != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='取消桌面IP'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CANCELIP_TIP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller : function($scope, $modalInstance){
					$scope.name = selected_rows.filter(function(row){ if(row.target_ip) return row;}).map(function(row){ return row.client_name; }).join(', ');
					var ids = selected_rows.filter(function(row){ if(row.target_ip) return row;}).map(function(row){ return row.id; });
					$scope.ok = function(){
						client.assignIps({
							method: "clearIP",
							client_ids: ids
						},function(res){
							_controllerScope.rows.forEach(function(item){
								if(ids.indexOf(item.id)>-1){
									item.target_ip = "";
								}
							});
							$modalInstance.close();
						})
					};
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};
	$scope.closeTerminal = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经关机")
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP7"),
					timeout : 6000
				});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP2' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-ng-disabled='loading' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' data-ng-disabled='loading' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){
							if(row.is_up == true) return row;
						}).map(function(row){
							return row.client_name;
						}).join(', ')
						$scope.ok = function(){
							$scope.loading = true;
							client.shutdowns({
								"method": "shutdown",
								client_ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; }),
								client_names: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; })
							}).$promise.finally(function(){
								$modalInstance.close();
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
	$scope.rebootTerminal = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经关机")
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP7"),
					timeout : 6000
				});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重启确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='确定重启吗' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; }).join(', ')
						$scope.ok = function(){
							client.shutdowns({
								"method": "reboot",
								client_ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; }),
								client_names: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; })
							}, function(res){
								$modalInstance.close();
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

	$scope.terminate = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP8"),
					timeout : 6000
				});		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='中断确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP3' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name }).join(', ');
						$scope.ok = function(){
							client.killSessions({
								ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; })
							}, function(res){
								$modalInstance.close();
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
	$scope.delete = function(){
		var ables = 0;var rows = $scope.rows;
		var selected_rows = $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables == selected_rows.length ){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP9"),
					timeout : 6000
				});
		}
		else
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP4' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name }).join(', ')
						$scope.ok = function(){
							client.delete({
								client_ids : selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.id; })
							}, function(res){
								res.ids.forEach(function(item){
									rows.forEach(function(data){
										if(data.id == item){
											rows.splice(rows.indexOf(data), 1);
										}
									})
								});
								res.ids.forEach(function(item){
									allrows.forEach(function(data){
										if(data.id == item){
											allrows.splice(allrows.indexOf(data), 1);
										}
									})
								});
								$modalInstance.close();

							}, function(){});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
				},
				size : "sm"
			});
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.inst_id, "person_desktop_" + item.inst_id);
	};
	$scope.editPass = function(item){
		$modal.open({
			templateUrl: "views/vdi/dialog/terminal/terminal_editPass.html",
			controller: function($scope, $modalInstance){
				var num_day = 3600 * 1000 * 24;
				$scope.startDateOptions = {
					formatYear: 'yy',
					startingDay: 1
				};
				$scope.minEndTime = function(){
					return $scope.time.getTime() + num_day * 60;
				};
				$scope.maxEndTime = function(){
					return $scope.time.getTime() + num_day * 180;
				};
				$scope.openStartDate = function($event){
					console.log(1111111,$event)
					$event.preventDefault();
					$event.stopPropagation();
					$scope.startDateOpened = true;
				};
				$scope.startTimeChange = function(){
					
				};

				$scope.is_edit = false;
				$scope.min_passwordLe=6;$scope.max_passwordLe=20;
				$scope.date = new Date();
				$scope.houer = $scope.date.getHours();
				$scope.minute = $scope.date.getMinutes();
				$scope.calculatePass = function(){
					
				};
				$scope.editSuperPass = function(){

				};
				$scope.close = function(){
					$modalInstance.close();
				};
			},
			size: "md"
		})
	};
	$scope.dynamicPass = function(){
		$modal.open({
			templateUrl: "views/vdi/dialog/terminal/terminal_dynamicPass.html",
			controller: function($scope, $modalInstance){
				client.dynamicPasswd(function(res){
					$scope.password = res.result;
				},function(){});
				$scope.close = function(){
					$modalInstance.close();
				};
			},
			size: "sm"
		})
	}
}])

.controller("vdiTerminalSessionManageController", ["$scope", "Session", "$modal", function($scope, session, $modal){
	$scope.rows = [];$scope.loading = true;
	session.query(function(res){
		$scope.rows = res.clients;
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

	$scope.terminate = function(item){

		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
		
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='中断会话'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='SESSION_TIPGROUP1'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						session.delete({
							ids: selected_rows.map(function(row){ return row.id; })
						}, function(res){
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
}])

.controller("clientSortDialog", ["$scope", "$modalInstance", "$modal", "Client", function($scope, $modalInstance, $modal, client){
	var _scope = $scope;var flag = false;
	$scope.computers = $scope.selected_rows;$scope.LENGTH = $scope.computers.length;
	$scope.able_computers = $scope.computers.filter(function(item){ return item.is_up; });
	$scope.unable_computers = $scope.computers.filter(function(item){ return !item.is_up; });
	$scope.able_noset_computers = $scope.able_computers.filter(function(item){ if(item.order_status !=2) return item; });
	$scope.able_noset_FWCompu = $scope.able_noset_computers.filter(function(item){ if(!(item.client_os.indexOf('Windows') > -1 || item.client_os.indexOf('windows') > -1)) return item; });
	$scope.noset_computers = $scope.computers.filter(function(item){ if(item.order_status !=2) return item; });
	$scope.set_computers = $scope.computers.filter(function(item){ if(item.order_status ==2) return item; });

	var ids = $scope.computers.map(function(item){ return item.id; });
	var able_ids = $scope.able_computers.map(function(item){ return item.id; });
	var able_noset_ids = $scope.able_noset_computers.map(function(item){ return item.id; });
	var able_noset_FW_ids = $scope.able_noset_FWCompu.map(function(item){ return item.id; });
	var noset_ids = $scope.noset_computers.map(function(item){ return item.id; });
	var set_ids = $scope.set_computers.map(function(item){ return item.id; });

	var computers = {};
	$scope.able_noset_computers.forEach(function(computer){
		computers[computer.id] = computer;
	});

	$scope.loop = false;$scope.results = 10;

  //   $scope.set = function(currentItem){
  //   	$modal.open({
		// 	template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel'>"+
		// 			"设置占位号</h4></div><div class='modal-body'><form class='form-horizontal' name='setNumber'><div class='form-group'><label class='col-xs-4 control-label required'>输入号码</label><div class='col-xs-7'><input type='number' required data-ng-model='placeholder' class='form-control'></div></div><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-ng-disabled='setNumber.$invalid'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;'>取消</button></footer></form></div></div></section>",
		// 	controller : function($scope, $modalInstance){
		// 		$scope.ok = function(){
		// 			client.setPlaceholder(
		// 			{ids:[currentItem.id], order:this.placeholder},
		// 			function(res){
		// 				//console.log(res)
		// 				currentItem.order_status = res.result[0].order_status;
		// 				currentItem.order = res.result[0].order;
		// 				_scope.set_computers.length++;
		// 				for(var i=0; i<_scope.able_noset_computers.length; i++){
		// 					if(_scope.able_noset_computers[i].id == res.result[0].id && _scope.able_noset_computers[i].is_up == true){
		// 						_scope.able_noset_computers.splice(i,1);
		// 						able_noset_ids.splice(i,1);
		// 					}
		// 				}
		// 				for(var i=0; i<noset_ids.length; i++){
		// 					if(noset_ids[i] == res.result[0].id){
		// 						_scope.noset_computers.splice(i,1);
		// 						noset_ids.splice(i,1);
		// 					}
		// 				}
		// 				//console.log(111,able_noset_ids);//console.log(222,noset_ids);
		// 			},function(){

		// 			})
					
		// 			$modalInstance.close();
		// 			//console.log(currentItem)
		// 		},
		// 		$scope.close = function(){
					
		// 			$modalInstance.close();
		// 		}
		// 	},
		// 	size : "sm"
		// });
  //   }

  //   $scope.cancel = function(currentItem){
  //   	$modal.open({
		// 	template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel'>"+
		// 			"取消占位号</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;'>确定取消占位号么?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;'>取消</button></footer></form></div></div></section>",
		// 	controller : function($scope, $modalInstance){
		// 		$scope.ok = function(){
		// 			client.setPlaceholder(
		// 			{ids:[currentItem.id], order:-1},
		// 			function(res){
		// 				currentItem.order_status = res.result[0].order_status;
		// 				currentItem.order = res.result[0].order;
		// 				_scope.set_computers.length--;
		// 				for(var i=0; i<_scope.computers.length; i++){
		// 					if(_scope.computers[i].id == res.result[0].id && _scope.computers[i].is_up == true){
		// 						_scope.able_noset_computers.push(_scope.computers[i]);
		// 						able_noset_ids.push(res.result[0].id);
		// 					}
		// 				}
		// 				for(var i=0; i<_scope.computers.length; i++){
		// 					if(_scope.computers[i].id == res.result[0].id){
		// 						_scope.noset_computers.push(_scope.computers[i]);
		// 						noset_ids.push(res.result[0].id);
		// 					}
		// 				}
						
		// 				//console.log(111,able_noset_ids);//console.log(222,noset_ids);
		// 			},function(){

		// 			});
					
		// 			$modalInstance.close();
		// 		},
		// 		$scope.close = function(){
		// 			$modalInstance.close();
		// 		}
		// 	},
		// 	size : "sm"
		// });
  //   }

    $scope.cancel = function(currentItem){
    	$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='取消登录序号'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CANCEL_LOGINNUM'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					client.setPlaceholder(
					{ids:[currentItem.id], order:-1},
					function(res){
						currentItem.order_status = res.result[0].order_status;
						currentItem.order = res.result[0].order;
					},function(){

					});
					
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
    }

	function time_loop(){
		client.polling(
			{ client_ids: able_noset_ids },
			function(res){
				var trueNum = 0;$scope.width = 0;
				res.result.forEach(function(data){
					var computer = computers[data.id];
					console.log(computer, computer.order)
					if(data.order || !computer.is_up){
						computer.client_name = data.name;
						computer.client_ip = data.ip;
						computer.order = data.order;
						trueNum++;
						$scope.width=(1/res.result.length)*trueNum*100 + "%";
					}
				});
				$scope.computers = $scope.able_noset_computers;
				var unableComputers = $scope.computers.filter(function(item){ return !item.is_up; });
				var ableComputers = $scope.computers.filter(function(item){ return item.is_up; });
				var nosortComputers = ableComputers.filter(function(item){ return !item.order; });
				var sortedComputers = ableComputers.filter(function(item){ return item.order !== null; });
				sortedComputers.sort(
					function(item1,item2){
						return item1.order > item2.order ? 1 : -1;
					}
				);
				$scope.computers = [].concat(sortedComputers, nosortComputers, unableComputers);
				console.log(
					sortedComputers.map(function(item){ return item.id; }),
					nosortComputers.map(function(item){ return item.id; }),
					unableComputers.map(function(item){ return item.id; })
				);
				if(angular.element(".box-all").length){
					var t = setTimeout(function(){
						time_loop();
					}, 3000);
				}
				if(flag){
					clearTimeout(t);
				}

			},
			function(){
				if(angular.element("").length){
					setTimeout(function(){
						time_loop();
					}, 6000);
				}
			}
		);
	}

    $scope.startSort = function(){
    	if($scope.sorttype == "manual"){
			$scope.sorting = true;$scope.Manualsorting = true;

			client.setPlaceholder(
				{ids:able_noset_ids, order:-1},
				function(res){
					res.result.forEach(function(data){
						var computer = computers[data.id];
						computer.order = null;
						console.log(computer, computer.order)
					});
					$scope.loop = true;
					time_loop();
				},function(){
					
				});

			client.sorting(
				{	ids:able_noset_ids,
			        start_num:this.start_num,
			        clientname_prefix:this.clientname_prefix,
			        clientname_suffix:null
			    },
			    function(res){

				},
				function(){

				});
    	}
    	if($scope.sorttype == "auto"){
    		var trueNum = 0;$scope.width = 0;
			$scope.computers = $scope.noset_computers;$scope.sorting = true;
			client.setPlaceholder(
				{ids:noset_ids, order:this.start_num, auto_order:1},
				function(res){
					for(var i=0; i<res.result.length; i++){
						if(res.result[i].order){
							$scope.computers[i].order = res.result[i].order;
							trueNum++;
							$scope.width=(1/res.result.length)*trueNum*100 + "%";
						}
					}

				},function(){})
    	}
    }

	$scope.cancelSort = function(){
		flag = true;
		client.cancelsort({ids:able_noset_ids}, function(res){
			$modalInstance.close();
		});
	};

	$scope.ok = function(){};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("clientBindingIpDialog", ["$scope", "$modalInstance", "Client", "SchoolRoom", "Network", function($scope, $modalInstance, client, schoolroom, network){

	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected; });
	var data = $scope.startIP = $scope.terminallists[0].target_ip;
	schoolroom.query(function(res){
		angular.forEach(res.pools_, function(item){
			if(item.name == $scope.select.name){
				$scope.network = item.network_name+"("+ item.dhcp_start + "~" +item.dhcp_end +")";
				$scope.network_id = item.network_id;
				$scope.subnet_id = item.subnet_id;
				$scope.ip_start = item.dhcp_start;
				$scope.ip_end = item.dhcp_end;
			}
		})
	});
	$scope.isUnchanged = function(){
		return angular.equals(this.startIP,data);
	};
	$scope.ok = function(){
		client.assignIps({
			method:"changeIp",
			start_ip:this.startIP,
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			network_id:this.network_id,
			subnet_id: this.subnet_id},
			function(res){
				var newip = res.result.map(function(item){ return item.ip});
			for(var i=0; i<newip.length; i++)
				$scope.terminallists[i].target_ip = newip[i];
			$modalInstance.close();
		})
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("configureTerminalParameterDialog", ["$scope", "$modalInstance","Client", "$$$I18N",function($scope, $modalInstance, client, $$$I18N){
	$scope.config = {};

	$scope.init_checkMode = function(mode){
		if(mode==0  && $scope.config.mode_countdown!==0){
			$scope.in_hybird = true;
			$scope.config.mode_countdown = $scope.config.mode_countdown;
			$scope.config.final_mode = $scope.config.final_mode;
		}
		else{
			$scope.in_hybird = false;
			$scope.config.mode_countdown = "";
			$scope.config.final_mode = "";
		}
	}
	$scope.checkMode = function(mode){
		$scope.config.enabled_multiple = 0;
		if(mode==0){
			$scope.in_hybird = true;
			$scope.config.mode_countdown = 5;
			$scope.config.final_mode = 1;
		}
		else{
			$scope.in_hybird = false;
			$scope.config.mode_countdown = "";
			$scope.config.final_mode = "";
		}
	}
	$scope.inHybird = function(){
		if($scope.in_hybird){
			$scope.in_hybird = false;
			$scope.config.mode_countdown = "";
			$scope.config.final_mode = "";
		}
		else{
			$scope.in_hybird = true;
			$scope.config.mode_countdown = 5;
			$scope.config.final_mode = 1;
		}
	}
	$scope.fullscreen = function(mode){
		if(mode === 2){
			$scope.config.auto_start = '1';
		}
		else{
			$scope.config.auto_start = '0';
		}
	}
	$scope.setWinWait = function(val){
		console.log(val);
		if(val){
			$scope.config.win_wait_time = 2;
		}
		else{
			$scope.config.win_wait_time = '';
		}
	};
	$scope.setWaitTime = function(val){
		if(val){
			$scope.config.wait_time = $scope.config.wait_time?$scope.config.wait_time:5;
		}
		else{
			$scope.config.wait_time = 5;
		}
	};

	$scope.dialogSet = function(key, value){
		$scope.config[key] = value;
	};

	var selected_rows = $scope.rows.filter(function(row){ return row._selected && row.is_up; });
	var has_windows_android = selected_rows.filter(function(item){ return item.client_type === 1 || item.client_type === 999 || item.client_type === 97 }).length===0?false:true;
	$scope.has_windows = selected_rows.filter(function(item){ return item.client_type === 1 || item.client_type === 999}).length==0 && $scope.isSingle ? false:true;
	$scope.has_linux = selected_rows.filter(function(item){ return item.client_type === 99 }).length==0 && $scope.isSingle ? false:true;
	$scope.selecLen = selected_rows.length;

	$scope.loading = true;
	client.getConfig({id:selected_rows[0].id}, function(data){
		$scope.loading = false;
		$scope.config = new2old(data.config);
		$scope.init_checkMode($scope.config.desktop_mode);
	}, function(error){ $scope.loading = false; $scope.getError = true; });
	$scope.ok = function(){
		$scope.sending = true;
		var id = selected_rows.filter(function(row){
			return row.is_up == true;
		}).map(function(row){
			return row.id;
		});
		// 提交前拉取一次最新的数据，并计算出 diff，仅仅提交不一样的部分
		// client.getConfig({id: selected_rows[0].id}, function(data){
			// var changes = difference(old2new($scope.config), data.config);
			var changes = old2new($scope.config);
            var flatChanges = flatObject(changes);
			// console.log('提交前拉取一次最新的数据', data.result)
			// console.log('修改后的老数据', $scope.config)
			// console.log('修改后的老数据转成新数据', old2new($scope.config))
			// console.log('差异', changes)

			client.modifyConfig({
                id: id,
                server: flatChanges,
                client: changes
            }, function(){
				$modalInstance.close();
			}, function(){
				$scope.sending = false;
				$scope.failTip = true;
			})
		// });
	};
	$scope.close = function(){
		$modalInstance.close();
	};
	/* 旧数据格式 => 新数据格式 */
	function old2new(oldData){
		var newData = {
			"desktop_mode": {
	            "desktop_mode": $scope.config.desktop_mode * 1, // 0 混合模式, 1 教学模式, 2 个人模式
	            "mode_countdown": $scope.config.mode_countdown * 1, // 混合模式-倒数多少秒
	            "final_mode": $scope.config.final_mode * 1, // 混合模式-倒数多少秒自动进入 1 教学桌面, 2 个人桌面 
	            "wait_time": $scope.config.autologin ? $scope.config.wait_time * 1 : 0 // 是否自动进入桌面, 0 不自动进入, 倒计时 3-600 秒自动进入桌面
	        },
	        "enabled_multiple": $scope.config.enabled_multiple * 1, // 0,1 个人模式-多桌面模式
	        "self_service": $scope.config.self_service_teach + "" + $scope.config.self_service_personal + "", // 虚拟机自助 '11'教学桌面启用,个人桌面启用; '10'教学桌面启用,个人桌面不启用; '01'教学桌面不启用,个人桌面启用; '00'教学桌面不启用,个人桌面不启用
			"mode1_shutdown_with_client":  $scope.config.mode1_shutdown_with_client * 1, // 0, 1教学桌面关机策略-关闭桌面同时关闭终端
			"mode1_shutdown_with_pc": $scope.config.mode1_shutdown_with_pc * 1, // 0, 1教学桌面关机策略-关闭终端同时关闭桌面
			"mode2_shutdown_with_client": $scope.config.mode2_shutdown_with_client * 1, // 0, 1个人桌面关机策略-关闭桌面同时关闭终端
			"mode2_shutdown_with_pc": $scope.config.mode2_shutdown_with_pc * 1, // 0, 1个人桌面关机策略-关闭终端同时关闭桌面
			"resolution": {
	            "current_resolution": $scope.config.current_resolution.key, // 个性化-分辨率
	        },
	         "console": {
	            "console_ip": $scope.config.console_ip // 个性化-服务器IP
	        },
	        "init_pwd": $scope.config.init_pwd, // 个性化-超级密码
	        "windows": {
				"shortcutKey": $scope.config.windows_shortcut_key * 1, // 0, 1 快捷键-Windows快捷键
				"fullscreen": $scope.config.fullscreen * 1, // Windows客户端运行模式: 0 窗口模式, 1 全屏可退出, 2 全屏不可退出
				"auto_start": $scope.config.auto_start * 1, // 0, 1开机自启
				"connect_type": $scope.config.connect_type, // Hyper-V桌面连接方式: rdp, vm
				"auto_exit": $scope.config.auto_exit * 1, // 与服务器连接断开后自动退出: 0, 1
				"win_wait_time": $scope.config.win_wait_time * 1, // 等待时间 1-30
				"disk_share_to_desktop": $scope.config.disk_share_to_desktop * 1 // 磁盘共享到桌面: 0, 1
			},
			"linux": {
				"shortcutKey": $scope.config.linux_shortcut_key * 1, // 0, 1 快捷键-Linux快捷键
				"auto_switch": $scope.config.auto_switch * 1, // 0, 1 自动切换
				"auto_switch_seconds": $scope.config.auto_switch_seconds * 1 // 虚系统中断时，倒数 3-600 s自动进入实系统
			}
		}
		return newData;
	};
	/* 新数据格式 => 旧数据格式 */
	function new2old(newData){
		// 给不完整的新格式数据设置默认值
		var resolutions = [];
		newData.resolution.support_resolution.forEach(function(item){
			if(item=='best'){
				resolutions.push({key: 'best', value: $$$I18N.get("最佳分辨率")})
			}else{
				resolutions.push({key: item, value: item})
			}
		});
		var hasCurrentResolution = newData.resolution.support_resolution.filter(function(item){ return item==newData.resolution.current_resolution }).length;
		if(!hasCurrentResolution){
			resolutions.push({key: newData.resolution.current_resolution, value: newData.resolution.current_resolution});
		}
		var oldData = {
			desktop_mode: newData.desktop_mode.desktop_mode + "",
			final_mode: newData.desktop_mode.final_mode + "",
			mode_countdown: newData.desktop_mode.mode_countdown,
			enabled_multiple: newData.enabled_multiple + "",
			wait_time: newData.desktop_mode.wait_time,
			autologin: newData.desktop_mode.wait_time == 0 ? false:true,
			
			self_service_teach: newData.self_service.slice(0,1),
			self_service_personal: newData.self_service.slice(1),
			mode1_shutdown_with_client: newData.mode1_shutdown_with_client + "",
			mode1_shutdown_with_pc: newData.mode1_shutdown_with_pc + "",
			mode2_shutdown_with_client: newData.mode2_shutdown_with_client + "",
			mode2_shutdown_with_pc: newData.mode2_shutdown_with_pc + "",

			support_resolution: resolutions,
			current_resolution: resolutions.filter(function(item){ return item.key == newData.resolution.current_resolution })[0],
			console_ip: newData.console.console_ip,
			init_pwd: newData.init_pwd
		};
		// 如果是windows端就赋值windows参数，否则就用默认值
		if(newData.windows){
			oldData.windows_shortcut_key = newData.windows.shortcutKey + "";
			oldData.fullscreen  =  newData.windows.fullscreen + "";
			oldData.auto_start  =  newData.windows.auto_start + "";
			oldData.connect_type  =  newData.windows.connect_type;
			oldData.auto_exit  =  newData.windows.auto_exit + "";
			oldData.win_wait_time  =  newData.windows.auto_exit?newData.windows.win_wait_time:"";
			oldData.disk_share_to_desktop  =  newData.windows.disk_share_to_desktop + "";
		}else{
			oldData.windows_shortcut_key = "1";
			oldData.fullscreen = "0";
			oldData.auto_start = "0";
			oldData.connect_type = 'rdp';
			oldData.auto_exit = "0";
			oldData.win_wait_time = "";
			oldData.disk_share_to_desktop = "0";
		}
		// 如果是linux端就赋值linux参数，否则就用默认值
		if(newData.linux){
			oldData.linux_shortcut_key = newData.linux.shortcutKey + "";
			oldData.auto_switch = newData.linux.auto_switch + "";
			oldData. auto_switch_seconds = newData.linux.auto_switch?newData.linux.auto_switch_seconds:"";
		}else{
			oldData.linux_shortcut_key = "1";
			oldData.auto_switch = "0";
			oldData.auto_switch_seconds = "";
		}
		return oldData;
	}

    var isObject = require("lodash/isObject");
    var isEqual = require("lodash/isEqual");
    var transform = require("lodash/transform");
    // 计算两个 object 的差异
    function difference(object, base) {
		function changes(object, base) {
			return transform(object, function(result, value, key) {
				if (!isEqual(value, base[key])) {
					result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
				}
			});
		}
		return changes(object, base);
	}
    function flatObject(obj){
        var ret = {};
        var flatFn = function(o){
            Object.keys(o).forEach(function(k){
                var v = o[k];
                if(typeof v === "number" || typeof v === "string") {
                    ret[k] = v;
                } else if(isObject(v)) {
                    flatFn(v);
                }
            });
        };
        flatFn(obj);
        return ret;
    }
}])

.controller("configureClassroomDialog", ["$scope", "$modalInstance", "Client", function($scope, $modalInstance, client){
	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected; });

	$scope.poollists = $scope.classrooms.filter(function(item){ if(item.name !== $scope.select.name) return item;});
	$scope.pool = $scope.poollists[0];

	$scope.isUnchanged = function(){
		return angular.equals($scope.item, $scope.rows) 
				|| angular.equals($scope.currentItem, $scope.rows);
	};

	$scope.ok = function(){
		client.changePools(
		{
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			pool_id:this.pool.id
		},
		function(res){
			angular.forEach($scope.terminallists, function(item){
				item.target_ip = null;
				item.order = null;
				$scope.rows.splice($scope.rows.indexOf(item),1);
			});
			var newPool = res.result.map(function(item){ return item.pool_id});
			for(var i=0; i<newPool.length; i++)
				$scope.terminallists[i].pool = newPool[i];
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("configureNameDialog", ["$scope", "$modalInstance", "Client", function($scope, $modalInstance, client){
	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected && item.is_up; });
	$scope.terminal = $scope.terminallists[0].client_name;
	$scope.ok = function(){
		client.changeNames(
		{
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			prefix:this.prename
		},
		function(res){
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
