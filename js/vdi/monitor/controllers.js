/*
*  Module
*
* Description
*/
angular.module('vdi.monitor', [])
.factory("SystemAlarm", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/alarmLog", null, {
        query: { method: "GET", isArray: false},
        query_log:
            { method: "GET", url: $Domain + "/thor/alarm_history/list"},
        delete :
            { method: "DELETE"},
        // setRead: { method: "PUT" },
        delete_alarm: 
            { method: "DELETE", url : $Domain  + "/thor/alarm_history"}
    });
}])
.factory("AlarmHistory", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/alarm_history", null, {
        setRead: { method: "POST" }
    });
}])
.factory('AlarmPlicy', ['$resource','$Domain', function($resource, $Domain){
    return $resource($Domain + "/thor/alarm/strategy", null, {
        add: 
            { method: "POST", url: $Domain + "/thor/alarm/strategy"},
        alter:
            { method: "PUT", url: $Domain + "/thor/alarm/strategy/:id", params:{id:"@strategy_id"}},
        query:
            { method: "GET", url: $Domain + "/thor/alarm/strategy/all"},
        get:
            { method: "GET", url: $Domain + "/thor/alarm/strategy/:id", params:{id:"@strategy_id"}},
        get_hosts: 
            { method: "GET", url: $Domain + "/thor/alarm/hostInfo"},
        //删除策略
        delete:
            { method:"DELETE", url: $Domain + "/thor/alarm/strategy"},
        // 设置全局报警项配置
        global_config:
            { method: "POST", url: $Domain + "/thor/alarm/sys"},
        // 获取全局报警项配置
        get_global_config:
            { method: "GET", url: $Domain + "/thor/alarm/sys"},
        //读取邮件投递配置
        get_email_config:
            { method: "GET", url: $Domain + "/thor/settings"},
        // 更新邮件投递配置
        update_email_config:
            { method: "POST" , url: $Domain + "/thor/settings/email"},
        //用邮件配置发送测试邮件
        test_email:
            { method : "POST", url: $Domain + "/thor/sendmail"}

    });
}])
.controller("vdiMonitorAlarmController", ["$scope", "SystemAlarm", "$modal", function($scope, alarm, $modal){
    $scope.rows =[];
    var _scope = $scope;
	// alarm.query(function(data){
 //        $scope.allRows = data.result;
	// 	$scope.rows = data.result;
 //        $scope.loading = false;
 //        // angular.copy($scope.rows,$scope.allRows);
	// });

    $scope.getList = function(){
        $scope.loading = true;
        alarm.query_log(function(res){
            $scope.allRows = res.data.sort(function(a,b){ return a.created_at>b.created_at?-1:1 });
            $scope.rows = res.data.sort(function(a,b){ return a.created_at>b.created_at?-1:1 });
            $scope.loading = false;
        });
    };
    $scope.getList();

    $scope.currentPage = 1;
    $scope.pagesize = Number($$$storage.getSessionStorage('alarm_pagesize')) || 30;

    $scope.$watch("pagesize", function(newvalue){
        if(newvalue){
            $$$storage.setSessionStorage('alarm_pagesize', newvalue);
        }
    })

    $scope.updateData = function(text){
    	$scope.rows = $scope.allRows.filter(function(row){
    		row._selected = false;
    		// if(text){
    		// 	return row.log.content.indexOf(text) !== -1;
    		// }
    		return true;
    	});
    };
    $scope.delete = function(item){
        var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
        $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_ALARM'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='ALARM_DELETE'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.name = rows.map(function(row){ return row.id }).join(', ')
                        $scope.ok = function(){
                            alarm.delete_alarm({ids:rows.map(function(row){ return row.id })},function(data){
                                rows.forEach(function(row){
                                   _scope.getList();
                                });
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
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='清空确认'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLEAR_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.ok = function(){
                            alarm.delete_alarm({ids:'all'},function(data){
                                _scope.rows.forEach(function(row){
                                   _scope.getList();
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
}])

.controller("vdiMonitorController", ["$scope","$interval","$http","$location", "Host","PersonDesktop","$$$I18N","$Domain",
 function($scope,$interval,$http,$location,Host,instance,$$$I18N,$Domain){
 	$scope.net_categories = [];
 	$scope.disk_categories = [];
 	$scope.$on("setDisk",function(e,value){
 		$scope.disk_category = value;
 	});
 	$scope.$on("setNet",function(e,value){
 		$scope.net_category = value;
 	}) 	
    $scope.refresh_time = 5000;

    $scope.cpu_options ={
        options: {
            chart: {
                type: 'area',   
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30, 0, 65, 68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                title: {
                    text: '%',
                    align: 'high',
                    ffset: 0,
                    rotation: 0,
                    y: -20,
                    x: 26

                },
                plotLines: [
                    {
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }
                ]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}%</b><br/>',
                //pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f} GB</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },
            // plotOptions: {
            //     area: {
            //         stacking: 'percent',
            //         // lineColor: '#ffffff',
            //         lineWidth: 1,
            //         marker: {   
            //             lineWidth: 1,
            //             lineColor: '#ffffff'
            //         }
            //     }

            // },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },

            series: [
                // {
                //     name: '空闲', color: "transparent",
                //     marker: {
                //         enabled: false
                //     }
                // },
                // {name: '正在使用', marker: {
                //     enabled: false
                // }},
                // {name: '系统', color: '#f86161', marker: {
                //     enabled: false
                // }},
                // {name: '等待使用', color: '#88de67', marker: {
                //     enabled: false
                // }}

                {name: $$$I18N.get("占用率"), marker: {
                    enabled: false
                }}
            ]

        },
        drawpoint: function (series,data, now) {
            var y0
            // var y1 = data.cpu.user;
            // var y2 = data.cpu.system;
            // var y3 = data.cpu.iowait;
            // var y0 = 100 - y1 - y2 - y3;

            // series[0].addPoint([now, y0 / 100], true, true);//idel空闲
            // series[1].addPoint([now, y1 / 100], true, true);//user
            // series[2].addPoint([now, y2 / 100], true, true);//system
            // series[3].addPoint([now, y3 / 100], true, true);//iowait
            if(data.cpu.iowait){
                y0 = (data.cpu.system + data.cpu.user + data.cpu.iowait);
            }
            else 
                y0 = (data.cpu.system + data.cpu.user);

            series[0].addPoint([now, y0], true, true);
        }
    };

    $scope.mem_options ={
            options:{
                chart: {
                    type: 'area',
                    height: 250,
                    animation: Highcharts.svg, // don't animate in old IE
                    margin: [30, 0, 65, 38],
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                },
                yAxis: {
                    lineWidth: 1,
                    tickWidth: 1,
                    title: {
                        text: 'GB',
                        align: 'high',
                        ffset: 0,
                        rotation: 0,
                        y: -20,
                        x: 26

                    },
                    plotLines: [
                        {
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }
                    ]
                },
                tooltip: {
                    pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f} GB</b><br/>',
                    crosshairs: true,
                    shared: true,
                    xDateFormat: '%Y-%m-%d %H:%M:%S'
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    y: -15
                },

                series: [
                    {
                        name: $$$I18N.get("己用内存"),
                        color: '#88de67',
                        marker: {
                            enabled: false
                        }
                    }
                ]

            },
            drawpoint: function (series, data, now) {
                var y0 = (data.mem.total - data.mem.free)/ 1024 / 1024 / 1024;

                series[0].addPoint([now, y0], true, true);
            }
        };

    $scope.net_options = {
        options:{
            chart: {
                type: 'spline',
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30,0,65,68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                labels:{
                    format:"{value}"
                },
                title: {
                    text: 'KB/s',
                    align: 'high',
                    offset: 0,
                    rotation: 0,
                    y: -20,
                    x: 40

                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}KB/s</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },
            series: [{
                name:  $$$I18N.get("上行"),
                marker: {
                    enabled: false
                }
            },{
                name:  $$$I18N.get("下行"),
                color: '#88de67',
                marker: {
                    enabled: false
                }
            }]

        },
        drawpoint : function (series, data, now) {
            var y0 = 0;
            var y1 = 0;
            if($scope.subpath === 'monitor_hostinfo'){
	            if($scope.net_category){
		            y0 = data.net[$scope.net_category].sent_rate / 1024;
		            y1 = data.net[$scope.net_category].recv_rate / 1024;
		            series[0].addPoint([now, y0], true, true);
		            series[1].addPoint([now, y1], true, true);
	            }
            }
            else{
            	y0 = data.net.read_speed / 1024;
             	y1 = data.net.write_speed / 1024;
             	series[0].addPoint([now, y0], true, true);
		        series[1].addPoint([now, y1], true, true);
            }


        }
    };

    $scope.disk_options = {
        options:{
            chart: {
                type: 'spline',
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30,0,65,68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                labels:{
                    format:"{value}"
                },
                title: {
                    text: 'KB/s',
                    align: 'high',
                    offset: 0,
                    rotation: 0,
                    y: -20,
                    x: 40

                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}KB/s</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },
            series: [{
                name:  $$$I18N.get("读取"),
                marker: {
                    enabled: false
                }
            },{
                name:  $$$I18N.get("写入"),
                color: '#88de67',
                marker: {
                    enabled: false
                }
            }]

        },
        drawpoint : function (series, data, now) {
        	var y0 = 0;
            var y1 = 0;
            if($scope.subpath === 'monitor_hostinfo'){
	        	if($scope.disk_category){
		            y0 = data.disk[$scope.disk_category].read_rate / 1024;
		            y1 = data.disk[$scope.disk_category].write_rate / 1024;
                	series[0].addPoint([now, y1], true, true);
        	        series[1].addPoint([now, y0], true, true);
	        	}            	
            }
            else{
            	y0 = data.disk.read_speed / 1024;
            	y1 = data.disk.write_speed /1024 ;
            	series[0].addPoint([now, y1], true, true);
	        	series[1].addPoint([now, y0], true, true);
            }
        }
    };
    
    $scope.change_server = function(item){
            $scope.net_categories = [];
            $scope.disk_categories = [];
            $scope.item = item;
            $scope.subpath = item.type == 'vm' ? "monitor_vminfo" : "monitor_hostinfo";
            if(item.type != "vm"){
                return;
            }
            $scope.cur_instance = item;
    };

    function metric_start(){
        return $interval(function(){
            if($scope.item){
                $scope.loading = true;
                $http.get($Domain+"/thor/"+$scope.subpath+"/"+$scope.item.id).success(function(data){
                    $scope.loading = false;
                    //4个图表directive会监听metric_data,4个图表的数据是一次请求拿下来的
                    if(data.data.msg){
                        //console.log(data.data.msg);
                    }else{
                        if($scope.subpath === 'monitor_hostinfo'){
                            if($scope.item.id == data.hostid){
                            	$scope.metric_data = data.data;
    	                        for(var i in data.data.disk){
    	                        	if($scope.disk_categories.indexOf(i)===-1){
    	                        		$scope.disk_categories.push(i);
    	                        		$scope.$root.$broadcast("setDisk", $scope.disk_categories[0]);
    	                        	}
    	                        };
    	                        for(i in data.data.net){
    	                        	if($scope.net_categories.indexOf(i)===-1){
    	                        		$scope.net_categories.push(i);
    	                        		$scope.$root.$broadcast("setNet", $scope.net_categories[0]);
    	                        	}
    	                        };
                            }
                        }
                        else{
                        	$scope.metric_data = data.data.result;
                        }
                    }

                });
            }

        },$scope.refresh_time);
    }

    var load_metric_data = metric_start();

    $scope.$watch('refresh_time',function(newvalue){
        $interval.cancel(load_metric_data);
        load_metric_data = metric_start();
    });

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed
        $interval.cancel(load_metric_data);

    });

    var path = $location.path();

    if(path == '/monitor/desktop'){
        $http.get($Domain+"/thor/monitor_tree").success(function(data){
        	var trees = [];
        	data.data.forEach(function(item){
        		item.insts = item.insts.filter(function(ins){ return ins.status === "running"; });
        		trees.push(item);
        	});
            $scope.items = trees.map(function(item){
                item.opened =false;
                return item;
            });
        });
    }else{
        Host.query_agent(function(data){
            $scope.items = data.hosts_list.filter(function(item){ return item.status === "active" });
            if(data.hosts_list.length > 0)
                $scope.change_server(data.hosts_list[0]);
        });
    }


    //console.log($scope);
    $scope.collapAll = function(){

        $scope.items.map(function(item,index){
            item.opened = false;
            return item;
        })
    };
    $scope.openAll = function(){
        $scope.items.map(function(item,index){
            item.opened = true;
            return item;
        })
    }
}])
.controller('vdiMonitorPolicyController', ['$scope','$modal','AlarmPlicy', function($scope, $modal, AlarmPlicy){
    $scope.rows = [];
    $scope.pagesize = 30;
    $scope.currentPage = 1;
    $scope.pagesizes = [10,20,30];
    var monitorScope = $scope;
    function getList(){
        AlarmPlicy.query(function(res){
            $scope.rows = res.strategys;
        });
    }
    getList();
	$scope.add = function(){
		var addDialog = $modal.open({
			templateUrl:"views/vdi/dialog/monitor/add.html",
			controller:"addDialogController",
			size:"md",
            resolve:{
                param:function(){
                    return monitorScope.rows;
                }
            }
		});
        addDialog.result.then(function(){
            getList();
        });
	};
    $scope.alter = function(item){
        var addDialog = $modal.open({
            templateUrl:"views/vdi/dialog/monitor/add.html",
            controller:"alterDialogController",
            size:"md",
            resolve: { param: function(){
                return {
                    getPolicyList:monitorScope.rows,
                    item:item
                }
            }}
        });
        addDialog.result.then(function(){
            getList();
        });
    };
    $scope.view = function(item){
        $modal.open({
            templateUrl:"views/vdi/dialog/monitor/view.html",
            controller:"viewDialogController",
            size:"md",
            resolve: { param: function(){return item}}
        });
    };
    $scope.delete = function(item){
        var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected});
        $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除'>"+
                    "删除</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确认删除吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
            
            controller : function($scope, $modalInstance){
                $scope.ok = function(){
                    $modalInstance.close();
                     AlarmPlicy.delete({ids:rows.map(function(r){ return r.strategy_id})},function(){
                       getList();
                    });
                },
                $scope.close = function(){
                    $modalInstance.close();
                }
            },
            size : "sm"
        });
       
    };
    $scope.config = function(){
        $modal.open({
            templateUrl:"views/vdi/dialog/monitor/config.html",
            controller:"configDialogController",
            size:"md"
        });
    };
    $scope.notice = function(){
        $modal.open({
            templateUrl:"views/vdi/dialog/monitor/notice.html",
            controller:"noticeDialogController",
            size:"md"
        });
    };
    $scope.active = function(item){
        var postData = item;
        item.active_loadding = true;
        postData.strategy_enabled = !item.strategy_enabled;
        AlarmPlicy.alter(postData,function(){
            item.active_loadding = false;
        });
    };
}])
.controller('addDialogController', ['$scope','$modalInstance','AlarmPlicy', '$$$I18N', 'param', function($scope, $modalInstance, AlarmPlicy, $$$I18N, param){
    var AlarmPlicyList = param;
    $scope.pageType = 'add';
    $scope.loading = true;
    $scope.alarm_settings = {
        'node.cpu_util_rate':{
            "cond_duration": 10,
            "cond_value": 80,
            "enabled": false,
        },
        'node.mem_util_rate':{
            "cond_duration": 10,
            "cond_value": 80,
            "enabled": false,
        },
        'node.network_util_rate':{
            "cond_duration": 10,
            "cond_value": 80,
            "enabled": false,
        },
        'node.mount_point_util_rate':{
            "cond_value": 90,
            "enabled": false,
        },
        'node.disk_io':{
            "cond_duration": 10,
            "cond_value": 80,
            "enabled": false,
        }
    };
    $scope.pools = [];
    $scope.data = {};
    $scope.data.host_ids = [];
    AlarmPlicy.get_hosts(function(res){
        $scope.loading = false;
        $scope.pools = res.result.filter(function(r){
            return r.hosts.length;
        });
    });
    $scope.check_alarm_null = function(){
        return Object.keys($scope.alarm_settings).every(key => {
            return $scope.alarm_settings[key].enabled === false;
        });
    };
    $scope.checkOne = function(pool){
        pool._selected = pool.hosts.every(function(h){ return h._selected});
        $scope.data.host_ids = $scope.pools.reduce(function(host_ids,pool){
            pool.hosts.forEach(function(host){
                if(host._selected){
                    host_ids.push(host.host_uuid);
                }
            });
            return host_ids;
        },[]);
    };
    $scope.checkAll = function(pool){
        pool.hosts.forEach(function(h){
            h._selected = pool._selected;
        });
        $scope.data.host_ids = $scope.pools.reduce(function(host_ids,pool){
            pool.hosts.forEach(function(host){
                if(host._selected){
                    host_ids.push(host.host_uuid);
                }
            });
            return host_ids;
        },[]);
    };

    $scope.ok = function(){
        var d = $scope.data;
        var s = $scope.alarm_settings;
        var flag = false;
        var postData = {
            "name": d.name,
            "desc": d.desc,
            "alarm_settings": s,
            "hosts": d.host_ids,
            "email_enabled": d.email_enabled,
            "email_address": d.email_enabled ? d.email_address : undefined,
            "strategy_enabled": true
        };
        AlarmPlicyList.map(function(it){
            if(it.name === postData.name){
                flag = true;
            }
        });
        if(flag){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("VDI_AlarmPlicy_TIPS"),
                timeout:6000
            });
            return;
        }
        $scope.submiting = true;
        AlarmPlicy.add(postData).$promise
            .then(function(){
                $modalInstance.close();
            })
            .finally(function(){
                $scope.submiting = false;
            })
    };
	$scope.close = function(){
		$modalInstance.dismiss();
	}
}])
.controller('alterDialogController', ['$scope','$modalInstance','param','AlarmPlicy', '$$$I18N', function($scope, $modalInstance, param, AlarmPlicy, $$$I18N){
    $scope.pageType = 'alter';
    $scope.data = param.item;
    var filterAlterPolicy = param.getPolicyList.filter(it => it.name != param.item.name);
    $scope.alarm_settings = {
        'node.cpu_util_rate':{},
        'node.mem_util_rate':{},
        'node.network_util_rate':{},
        'node.mount_point_util_rate':{},
        'node.disk_io':{},
    };
    Object.keys(param.item.alarm_settings).forEach(function(key){
        $scope.alarm_settings[key] = param.item.alarm_settings[key];
    });
    $scope.loading = true;

    AlarmPlicy.get_hosts(function(res){
        $scope.loading = false;
        $scope.pools = res.result.map(function(p){
            p.hosts.forEach(function(h){
                if(param.item.hosts.indexOf(h.host_uuid) > -1){
                    h._selected = true;
                }
            });
            p._selected = p.hosts.length ? p.hosts.every(function(h){ return param.item.hosts.indexOf(h.host_uuid) > -1}) : false;
            return p;
        }).filter(function(p){
            return p.hosts.length;
        });
        get_host_ids();
    });
    
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
    $scope.check_alarm_null = function(){
        return Object.keys($scope.alarm_settings).every(key => {
            return $scope.alarm_settings[key].enabled === false;
        });
    };
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

    $scope.ok = function(){
        var d = $scope.data;
        var s = $scope.alarm_settings;
        var flag = false;
        var postData = {
            "name": d.name,
            "desc": d.desc,
            "alarm_settings":s,
            "hosts": d.host_ids,
            "email_enabled": d.email_enabled,
            "email_address": d.email_enabled ? d.email_address : undefined,
            "strategy_enabled": d.strategy_enabled,
            "strategy_id": d.strategy_id
        };
        filterAlterPolicy.map(function(it){
            if(it.name === postData.name){
                flag = true;
            }
        });
        if(flag){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("VDI_AlarmPlicy_TIPS"),
                timeout:6000
            });
            return;
        }
        $scope.submiting = true;
        AlarmPlicy.alter(postData).$promise
            .then(function(){
                $modalInstance.close();
            })
            .finally(function(){
                $scope.submiting = false;
            })
    };
    $scope.close = function(){
        $modalInstance.dismiss();
    };
}])
.controller('viewDialogController', ['$scope','$modalInstance','param','AlarmPlicy', function($scope, $modalInstance,param,AlarmPlicy){
    $scope.data = param;
    $scope.loading = true;
    AlarmPlicy.get_hosts(function(res){
        $scope.loading = false;
        $scope.pools = res.result.reduce(function(p_arr,p){
            var p_hosts = p.hosts.reduce(function(h_arr,h){
                if(param.hosts.indexOf(h.host_uuid) > -1){
                    h_arr.push(h);
                }
                return h_arr;
            },[]);
            if(p_hosts.length){
                p.hosts = p_hosts;
                p_arr.push(p);
            }
            return p_arr;
        },[]);
    });
    $scope.close = function(){
        $modalInstance.close();
    };
}])
.controller('configDialogController', ['$scope','$modalInstance','AlarmPlicy', function($scope,$modalInstance, AlarmPlicy){
	$scope.data = {
        'node.service_exception':{},
        'node.disconn':{},
        'sys.ha':{},
        'inst.ha':{},
        'inst.teach_desktop_using_time':{},
        'inst.personal_desktop_using_time':{},
        'sys.authorization':{}
    };
    $scope.submiting = true;
    AlarmPlicy.get_global_config(function(res){
        var resdata = res.alarm_settings;
        Object.keys(resdata).forEach(function(key){
            $scope.data[key] = resdata[key];
        });
        $scope.config = res;
    }).$promise.finally(function(){
        $scope.submiting = false;
    });
	$scope.ok = function(){
        var d = $scope.data;
        var postData = {
            'alarm_settings':d,
            'email_enabled':$scope.config.email_enabled,
            'email_address':$scope.config.email_enabled ? $scope.config.email_address : undefined
        }
        $scope.submiting = true;
		AlarmPlicy.global_config(postData).$promise
        .then(function(){
            $modalInstance.close();
        })
        .finally(function(){
            $scope.submiting = false;
        });
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller('noticeDialogController', ['$scope', '$modalInstance','AlarmPlicy', function($scope,$modalInstance, AlarmPlicy){
	$scope.data = {};
    $scope.submiting = true;
    AlarmPlicy.get_email_config({name:'email'},function(res){
        $scope.data = res.value;
    }).$promise.finally(function(){
        $scope.submiting = false;
    });
	$scope.ok = function(){
        $scope.submiting = true;
        AlarmPlicy.update_email_config({
            "name": "email",
            "value": $scope.data
        }).$promise.then(function(){
            $modalInstance.close();
        }).finally(function(){
            $scope.submiting = false;
        });
	};
	$scope.close = function(){
		$modalInstance.close();
	};
    $scope.test_mail = function(){
        $scope.submiting = true;
        AlarmPlicy.test_email({
            "name": "email",
            "value": $scope.data
        }).$promise.then(function(){

        }).finally(function(){
            $scope.submiting = false;
        });
    };
}])
