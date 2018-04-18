angular.module("vdi.template.hardware", ["vdi.template"])

.factory("HardwareTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/hardwares", isArray: false },
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/image/hardwares" },
		save:
			{ method: "POST",url: $Domain + "/thor/image/hardwares" },
		get:
			{ method: "GET", url: $Domain + "/thor/image/hardwares/:id", params: { id: "@id"}, isArray: false },
		update:
			{ method: "PUT", url: $Domain + "/thor/image/hardware/:id", params: { id: "@id"}, isArray: false },
		// 过滤模板
		filter:
			{ method: "GET", url:$Domain + "/thor/image/hardwares"}
	});
}])

.controller("vdiTemplateHardwareListController", ["$scope", "$modal", "HardwareTemplate", function($scope, $modal, hardware){
	$scope.rows = [];
	$scope.loading = true;
	var _controllerScope = $scope;
	hardware.query(function(res){
		$scope.rows = res.result;
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];
	
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除硬件模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_H' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.name = rows.map(function(row){ return row.name }).join(', ');
				$scope.ok = function(){
					hardware.delete(
						{
							"instance_type_id": rows.map(function(item){ return item.id })
						},
						function(){
							hardware.query(function(res){
								var newRows = res.result;
								_controllerScope.rows.splice(0, _controllerScope.rows.length);
								Array.prototype.push.apply(_controllerScope.rows,newRows);
							});
						},
						function(error){
							hardware.query(function(res){
								var newRows = res.result;
								_controllerScope.rows.splice(0, _controllerScope.rows.length);
								Array.prototype.push.apply(_controllerScope.rows,newRows);
							});
							
						}
					);
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

.controller("addHardwareTemplateDialog", ["$scope", "$modalInstance","HardwareTemplate",function($scope,$modalInstance,hardware){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {
		cpu_num:1,
		memory_mb:1,
		system_gb:10
		// system_disk_type: "2",
		// local_disk_type: "3"
	};
	$scope.btndisks = [];
	// $scope.data.system_disk_type = "2";$scope.data.local_disk_type = "3";
	var _controllerScope = $scope;
	$scope.ok = function(){
		var _this = this;
		hardware.save({
				"name" : this.data.name,
				"cpu_num" : this.data.cpu_num,
				"memory_mb": this.data.memory_mb*1024,
				"system_gb" :this.data.system_gb,
				"local_gb" : this.btndisks[0]?this.btndisks[0].local_gb:0,
				"local_gb1" : this.btndisks[1]?this.btndisks[1].local_gb:0
				// "system_disk_type": this.data.system_disk_type,
				// "local_disk_type": this.data.local_disk_type
			},
			function(data){
				// $scope.rows.unshift({
				// 	id: data.id,
				// 	name : _this.data.name,
				// 	cpu_num : _this.data.cpu_num,
				// 	memory_mb: _this.data.memory_mb*1024,
				// 	system_gb : _this.data.system_gb,
				// 	local_gb : _this.data.local_gb,
				// 	"system_disk_type": _this.data.system_disk_type,
				// 	"local_disk_type": _this.data.local_disk_type
				// });
				hardware.query(function(res){
					var newRows = res.result;
					_controllerScope.rows.splice(0, _controllerScope.rows.length);
					Array.prototype.push.apply(_controllerScope.rows,newRows);
				});
				$modalInstance.close();
			}
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.addbtndisk = function(){
		$scope.btndisks.push({local_gb: 5});
	};
	$scope.minusbtndisk = function(){
		// var idx = $scope.btndisks.indexOf(i)
		$scope.btndisks.splice($scope.btndisks.length-1,1);
	};
	
}])

.controller("editHardwareTemplateDialog", ["$scope", "$modalInstance","HardwareTemplate", function($scope, $modalInstance, hardware){
	$scope.min_namelength=2;$scope.max_namelength=20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function(){
		hardware.update(
			$scope.data,
			function(res){
				item.name = res.name;
				item.cpu_num = res.cpu_num;
				item.memory_mb = res.memory_mb;
				item.local_gb = res.local_gb;
				item.system_gb = res.system_gb;
				$modalInstance.close();
			},
			function(){

			}
		);
	};
	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.useNum="1"
	$scope.btndisks = [];
	$scope.addharddisk = function(){
		$scope.useNum-=1
		$scope.btndisks.push(new String);
	};
	$scope.deleteharddisk = function(itemindex){
		$scope.useNum+=1
		$scope.btndisks.splice(itemindex, 1);
	};
}])