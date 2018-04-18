angular.module("vdi.schoolroom", [])
.factory("SchoolRoom", ["$resource", "$Domain", function($resource, $Domain){
 	return $resource($Domain + "/thor/pools", null, {
 		query: { method: "GET", isArray: false },
 		querywithSimple: { method: "GET", url: $Domain + "/thor/pools?simple=true", isArray: false },
		save :
			{ method: "POST", url: $Domain + "/thor/pool" },
		"delete":
			{ method: "DELETE"},
		update:
			{ method: "PUT", url: $Domain + "/thor/pool" },
		sendMessage:
			{ method: "POST", url: $Domain + "/thor/pools/:id/message", params: { "id": "@id" } },
		closeMessage:
			{ method: "DELETE", url: $Domain + "/thor/pools/:id/message", params: { "id": "@id" } },
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
.controller("vdiTerminalSchoolroomManageController", [
"$scope", "SchoolRoom","$modal", "$$$I18N", "UserRole",
function($scope, schoolroom, $modal, $$$I18N, UserRole){
	let user = UserRole.currentUser;
	if(!user){ return }
	$scope.rows = [];
	// $scope.allRows = [];
	var _controllerScope = $scope;$scope.loading = true;
	$scope.owner = UserRole.isOwner;

	function getList(){
		schoolroom.query(function(res){
			if($scope.owner){
				$scope.rows = res.pools_.sort(function(a,b){
					if(a.name === 'default'){
						return -1
					}else if(b.name === 'default'){
						return 1;
					};
					return 0;
				});
			}
			else{
				var schoolrooms = [];
				res.pools_.forEach(function(item){
					if(item.user_ids.some(data => data === user.id)){
						schoolrooms.push(item);
					}
				})
				$scope.rows = schoolrooms;
			}
			// angular.copy($scope.rows,$scope.allRows);
			$scope.loading = false;
		});
	}
	getList();

	// $scope.updateData = function(text){
	// 	$scope.rows = $scope.allRows.filter(function(row){
	// 		row._selected = false;
	// 		if(text){
	// 			return row.name.indexOf(text) !== -1;
	// 		}
	// 		return true;
	// 	});
	// };

    $scope.currentPage = 1;
    $scope.pagesize = Number($$$storage.getSessionStorage('schoolroom_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		$$$storage.setSessionStorage('schoolroom_pagesize', newvalue ? newvalue : 0);
	}); 

	$scope.delete = function(item){

		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.id!==1; })
		var nodelete_rows = selected_rows.filter(function(row){ if( row.sceneCount != 0 || row.terminalCount != 0 ) return row; });
		var delete_rows = selected_rows.filter(function(row){ if( row.sceneCount == 0 && row.terminalCount == 0 ) return row; });

		if(delete_rows.length==0)
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP10"),
					timeout : 6000
				});
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教室'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:10px;' data-localize='CLASSROOM_TIPGROUP1' param1='{{deleteName}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length!=0' data-localize='CLASSROOM_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.deleteName = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
						$scope.delete_rows = delete_rows;$scope.nodelete_rows = nodelete_rows;
						$scope.ok = function(){
							schoolroom.delete({
								ids: delete_rows.map(function(row){ return row.id; })
							}, function(){
								delete_rows.forEach(function(row){
									_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
								});
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

	$scope.changeClass = function(item){
		$$$storage.setSessionStorage('classroom', item.id);
	};

	$scope.onlyOneItem = function(){
		var selectedLength = $scope.rows.filter(function(item){ return item._selected }).length;
		return selectedLength==1;
	}
	$scope.selectNoDefault = function(){
		var _length = $scope.rows.filter(function(item){ return item._selected && item.id!==1 }).length;
		return _length;
	}
	$scope.sendMessage = function(){
		var selected_row = $scope.rows.filter(function(row){ return row._selected; })[0];
		$modal.open({
			templateUrl: "views/vdi/dialog/terminal/sendMessage.html",
			controller: function($scope, $modalInstance){
				$scope.data = {};
				if(selected_row.message!=''){ $scope.data.message=selected_row.message }
				$scope.isUnchanged = function(){
					return angular.equals($scope.data.message,selected_row.message);
				}
				$scope.ok = function(){
					schoolroom.sendMessage({
						id: selected_row.id,
						message: $scope.data.message
					},function(){
						$modalInstance.close();
						getList();
					},function(){});
				}
				$scope.close = function(){
					$modalInstance.close();
				};
			},
			size: "md"
		})
	}

	$scope.closeMessage = function(){
		var selected_rows = $scope.rows.filter(function(row){ return row._selected; });
		var message = selected_rows[0].message;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关闭消息'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-if='message' data-localize='closeMessage'></p><p ng-if='message' style='margin-bottom:20px;'><span data-localize='消息内容'></span>：{{ message }}</p><p ng-if='!message' data-localize='无消息'></p><footer class='text-right'><button class='btn btn-primary' ng-disabled='!message' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller : function($scope, $modalInstance){
					$scope.message = message;
					$scope.ok = function(){
						schoolroom.closeMessage({
							id: selected_rows[0].id
						},function(){
							$modalInstance.close();
							getList();
						},function(){});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
			},
			size : "sm"
		});
	}
}])

.controller("editSchoolroomDialog", ["$scope", "$modalInstance", "SchoolRoom","Network", "Admin","$$$I18N", "ResourcePool","UserRole",function($scope, $modalInstance, sc, network, admin, $$$I18N, ResourcePool,UserRole){
	let user = UserRole.currentUser;
	$scope.min_namelength=2;$scope.max_namelength=20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);

	$scope.is_default = item.name === 'default'? true:false;
	// console.log(333333333,item)
	// ResourcePool.query(function(res){
	// 	$scope.resources = res.result;
	// 	$scope.data.resource = $scope.resources.filter(function(data){ return data.id === $scope.data.resource_pool_id })[0];
	// });
	function getSubnets(Network){
		if(Network){
			$scope.network_loading = true;
			network.query_sub({id: Network.id }, function(res){
				$scope.subnets = res.result;
				$scope.data.subnet = $scope.subnets.filter(function(data){ return data.id === $scope.data.subnet_id })[0];
				$scope.network_loading = false;
			})			
		}
	};
	network.query(function(data){
		$scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
		$scope.data.network = $scope.networks.filter(function(data){ return data.id === $scope.data.network_id })[0];
		getSubnets($scope.data.network);
	})
	$scope.switchSubnet = function(val){
		getSubnets(val);
	}
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.isUnchanged = function(){
		if($scope.data.network && $scope.data.subnet){
			return $scope.data.name===item.name && $scope.data.desc===item.desc && $scope.data.ip_start===item.ip_start && $scope.data.ip_end===item.ip_end && $scope.data.network.id===item.network_id && $scope.data.subnet.id===item.subnet_id;
			// return $scope.data.name===item.name && $scope.data.desc===item.desc && $scope.data.ip_start===item.ip_start && $scope.data.ip_end===item.ip_end && $scope.data.resource.id===item.resource_pool_id && $scope.data.network.id===item.network_id && $scope.data.subnet.id===item.subnet_id;
		}
	};
	$scope.reset = function(){
		$scope.data = angular.copy(item);
		// $scope.data.resource = $scope.resources.filter(function(data){ return data.id === item.resource_pool_id })[0];
		$scope.data.network = $scope.networks.filter(function(data){ return data.id === item.network_id })[0];
		getSubnets($scope.data.network);
	};

	var ids = [];
	admin.query(function(res){
		ids = res.users.filter(function(item){ return item.permission === 'Administrator' }).map(function(item){ return item.id })
	})
	var _id;
	var _controllerScope = $scope;
	$scope.edit = function(){
		_id = this.data.id;
		sc.update(
			{
				"id":this.data.id,
				"name": this.data.name,
				"desc": this.data.desc,
				// "resource_pool_id": this.data.resource.uuid,
				"network_id": this.data.network.id,
				"subnet_id": this.data.subnet.id,
				"ip_start": this.data.ip_start || '',
				"ip_end": this.data.ip_end || ''
			},
			function(res){
				if(res.id ==_id){
					sc.query(function(res){
						if($scope.owner){
							var newRows = res.pools_.sort(function(a,b){
								if(a.name === 'default'){
									return -1
								}else if(b.name === 'default'){
									return 1;
								};
								return 0;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows,newRows);
						}
						else{
							var schoolrooms = [];
							res.pools_.forEach(function(item){
								if(item.user_ids.some(data => data === user.id)){
									schoolrooms.push(item);
								}
							})
							var newRows = schoolrooms;
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
                			Array.prototype.push.apply(_controllerScope.rows,newRows);
						}
						$scope.loading = false;
					});
					$modalInstance.close();
				}else{
					$.bigBox({
						title	:$$$I18N.get("INFOR_TIP"),
						content	: $$$I18N.get("教室重复").replace("XXX",res.name),
						color	: "#C46A69",
						icon	: "fa fa-warning shake animated",
						timeout	: 6000
					});
				}
				
			},
			function(){  }
		);

	};
}])

.controller("addSchoolroomDialog", [
"$scope", "$modalInstance", "SchoolRoom", "Network", "Admin","$$$I18N", "UserRole","ResourcePool",
function($scope, $modalInstance, schoolroom, network, admin, $$$I18N, UserRole, ResourcePool){
	let user = UserRole.currentUser;
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {};
	$scope.master = {};

	var ids = [];
	admin.query(function(res){
		ids = res.users.filter(function(item){ return item.permission === 'Administrator' }).map(function(item){ return item.id });
	})
	// ResourcePool.query(function(res){
	// 	$scope.resources = res.result;
	// 	$scope.data.resource = $scope.resources[0];
	// });
	function getSubnets(Network){
		$scope.network_loading = true;
		network.query_sub({id: Network.id }, function(res){
			$scope.subnets = res.result;
			$scope.data.subnet = $scope.subnets[0];
			$scope.network_loading = false;
		})	
	};
	network.query(function(data){
		$scope.networks = data.networks.filter(function(item){ return item.subnets.length!==0 });
		$scope.data.network = $scope.networks[0];
		getSubnets($scope.data.network);
	})
	$scope.switchSubnet = function(val){
		getSubnets(val);
	}
	var _controllerScope = $scope;
	$scope.ok = function(){
		var _this = this;
		schoolroom.save({
				"name": this.data.name,
				"desc": this.data.desc,
				// "resource_pool_id": this.data.resource.uuid,
				"subnet_id": this.data.subnet.id,
				"network_id": this.data.network.id,
				"user_ids": ids,
				"ip_start": this.data.ip_start || '',
				"ip_end": this.data.ip_end || ''
			},
			function(data){
				if(!data.name || data.name == _this.data.name){
					schoolroom.query(function(res){
						if($scope.owner){
							var newRows = res.pools_.sort(function(a,b){
								if(a.name === 'default'){
									return -1
								}else if(b.name === 'default'){
									return 1;
								};
								return 0;
							});
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows,newRows);
						}
						else{
							var schoolrooms = [];
							res.pools_.forEach(function(item){
								if(item.user_ids.some(data => data === user.id)){
									schoolrooms.push(item);
								}
							})
							var newRows = schoolrooms;
							_controllerScope.rows.splice(0, _controllerScope.rows.length);
                			Array.prototype.push.apply(_controllerScope.rows,newRows);
						}
						$scope.loading = false;
					});
					var logInfor = UserRole.currentUser;
					logInfor.pool = logInfor.pool.concat(data.id);
					$$$storage.setSessionStorage('loginInfo', JSON.stringify(logInfor));
					$modalInstance.close();
				}else{
					$.bigBox({
						title	: $$$I18N.get("INFOR_TIP"),
						content	: $$$I18N.get("教室重复").replace("XXX",data.name),
						color	: "#C46A69",
						icon	: "fa fa-warning shake animated",
						timeout	: 6000
					});
				}
			}
		);

	};
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	};
}])