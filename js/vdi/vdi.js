angular.module("vdi", [])

.factory("Task", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/home/tasklog", null, {
        query: { method: "GET", isArray: false },
        post: { method: "POST" },
        put: { method: "PUT" }
    });
}])


.factory("VNC", ["$resource", "$Domain", function($resource, $Domain) {
    return $resource($Domain + "/thor/instance/vnc/:id", { id: "@id" }, {
        loadISO:
            { method: "POST", url: $Domain + "/thor/image/loadISO" },
        save:
            { method: "POST", url: $Domain + "/thor/image/update_template" }
    });
}])

.factory("loginResource", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/version", null, {
        query: { method: "GET"}
    })
}])


.filter('lun_name', function () {
    return function (lun) {
        if (!angular.isUndefined(lun)) {
            lun.map(function (item) {
                item.value = item.vendor + " lun-" + item.lun + " " + item.size;
            });
        }
        return lun;
    };
})
.filter('storage_type', function () {
    var type2str = {
        local: "本地磁盘",
        iscsi: 'iscsi 磁盘',
        netfs: '网络文件系统',
        fc: 'FC 光纤存储'
    };
    return function (type) {
        return type2str[type]
    }
})
.filter('storage_status', function () {
    var stauts2str = {
        running: "正常",
        building:"准备中",
        error:'异常'
    };
    return function (stauts) {
        return stauts2str[stauts]
    }
})
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val+"");
    };
})
.filter('join', function() {
    return function(val,slash) {
      return val.filter(function(d){
        return d;
      }).join(slash)
    };
})
.filter('network_type', function () {
    var type2str = {
      nat:'NAT',
      bridge:'桥接',
      vlan:'VLAN'
    };
    return function (val) {
      return type2str[val];
    };
})
.filter('yesorno', function () {
    return function (val) {
      return val ? '是' : '否';
    };
})
.filter('to_mb', function () {
    return function (val) {
      return (val/1024/1024).toFixed(2);
    };
})
.filter('reverse', function() {
  return function(input,searchText,searchName) {
    if(input && searchText){
        var outPut = [];
        outPut = input.filter(function(item){
            if(item[searchName].indexOf(searchText)>-1)
                return item;
        })
        return outPut;
    }
    return input;
  };
})
.config(["$filterProvider", function($filterProvider){
	$filterProvider.register("paging", function(){
		return function(items, index, pageSize){
			if(!angular.isArray(items)){
                return items;
            }
            if(pageSize > 0 && index > 0){
    			var total = items.length;
    			var totalPage = Math.ceil(total / pageSize);
    			index = Math.min(totalPage, Math.max(1, index));
    			return items.slice((index - 1) * pageSize, index * pageSize);
            }
            return items;
		};
	});
}])

.directive("dialog", ["$modal", "$rootScope", "$$$I18N", function ($modal, $rootScope, $$$I18N) {
    return {
        restrict: "A",
        link: function ($scope, element, attrs) {
            element.click(function () {
                if(attrs.disabled){
                    $.bigBox({
                        title:$$$I18N.get("INFOR_TIP"),
                        content:attrs.error
                    });
                }else{
                    var dialog = $modal.open({
                        templateUrl: "views/vdi/dialog/" + attrs.dialogUrl,
                        controller: attrs.dialog,
                        scope: $scope,
                        size: attrs.dialogSize
                    });
                    $scope.close = dialog.dismiss.bind(dialog);
                    window.___dialog = dialog;
                }
                
            });
        }
    };
}])
.directive("widgetGrid", ["$filter", "$modal", function($filter, $modal){
    function getPosition(e, ele) {
        var st = Math.max(
            document.documentElement.scrollTop,
            document.body.scrollTop
        );
        var sl = Math.max(
            document.documentElement.scrollLeft,
            document.body.scrollLeft
        );
        var cw = document.documentElement.clientWidth;
        var ch = document.documentElement.clientHeight;
        var sw = Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth
        );
        var sh = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
        );
        var ow = ele.offsetWidth;
        var oh = ele.offsetHeight;
        return {
            x: Math.max(0, e.pageX + ow > sl + cw ? sl + cw - ow : e.pageX),
            y: Math.max(0, e.pageY + oh > st + ch ? st + ch - oh : e.pageY)
        }
    }
    return {
        restrict: "A",
        controller: function($scope){
            this.getCurrentPage = function(){
                return Number($scope.currentPage) > 0 ? $scope.currentPage : 0;
            };
            this.getCurrentRows = function(){
                return $scope.getCurrentRows();
            }
            this.getPageSize = function(){
                return Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
            };
        },
        link: function ($scope, element, attrs) {
            var context_wrapper = element.find(".context_wrapper");
            context_wrapper.on("mousedown", function (e) {
                if (e.target === this) {
                    context_wrapper.hide();
                    element.find(".contextmenu_selected").removeClass("contextmenu_selected");
                }
            }).on("click", function () {
                context_wrapper.hide();
                element.find(".contextmenu_selected").removeClass("contextmenu_selected");
            });
            context_wrapper.hide();

            // $scope.searchText = "";
            //$scope.pagesize = 5;
            $scope.currentPage = 1;

            $scope.getCurrentRows = function(){
                return $filter("paging")(
                    $scope.getFilterRows(),
                    $scope.currentPage, $scope.pagesize
                );
            };
            $scope.getFilterRows = function(){
                return $filter("filter")($scope.rows || [], $scope.searchText);
            };

            $scope.checkAll = function(){
                var rows = $scope.getCurrentRows();
                var _all = rows.length && rows
                    .filter(item => !item._ignore ).length && rows
                    .filter(item => !item._ignore )
                    .every(row => row._selected );
                $scope.checkedAll = _all;
                return _all;
            };
            $scope.selectAllChange = function (checkAll) {
                var rows = $scope.getCurrentRows();
                rows.filter(item => !item._ignore ).forEach(function (row) {
                    row._selected = checkAll;
                });
                $scope.checkedAll = checkAll;
            };
            $scope.checkOne = function () {
                var rows = $scope.getCurrentRows();
                return rows.filter(item => !item._ignore ).some(function (row) {
                    return row._selected;
                });
            };
            $scope.sort = function(name, asc){
                $scope.rows.sort(function(a, b){
                    return (a[name] > b[name] ? 1 : -1) * (asc ? 1 : -1);
                });
            };
            $scope.pageSizeChange =
            $scope.pageChange = function(){
                $scope.rows.forEach(function(item, i){
                    item._selected = false;
                });
            };
            $scope.currentItem = null;
            $scope.$on("contextmenu", function (e, item, de, handler) {
                $scope.currentItem = item;
                handler.addClass("contextmenu_selected");
                $scope.rows.forEach(function (item) {
                    item._selected = false;
                });
                item._selected = true;
                $scope.$apply();
                context_wrapper.fadeIn(200);
                var menu = element.find(".grid_context_menu");
                var offset = context_wrapper.offset();
                var pos = getPosition(de, menu[0]);
                menu.css({
                    top: pos.y - offset.top + "px",
                    left: pos.x - offset.left + "px"
                });
                $scope.rows.forEach(function (item) {
                    item._selected = false;
                });
                item._selected = true;
                $scope.$apply();
                e.stopPropagation();
                de.preventDefault();
            });
        }
    };
}])
.directive("gridPagination", [function(){
    return {
        restrict: "A",
        require: ["^widgetGrid"],
        conroller: function($scope){

        },
        link: function($scope, element, attrs, ctrls){
            var grid = ctrls[0];
            $scope.getStart = function(){
                var current = grid.getCurrentPage();
                var pagesize = grid.getPageSize();
                return pagesize > 0 ? (current - 1) * pagesize + 1 : 0;
            };
            $scope.getEnd = function(){
                var current = $scope.currentPage;
                var pagesize = grid.getPageSize();
                var end = current * pagesize;
                var currentCount = $scope.getFilterRows().length;
                return end < currentCount ? end : currentCount;
            };
            $scope.getCurrentCount = function(){
                return $scope.getCurrentRows().length;
            };
        }
    }
}])
.directive("ribbonTips", ["localize", "$route", "$location", "$interval", function(localize, $route, $location, $interval){
    return {
        restrict: "A",
        link: function($scope, element, attrs){
            var timer, dereg;
            var fn_update_help_info = function(){
                var path = $location.$$path;
                if(/^\/resource\/network\/\d+\/?$/.test(path)){
                    path = "/resource/network/:id";
                }
                if(/^\/desktop\/teach\/\d+\/?$/.test(path)){
                    path = "/desktop/teach/:id";
                }
                var help_text = attrs.myTips?localize.localizeText(attrs.myTips):localize.localizeText(path);
                element.attr("data-content", help_text);
                if(help_text) {
                    element.parent().show();
                } else {
                    element.parent().hide();
                }
            };
            $scope.$on("$routeChangeSuccess", function(){
                fn_update_help_info();
            });
            if(localize.isReady()) {
                fn_update_help_info();
            }
            $scope.$on("localizeLanguageChanged", fn_update_help_info);
        }
    };
}])
.directive("contextmenu", [function(){
    return {
        restrict: "A",
        link: function ($scope, element, attrs) {
            if (attrs.contextmenuDisabled !== "true") {
                element.bind("contextmenu", function (e) {
                    $scope.$emit(attrs.contextmenuEventName || "contextmenu", $scope.item, e, element);
                });
            }
        }
    };
}])

.directive("wizard", [function () {
    return {
        restrict: "A",
        transclude: true,
        scope: {
            lastText: "@",
            btnUnable:"="
        },
        controller: function ($scope, localize, $$$I18N) {
            var steps = $scope.steps = [];
            $scope.currentStep = null;
            $scope.moveWth = 0;
            var defaults = {
                prevBtnText: "上一步",
                nextBtnText: "下一步",
                doneBtnText: "完成",
            };
            $scope.$on("currentStepChange", function(e, stepIndex){
                $scope.go(stepIndex);
            });
            $scope.select = function (step) {
                var index;
                steps.forEach(function (s, i) {
                    s.selected = s === step;
                    if(s.selected) {
                        index = i;
                    }
                });
                $scope.currentStep = step;
                ["prev", "next", "done"].forEach(function(s){
                    var key = s + "BtnText";
                    $scope[key] = $$$I18N.get(step[key] || defaults[key]);
                });
                $scope.$emit("selectStepChange", {index: index, stepScope: step});
            };
            $scope.getCurrentIndex = function () {
                return steps.indexOf($scope.currentStep);
            };

            $scope.prev = function () {
                var index = $scope.getCurrentIndex();
                //var e = $scope.$emit(($scope.stepEventName || "WizardStep"), $scope.currentStep);
                var prev = steps[index - 1];
                prev && $scope.select(prev);
                $scope.moveWth = $scope.getMarginValue();

            };
            $scope.next = function () {
                var index = $scope.getCurrentIndex();
                $scope.currentStep.is_dirty = true;
                var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling);
                if ($scope.currentStep.done !== false) {
                    var next = steps[index + 1];
                    next && $scope.select(next);
                    $scope.moveWth = $scope.getMarginValue();
                };

            };
            $scope.go = function(index){
                $scope.select(steps[index]);
                $scope.moveWth = $scope.getMarginValue();
            }
            $scope.showPrev = function () {
                return steps.indexOf($scope.currentStep) > 0 && $scope.currentStep.prevBtnText !== "";
            };
            $scope.isLast = function () {
                return steps.indexOf($scope.currentStep) >= steps.length - 1;
            };
            $scope.done = function () {
                var index = $scope.getCurrentIndex();
                $scope.currentStep.is_dirty = true;
                var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling); 
                if ($scope.currentStep.done !== false) {
                    var next = steps[index + 1];
                    next && $scope.select(next);
                    $scope.$emit($scope.doneEventName || "WizardDone", steps, steps.map(function (step) {
                        return step.$$nextSibling
                    }));
                }
            };
            this.addStep = function (step) {
                steps.push(step);
                if (steps.length === 1) {
                    $scope.select(step);
                }
            };
            this.jumpStep = function (index) {

            };
            this.removeStep = function (index) {

            };
            this.insertStep = function (step) {

            };
        },
        link : function($scope, element, attrs){
            $scope.getMarginValue = function(){
                var _idx = $scope.getCurrentIndex();
                var wizardWth = element.find('.wizard').outerWidth();
                var _wth = 60;
                for(var i = 0; i<=_idx+1 ; i++){
                    _wth+=element.find(".steps>li").eq(i).outerWidth();
                }
                if(wizardWth - _wth < 0){
                    return (wizardWth - _wth) ;
                }else{
                    return 0;
                }
            };
            // if(attrs.disableNav !== "true") {
            //     element.find(".steps").delegate("li.complete","click",function(e){
            //         var _idx = $(this).index();
            //         $scope.go(_idx);
            //     });
            // }
        },
        template: `<div class="wizard" style="margin-bottom:20px;">
            <ul class="steps" style="margin-left:{{moveWth}}px">
                <li data-ng-repeat="step in steps" data-target="#step{{ $index }}" data-ng-class="{ active: getCurrentIndex() >= $index ,complete:getCurrentIndex() > $index }">
                    <span class="badge badge-info">{{ $index + 1 }}</span><span localize="{{step.name}}"></span><span class="chevron"></span>
                </li>
            </ul>
            <div class="actions">
                <button ng-show="!btnUnable" type="button" data-ng-if="showPrev()" data-ng-click="prev()" ng-disabled="currentStep.showLoading === true" class="btn btn-sm btn-primary btn-prev">
                    <i class="fa fa-arrow-left"></i><span ng-bind="prevBtnText"></span>
                </button>
                <button ng-show="!btnUnable" type="button" data-ng-if="!isLast()" data-ng-click="next()" ng-disabled="currentStep.showLoading === true" class="btn btn-sm btn-success btn-next">
                    <span ng-bind="nextBtnText"></span> <i class="fa fa-arrow-right"></i>
                </button>
                <button id='finish' ng-show="!btnUnable && isLast()" type="button" data-ng-click="done()" ng-disabled="currentStep.showLoading === true" class="btn btn-sm btn-success btn-next">
                    <span ng-bind="doneBtnText"></span><i class="fa fa-check" ></i>
                </button>
                <img ng-show="btnUnable" src="img/loadingtext.gif" width="24px" height="24px"/>
                <img ng-show="currentStep.showLoading === true" src="img/loadingtext.gif" width="24px" height="24px"/>
            </div>
        </div>
        <div class="step-content">
            <form data-ng-transclude class="form-horizontal" id="fuelux-wizard" method="post" novalidate>
            </form>
        </div>
        <div ng-show="currentStep.showLoading === true" style="position: absolute;top:0;right:0;bottom:0;left:0;z-index:999;"></div>`
    };
}])
.directive("wizardStep", [function () {
    return {
        restrict: "A",
        require: "^wizard",
        transclude: true,
        replace: true,
        scope: {
            name: "@",
            prevBtnText: "@",
            nextBtnText: "@",
            doneBtnText: "@",
            testValid: "="
        },
        controller: function ($scope) {},
        link: function (scope, element, attrs, wizard) {
            wizard.addStep(scope);
        },
        template: `<div class="step-pane" data-ng-class="{ active: selected }" data-ng-show="selected" data-ng-transclude></div>`
    };
}])

.directive('areaTraffic', function ($interval,$http) {
    return {
        restrict: 'EA',
        replace: true,
        scope:{
            options : "="
        },
        link: function (scope, e, attrs) {
            Highcharts.setOptions({    //disable utc time
                global: {    
                    useUTC: false    
                }    
            }); 
            function init_data(){
                // generate init data
                var data = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -40; i <= 0; i += 1) {
                    data.push({
                        x: time + i * scope.$parent.refresh_time,
                        y: 0
                    });
                }
                return data;
            }
            var hc_options = scope.options.options;
            hc_options.chart.renderTo = e[0];
            hc_options.yAxis.min = 0;
            angular.forEach(hc_options.series,function(s){
                s.data = init_data();
            });

            var highcharts = new Highcharts.Chart(hc_options);

            function drawPoint(data) {
                var datetime = (new Date()).getTime();
                var hc_series = highcharts.series;

                scope.options.drawpoint(hc_series,data,datetime);

            }

            function reset_highcharts(){
                //reset highcharts
                highcharts.destroy();
                angular.forEach(hc_options.series,function(s){
                    s.data = init_data();
                });
                highcharts = new Highcharts.Chart(hc_options);
            }

            scope.$watch('$parent.metric_data',function(newvalue){
                if(newvalue){
                    drawPoint(newvalue);
                }
            });

            scope.$watch('$parent.refresh_time',function(newvalue){
                reset_highcharts();
            });

            scope.$watch('$parent.item',function(newvalue){
                reset_highcharts();
            });

        }
    }
})
.directive("monitorTree", [function(){
    return {
        restrict: "A",
        transclude: true,
        template: `<div class="portlet-title clearfix padding-5">
                <div class="pull-left">
                    <a href="javascript:" id="collape" class="btn btn-default btn-xs"><i class="fa  icon-jj-Shrinkfrom"></i> </a>
                    <a href="javascript:" id="open" class="btn btn-default  btn-xs"><i class="fa icon-jj-Open"></i></a>
                </div>
                <div class="pull-right"><a href="javascript:"class="btn btn-default  btn-xs" ng-init="ishow=false" ng-click="ishow==true?ishow=false:ishow=true;open()"><i class="fa fa-search"></i></a></div> 
            </div>
            <div class="search" ng-show="ishow"><input type="search" localize="桌面名" ng-model="searchText"></div>
            <div class="portlet-body fuelux monitor-tree" data-ng-transclude></div>
        `,
        link: function(scope, element, attrs){
            element.delegate('#open', 'click', function(event) {
                element.find(".parent").addClass('in');
            });
            element.delegate('#collape', 'click', function(event) {
                element.find(".parent").removeClass('in');
            });
            element.delegate (".tree-toggle","click",function(event){
                var parent =$(this).parent().parent(".parent");
                if(parent.hasClass('in')){
                    parent.removeClass('in');
                }else{
                    parent.addClass("in");
                }
            });
            element.delegate(".tree-it","click",function(event){
                element.find("li").removeClass('active');
                $(this).parent("li").addClass('active');
            });
            scope.open = function(){
                element.find(".parent").addClass('in');
            };
        }
    };
}])
.directive('ipPattern',function (ip_pattern) {

    return {
      require: ['ngModel','?ngRequired'],
      link: function (scope, elm, attrs, ctrls) {
        var ngmodelctl = ctrls[0];
        var ngrequiredctl = ctrls[1];

        ngmodelctl.$parsers.push(function (viewValue) {

          if (ip_pattern.test(viewValue)||(!ngrequiredctl&&!viewValue)) {

            ngmodelctl.$setValidity('ipcheck', true);
            return viewValue;
          } else {

            ngmodelctl.$setValidity('ipcheck', false);
            return undefined;
          }
        });
      }
    }

})
.directive("preventSpace", [function(){
    return {
      restrict: "A",
      link: function(scope, element, attrs){
        element.on("keypress",function(e){
          if(e.keyCode === 32){
            e.preventDefault();
          }
        })
      }
    };
  }])
.directive("inputNumber", [function(){
    return {
        restrict: "AE",
        link: function(scope, element, attrs){
            var numKey = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
            var ctrlKey = [
                8, // backspace
                46,// delete
                37,// left arrow
                39 // right arrow
            ];
            element.on("keydown", function(e){
                var code = e.which || e.keyCode;
                if(numKey.indexOf(code) > -1) {
                    var num = code < 60 ? code - 48 : code - 96;
                    var nextValue = this.value + num;
                    if(!attrs.max) { return; }
                    var max = attrs.max * 1;
                    if(!isNaN(max) && nextValue <= max) {
                        return;
                    }
                } else if(ctrlKey.indexOf(code) > -1) {
                    return;
                }
                e.preventDefault();
                return false;
            });
        }
    };
}])
// .directive("inputDot", [function(){
//     return {
//         restrict: "AE",
//         link: function(scope, element, attrs){
//             element.on("keydown",function(e){
//                 if(attrs.inputDot == 'true'){
//                    if(e.keyCode === 190 || e.keyCode === 110 || e.keyCode === 69){
//                         e.preventDefault();
//                    }
//                 }
//                 else{
//                     if(e.keyCode === 69){
//                         e.preventDefault();
//                     }
//                 }

//             });
//         }
//     };
// }])
.directive("formatIp", ["$compile",function($compile){
    return {
        restrict:"EA",
        require:"ngModel",
        scope:{
            start:"=",
            end:"="
        },
        link:function(scope,element,attrs,ctrl){
            var ngModelCtrl = ctrl;
            var required = attrs.ipRequired ? scope.$eval(attrs.ipRequired) : true;

            if(!ngModelCtrl){
                return;
            };
            var CHECKTOOLS = {};

            CHECKTOOLS.checkIP = function(ip){
                if(!ip) { return false; }
                var parts = ip.split(".");
                //9029bug 0.0.0.0不合法IP
                var numre = /^(0|[1-9][0-9]*)$/;
                var i, valid = true;
                if(parts.length !== 4) { return false; }
                for(i = 0; i < 4; i++) {
                    if(numre.test(parts[i]) && parseInt(parts[i]) <= 255) {
                        continue;
                    } else {
                        valid = false;
                    }
                }
                valid = valid && (ipformatNum(ip) > ipformatNum('1.0.0.0'));
                return valid;
            };

            function ipformatNum(ip){
                var arr = ip.split('.').map(function(item){ return Number(item)});
                return arr[0]*Math.pow(256,3) + arr[1]*Math.pow(256,2) + arr[2]*Math.pow(256,1) + arr[3];   
            }

            CHECKTOOLS.ip2long = function(ip){
                if(CHECKTOOLS.checkIP(ip)){
                    var arr = ip.split('.').map(function(item){ return Number(item)});
                    return arr[0]*Math.pow(256,3) + arr[1]*Math.pow(256,2) + arr[2]*Math.pow(256,1) + arr[3];
                }
            };
            CHECKTOOLS.checkRange = function(ip,s_ip,e_ip){
                if(CHECKTOOLS.checkIP(ip),CHECKTOOLS.checkIP(s_ip) && CHECKTOOLS.checkIP(e_ip)){
                     var s = CHECKTOOLS.ip2long(s_ip);
                     var e = CHECKTOOLS.ip2long(e_ip);
                     var c = CHECKTOOLS.ip2long(ip);
                     return c >= s && c <= e;
                 }else{
                    return false;
                 }
            };
            var popEl = angular.element("<div format-ip-wrap></div>");
            var $input = $compile(popEl)(scope);
            element.addClass("ng-hide");
            element.after($input);

            // model -- ui
            
            ngModelCtrl.$render = function(){
                var modelVal = ngModelCtrl.$modelValue;
                var modelValArr;
                try{
                    if(modelVal === null) {
                        modelValArr = [];
                        ngModelCtrl.$setPristine();
                    } else {
                        modelValArr = modelVal.split(".");
                    }
                    [1,2,3,4].forEach(function(i,idx){
                        scope["seg" + i] = modelValArr[idx] || "";
                    });
                }catch(err){
                }
                // setValidate();
            };
            /*
            function setValidate(){
                var isValid;
                if(ngModelCtrl.$modelValue){
                    if(scope.start && scope.end){
                        isValid = CHECKTOOLS.checkRange(ngModelCtrl.$modelValue,scope.start,scope.end)
                    }else{
                        isValid = CHECKTOOLS.checkIP(ngModelCtrl.$modelValue);
                    }
                    ngModelCtrl.$setValidity("ip",isValid);
                }else{
                    ngModelCtrl.$setValidity("ip",true);
                }
            };

            // ui -- model
            $input.on("input",function(e){
                scope.$apply(function(){
                    var val = [1,2,3,4].map(function(i){ return scope["seg" + i] || ""; }).join(".");
                    var isNull = val.split(".").every(function(item){ return item.length===0 });
                    if(isNull){
                        ngModelCtrl.$setViewValue("");
                    }else{
                        ngModelCtrl.$setViewValue(val);
                    }
                    ngModelCtrl.$render();
                })
            });

            */

            scope.$watch("seg1 + '.' + seg2 + '.' + seg3 + '.' + seg4", function(ip){
                var value = ngModelCtrl.$modelValue;
                if(ip === "...") {
                    if(value) {
                        ngModelCtrl.$setViewValue("");
                    }
                    if(!value || !required) {
                        return ngModelCtrl.$setValidity("ip", true);
                    }
                    ngModelCtrl.$setValidity("ip", false);
                } else {
                    var isValid = false;
                    if(scope.start && scope.end){
                        isValid = CHECKTOOLS.checkRange(ip, scope.start, scope.end);
                    }else{
                        isValid = CHECKTOOLS.checkIP(ip);
                    }
                    ngModelCtrl.$setValidity("ip", isValid);
                    ngModelCtrl.$setViewValue(ip);
                }
            });
        }
    }
}])
.directive("formatIpWrap",function(){
    return {
        restrict: "AE",
        replace: true,
        template: `<span role="ipgroup"><input type="text" ng-model="seg1"><span class="dot">.</span><input type="text" ng-model="seg2"><span class="dot">.</span><input type="text" ng-model="seg3"><span class="dot">.</span><input type="text" ng-model="seg4"></span>`,
        link: function(scope,element,attrs){
            element.on("keydown", "input", function(event){
                switch(event.keyCode){
                    case 110:
                    case 190:
                        var nextEles = $(this).nextAll("input");
                        nextEles.length && nextEles.eq(0).focus();
                        event.preventDefault();
                        break;
                    case 8:
                        if(!$(this).val()){
                            $(this).prevAll("input").length && $(this).prevAll("input").eq(0).focus();
                        }
                        break;
                    case 37:
                        if(this.selectionStart === 0){
                            $(this).prevAll("input").length && $(this).prevAll("input").eq(0).focus();
                        };
                        break;
                    case 39:
                        if(this.selectionStart === $(this).val().length){
                            $(this).nextAll("input").length && $(this).nextAll("input").eq(0).focus();
                        }
                        break;
                    case 32:
                    case 229:
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                }
            });
            element.on("keypress", "input",function(e){
                if(e.keyCode < 48 || e.keyCode > 57){
                    e.preventDefault();
                }
                if($(this).val().length > 2 && this.selectionStart === this.selectionEnd){
                    e.preventDefault();
                }
            });
            element.on("paste",function(e){
                e.preventDefault();
            });
            element.on("focus", "input", function(e){
                element.addClass("focus");
            });
            element.on("blur", "input", function(e){
                element.removeClass("focus");
            });
        }
    }
})
.directive("treeNodeParent", ["$compile", function($compile){
    return {
        restrict: 'EA',
        replace: true,
        scope: {users: '=', filtertext: '='},
        template: '<ul role="tree" class="menu menu-tree" ng-repeat="item in getUsers()">'+
                    '<div class="menu_header">'+
                        '<span class="fa icon-jj"></span>'+
                        '<span class="menu-name">{{item.dept_name}}</span>'+
                        '<span class="pull-right fa icon-jj-add" data-ng-click="add_selected(item);$event.stopPropagation()"></span>'+
                    '</div>'+
                    '<div class="menu_body">'+
                        '<tree-node ng-repeat="node in item.children" data-nodes="item.children" data-node="node"></tree-node>'+
                    '</div>'+
                '</ul>',
        controller: function($scope){
            var lastFilter;
            var lastFiltedResult;
            $scope.add_selected = function(children){
                $scope.$emit('add_selected', children);
            }

            $scope.getUsers = function(){
                var text = $scope.filtertext || "";
                var users = $scope.users;
                text = text.trim();
                if(!text) { return users; }
                if(text !== lastFilter) {
                    lastFilter = text;
                    lastFiltedResult = filterUser(angular.copy(users), text);
                }
                return lastFiltedResult;
            };

            function filterUser(users, text) {
                return users.filter(function(user){
                    if(user.children) {
                        user.children = filterUser(user.children, text);
                        return user.children.length > 0;
                    } else {
                        return user.user_name.indexOf(text) > -1 || user.real_name.indexOf(text) > -1;
                    }
                });
            }
        },
        link: function(scope, element, attrs){
        }
    };
}])
.directive("treeNode", ["$compile", function($compile){
    return {
        restrict: 'EA',
        replace: true,
        scope: {node: '=', nodes: '='},
        template: '<div></div>',
        controller: function($scope){
            $scope.add_selected = function(children){
                $scope.$emit('add_selected', children);
            }
            $scope.add_select_rows = function($event,node,nodes){
                $scope.$emit('add_select_rows', $event,node,nodes);
            }
        },
        link: function(scope, element, attrs){
            if(scope.node.children) {
                element.append('<ul role="group" class="menu menu-tree">'+
                    '<div class="menu_header">'+
                        '<span class="fa icon-jj"></span>'+
                        '<span class="menu-name">{{node.dept_name}}</span>'+
                        '<span class="pull-right fa icon-jj-add" data-ng-click="add_selected(node);$event.stopPropagation()"></span>'+
                    '</div>'+
                    '<div class="menu_body">'+
                        '<tree-node ng-repeat="sub in node.children" data-nodes="node.children" data-node="sub"></tree-node>'+
                    '</div>'+
                '</ul>')
            }else{
                element.append('<li class="menuitem" ng-click="add_select_rows($event,node,nodes)" ng-dblclick="add_selected(node)">'+
                    '<span class="text-overflow text-overflow-half">{{node.name}}</span>'+
                    '<span class="text-overflow text-overflow-half">{{node.real_name}}</span>'+
                  '</li>')
            }
            $compile(element.contents())(scope)
        }
    };
}])
.directive("uiMenuList", ["Admin","User","Domain","$q","$$$I18N",function(APIadmin,APIuser,APIdomain,$q,$$$I18N){
    return {
        restrict: "AE",
        scope:{
            selected: "=menuListData",
            // domain:"=menuListDomain"
        },
        templateUrl: "includes/userMenu.html",
        controller: function($scope){
            $scope.expandedNodes = [];
            $scope._users = [];
            $scope.selected = $scope.selected || [];
            $scope.seRows = [];
            $scope.rmRows = [];
            $scope.common_users = [];
            function formatData(d,name){
                iteration(d,name);
                return d;
            }
            function iteration(data,childName,list){
                for(var i = 0 ; i < data.length ; i++){
                    $scope.expandedNodes.push(data[i]);
                    if(data[i][childName] && data[i][childName].length){
                        var len = iteration(data[i][childName],childName);
                        if(len === 0){
                            data[i] = undefined;
                        }
                    }
                    if(!data[i]) { continue; }
                    if(data[i].users && data[i].users.length > 0){
                        data[i].users.map(user => {
                            user.name = user.name || user.user_name;
                            user._is_last = true;
                            return user;
                        });
                        data[i][childName] = data[i].users;
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
            function removeNoChildrenDeparts(data) {
                data = data.filter(noUserFilter);
                data.forEach(walk);
                return data;
                function walk(node) {
                    if(!node.dept_id) { return; }
                    // 用户上级是没有 children 的
                    if(node.children) {
                        node.children = node.children.filter(noUserFilter);
                        node.children.forEach(walk);
                    }
                }
                function noUserFilter(node) {
                    if(node.dept_id && !node.children && node.users.length === 0) {
                        return false;
                    }
                    return true;
                }
            }
            function get_admin(){
                var deferred = $q.defer();
                APIadmin.query(function(res){
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            function get_user(){
                var deferred = $q.defer();
                APIuser.query_tree(function(res){
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            function get_domain(){
                var deferred = $q.defer();
                APIdomain.list(function(res){
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
            $q.all([get_admin(),get_user(),get_domain()]).then(function(arr){
                $scope._users = [{
                    typeName: $$$I18N.get("管理用户"),
                    userData: arr[0].users
                }];
                $scope.domain_users = arr[2].result.map(function(res){
                    res._name = $$$I18N.get("域") + "(" + res.name + ")";
                    return res;
                });
                $scope.common_users = formatData(removeNoChildrenDeparts(arr[1].result),"children");
                console.log($scope.common_users)
            });
            function getLastLevelNodes(obj_levels, arrays){
                if(obj_levels.children){
                    obj_levels.children.forEach(function(item){
                        getLastLevelNodes(item, arrays);
                    })
                }else{
                    arrays.push(obj_levels);
                }
            }

            $scope.$on('add_selected', function(e, levels){
                var arrays = [];
                getLastLevelNodes(levels, arrays);
                $scope.add_selected(arrays);
            })
            $scope.$on('add_select_rows', function(e,$event,node,nodes){
                console.log(555555, $event,node, nodes);
                $scope.add_select_rows($event,node, nodes);
            })
            $scope.add_selected = function(items){
                var rows = items instanceof Array ? items : [items];
                rows.forEach(function(i){
                    if($scope.selected.indexOf(i) === -1){
                        $scope.selected.push(i);
                    }
                });
            };
            $scope.remove_selected = function(items){
                var rows = items instanceof Array ? items : [items];
                rows.forEach(function(i){
                    $scope.selected.splice($scope.selected.indexOf(i),1);
                });
                $scope.rmRows = [];
            };
            var lastRow2 = null;
            $scope.add_select_rows = function(e,item,items){
                var idx = $scope.seRows.indexOf(item);
                if(e.ctrlKey){
                    idx === -1 ? $scope.seRows.push(item) : $scope.seRows.splice(idx,1);
                    lastRow2 = item;
                }else if(e.shiftKey){
                    var begin_idx = items.indexOf(lastRow2);
                    var end_idx = items.indexOf(item);
                    if(begin_idx === -1){
                        lastRow2 = item;
                        $scope.seRows = [item];
                    }else{
                        $scope.seRows = items.slice(Math.min(begin_idx,end_idx),Math.max(begin_idx,end_idx)+1);
                        console.log(1111111,$scope.seRows)
                    }
                }else{
                    $scope.seRows.splice(0,$scope.seRows.length,item);
                    lastRow2 = item;
                }
            };
            var lastRow = null;
            $scope.add_remove_rows = function(e,item){
                var idx = $scope.rmRows.indexOf(item);
                if(e.ctrlKey){
                    idx === -1 ? $scope.rmRows.push(item) : $scope.rmRows.splice(idx,1);
                    lastRow = item;
                }else if(e.shiftKey){
                    var begin_idx = $scope.selected.indexOf(lastRow);
                    var end_idx = $scope.selected.indexOf(item);
                    if(begin_idx !== -1 && end_idx !== -1){
                        $scope.rmRows = $scope.selected.slice(Math.min(begin_idx,end_idx),Math.max(begin_idx,end_idx)+1); 
                    }else{
                        $scope.rmRows = [item];
                        lastRow = item;
                    }
                }
                else{
                    $scope.rmRows.splice(0,$scope.rmRows.length,item);
                    lastRow = item;
                }
            };
            $scope.ltor = function(){
                $scope.add_selected($scope.seRows);
            };
            $scope.rtol = function(){
                $scope.remove_selected($scope.rmRows);
            }
        },
        link: function(scope, element, attrs){
            var last = null;
            element.on("keyup",'input[ng-model="searchText"]',function(e){
                $(".menu_header").addClass("open");
            });
            element.on("click",".menu_header",function(e){
                $(this).toggleClass("open");
            });
            element.on("click",".menuitem", function(e){
                var ele = $(this);
                var menuItems = ele.parent().parent(".menu_body").find(".menuitem");
                var allMenuItems = ele.parents(".menus").find(".menuitem");
                if(e.ctrlKey){
                    ele.hasClass("itemActive") ? ele.removeClass("itemActive") : ele.addClass("itemActive");
                    last = ele;
                }else if(e.shiftKey){
                    var begin_idx = [].indexOf.apply(menuItems,last);
                    var end_idx = [].indexOf.apply(menuItems,ele);
                    allMenuItems.removeClass("itemActive");
                    if(begin_idx !== -1 && end_idx !== -1){
                        for(var i = 0; i < menuItems.length; i++){
                            if(i > Math.max(begin_idx,end_idx) || i < Math.min(begin_idx,end_idx)){
                                menuItems.eq(i).removeClass("itemActive");
                            }else{
                                menuItems.eq(i).addClass("itemActive");
                            }
                        }
                    }else{
                        ele.addClass("itemActive");
                        last = ele;
                    }
                }else{
                    allMenuItems.removeClass("itemActive");
                    ele.addClass("itemActive");
                    last = ele;
                }
                
            });
        }
    };
}])
.directive("uiInputNumber", ["$http","$compile","$templateCache",function($http,$compile,$templateCache){
    return {
        restrict: "AE",
        scope:{
            step:"@",
            max:"@",
            userNumber: "=ngModel",
            min:"@"
        },
        priority: 2,
        require: "ngModel",
        controller: function($scope){

        },
        link: function(scope, element, attrs,ctrl){

            scope.addStep = Number(scope.step) || 1;
            scope.addMax  = Number(scope.max) || null;
            scope.addMin  = Number(scope.min) || null;

            var is_dot = String(Number(scope.step)).indexOf(".") === -1 ? false : true; 

            var modelCtrl = ctrl;
            var temp = $compile($("<div ui-input-number-wrapper></div>")[0])(scope);
            element.hide();
            element.after(temp);
           
            var numKey = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
            var ctrKey = [8,9,13,35,36,37,38,39,40,45,46,144,112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,110,190];
            scope.keydown = function(e){
                var _code = e.keyCode;
                var _valsplit = e.target.value.split("."); 

                if(numKey.indexOf(_code) === -1 && ctrKey.indexOf(_code) === -1){
                    e.preventDefault();
                }
                // 小数点后只能输入一位
                if(numKey.indexOf(_code) > -1 && _valsplit.length > 1 && _valsplit[1].length > 0 && e.target.selectionStart > e.target.value.indexOf(".")){
                    e.preventDefault();
                }
                // 屏蔽小数点
                if(_code === 110 || _code === 190){
                    if(!is_dot){
                        e.preventDefault();
                    }else{
                        if(e.target.value.indexOf(".") !== -1){
                            e.preventDefault();
                        }
                    }
                    
                }
                // 键盘上键加法
                if(_code === 38){
                    e.preventDefault();
                    scope.add(scope.addStep);
                    scope.round();
                }
                // 键盘下键减法
                if(_code === 40){
                    e.preventDefault();
                    scope.add(-scope.addStep);
                    scope.round();
                }
                
            };
            scope.round = function(){
                scope.userNumber = is_dot ? Math.round(Number(scope.userNumber)*2)/2 : Math.round(scope.userNumber);
            }

            modelCtrl.$render = function(){
                scope.setValidation();
            };
            scope.setValidation = function(){
                var newval = modelCtrl.$modelValue;
                var exp = /^-?([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*|0?\.?0+|0)$/;
                if(exp.test(newval)){
                    if((Math.abs(scope.addMax) >= 0 && newval > scope.addMax) || (Math.abs(scope.addMin) >= 0 && newval < scope.addMin) ){
                        modelCtrl.$setValidity("number",false);
                    }else{
                        modelCtrl.$setValidity("number",true);
                    }
                }else{
                    if(newval){
                        modelCtrl.$setValidity("number",false);
                    }else{
                        modelCtrl.$setValidity("number",true);
                    }
                }
            };
            scope.add = function(num){
                scope.userNumber = Number(scope.userNumber) ? Number(scope.userNumber) + Number(num) : Number(num);
                scope.setValidation();
            };
        }
    };
}])
.directive("uiInputNumberWrapper", [function(){
    return {
        restrict: "A",
        replace:true,
        templateUrl: "./views/vdi/common/input-number-temp.html",
        link: function(scope,element){
        }
    };
}])
.directive("uiInputNumberFormatter", [function(){
    return {
        restrict: "A",
        require:"ngModel",
        link: function(scope, element, attrs,ctrl){
            var exp = /^-?([1-9]\d*\.?\d*|0\.?\d*[1-9]\d*|0?\.?0+|0)$/;

            ctrl.$parsers.push(function(value){
                if(exp.test(value)){
                    return Number(value);
                }
            });
            ctrl.$formatters.push(function(value){

                if(exp.test(value)){
                    return Number(value);
                }
            });
        }
    };
}])
.directive("uiWebUpload", ["$http", "$rootScope", "$$$I18N", "$Domain", function($http, $rootScope, $$$I18N, $Domain){
    var org = XMLHttpRequest;
    var org_open = org.prototype.open;
    var allowUpload = window.FormData && typeof window.FormData === "function";
    $rootScope.uploadPool = $rootScope.uploadPool || {};
    return {
        restrict: "A",
        templateUrl: function(ele, attrs){
            if(attrs.templateUrl){
                return attrs.templateUrl;
            }
            return "views/vdi/common/ui-web-upload.html";
        },
        scope: {
            config:"=uiUploadConfig",
            finishHandel:"&"
        },
        controller: ["$scope", function(scope){
            scope.$on("progress", function(e, size){
                if(size.id === scope.upload_id){
                    scope.progressName = size.name
                    scope.isUploading = true;
                    var percent = size.loaded / size.total * 100;
                    if(isNaN(percent)) {
                        percent = 0;
                    }
                    scope.progressPercent = percent.toFixed(2) + "%";
                    if(scope.progressPercent === "100.00%"){ scope.isUploading = false; }
                    // 初始化页面上传不更新问题
                    scope.$apply();
                }
            });
            scope.allowUpload = allowUpload;
            scope.uploadISOSize = null;

        }],
        link: function(scope, element, attrs){
            scope.upload_id = attrs.uiWebUpload;
            scope.btnName = $$$I18N.get(attrs.uiUploadBtnName);
            scope.$on("localizeLanguageChanged", function(){
                // 重新apply数据才会更新视图，加定时器，调用apply才不会报错
                setTimeout(function(){
                     scope.btnName = $$$I18N.get(attrs.uiUploadBtnName);
                     scope.$apply();
                });
            });

            // 绑定一个测试提交，如果条件为 true 则按钮可点击，否则不可点击
            // 这种方式需要父 scope 配合
            if(attrs.uiWebUploadTest) {
                var degfn = scope.$parent.$watch(attrs.uiWebUploadTest, function (v) {
                    scope.disableTest = v;
                });
                scope.$on("$destroy", degfn);
                scope.disableTest = false;
            } else {
                scope.disableTest = true;
            }

            var filetype,url;
            var form = element.find("form");
            form.attr("action", url);
            function checkConfig(file,config){
                var filetype = attrs.uiUploadType;
                var maxSize = attrs.uiUploadLimit;
                var url = attrs.uiUploadUrl;

                if(!url){
                    throw new Error("no url config");
                    return false;
                }
                var typematch = true;
                if(filetype && file) {
                    typematch = (new RegExp("\\.(" + filetype + ")$")).test(file.name);
                    if(!typematch) {
                        $.bigBox({
                            title : $$$I18N.get("INFOR_TIP"),
                            content : $$$I18N.get("不是一个可接受的文件类型"),
                            icon : "fa fa-warning shake animated",
                            timeout : 6000
                        });
                        return false;
                    }
                }

                if(maxSize){
                    maxSize = parseInt(maxSize);
                    if(isNaN(maxSize)) {
                        return console.error("invalid upload limit:", attrs.uiUploadLimit);
                    }
                    if(file.size > maxSize * Math.pow(2,30)) {
                        $.bigBox({
                            title : $$$I18N.get("INFOR_TIP"),
                            content : $$$I18N.get("超出文件大小限制") + "("+ maxSize +"G)",
                            icon : "fa fa-warning shake animated",
                            timeout : 6000
                        });
                        return false;
                    }
                }
                if(file.size === 0){
                    $.bigBox({
                        title : $$$I18N.get("INFOR_TIP"),
                        content : $$$I18N.get("文件为空"),
                        icon : "fa fa-warning shake animated",
                        timeout : 6000
                    });
                    return false;
                }
                else{
                    return true;
                }
            }
            function clearDOM(){
                var input = element.find("input[type=file]");
                input.after(input.clone(true).val(''));
                input.remove();
                scope.isUploading = false;
                scope.progressSize = 0;
            }
            function finish(){
                $rootScope.uploadPool[attrs.uiWebUpload] = undefined;
                delete $rootScope.uploadPool[attrs.uiWebUpload];
            }
            function success(res){
                if(typeof scope.finishHandel === "function"){
                    scope.finishHandel({response: res});
                }
            }
            element.find("input[type=file]").on("change", function(e){
                var file = e.target.files[0];
                if(!file){
                    return ;
                }
                // var conf = scope.config;
                var isValid = checkConfig(file);
                
                if(isValid){
                    // $.bigBox({
                    //  title : $$$I18N.get("INFOR_TIP"),
                    //  content : $$$I18N.get("INFOR_UPISO"),
                    //  iconSmall : "fa fa-warning shake animated",
                    //  timeout : 5000
                    // });

                    var data = new FormData();
                    // 允许绑定额外的参数
                    if(attrs.uiWebUploadParams) {
                        $.each(scope.$eval(attrs.uiWebUploadParams), function(k, v){
                            data.append(k, v);
                        });
                    }
                    data.append(attrs.uiWebUploadName || e.target.name, file);
                    scope.progressName = file.name;
                    scope.progressSize = "(" + (file.size / Math.pow(2,20)).toFixed(2) + "M)";

                    $http.post($Domain + attrs.uiUploadUrl, data, {
                        transformRequest: function(config){
                            window.XMLHttpRequest = function(a, b, c, e){
                                window.XMLHttpRequest = org;
                                var xhr = new org(a, b, c, e);
                                $rootScope.uploadPool[attrs.uiWebUpload] = xhr;
                                xhr.open = function(q,w,e,r,t,y){
                                    xhr.open = undefined;
                                    delete xhr.open;
                                    if(xhr.upload){
                                        xhr.upload.addEventListener("progress", function(e){
                                            $rootScope.$broadcast("progress", {
                                                id: attrs.uiWebUpload,
                                                name: file.name,
                                                loaded: e.loaded,
                                                position: e.position,
                                                total: e.total,
                                                totalSize: e.totalSize
                                            });
                                            
                                        });
                                        xhr.addEventListener("abort", finish);
                                    }
                                    return org_open.call(xhr, q, w, e, r, t, y);
                                }
                                return xhr;
                            };
                            return config;
                        },
                        headers: {"Content-Type": undefined}
                    }).then(function(res){
                        clearDOM();
                        finish(res);
                        success(res);
                        $rootScope.$broadcast("finishUpload", true, file.name);
                    },function(){
                        clearDOM();
                        finish();
                    });
                }
            });
                
            element.find("button[type='button']").on("click", function(e){
                $(this).prev("input[type=file]").click();
            });
            if(attrs.btnClass) {
                element.find("button[type='button']").removeClass("btn-primary").addClass(attrs.btnClass);
            }
            if(attrs.iconClass) {
                element.find(".icon").removeClass("icon-jj-Upload").addClass(attrs.iconClass);
            }

            element.find("#abortBtn").on("click", function(e){
                var xhr = $rootScope.uploadPool[attrs.uiWebUpload];
                xhr && xhr.abort();
                clearDOM();
                scope.$apply();
            });
        }
    };
}])
.service("warnBox",[function(){
    this.warn = function(content, id, callback){
        if(!$("#warnBox").length){
            $("body").append("<div id='warnBox'></div>");
        }else{
            $("#warnBox").show();
        }
        $("body #warnBox").append("<div class='box warnBox"+id+"'><i class='fa fa-bell'></i><div class='content'><div class='btn-close'><span>×</span></div><p class='detail' title="+content+">"+content+"</p></div></div>")
        if($("body .warnBox"+id+" .detail").height()>38){
            $("body .warnBox"+id+" .detail").addClass('highHeight');
        }
        $("#warnBox .warnBox"+id+" .btn-close").click(function(e){
            callback(id);
        })
        setTimeout(function(){
            if($("#warnBox .warnBox"+id+"")){
                callback(id);
            }
        }, 30000)
    },
    this.close = function(id){
        $("body .box.warnBox"+id+"").remove();
        if(!$("#warnBox").children().length){
            $("#warnBox").hide();
        }else{ $("#warnBox").show(); }
    }
}])
.controller("TaskListController", ["$scope", "Task", "$location","$$$I18N", "UserRole","$rootScope", "warnBox", function($scope, task, $location, $$$I18N, UserRole,$rootScope,warnBox){
    $scope.toggleTaskList = function(){
        $("body").toggleClass("show_prog");
    };
    let user;
    let taskTimer = null;
    $scope.$on("NOAUTH", () => {
        user = null;
        clearTimeout(taskTimer);
    });
    $scope.$on("STOPLOG", function(){
        clearTimeout(taskTimer);
    });
    $scope.$on("AUTHED", () => {
        user = UserRole.currentUser;
        schedule();
    });
    if(UserRole.currentUser){
        user = UserRole.currentUser;
        schedule();
    }
    $scope.rows = [];
    var data = {};
    $scope.$on("instanceIDS", function($event, ids){
        data.instances = ids;
    });
    $scope.$on("imageIDS", function($event, ids){
        data.images = ids;
    });
    $scope.$on("clientIDS", function($event, ids){
        data.clients = ids;
    });
    $scope.$on('modeIDS', function($event, ids){
        data.modes = ids;
    });
    $scope.$on('nodes', function($event, ids){
        data.nodes = ids;
    });
    $scope.$on('manageNetworkIDS', function($event, ids){
        data.manage_networks = ids;
    })
    $scope.$on('personpools',function($event,ids){
        data.personpools=ids;
    })
    var lists = [], flag = false;
    function schedule(){
        var postData = data && Object.keys(data).map(function(key){
            // if(key !== "clients"){
                return {
                    key: key,
                    ids: data[key]
                };                
            // }
            // else{
            //     return {
            //         key: key,
            //         ids: []
            //     };    
            // }
        });
        task.post(postData,
            function(res){
                $scope.rows = res.results.tasks.filter(item => user.real_name ===  item.user);
                
                Object.keys(res.results).forEach(function(key){
                    if(key !== "tasks"){
                        $scope.$root && $scope.$root.$broadcast(key + "RowsUpdate", res.results[key]);
                    }
                });
                for(var i in res.results.notifies){
                    var item = res.results.notifies[i], color = '#004d60', content;
                    if( lists[item.id] == undefined ){
                        lists[item.id] = item;
                        if(item.waringtype === 0){
                            warnBox.warn(item.content, item.id, function(ID){
                                warnBox.close(ID);
                                task.put({notify_id: ID}, function(res){  })
                            })
                        }
                        else{
                            if(item.waringtype === 1){
                                color = "#004d60";
                                content = $$$I18N.get(item.name) + ' (' + item.target + ')';

                            }
                            else{
                                color = "#C46A69";
                                content = $$$I18N.get(item.name) + ' (' + item.target + ')';
                            }
                            $.bigBox({
                                title:$$$I18N.get('waringtype'+item.waringtype),
                                content:content,
                                color : color,
                                timeout : 3000
                            }, function(){
                                task.put({notify_id: item.id}, function(res){
                                })
                            });
                        }
                    }
                }
                taskTimer = setTimeout(schedule, 3000);
            },
            function(){
                taskTimer = setTimeout(schedule, 10000);
            }
        );
        for(var k in data){
            data[k] = undefined;
            delete data[k];
        }
    }

}])
.controller("pageHeaderController", ["$scope", "UserAuth", "Task", "$location","$$$I18N", "UserRole", "desktopHelpBox",function($scope, Auth, task, $location, $$$I18N, UserRole, desktopHelpBox){
    $scope.logout = function(){
        Auth.logout();
        desktopHelpBox.close();
    };
    $scope.$on("NOAUTH", function(){
        desktopHelpBox.close();
    });
    $scope.$on("DMS", function(e,dms){
        $scope.dmsURL = dms;
        $$$storage.setSessionStorage('DMS', dms);
    })
    $scope.dmsURL = $$$storage.getSessionStorage('DMS') || 'nodms';
    
}])
.controller("LogoController", ["$scope","settings", "$Domain", "$$$version", function($scope, settings, $Domain, $$$version){
    $scope.domain = $Domain;
    $scope.version = $$$version;
    $scope.languages = settings.languages;
    $scope.currentLang = settings.currentLang;
}])
.controller("SkinController", ["$scope", function($scope){
    $scope.changeSkin = function(theme){
        $scope.$root.$broadcast("changeSkin", theme)
    }
}])
.controller("userLoginInfoController", ["$scope", "UserRole", function($scope, Role){
    $scope.loginUser = Role.currentUser;
    $scope.$on("AUTHED", function(name, userInfo){
        $scope.loginUser = userInfo;
    });
    $scope.$on("NOAUTH", function(){
        $scope.loginUser = null;
    });
}])
.controller("AlarmController", ["$scope", "$modal", "SystemAlarm", "AlarmHistory", function($scope, $modal, alarm, AlarmHistory){
    $scope.isOpen = false;
    $scope.open = function(){
        $scope.isOpen = true;
    }
    $scope.close = function(e){
        if(e)
            e.stopPropagation();
        $scope.isOpen = false;
    }
    // function findDif(oldArray, newArray, difAttr){
    //     if(newArray.length){
    //         var length = oldArray.length>=newArray.length?oldArray.length:newArray.length;
    //         var difs = [];
    //         for(var i=0; i<length; i++){
    //             if(newArray[i]){
    //                 var different = oldArray.filter(function(item){ return item[difAttr] == newArray[i][difAttr] })[0];
    //                 if(!different){ difs.push(newArray[i]) };
    //             }
    //         }
    //         return difs;
    //     }else{ return []; }
    // };

    // var oldAlarms = [];
    $scope.$on("alarmsRowsUpdate", function($event, data){
        $scope.alarms = data;
        // if(!$scope.isOpen){
        //     var unreads = [];
        //     data.forEach(function(item){
        //         if(!item.is_read){ unreads.push(item) }
        //     })
        //     if(unreads.length){
        //         $scope.open();
        //         setTimeout(function(){
        //             $scope.close();
        //         }, 30000)
        //     }
        // }

        // var difs = findDif(oldAlarms, data, 'id');
        // if(!$scope.isOpen && difs.length){
        //     oldAlarms = data;
        //     $scope.open();
        //     setTimeout(function(){
        //         $scope.close();
        //     }, 30000)
        // }
    })
    $scope.delete = function(){
        AlarmHistory.setRead({ids: $scope.alarms.map(function(item){ return item.id; })},function(res){
            $scope.alarms = [];
            $scope.isOpen = false;
        })
    }
}])
.filter("interfaceFilter",[function(){
    return function(data,idx,nets){
        var invalidArr = [];
        nets.forEach((n,i) => {
            if(i !== idx && n._data_dev && n._data_dev._dev){
                invalidArr.push(n._data_dev._dev);
            }
        });
        return data.filter(function(d){
           if(invalidArr.indexOf(d._dev) === -1){
                return true;
           }
           return false;
        });
    }
}])
