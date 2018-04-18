angular.module("vdi.about", [])
.factory("permissionList", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/permission", null, {
        query: { method: "GET", isArray:false}
    });
}])
.factory("pushlicenseFile", ["$resource", "$Domain", function($resource, $Domain){
    return $resource($Domain + "/thor/license/show", null, {
        update: { method: "GET", isArray:false}
    });
}])
.service("desktopHelpBox",["$$$I18N", function($$$I18N){
    var _this = this;
    this.open = function(content, id, callback){
        if(!$("#desktopHelpBox").length){
            $("body").append("<div id='desktopHelpBox'></div>");
            $("body #desktopHelpBox").append('<div class="modal-header">'+
                    '<button type="button" class="close"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>'+
                    '<h4 class="modal-title">'+ $$$I18N.get("桌面部署帮助") +'</h4>'+
                '</div>'+
                '<div class="modal-body">'+
                    '<form class="form-horizontal" novalidate>'+
                        '<div class="form-group">'+
                            '<div class="col-xs-4">'+
                                '<select class="form-control type">'+
                                    '<option value="1">'+ $$$I18N.get("教学桌面部署流程") +'</option>'+
                                    '<option value="2">'+ $$$I18N.get("个人桌面部署流程") +'</option>'+
                                '</select>'+
                            '</div>'+
                        '</div>'+
                        '<div class="form-group teach">'+
                            '<div class="col-xs-12">'+
                                '<div class="map">'+
                                    '<div>'+
                                        '<div class="first">'+
                                            '<div style="margin-bottom: 40px;">'+
                                                '<div class="icon"><i class="fa-fw fa icon-028"></i><br/><span title="'+ $$$I18N.get("新增资源池") +'">'+ $$$I18N.get("新增资源池") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-029"></i><br/><span title="'+ $$$I18N.get("添加计算节点") +'">'+ $$$I18N.get("添加计算节点") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-030"></i><br/><span title="'+ $$$I18N.get("新增分布式虚拟交换机") +'">'+ $$$I18N.get("新增分布式虚拟交换机") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-017"></i><br/><span title="'+ $$$I18N.get("新增网络") +'">'+ $$$I18N.get("新增网络") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-classroom"></i><br/><span title="'+ $$$I18N.get("新增教室") +'">'+ $$$I18N.get("新增教室") +'</span></div>'+
                                            '</div>'+
                                            '<div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-Upload"></i><br/><span title="'+ $$$I18N.get("上传安装包") +'">'+ $$$I18N.get("上传安装包") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-032"></i><br/><span title="'+ $$$I18N.get("新增硬件模板") +'">'+ $$$I18N.get("新增硬件模板") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-Template"></i><br/><span title="'+ $$$I18N.get("新增模板") +'">'+ $$$I18N.get("新增模板") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-034"></i><br/><span title="'+ $$$I18N.get("加载gesttools") +'">'+ $$$I18N.get("加载gesttools") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-035"></i><br/><span title="'+ $$$I18N.get("保存模板") +'">'+ $$$I18N.get("保存模板") +'</span></div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="help_arrow_big"><div class="help_arrow nomargin"><span class="tou"></span></div></div>'+
                                        '<div class="last">'+
                                            '<div class="icon"><i class="fa-fw fa icon-036"></i><br/><span title="'+ $$$I18N.get("新增教学场景") +'">'+ $$$I18N.get("新增教学场景") +'</span></div>'+
                                            '<div class="help_arrow down"><span class="tou"></span></div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="second">'+
                                        '<div class="last">'+
                                            '<div class="icon"><i class="fa-fw fa icon-037"></i><br/><span title="'+ $$$I18N.get("激活场景") +'">'+ $$$I18N.get("激活场景") +'</span></div>'+
                                            '<div class="help_arrow down"><span class="tou"></span></div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="third">'+
                                        '<div class="icon green"><i class="fa-fw fa icon-jj-008"></i><br/><span title="'+ $$$I18N.get("安装客户端") +'">'+ $$$I18N.get("安装客户端") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon"><i class="fa-fw fa icon-031"></i><br/><span title="'+ $$$I18N.get("为终端分配教室") +'">'+ $$$I18N.get("为终端分配教室") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon"><i class="fa-fw fa icon-033"></i><br/><span title="'+ $$$I18N.get("终端排序") +'">'+ $$$I18N.get("终端排序") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon"><i class="fa-fw fa icon-jj-IP"></i><br/><span title="'+ $$$I18N.get("分配IP") +'">'+ $$$I18N.get("分配IP") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon green"><i class="fa-fw fa icon-038"></i><br/><span title="'+ $$$I18N.get("终端访问桌面") +'">'+ $$$I18N.get("终端访问桌面") +'</span></div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="form-group personal">'+
                            '<div class="col-xs-12">'+
                                '<div class="map">'+
                                    '<div>'+
                                        '<div class="first">'+
                                            '<div style="margin-bottom: 40px;">'+
                                                '<div class="icon"><i class="fa-fw fa icon-028"></i><br/><span title="'+ $$$I18N.get("新增资源池") +'">'+ $$$I18N.get("新增资源池") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-029"></i><br/><span title="'+ $$$I18N.get("添加计算节点") +'">'+ $$$I18N.get("添加计算节点") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-030"></i><br/><span title="'+ $$$I18N.get("新增分布式虚拟交换机") +'">'+ $$$I18N.get("新增分布式虚拟交换机") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-017"></i><br/><span title="'+ $$$I18N.get("新增网络") +'">'+ $$$I18N.get("新增网络") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-people"></i><br/><span title="'+ $$$I18N.get("新增用户") +'">'+ $$$I18N.get("新增用户") +'</span></div>'+
                                            '</div>'+
                                            '<div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-Upload"></i><br/><span title="'+ $$$I18N.get("上传安装包") +'">'+ $$$I18N.get("上传安装包") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-032"></i><br/><span title="'+ $$$I18N.get("新增硬件模板") +'">'+ $$$I18N.get("新增硬件模板") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-jj-Template"></i><br/><span title="'+ $$$I18N.get("新增模板") +'">'+ $$$I18N.get("新增模板") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-034"></i><br/><span title="'+ $$$I18N.get("加载gesttools") +'">'+ $$$I18N.get("加载gesttools") +'</span></div>'+
                                                '<div class="help_arrow"><span class="tou"></span></div>'+
                                                '<div class="icon"><i class="fa-fw fa icon-035"></i><br/><span title="'+ $$$I18N.get("保存模板") +'">'+ $$$I18N.get("保存模板") +'</span></div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="help_arrow_big"><div class="help_arrow nomargin"><span class="tou"></span></div></div>'+
                                        '<div class="last">'+
                                            '<div class="icon"><i class="fa-fw fa icon-036"></i><br/><span title="'+ $$$I18N.get("新增个人桌面") +'">'+ $$$I18N.get("新增个人桌面") +'</span></div>'+
                                            '<div class="help_arrow down"><span class="tou"></span></div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="third">'+
                                        '<div class="icon green"><i class="fa-fw fa icon-jj-008"></i><br/><span title="'+ $$$I18N.get("安装客户端") +'">'+ $$$I18N.get("安装客户端") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon green"><i class="fa-fw fa icon-039"></i><br/><span title="'+ $$$I18N.get("输入用户名密码") +'">'+ $$$I18N.get("输入用户名密码") +'</span></div>'+
                                        '<div class="help_arrow"><span class="tou"></span></div>'+
                                        '<div class="icon green"><i class="fa-fw fa icon-038"></i><br/><span title="'+ $$$I18N.get("终端访问桌面") +'">'+ $$$I18N.get("终端访问桌面") +'</span></div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</form>'+
                '</div>');
                if($$$I18N.get("GOD_VERSION")=='cloudClassEn'){
                    $('#desktopHelpBox').addClass('en')
                }
                $('#desktopHelpBox .personal').hide();
            $('#desktopHelpBox .teach').show();
            $$$storage.setSessionStorage("desktopHelpBox", 'open');
            var obj = document.getElementById('desktopHelpBox');
            obj.style.left = (document.documentElement.clientWidth - obj.offsetWidth)/2 + 'px';
            obj.style.top = (document.documentElement.clientHeight - obj.offsetHeight)/2 + 'px';
            $('#desktopHelpBox select.type').change(function(e){
                var value = e.target.value;
                if(value=='1'){
                    $('#desktopHelpBox .personal').hide();
                    $('#desktopHelpBox .teach').show();
                }else{
                    $('#desktopHelpBox .personal').show();
                    $('#desktopHelpBox .teach').hide();
                }

            })
        }
        function drag(obj) {
            var d = document, x, y, maxLeft, maxTop;
            var dragging = false;
            if (typeof obj == "string") {
                obj = document.getElementById(obj);
                obj.orig_index = obj.style.zIndex;
                maxLeft = document.documentElement.clientWidth - obj.offsetWidth;
                maxTop = document.documentElement.clientHeight - obj.offsetHeight;
                //设置当前对象永远显示在最上层
            }
            obj.onmousedown = function(a) {
                //鼠标按下
                this.style.cursor = "move";
                //设置鼠标样式
                if (!a) a = window.event;
                //按下时创建一个事件
                x = a.clientX - document.body.scrollLeft - obj.offsetLeft;
                //x=鼠标相对于网页的x坐标-网页被卷去的宽-待移动对象的左外边距
                y = a.clientY - document.body.scrollTop - obj.offsetTop;
                //y=鼠标相对于网页的y左边-网页被卷去的高-待移动对象的左上边距
                dragging = true;
            }
            obj.addEventListener("mousemove", function(a) { //鼠标移动
                if (!a) a = window.event; //移动时创建一个事件
                if(!dragging) { return; }
                var left = a.clientX + document.body.scrollLeft - x;
                var top = a.clientY + document.body.scrollTop - y;
                if(left<0) left = 0;
                if(top<0) top = 0;
                obj.style.left = left>maxLeft?maxLeft:left + 'px';
                obj.style.top = top>maxTop?maxTop:top + 'px';
            });
            d.addEventListener("mouseup", function() { //鼠标放开
                obj.style.cursor = "normal"; //设置放开的样式
                obj.style.zIndex = obj.orig_index;
                dragging = false;
            });
        }
        drag('desktopHelpBox')
        $("#desktopHelpBox .close").click(function(e){
            $$$storage.setSessionStorage("desktopHelpBox", 'unopen');
            _this.close();
        })
    };
    this.close = function(){
        $("body #desktopHelpBox") && $("body #desktopHelpBox").remove();
    }
}])

.controller("vdiAboutController", ["$scope", "$Domain", function($scope,$Domain){
}])

.controller("vdiPermissionController", ["$scope","$modal","permissionList","desktopHelpBox","$Domain",function($scope,$modal,permission_list,desktopHelpBox,$Domain){
    $scope.domain = $Domain;
    $scope.service_qq = ["9714711", "330740825"];
    permission_list.query(function(res){
    $scope.pmis = {
        "version":res.version,
        "build"  :res.build,
        "instance_num_quota":res.instance_num_quota,
        "license_time":res.license_time,
        "remain_days":res.remain_days,
        };
    });
    $scope.$on('test',function(event,data){
    	$scope.pmis = {
    		"instance_num_quota" : data.instnum,
    		"build" : data.build_version,
    		"version" : data.version,
    		"license_time" : data.time,
            "remain_days" : data.remain_days,
    	}
    })

    /**
     * [shutdown 一键关机]
     */
    $scope.shutdown=function(){
        $modal.open({
            size:"sm",
            templateUrl:"views/vdi/dialog/license/shutdown.html",
            backdrop:"static",
            controller:function($scope, $modalInstance){
                $scope.ok=function(){
                    // About.query(function(){
                        
                    // });
                    $modalInstance.close();
                }
                $scope.close=function(){
                    $modalInstance.close();
                }
            }
        })
    }
    $scope.help=function(){
        desktopHelpBox.open();
    }
}])

.controller("UpdateLicenseDialog",["$scope","$modalInstance", "$$$version","$$$I18N","$Domain", function($scope,$modalInstance,$$$version, $$$I18N,$Domain){
    $scope.ex={
        url: $Domain + '/thor/license/export'
    }
    $scope.version = $$$version;
    $scope.close=function(){
        $modalInstance.close();
    };
    var encodeHTML = function(txt, con){
        con = con || document.createElement("div");
        while(con.firstChild){
            con.removeChild(con.firstChild);
        }
        return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
    };
    var format = function(tmpl){
        var data = Array.prototype.slice.call(arguments, 0);
        return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function(match, param){
            if(data[param]){
                return encodeHTML(data[param]);
            }
            return match;
        }) : "";
    };

    $scope.finishUpload = function(response){
        var data = response.data;
        switch(data.code){
            case 0:
                $modalInstance.close();
                $.bigBox({
                    title   : $$$I18N.get("授权更新成功"),
                    // 新的授权内容已生效，请关闭本窗口后刷新页面查看。
                    content : $$$I18N.get("LICENSE_MESS_1"),
                    color   : "#8ac38b",
                    icon    : "fa fa-ok shake animated",
                    timeout : 6000
                });
                $scope.$emit('test',data);
                break;
            case -1:
                $.bigBox({
                    title   : $$$I18N.get("授权更新失败"),
                    // "授权文件与服务器硬件ID不匹配，请确认后重新上传。"
                    content : $$$I18N.get("LICENSE_MESS_2"),
                    color   : "#C46A69",
                    icon    : "fa fa-warning shake animated",
                    timeout : 6000
                });
                break;
            default :
                $.bigBox({
                    title   : $$$I18N.get("授权更新失败"),
                    // "不是合法的授权文件格式或内容，请检查确认后重新上传。"
                    content : $$$I18N.get("LICENSE_MESS_3"),
                    color   : "#C46A69",
                    icon    : "fa fa-warning shake animated",
                    timeout : 6000
                });
        }
    };
}])
