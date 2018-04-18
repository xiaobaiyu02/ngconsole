/**
*  Module
*
* Description
*/
angular.module('vdi.resource.console', [])
.factory("Console", ["$resource", "$Domain","$controllerDomain", function($resource, $Domain,$controllerDomain){
	return $resource($Domain + "/thor/hosts", null, {
		query_console:
			{ method: "GET", url: $Domain + "/thor/controllers"},
		save_ip:
			{ method: "POST", url: $Domain + "/thor/host/external_ip"},
		get_sync_network:
			{ method: "POST", url: $Domain + "/thor/get_data_sync_network"},
        get_ha_status:
            { method: "GET", url: $Domain + "/thor/get_controller_ha_status"},
        switch_controller:
            {method: "POST", url: $Domain + "/thor/switch_controller"},
        fast_shutdown:
            {method: "POST", url: $Domain + "/thor/controller/fast_shutdown_host"},
        get_ha_detail:
            {method: "GET", url: $Domain + "/thor/controller/ha"}
	});
}])
.factory('maskModel', ['$rootScope','$modal', function($rootScope,$modal){
	//服务重启的情况下，页面增加遮罩层
	return {
		open:function(node_ids,page_type){
			var instance = $modal.open({
				size:"sm",
				controller: ["$modalInstance","$scope",function($modalInstance,$scope){
					// 60秒后开始判断服务是否重启完成
					setTimeout(function(){
						switch(page_type){
							case "manageNetwork":
								$scope.$on("manage_networksRowsUpdate", function($event,data){
									if(data.length && data.every(function(n){ return n.state })){
										location.reload();
										$modalInstance.close();
									}
								});
								break;
							case "enableConsoleHA":
								$scope.$on("nodesRowsUpdate", function($event,data){
									var nodes = data.filter(item => {return node_ids.indexOf(Number(item.tasklog_controller_id)) !== -1});
									if(nodes.every(function(n){ return n.enable_ha_service_state })){
										location.reload();
										$modalInstance.close();
									}
								});
								break;
							case "disableConsoleHA":
								$scope.$on("nodesRowsUpdate", function($event,data){
									var nodes = data.filter(item => {return node_ids.indexOf(Number(item.tasklog_controller_id)) !== -1});
									if(nodes.every(function(n){ return n.disable_ha_service_state })){
										location.reload();
										$modalInstance.close();
									}
								});
								break;
							default:
								$scope.$on("nodesRowsUpdate", function($event,data){
									var nodes = data.filter(item => node_ids.indexOf(item.id) !== -1);
									if(nodes.every(function(n){ return n.service_state })){
										location.reload();
										$modalInstance.close();
									}
								});
								break;
						}
					},60000);
				}],
				template:`<div class="modal-content-blank">
							<p>
								<img src="img/loadingtext.gif" alt="" width="24" height="24">
								<span localize="MASKMODEL_WAITING_TIPS"></span>
							</p>
						</div>`
			});
			return instance;
		}
	};
}])
// 通用接口：查询是否启用 HA
.factory("isHAEnabled", ["Console", function(Console){
    return function(){
        return Console.get_ha_status().$promise.then(function(data){
            return data.result.ha_mode === "active_passive";
        });
    }
}])
.controller('vdiResourceConsoleListController', ['$scope','$modal','$$$I18N','Console','Host','$rootScope','$interval', function($scope,$modal,$$$I18N,Console,Host,$rootScope,$interval){
	$scope.rows = [];
	$interval(function(){
		$scope.rows && $scope.$root && $scope.$root.$broadcast("nodes", $scope.rows.map( item => item.tasklog_controller_id ));
	}, 1000);
	$scope.$on("nodesRowsUpdate", function($event, data){
		// 列表接口的tasklog_controller_id字段与轮询接口的id字段对应
		$rootScope.activeHostIds = $scope.rows.filter(row => { return row.status === 'active'}).map(row => { return row.id});
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.tasklog_controller_id] = item;
		});
		data.forEach(function(item){
			if(_rows[item.tasklog_controller_id]){
				for(var k in item){
					_rows[item.tasklog_controller_id][k] = item[k];
				}
			}
		});
	});
    var get_list = function(){
    	$scope.loading = true;
    	Console.query_console(function(res){
    		$scope.loading = false;
	    	$scope.rows = res.result.map(function(item,idx,arr){
	    		item.memory_mb = (item.memory_mb/1024).toFixed(1);
	    		item.memory_mb_used = (item.memory_mb_used/1024).toFixed(1);
	    		item._has_ha = arr.length > 1;
	    		return item;
	    	});
	    });
    };
    get_list();
    getHAStatus();

    $scope.openHostMoreDialog = function(item){
    	var _dialog = $modal.open({
			controller:"consoleMoreDialog",
			templateUrl:"views/vdi/dialog/resource/console/console_more.html",
			size:"lg",
			resolve:{
				param:function(){
					return item;
				}
			}
		});
    };
    $scope.openHAConfigDialog = function(item){
    	var backup_agent = $scope.rows.filter(row => { return row.role === 'backup'})[0];
    	item._btn_status = backup_agent ? backup_agent.status === 'active' : true;
    	var _dialog = $modal.open({
			controller:"HAconfigDialog",
			templateUrl:"views/vdi/dialog/resource/console/ha_config.html",
			size:"md",
			resolve:{
				param:function(){
					return item;
				}
			}
		});
    	// _dialog.result.then(function(){
    	// 	get_list();
    	// });
    };
    $scope.restart = function(item){
		var rows = (item ? [item] : $scope.rows).filter(function(item) {return item.status === 'active';});
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='重启主机'>"+
						"重启主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启主机吗?'>确定重启主机吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						Host.maintain_host({
							action:"reboot_host",
							host_ips:rows.map(function(row){ return row.ip })
						},function(res){
							$rootScope.$broadcast('NOAUTH');
							location.reload();
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
				content:$$$I18N.get("vdiResourceHostList_TIP1"),
				timeout:6000
			});
		}
	};

	$scope.poweroff = function(item){
		var rows = (item ? [item] : $scope.rows).filter(function(item) {return item.status === 'active';});
		if(rows.length){
			$modal.open({
				template: `<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='关闭主机'>"+
						"关闭主机</h4></div><div class='modal-body'>
							<form class='form-horizontal'>
								<p style='margin-bottom:20px;' localize='确定关闭主控节点吗'></p><footer class='text-right'>
								<div class="form-group">
									<label class="col-xs-12" style='text-align: left;'>
										<input class="checkbox ng-pristine ng-valid" type="checkbox" data-ng-model="all" data-ng-init='all=true'>
										<span localize='同时关闭所有运行的桌面和计算节点'></span>
									</label>
								</div>
								<button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button>
								<button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>
							</footer>
						</form></div></div></section>`,
				
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						Host.shutdown({
							all: this.all
						},function(res){
							$rootScope.$broadcast('NOAUTH');
							location.reload();
						})
						$modalInstance.close();
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
				content:$$$I18N.get("vdiResourceHostList_TIPACTIVE"),
				timeout:6000
			});
		}
	};
	$scope.poweroffBackup = function(item){
		var rows = (item ? [item] : $scope.rows).filter(function(item) {return item.status === 'active';});
		if(rows.length){
			$modal.open({
				template: `<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='关闭主机'>"+
						"关闭主机</h4></div><div class='modal-body'>
							<form class='form-horizontal'>
								<p style='margin-bottom:20px;' localize='确定关闭主机吗'></p><footer class='text-right'>
								<button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button>
								<button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button>
							</footer>
						</form></div></div></section>`,
				
				controller: function($scope, $modalInstance){
					$scope.ok = function(){
						Host.maintain_host({
							host_ips:rows.map(function(item){ return item.ip }),
							action:"poweroff_host"
						});
						$modalInstance.close();
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
				content:$$$I18N.get("vdiResourceHostList_TIPACTIVE"),
				timeout:6000
			});
		}
	};
	// $scope.maintain = function(){
	// 	var rows = $scope.rows.filter(function(item) {return item._selected});
	// 	$modal.open({
	// 		template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='维护主机'>"+
	// 				"维护主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定维护主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
	// 		controller: function($scope, $modalInstance){
	// 			$scope.ok = function(){
	// 				Host.maintain_host({
	// 					action:"maintenance_host",
	// 					host_ips:rows.map(function(item){ return item.ip })
	// 				},function(res){
	// 					get_list();
	// 				});
	// 				$modalInstance.close();
	// 			},
	// 			$scope.close = function(){
	// 				$modalInstance.close();
	// 			}
	// 		},
	// 		size : "sm"
	// 	});
	// };
	// $scope.recovery = function(){
	// 	var rows = $scope.rows.filter(function(item) {return item._selected});
	// 	$modal.open({
	// 		template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='恢复主机'>"+
	// 				"恢复主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定恢复主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
	// 		controller: function($scope, $modalInstance){
	// 			$scope.ok = function(){
	// 				Host.maintain_host({
	// 					action:"recovery_host",
	// 					host_ips:rows.map(function(item){ return item.ip })
	// 				},function(res){
	// 					get_list();
	// 				});
	// 				$modalInstance.close();
	// 			},
	// 			$scope.close = function(){
	// 				$modalInstance.close();
	// 			}
	// 		},
	// 		size : "sm"
	// 	});
	// };
	$scope.current_theme = $$$storage.getSessionStorage('current_theme') || "smart-style-0";
	$scope.$on("changeSkin", function(e,value){
        $scope.current_theme = value;
    });
    // HA 查看详情
    $scope.viewDetail = function(){
        $modal.open({
            templateUrl: "views/vdi/dialog/resource/console/ha-detail.html",
            controller: "HAViewDetailDialogController",
            windowClass: "ha-detail-modal",
            resolve: {
                data: function(){
                    return $scope.ha;
                }
            }
        });
    };
    // HA 主备控切换
    $scope.switchBrain = function(){
        $modal.open({
            templateUrl: "views/vdi/dialog/resource/console/ha-switch-brain.html",
            controller: "HASwitchBrainDialogController",
            resolve: {
                data: function(){
                    return $scope.ha;
                }
            }
        });
    };
    // HA 一键关机
    $scope.onekeyShutdown = function(){
        $modal.open({
            templateUrl: "views/vdi/dialog/resource/console/ha-shutdown.html",
            controller: "HAShutdownDialogController",
            resolve: {
                data: function(){
                    return $scope.ha;
                }
            }
        });
    };
    // 获取 HA 状态
    function getHAStatus(){
        Console.get_ha_status(function(resp){
            $scope.ha = resp.result;
            $scope.haEnabled = resp.result.ha_mode === "active_passive";
            var hasActive = false, hasPassive = false;
            $scope.ha.roles.forEach(function(x){
                if(x.role === "active") {
                    hasActive = true;
                } else if(x.role === "passive") {
                    hasPassive = true;    
                }
            });
            $scope.switchable = hasActive && hasPassive && !$scope.ha.is_split_brain;
        });
    }
}])
.filter("haDataStatus", ["$$$I18N", function(i18n){
    return function(data){
        var key;
        if(!data || typeof data !== "object") {
            return "";
        }
        switch(data.data_sync) {
            case "synced":
                key = "已同步";
                break;
            case "syncing":
                key = "正在同步";
                break;
            case "unsynced":
                key = "未同步";
                break;
        }
        return i18n.get(key);
    };
}])
.filter("haRunningStatus", ["$$$I18N", function(i18n){
    return function(data){
        if(!data || typeof data !== "object") {
            return "";
        }
        var num = data.roles.filter(function(x){
            return x.role === "passive";
        }).length;
        if(data.is_split_brain) {
            return "异常（有" + num + "个备控，裂脑）";
        } else {
            return "正常";
        }
    };
}])
.directive("haDrawwer", ["$q", function($q){
    return {
        scope: {
            data: "="
        },
        link: function(scope, element){
            var context = element[0].getContext("2d");
            if(!context) { return; }
            var loaded = false;
            $q.all(["main-ctrl", "sub-ctrl", "arbitration", "error", "warn"].map(function(id){
                id = "#ha-detail-" + id;
                return new Promise(function(resolve, reject){
                    var el = document.querySelector(id);
                    if(el.complete) {
                        return resolve();
                    }
                    el.addEventListener("load", function onImgLoad(){
                        el.removeEventListener("load", onImgLoad);
                        resolve();
                    });
                });
            })).then(function(){
                loaded = true;
                update();
            });
            scope.$on("$destroy", scope.$watch("data", update));
            function update(){
                if(!loaded) { return; }
                var w = element.width();
                var h = element.height();
                var scale = getCanvasScale(context);
                element.attr("width", w * scale);
                element.attr("height", h * scale);
                context.scale(scale, scale);
                draw(context, w, h, scope.data);
            }
        }
    };
    function draw(context, width, height, data){
        var dataColor = "#16ee21";
        var networkColor = "#73bfe9";
        // 画出来的图形总宽 60%，总高 60%
        // 外围的三角形, 根据总宽高计算
        var outerPoints = [
            [width * 0.2, height * 0.25 + 30],
            [width * 0.8, height * 0.25 + 30],
            [width * 0.5, height * 0.75 + 15]
        ];
        // 左上角角度
        var topLeftAngle = Math.atan2(
            outerPoints[2][1] - outerPoints[0][1],
            outerPoints[2][0] - outerPoints[0][0]
        );
        var drawTriangle = function(point, i){
            if(i === 0) {
                context.beginPath();
                context.moveTo(point[0], point[1]);
            } else {
                context.lineTo(point[0], point[1]);
                if(i === 2) {
                    context.closePath();
                    context.stroke();
                }
            }
        };
        var drawLine = function(point1, point2, color){
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(point1[0], point1[1]);
            context.lineTo(point2[0], point2[1]);
            context.stroke();
        };
        var widthOf = function(str) {
            return context.measureText(str).width;
        };
        var drawBetween = function(p1, p2, type){
            var x = (p1[0] + p2[0]) / 2;
            var y = (p1[1] + p2[1]) / 2;
            var el = document.querySelector("#ha-detail-" + type);
            // 图标的大小为：25 * 24
            context.drawImage(el, x - 12.5, y - 12);
        };
        context.clearRect(0, 0, width, height);
        // context.lineWidth = 3.0;
        context.strokeStyle = networkColor;
        outerPoints.forEach(drawTriangle);
        drawLine(
            [outerPoints[0][0], outerPoints[0][1] - 40],
            [outerPoints[1][0], outerPoints[1][1] - 40],
            dataColor
        );
        context.drawImage(
            document.querySelector("#ha-detail-main-ctrl"),
            outerPoints[0][0] - 34.5,
            outerPoints[0][1] - 62
        );
        context.drawImage(
            document.querySelector("#ha-detail-sub-ctrl"),
            outerPoints[1][0] - 34.5,
            outerPoints[1][1] - 62
        );
        context.drawImage(
            document.querySelector("#ha-detail-arbitration"),
            outerPoints[2][0] - 34.5,
            outerPoints[2][1] - 73
        );
        context.font = "13px 'Open Sans', Arial, Helvetica, 'Microsoft YaHei', Sans-Serif";
        context.fillStyle = dataColor;
        context.fillText(
            data.data_sync_ip,
            outerPoints[0][0] - 40 - widthOf(data.data_sync_ip),
            outerPoints[0][1] - 35
        );
        context.fillText(
            data.peer_data_sync_ip,
            outerPoints[1][0] + 40,
            outerPoints[1][1] - 35
        );
        context.fillStyle = networkColor;
        context.fillText(
            data.management_ip,
            outerPoints[0][0] - 40 - widthOf(data.management_ip),
            outerPoints[0][1] - 10
        );
        context.fillText(
            data.peer_management_ip,
            outerPoints[1][0] + 40,
            outerPoints[1][1] - 10
        );
        context.fillText(
            data.quorum_ip_addresses[0],
            outerPoints[2][0] - widthOf(data.quorum_ip_addresses[0]) / 2,
            outerPoints[2][1] + 20
        );
        if(data.peer_data_to_data === false) {
            drawBetween(
                [outerPoints[0][0], outerPoints[0][1] - 40],
                [outerPoints[1][0], outerPoints[1][1] - 40],
                "error"
            );
        }
        if(data.peer_management_to_management === false) {
            drawBetween(
                outerPoints[0], outerPoints[1],
                data.is_peer_unknow ? "warn" : "error"
            );
        }
        if(data.quorum_to_management[0] === false) {
            drawBetween(outerPoints[0], outerPoints[2], "error");
        }
        if(data.quorum_to_management[1] === false) {
            drawBetween(outerPoints[1], outerPoints[2], "error");
        }
    }
    function getCanvasScale(context) {
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;
        return devicePixelRatio / backingStoreRatio;
    }
}])
.controller("HAViewDetailDialogController", ["$modalInstance", "$q", "$scope", "Console", "data", function($modalInstance, $q, $scope, Console, data){
    $scope.firstLoading = true;
    $scope.close = function(){
        $modalInstance.close();
    };
    $scope.refresh = load;
    load();
    function load(){
        $q.all([
            Console.get_ha_status().$promise,
            Console.get_ha_detail({detail: 1}).$promise
        ]).then(function(arr){
            $scope.ha = arr[0].result;
            $scope.detail = arr[1];
            $scope.detail.is_peer_unknow = $scope.ha.roles.some(function(x){
                return x.role === "unknow";
            });
        }, function(){}).finally(function(){
            $scope.firstLoading = false;
        });
    }
}])
.controller("HASwitchBrainDialogController", ["$modalInstance", "$scope", "Console", "data", function($modalInstance, $scope, Console, data){
    var switchToIP;
    data.roles.forEach(function(x){
        if(x.role === "passive") {
            switchToIP = x.ip;
        }
    });
    console.assert(!!switchToIP, "backend data error: " + switchToIP);
    $scope.loading = false;
    $scope.close = function(){
        $modalInstance.close();
    };
    split();
    function split(){
        var timer;
        // 此接口是阻塞的，所以返回后即可确定是刷新还是报错
        Console.switch_controller({
            active_ip: switchToIP
        }, function(resp){
            resp && location.reload();
            clearTimeout(timer);
        }, function(){
            location.reload();
            clearTimeout(timer);
        });
        $scope.loading = true;
        timer = setTimeout(function(){
            location.reload();
        }, 30 * 1000);
        $scope.$root.$broadcast("STOPLOG");
    };
}])
.controller("HAShutdownDialogController", ["$modalInstance", "$scope", "Console", "data", function($modalInstance, $scope, Console, data){
    $scope.loading = false;
    $scope.close = function(){
        $modalInstance.close();
    };
    $scope.shutdown = function(){
        Console.fast_shutdown();
        $scope.loading = true;
    };
}])
.controller('consoleRenewDialog', ['$scope', function($scope){
	
}])
.controller('HAconfigDialog', ['$scope','HA','param','$modalInstance','Console','maskModel','Host','$$$I18N', function($scope,HA,param,$modalInstance,Console,maskModel,Host,$$$I18N){
	var isEmptyObject = function(obj){
		for(i in obj){
			return false;
		};
		return true;
	};
	$scope.ha = {};
	$scope.ha.loadding = true;
	$scope.currentItem = param;
	HA.get_console_ha({controller_ip:param.ip},function(res){
		$scope.ha = res;
		// $scope.ha.editable = $scope.ha.management_ip ? false : true;	
		$scope.ha.back_user = "root";
		$scope.ha.ha_mode = $scope.ha.ha_mode == 'off' ? false: true;
		$scope.quorums = $scope.ha.management_ip ? $scope.ha.quorum_ip_addresses.map(function(q){ return {ip:q} }) : [{ip:null}];
	}).$promise.finally(function(){
		$scope.ha.loadding = false;
	});
	$scope.close = function(){
		$modalInstance.dismiss();
	};
	$scope.ok = function(){
		var postData = {};
		if($scope.ha.ha_mode){
			postData = {
				controller_ip:'',
				ha_mode: 'off',
				floating_ip	:$scope.ha.floating_ip,
				quorum_ip_addresses:$scope.ha.quorum_ip_addresses,
				data_sync_ip:$scope.ha.data_sync_ip,
				peer_data_sync_ip:$scope.ha.peer_data_sync_ip,
				data_sync_mask:$scope.ha.data_sync_mask,
				management_ip:$scope.ha.management_ip,
				peer_management_ip: $scope.ha.peer_management_ip,
				sensitivity:$scope.ha.sensitivity
			}
		}else{
			var is_ip_ok = $scope.quorums.some(q => {return q.status === 'normal'})
			if(!is_ip_ok){
				$.bigBox({
					title:$$$I18N.get("INFOR_TIP"),
					content:$$$I18N.get("configHATestIPConfirm"),  //请先点击'测试连接'按钮，确认仲裁IP网络连通
					timeout:6000
				});
				return;
			}
			postData = {
				controller_ip: param.ip,
				ha_mode:'active_passive',
				floating_ip	:$scope.ha.floating_ip,
				quorum_ip_addresses:$scope.quorums.map(function(q){ return q.ip }),
				data_sync_ip:$scope.ha.network_data.data_sync_ip,
				peer_data_sync_ip:$scope.ha.network_data.peer_data_sync_ip,
				data_sync_mask:$scope.ha.network_data.data_sync_mask,
				management_ip:$scope.ha.management_ip,
				peer_management_ip: $scope.ha.peer_management_ip,
				back_user:$scope.ha.back_user,
				back_password:$scope.ha.back_password,
				sensitivity:$scope.ha.sensitivity
			}
		}
		$scope.ha.loadding = true;
		HA.set_console_ha(postData,function(res){
			$modalInstance.close();
			maskModel.open([-1],($scope.ha.ha_mode ? "disableConsoleHA" : "enableConsoleHA"));
		}).$promise.finally(function(){
			$scope.ha.loadding = false;
		});
	};
	$scope.addQuorumIp = function(){
		$scope.quorums.push({ip:null});
	};
	$scope.minusQuorumIp = function(i){
		var idx = $scope.quorums.indexOf(i)
		$scope.quorums.splice(idx,1);
	};
	$scope.test_connect = function(item){
		item.connecting = true;
		Host.node_ping({
			remote_ip:item.ip,
			node_ip:[
				$scope.ha.management_ip,
				$scope.ha.peer_management_ip
			]
		},function(res){
			item.status = res.result ? "normal" : "failed";
		}).$promise.finally(function(){
			item.connecting = false;
		});
	};
	$scope.get_network = function(){
		$scope.loading_net = true;
		Console.get_sync_network({
			master_ip:$scope.ha.management_ip,
			backup_ip:$scope.ha.peer_management_ip
		},function(res){
			$scope.networks = res.result;
			if(Object.keys($scope.networks).length){
				$scope.ha.network_data = $scope.networks[Object.keys($scope.networks)[0]];
			}
		}).$promise.finally(function(){
			$scope.loading_net = false;
		});

	};
}])
.controller("consoleMoreDialog", ["$scope","$modalInstance", "Host", "HostManage","$$$I18N", "$Domain","param","Storage","Console","maskModel","$modal",
	function($scope, $modalInstance,Host,HostManage, $$$I18N, $Domain,param,Storage,Console,maskModel,$modal){
	var param_host =angular.copy(param);
	$scope.is_ha = param_host._has_ha;
    $scope.get_nic = function(){
    	$scope.loading_nic = true;
    	HostManage.network_info({
	    	host:param.ip,
	    	role:param.role,
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
			$scope.getSuccess = true;
	    },function(error){
			$scope.getSuccess = false;
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
			is_console:true,
			iface:item.name,
			ips:item._ips.map(function(i){ return i.model.ip}),
			netmasks:item._ips.map(function(i){ return i.model.netmask}),
			ips_editable:item._ips.map(function(i){ return i.model.ip_editable}),
			before_cidr:before_cidr,
			all_cidr:all_cidr
		};
		var no_alter = item._ips.every(it => {
			return it.model.ip === it.value.ip && it.model.netmask === it.value.netmask
		});
		if(no_alter && item._ips.length === item.ips.length){
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
			HostManage.alter_gatedns(postData, function(){
				d._dnss.forEach(dns => {
					dns.value = dns.model;
				});
				d._gateway.value = d._gateway.model;
				d._readonly = true;
				maskModel.open([-1]);
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
					p_dev_states:angular.copy($scope.dev_states)
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
					p_item :angular.copy(item),
					p_dev_states:angular.copy($scope.dev_states)
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
					p_dev_states:angular.copy($scope.dev_states)
				}
			}}
		});
		dialog.result.then(function(){
			getNetcardList();
		});
	};
	//硬件信息
	HostManage.hardware_info({
		host: param.ip,
		id:param.id || '',
		role:param.role,
	},function(res){
		$scope.hardware = res;
	});
    //窗口关闭按钮
	$scope.close = function(){
		$modalInstance.close();
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
}])
