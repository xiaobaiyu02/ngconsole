angular.module("vdi.plan", [])

/* 计划任务 */
.factory("Plan", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/tasks", null, {
		query:
			{ method: "GET", isArray: false, params: null},
		add:
			{ method: "POST", isArray: false},
		update:
			{ method: "PUT", url: $Domain + "/thor/tasks/:id", params: { id: "@id" }},
		delete:
			{ method: "DELETE", url:$Domain + "/thor/tasks", isArray: false}

	});
}])
.factory("HostPlan", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/compute/v1/tasks/node", null, {
		query:
			{ method: "GET", isArray: false, params: null},
		add:
			{ method: "POST", url:$Domain + "/compute/v1/tasks", isArray: false},
		update:
            { method: "PUT", url: $Domain + "/compute/v1/tasks/:id", params: { id: "@id" } },
        active:
            { method: "PUT", url: $Domain + "/compute/v1/tasks/:id", params: { id: "@id" } },
		delete:
            { method: "DELETE", url:$Domain + "/compute/v1/tasks"},
        hostList:
            { method: "GET", url:$Domain + "/compute/v1/nodes" }

	});
}])

.factory("weekdays", ["$$$I18N", function($$$I18N){
	return function(){
		return "周一 周二 周三 周四 周五 周六 周日".split(" ").map(function(s, i){
			return {id: i + 1, name: $$$I18N.get(s)};
		});
	}
}])

.directive('iptNumber', ['$rootScope', '$timeout', function($rootScope, $timeout){
    // Runs during compile
    return {
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
        link:function(scope, $element, $attrs){
            var minLen = Number($attrs.min);
            var maxLen = Number($attrs.max);
            $element.click(function(e){
                var preVal = Number(e.target.value);
                if(this.value ===''){
                    this.value = '';
                } else {
                    if(preVal >= maxLen){
                        this.value = minLen;
                    }
                    if(preVal <= minLen){
                        this.value = maxLen ;
                    }
                }
            });
        }
    };
}])

.factory("initPlanScope", ["Plan", "$$$I18N", "weekdays", function(Plan, $$$I18N, weekdays){
	return function(scope, $modalInstance, Scene, TeachDesktop, Plan){
		// scope 变量
        scope.min_namelength = 2;
        scope.max_namelength = 20;
        scope.data = {open: false, off: false};
        scope.modes = [];
        scope.modes_loading = true;
        scope.weeks = weekdays();

        Plan.query(function(res){
            scope.getPlanList = res.tasks;
        });
        // scope 方法
        scope.loadList = function(mode){
            scope.modes.forEach(function(item){
                if(item.id == mode.id){
                    item.is_open=!item.is_open;
                    if(!item.desktops){
                        item.desktop_loading = true;
                        TeachDesktop.query({id: mode.id}, function(res){
                            item.desktop_loading = false;
                            item.desktops = res.result;
                            // item._selected = item.desktops.filter(function(d){ return d.in_task }).length == item.desktops.length ? true:false;
                            // item.desktops.forEach(function(d){
                                // if(d.in_task){
                                    // d._selected = true;
                                    // item.has_inTask = true;
                                // }
                            // });
                        });
                    }
                }
            });
        };
        scope.checksublist = function(item){
            if(!item._selected){
                item.desktops.forEach(function(data){ data._selected = true; })
            }
            else{
                item.desktops.forEach(function(data){ data._selected = false; })
            }
        };
        scope.setparent = function(item){
            var select_len = item.desktops.filter(function(data){ return data._selected==true; }).length;
            if(select_len==item.desktops.length){
                item._selected = true;
            }
            else
                item._selected = false;
        };
        scope.$watch('data.open',function(newData, oldData, scope){
            if(!newData){
                scope.data.openHouer = undefined;
                scope.data.openMinute = undefined;
            }
        });
        scope.$watch('data.off',function(newData, oldData, scope){
            if(!newData){
                scope.data.offHouer = undefined;
                scope.data.offMinute = undefined;
            }
        });
        scope.check = function(){
            // let select_len = scope.modes.filter(function(item){ return item.desktops && item.desktops.filter(function(desktop){ return !desktop.in_task && desktop._selected }).length }).length;
            let select_len = scope.modes.filter(function(item){ return item.desktops && item.desktops.filter(function(desktop){ return desktop._selected }).length }).length;
            if(scope.data.open && scope.data.off)
                return select_len && scope.data.openHouer!=undefined && scope.data.openMinute!=undefined && scope.data.offHouer!=undefined && scope.data.offMinute!=undefined;
            else
                return select_len && ( (scope.data.open && scope.data.openHouer!=undefined && scope.data.openMinute!=undefined) || (scope.data.off && scope.data.offHouer!=undefined && scope.data.offMinute!=undefined ) );
        };
        scope.checkWeek = function(){
            return scope.weeks.filter(function(item){ return item._selected }).length
        };
        scope.selectAllWeek = function(selectAll){
            scope.weeks.forEach(function(item){ item._selected = selectAll; });
        };
        scope.selectOne = function(){
            var selectNum = scope.weeks.filter(function(item){ return item._selected; }).length;
            if(selectNum === scope.weeks.length){
                scope.selectAll = true;
            } else {
                scope.selectAll = false;
            }
        };
        scope.ok = function(){
			var data = scope.getValues();
            var flag = false ;
            if(data.task_type === 'bootup,shutdown' && scope.data.openHouer == scope.data.offHouer && scope.data.openMinute == scope.data.offMinute){
                $.bigBox({
                    title	: $$$I18N.get("INFOR_TIP"),
                    content	: $$$I18N.get("SCHEDUL_TIP"),
                    timeout	: 6000
                });
            } else {
                scope.getPlanList.map(function(it){
                    if(it.name===data.name){
                        flag = true;
                    }
                })
                if(flag){
                  $.bigBox({
                      title : $$$I18N.get("INFOR_TIP"),
                      content   : $$$I18N.get("SCHEDUL_SAME_NAME_TIPS"),
                      timeout   : 6000
                  });
                  return false;  
                }
                Plan.add({'task': data}, function(res){
                    Plan.query(function(res){
                        scope.rows.splice(0, scope.rows.length);
                        Array.prototype.push.apply(scope.rows, res.tasks);
                    });
                    $modalInstance.close();
                });
			}
        };
        scope.close = function(){
            $modalInstance.close();
        };
        // 对于增改来说，获取、设置当前 scope 值是必须的，这样保证提交数据的接口代码足够简单
		scope.getValues = function(){
            // 这个值是要返回的，放在函数的第一行，更醒目
            var data = {
                'name': scope.data.name,
                'desc': scope.data.desc,
                'is_active': true,
                'trigger_type': "cron",
                'task_type': '',
                'trigger_kwargs': {},
                'instance': []
            };
            // 这个值很常用，建议封装为独立的方法
            var week_days = scope.weeks.filter(function(item){ return item._selected }).map(function(item){ return item.id });
            if(scope.data.off && scope.data.open){
                data.task_type = 'bootup,shutdown';
                data.trigger_kwargs.bootup = {
                    "week_days": week_days,
                    "hour": scope.data.openHouer,
                    "minute": scope.data.openMinute,
                    "second": 0
                };
                data.trigger_kwargs.shutdown = {
                    "week_days": week_days,
                    "hour": scope.data.offHouer,
                    "minute": scope.data.offMinute,
                    "second": 0
                };
            } else if (!scope.data.off && scope.data.open){
                data.task_type = 'bootup';
                data.trigger_kwargs.bootup = {
                    "week_days": week_days,
                    "hour": scope.data.openHouer,
                    "minute": scope.data.openMinute,
                    "second": 0
                };
            } else {
                data.task_type = 'shutdown';
                data.trigger_kwargs.shutdown = {
                    "week_days": week_days,
                    "hour": scope.data.offHouer,
                    "minute": scope.data.offMinute,
                    "second": 0
                };
            }
            scope.modes.forEach(function(mode){
                mode.desktops && mode.desktops.forEach(function(desktop){
                    if(desktop._selected){
                        data.instance.push(desktop.instance_extra_id);
                    }
                })
            });
            return data;
		};
		scope.setValues = function(planItem){
            scope.data.name = planItem.name;
            scope.data.desc = planItem.desc;
            var bootupArgs = planItem.trigger_kwargs.bootup;
            var shutdownArgs = planItem.trigger_kwargs.shutdown;
            if(bootupArgs) {
                scope.data.open = true;
                scope.data.openHouer = bootupArgs.hour;
                scope.data.openMinute = bootupArgs.minute;
                scope.weeks.forEach(function(item){
                    item._selected = bootupArgs.week_days.indexOf(item.id) > -1;
                });
            }
            if(shutdownArgs) {
                scope.data.off = true;
                scope.data.offHouer = shutdownArgs.hour;
                scope.data.offMinute = shutdownArgs.minute;
                scope.weeks.forEach(function(item){
                    item._selected = shutdownArgs.week_days.indexOf(item.id) > -1;
                });
			}
        };
        // scope 状态初始化，如加载数据
	};
}])
.controller("vdiPlanSwitchController", ["$scope", "$modal", "Plan", "$$$I18N", function($scope, $modal, Plan, $$$I18N){
	$scope.currentPage = 1;
	$scope.pagesize = Number($$$storage.getSessionStorage('plan_pagesize')) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
        $$$storage.setSessionStorage('plan_pagesize', newvalue ? newvalue : 0);
	});
	$scope.loading = true;

	Plan.query(function(res){
		$scope.loading = false;
		$scope.rows = res.tasks;
	},function(err){
		$scope.loading = false;
	});

	$scope.active = function(plan){
		$scope.rows.forEach(function(item){
			if(item.id == plan.id){
				item.active_loadding = true;
			}
		});
		Plan.update({ id: plan.id, is_active: !plan.is_active }, function(res){
			$scope.rows.forEach(function(item){
				if(item.id == plan.id){
					item.active_loadding = false;
					item.is_active = !plan.is_active;
				}
			});
		}, function(err){
			$scope.rows.forEach(function(item){
				if(item.id == plan.id){
					item.active_loadding = false;
				}
			});
		});
	}
	var _controllerScope = $scope;
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var onrows = rows.filter(function(row){ return row.is_active; });
		var offrows = rows.filter(function(row){ return !row.is_active; });
		if(rows.length == onrows.length){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("DELE_PLAN_TIP"),
				timeout	: 6000
			});
		}
		else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_PLAN_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance,$q){
					$scope.name = offrows.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						Plan.delete({ id: offrows.map(function(item){ return item.id }) },function(res){
							Plan.query(function(res){
								_controllerScope.rows.splice(0, _controllerScope.rows.length);
								Array.prototype.push.apply(_controllerScope.rows,res.tasks);
							});
						},function(error){

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

}])

.controller("addSwitchDialog", ["$scope", "$modalInstance", "Scene", "TeachDesktop", "Plan", "initPlanScope", function($scope, $modalInstance, Scene, TeachDesktop, Plan, initPlanScope){
	initPlanScope($scope, $modalInstance, Scene, TeachDesktop, Plan);

    Scene.query(function(res){
        $scope.modes = res.modes;
        $scope.modes.forEach(function(item){
            item.is_open = false;
        });
        $scope.modes_loading = false;
    }, function(err){
        $scope.modes_loading = false;
    });
}])
.controller("editSwitchDialog", ["$scope", "$modalInstance", "Scene", "TeachDesktop", "Plan", "initPlanScope", "$$$I18N", function($scope, $modalInstance, Scene, TeachDesktop, Plan, initPlanScope, $$$I18N){
	var planItem = $scope.item || $scope.currentItem;
    initPlanScope($scope, $modalInstance, Scene, TeachDesktop, Plan);
    var filterPlanList = $scope.rows.filter(it => it.name != planItem.name);
    $scope.setValues(planItem);
    // 重写 $scope.ok
	$scope.ok = function(){
        var data = $scope.getValues();
        var flag = false;
        data.id = planItem.id;
        data.is_active = planItem.is_active;
        if(data.task_type === 'bootup,shutdown' && $scope.data.openHouer == $scope.data.offHouer && $scope.data.openMinute == $scope.data.offMinute){
            $.bigBox({
                title	: $$$I18N.get("INFOR_TIP"),
                content	: $$$I18N.get("SCHEDUL_TIP"),
                timeout	: 6000
            });
        } else {
            filterPlanList.map(function(it){
                if(it.name===data.name){
                    flag = true;
                }
            })
            if(flag){
              $.bigBox({
                  title : $$$I18N.get("INFOR_TIP"),
                  content   : $$$I18N.get("SCHEDUL_SAME_NAME_TIPS"),
                  timeout   : 6000
              });
              return false;  
            }
            Plan.update(data, function(res){
                Plan.query(function(res){
                    $scope.rows.splice(0, $scope.rows.length);
                    Array.prototype.push.apply($scope.rows, res.tasks);
                });
                $modalInstance.close();
            });
        }
    };
	$scope.selectOne();

    Scene.query(function(res){
        $scope.modes = res.modes;
        $scope.modes.forEach(function(item){
            item.is_open = false;
            planItem.instance.forEach(function(ins){
                if(item.id == ins.mode_id){
                    item.is_open = true;
                    item.desktop_loading = true;
                    TeachDesktop.query({id: ins.mode_id}, function(res){
                        item.desktop_loading = false;
                        item.desktops = res.result;
                        item.desktops.forEach(function(d){
                            var has_selected = ins.desktop.filter(function(instance){ return instance==d.instance_extra_id }).length;
                            if(has_selected){
                                d._selected = true;
                                // d._own = true;
                                // item.has_inTask = true;
                                // item._own = true;
                            }else{  }
                        });
                        item._selected = item.desktops.filter(function(d){ return d._selected }).length == item.desktops.length;
                    });
                }
            });
        });
        $scope.modes_loading = false;
    }, function(err){
        $scope.modes_loading = false;
    });
}])

.controller("vdiHostPlanSwitchController", ["$scope", "$modal", "HostPlan", "$$$I18N",function($scope, $modal, HostPlan, $$$I18N){
    $scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
    $scope.currentPage = 1;

    $scope.rows = [];
    $scope.loading = true;

    function getList(){
        HostPlan.query(function(res){
            $scope.loading = false;
            $scope.rows = res.tasks;
        },function(err){
            $scope.loading = false;
        });
    }
    getList();

    $scope.add = function(){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/plan/host_switch.html",
			controller: "addEditHostSwitchDialog",
            size: "md",
            resolve:{
				params : function(){
					return { };
				}
			}
		});
		dialog.result.then(function(res){
			if(res){
				getList();
			}
		});
	}

	$scope.edit = function(){
		var hostPlan = this.item || this.currentItem;
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/plan/host_switch.html",
			controller: "addEditHostSwitchDialog",
			scope: $scope,
			size: "md",
			resolve:{
				params : function(){
					return { hostPlan: angular.copy(hostPlan) };
				}
			}
		});
		dialog.result.then(function(data){
			if(data){
				getList();
			}
		});
    }
    
    $scope.active = function(plan){
		$scope.rows.forEach(function(item){
			if(item.id == plan.id){
				item.active_loadding = true;
			}
        });
		HostPlan.active({ id: plan.id, action: !plan.enable?'enable':'disable' }, function(res){
			$scope.rows.forEach(function(item){
				if(item.id == plan.id){
					item.active_loadding = false;
					item.enable = !plan.enable;
				}
			});
		}, function(err){
			$scope.rows.forEach(function(item){
				if(item.id == plan.id){
					item.active_loadding = false;
				}
			});
		});
    }

    $scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var onrows = rows.filter(function(row){ return row.enable; });
		var offrows = rows.filter(function(row){ return !row.enable; });
		if(rows.length == onrows.length){
			$.bigBox({
				title	: $$$I18N.get("INFOR_TIP"),
				content	: $$$I18N.get("DELE_PLAN_TIP"),
				timeout	: 6000
			});
		}
		else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_PLAN_T' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance,$q){
					$scope.name = offrows.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						HostPlan.delete({ id: offrows.map(function(item){ return item.id }) },function(res){
							getList();
						},function(error){

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

}])
.controller("addEditHostSwitchDialog", ["$scope", "$modalInstance", "Plan", "weekdays", "AlarmPlicy", "HostPlan","$$$I18N","params",function($scope, $modalInstance, Plan, weekdays, AlarmPlicy,HostPlan,$$$I18N,params){
    $scope.min_namelength = 2;
    $scope.max_namelength = 20;
    $scope.weeks = weekdays();
    $scope.data = {};
    $scope.pools = [];
    $scope.loading = true;
    $scope.isEdit = params.hostPlan?true:false;

    if(params.hostPlan){
        setValues(params.hostPlan);
        var hostID = params.hostPlan.targets.map(function(item){ return item.id });
        AlarmPlicy.get_hosts(function(res){
            $scope.loading = false;
            $scope.pools = res.result.map(function(p){
                p.hosts.forEach(function(h){
                    if(hostID.indexOf(h.host_uuid) > -1){
                        h._selected = true;
                    }
                    if(h.host_uuid=='-1' && params.hostPlan.trigger_kwargs.with_controller){
                        h._selected = true;
                    }
                });
                p._selected = p.hosts.length ? p.hosts.every(function(h){ return hostID.indexOf(h.host_uuid) > -1 || (h.host_uuid=='-1' && params.hostPlan.trigger_kwargs.with_controller)}) : false;
                return p;
            }).filter(function(p){
                return p.hosts.length;
            });
            get_host_ids();
        });
    }else{
        $scope.data = {open: false, off: false};
        AlarmPlicy.get_hosts(function(res){
            $scope.loading = false;
            $scope.pools = res.result.filter(function(r){
                return r.hosts.length;
            });
        });
    }

    
    function setValues (planItem){
        $scope.data.name = planItem.name;
        $scope.data.description = planItem.description;
        var bootupArgs = planItem.trigger_kwargs.bootup;
        var shutdownArgs = planItem.trigger_kwargs.shutdown;
        if(bootupArgs) {
            $scope.data.open = true;
            $scope.data.openHouer = bootupArgs.hour;
            $scope.data.openMinute = bootupArgs.minute;
            $scope.weeks.forEach(function(item){
                item._selected = bootupArgs.week_days.indexOf(item.id) > -1;
            });
        }
        if(shutdownArgs) {
            $scope.data.off = true;
            $scope.data.offHouer = shutdownArgs.hour;
            $scope.data.offMinute = shutdownArgs.minute;
            $scope.weeks.forEach(function(item){
                item._selected = shutdownArgs.week_days.indexOf(item.id) > -1;
            });
        }
    };
    function get_host_ids(){
        $scope.data.host_ids = $scope.pools.reduce(function(host_ids,pool){
           pool.hosts.forEach(function(host){
               if(host._selected){
                   host_ids.push(host.host_uuid);
               }
           });
           return host_ids;
       },[]);
   }
    $scope.checkOne = function(pool){
        pool._selected = pool.hosts.every(function(h){ return h._selected});
        get_host_ids();
    };
    $scope.checkAll = function(pool){
        pool.hosts.forEach(function(h){
            h._selected = pool._selected;
        });
       get_host_ids();
    };
    $scope.selectAllWeek = function(selectAll){
        $scope.weeks.forEach(function(item){ item._selected = selectAll; });
    };
    $scope.selectOneWeek = function(){
        var selectNum = $scope.weeks.filter(function(item){ return item._selected; }).length;
        if(selectNum === $scope.weeks.length){
            $scope.selectAll = true;
        } else {
            $scope.selectAll = false;
        }
    };
    $scope.checkWeek = function(){
        return $scope.weeks.filter(function(item){ return item._selected }).length
    };
    $scope.$watch('data.open',function(newData, oldData, scope){
        if(!newData){
            scope.data.openHouer = undefined;
            scope.data.openMinute = undefined;
        }
    });
    $scope.$watch('data.off',function(newData, oldData, scope){
        if(!newData){
            scope.data.offHouer = undefined;
            scope.data.offMinute = undefined;
        }
    });
    function getValues(){
        // 这个值是要返回的，放在函数的第一行，更醒目
        var data = {
            'name': $scope.data.name,
            'description': $scope.data.description,
            'enable': true,
            'trigger_type': "cron",
            'action': '',
            'type': 'node',
            'trigger_kwargs': {},
            'targets': $scope.data.host_ids
        };
        var hasConsole = $scope.data.host_ids.filter(function(item){ return item=='-1' }).length;
        if(hasConsole){ data.trigger_kwargs.with_controller=true }
        else{ data.trigger_kwargs.with_controller=false }
        // 这个值很常用，建议封装为独立的方法
        var week_days = $scope.weeks.filter(function(item){ return item._selected }).map(function(item){ return item.id });
        if($scope.data.off && $scope.data.open){
            data.action = 'bootup,shutdown';
            data.trigger_kwargs.bootup = {
                "week_days": week_days,
                "hour": $scope.data.openHouer,
                "minute": $scope.data.openMinute,
                "second": 0
            };
            data.trigger_kwargs.shutdown = {
                "week_days": week_days,
                "hour": $scope.data.offHouer,
                "minute": $scope.data.offMinute,
                "second": 0
            };
        } else if (!$scope.data.off && $scope.data.open){
            data.action = 'bootup';
            data.trigger_kwargs.bootup = {
                "week_days": week_days,
                "hour": $scope.data.openHouer,
                "minute": $scope.data.openMinute,
                "second": 0
            };
        } else {
            data.action = 'shutdown';
            data.trigger_kwargs.shutdown = {
                "week_days": week_days,
                "hour": $scope.data.offHouer,
                "minute": $scope.data.offMinute,
                "second": 0
            };
        }
        return data;
    };
    $scope.ok = function(){
        var data = getValues();
        var flag = false;
        if(data.action === 'bootup,shutdown' && $scope.data.openHouer == $scope.data.offHouer && $scope.data.openMinute == $scope.data.offMinute){
            $.bigBox({
                title	: $$$I18N.get("INFOR_TIP"),
                content	: $$$I18N.get("SCHEDUL_TIP"),
                timeout	: 6000
            });
        } else {
            // $scope.getPlanList.map(function(it){
            //     if(it.name===data.name){
            //         flag = true;
            //     }
            // })
            if(flag){
              $.bigBox({
                  title : $$$I18N.get("INFOR_TIP"),
                  content   : $$$I18N.get("SCHEDUL_SAME_NAME_TIPS"),
                  timeout   : 6000
              });
              return false;  
            }
            if(!params.hostPlan){
                HostPlan.add({'data': data}, function(res){
                    $modalInstance.close(res);
                });
            }else{
                HostPlan.update({'id': params.hostPlan.id, 'data': data}, function(res){
                    $modalInstance.close(res);
                });
            }
            
        }
    };
    $scope.close = function(){
        $modalInstance.close();
    }
}])