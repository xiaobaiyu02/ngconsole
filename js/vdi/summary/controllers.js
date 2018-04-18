angular.module("vdi.summary", [])
.factory("Summary", ["$resource", function($resource){
    return $resource("/thor/home", null, {
        query: { method: "GET", isArray: false,url:"/thor/home", params:{ uuid:"@uuid" }},
        top_logs: { method: "GET", isArray: false, url: "/thor/home/top_logs"},
        top_instance: {method:"GET", isArray: false, url:"/thor/home/top_instance",params:{uuid:"@uuid"}},
        top_client: {method:"GET", isArray: false, url:"/thor/home/top_client"}
    });
}])

.controller("vdiSummaryController", ["$scope", "Summary","$$$I18N","ResourcePool",function($scope, summary,$$$I18N,ResourcePool){

    ResourcePool.query(function(res){
        $scope.pools = res.result.sort((a,b) => {
            return a.name > b.name ? 1 : -1
        });
        // $scope.pool = $scope.pools.filter(function(p){ return p.name==="default"})[0];
        $scope.pool = {};
        $scope.get_host($scope.pool.uuid);
    }); 
    
    

    summary.top_logs(function(res){
        $scope.top_logs_list = res.result.sort(function(a,b){
            return b.datetime - a.datetime;
        });
    });
    $scope.get_host = function(id){
        $scope.loading = true;
        summary.query({uuid:id},function(res){
            $scope.loading = false;
            $scope.summary = res.info;
            $scope.cpu_rate = ($scope.summary.cpu_rate).toFixed(1); 
            var mem_data = [
                {
                    'name':$$$I18N.get("已使用"), 
                    'y':parseInt((($scope.summary.mem_used)/($scope.summary.memory_cnt)*100).toFixed(2))
                },
                {
                    'name':$$$I18N.get("剩余"),
                    'y':parseInt((($scope.summary.mem_remain)/($scope.summary.memory_cnt)*100).toFixed(2))
                }
            ];
            var disk_data = [
                {
                    'name':$$$I18N.get("已使用"), 
                    'y':parseInt((($scope.summary.disk_used)/($scope.summary.disk_cnt)*100).toFixed(2))
                },
                {
                    'name':$$$I18N.get("剩余"),
                    'y':parseInt((($scope.summary.disk_remain)/($scope.summary.disk_cnt)*100).toFixed(2))
                }
            ];
            //饼图开始
            angular.element("#3Dmemory").highcharts({
                    chart: {
                        type: 'pie',
                        height:170,
                        spacing:[0,0,0,0],
                        backgroundColor:'#fafafa',
                        options3d: {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        }
                    },
                    title: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            dataLabels: {
                                enabled: false,
                                format: ''
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: $$$I18N.get("内存"),
                        data:mem_data
                    }]
            });
            angular.element("#3Ddisk").highcharts({
                    chart: {
                        type: 'pie',
                        height:170,
                        backgroundColor:'#fafafa',
                        spacing:[0,0,0,0],
                        options3d: {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        }
                    },
                    title: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            dataLabels: {
                                enabled: false,
                                format: ''
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: $$$I18N.get("存储"),
                        data: disk_data
                    }]
            }); 
            //饼图结束  
        });

        // 桌面
        summary.top_instance({uuid:id},function(res){

            $scope.instances_summary = res.instances_summary;

            $scope.top_instances_list = res.top_instances_list;
        });
    };

    $scope.view_desktop = function(id){
        window.open("desktopScreenshot.html#" + id, "person_desktop_" + id);
    };

}])