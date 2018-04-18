angular.module("vdi.split",["ngRoute","ngResource", "ui.bootstrap","app.localize","app.controllers","vdi"])
.run(['localize',function(localize){
    localize.setLang();
}])
.factory("Split", ["$resource", "$splitDomain", function(res, $splitDomain){
	return res($splitDomain + "/thor/controller", null, {
        split_brain_info: { method: "GET", url:$splitDomain + "/thor/controller/split_brain_info", isArray: false},
        recover_split_brain:{ method: "POST", url:$splitDomain + "/thor/controller/recover_split_brain"}
	});
}])
.directive("readCount", ["$compile", function($compile){
    return {
        restrict: 'EA',
        replace: true,
        link: function(scope, element, attrs){
            var count = attrs.param1;
            var timer = setInterval(function(){
                if(count>0){
                    count--;
                    $$$storage.setSessionStorage('count', count);
                    element.find('span.count').text(count)
                }else{
                    clearInterval(timer);
                    scope.$emit('conuntDownFinish', true);
                }
            },1000);
        }
    };
}])
.controller("splitBrainController", ["$scope","localize","$$$I18N","$timeout","$location","$rootScope","Split",'$Domain',"$splitDomain",
function($scope,localize,$$$I18N,$timeout,$location,$rootScope,Split,domain,$splitDomain){
    $scope.restore_host_ip = $$$storage.getSessionStorage('restore_host_ip') || undefined;
    $scope.click_restore = $$$storage.getSessionStorage('click_restore') || undefined;
    $scope.restoring = $$$storage.getSessionStorage('restoring') || undefined;
    $scope.restore_status = $$$storage.getSessionStorage('restore_status') || undefined;
    $scope.FloatingIP = $$$storage.getSessionStorage('FloatingIP') || undefined;
    $scope.count = $$$storage.getSessionStorage('count') || undefined;
    $scope.loading = true;
    function getLists(){
        Split.split_brain_info(function(res){
            $scope.loading = false;
            $scope.servers = res.result.sort(function(a,b){ return a.priority>b.priority?-1:1 });
            $scope.servers[0].high = true;
        });
    }
    getLists();
    $scope.selectServer = function(server){
        $scope.restore_host_ip = server.host_ip;
        $$$storage.setSessionStorage('restore_host_ip', server.host_ip);
        $scope.restore = server;
    }
    $scope.back = function(){
        $scope.restore_host_ip = undefined;
        $scope.click_restore = undefined;
        $scope.restoring = undefined;
        $scope.restore_status = undefined;
        $$$storage.clearSessionStorage();
    }
    $scope.$on("conuntDownFinish",function(e,v){
        $$$storage.clearSessionStorage();
        location.replace('http://'+$scope.FloatingIP);
    })

    var _scope = $scope;
    if($scope.restoring == 'restoring'){
        schedule();
        countDown(1800); //倒计时30分钟
    }
     /* 轮询 get_controller_ha_status，直至 is_split_brain 返回 false 修复成功，
        若从轮询开始直到 30 分钟后还是返回 true 就修复失败 */
    var taskTimer;
    function schedule(){
        var IP = location.protocol + "//" + ($$$storage.getSessionStorage('restore_host_ip') || _scope.restore_host_ip) + ":8081";
        var status_ha = $.get(IP + "/thor/get_controller_ha_status");
        status_ha.done(function(res){
            res = typeof res === "string" ? JSON.parse(res) : res;
            if(res.result && !res.result.is_split_brain && res.result.data_sync=='synced') {
                _scope.FloatingIP = res.result.floating_ip;
                restoreSuc();
            }
            taskTimer = setTimeout(schedule, 3000);
        });
    }
    
    // ha恢复成功
    function restoreSuc(){
        clearTimeout(taskTimer);
        clearInterval(timer);
        $scope.restoring = 'restoring_finish';
        $$$storage.setSessionStorage('restoring', 'restoring_finish');
        $scope.restore_status = 'restoring_suc';
        $$$storage.setSessionStorage('restore_status', 'restoring_suc');
        $scope.count = 5;
    }

    // ha恢复失败
    function restoreFail(){
        clearTimeout(taskTimer);
        clearInterval(timer);
        $scope.restoring = 'restoring_finish';
        $$$storage.setSessionStorage('restoring', 'restoring_finish');
        $scope.restore_status = 'restoring_fail';
        $$$storage.setSessionStorage('restore_status', 'restoring_fail');
    }

    // 多少秒后执行ha恢复失败
    var timer;
    function countDown(count){
        timer = setInterval(function(){
            if(count>0){
                count--;
            }else{
                clearInterval(timer);
                if($scope.restore_status == 'restoring_fail'){
                    restoreFail();
                }
            }
        },1000);
    }

    $scope.restoreSplit = function(){
        $scope.click_restore = 'click';
        $$$storage.setSessionStorage('click_restore', 'click');
        $scope.restoring = 'restoring';
        $$$storage.setSessionStorage('restoring', 'restoring');

        // 发送恢复裂脑，若有返回且返回失败就恢复失败，若有返回且返回成功就恢复成功，若无返回需要轮询 get_controller_ha_status
        Split.recover_split_brain({controller_ip:$scope.restore_host_ip},function(res){
            if(!res.result){
                restoreFail();
            }else{
                // restoreSuc();
            }
        }); 

        schedule();
        countDown(1800); //倒计时30分钟
    }

}])