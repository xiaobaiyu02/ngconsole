var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2]?decodeURIComponent($hash[2]):'';
var $pname=$hash[3]?decodeURIComponent($hash[3]).split(';')[1]:'';
var $deskName=$pname || decodeURIComponent(location.hash).split('&')[3];
var $is_personalTemp = $hash[3]=="personal"?true:false;
angular.module("vdi.webSpice", ["app.localize","app.controllers","vdi"])
.factory('BrowserConnect', ["$resource", "$Domain", function($resource,$Domain){
    return $resource($Domain + "/thor/desktop/connect", null, {
        connect:
            { method: "POST"},
    });
}])
.factory('$$base64encode', function(){
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return function base64encodePwd(str) {  
        var out, i, len;  
        var c1, c2, c3;  
        len = str.length;  
        i = 0;  
        out = "";  
        while(i < len) {  
            c1 = str.charCodeAt(i++) & 0xff;  
            if(i == len)  
            {  
                out += base64EncodeChars.charAt(c1 >> 2);  
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);  
                out += "==";  
                break;  
            }  
            c2 = str.charCodeAt(i++);  
            if(i == len)  
            {  
                out += base64EncodeChars.charAt(c1 >> 2);  
                out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);  
                out += "=";  
                break;  
            }  
            c3 = str.charCodeAt(i++);  
            out += base64EncodeChars.charAt(c1 >> 2);  
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));  
            out += base64EncodeChars.charAt(c3 & 0x3F);  
        }  
        return out;  
    }  
})
.controller("browserSpiceController", ["$scope","$http", "localize", "$$base64encode", function($scope,$http,localize,$$base64encode){
    var it = $scope;
    var iframe=document.getElementById("webSpice");
    iframe.onload=function(){
        //发送CTRL+ALT+DELETE
        $scope.CAD = function(){
            iframe.contentWindow.clientAgent.sendCtrlAltDel();
        }
    }
    //密码错误事件
    jQuery(window).on("passwordError",function(){
        console.log('password invalid tips');
        iframe.contentWindow.location.reload();
    }); 
    //token过期事件
    // jQuery(window).on("tokenError",function(){
    //     //token错误
    //     console.log('token outtime');
    //     iframe.contentWindow.location.reload();
    // });
    //socketClose 断开
    jQuery(window).on("socketClose",function(){
        //socket断开处理
        console.log('socketClose');
        iframe.contentWindow.location.reload();
        jQuery('#noVNC_status').html('socket closed');
    });

    function setIframeParams(host,port,token,password){
        var p = port || 6082;
        iframe.src="js/vdi-spice/vdi-client/index.html?host="+
                    host+"&port="+p+"&token="+
                    token+"&password="+$$base64encode(password);
    }

    $scope.name = $deskName;
    $http({
        method: "post",
        url:"/thor/desktop/connect",
        data: {
            vm_id: $id
        }
    }).then(function(res){
        var url=res.data.result.access_url;
        var a = document.createElement("a");
        a.href = url;
        var password=res.data.result.password;
        var host=a.host.split(':')[0];
        var port = a.port;
        var token=url.split('=')[1];
        setIframeParams(host, port, token, password);
        jQuery('#noVNC_status').html('connecting');
    });
}])
.config(["$httpProvider", function($httpProvider){
    $httpProvider.interceptors.push(function(){
        return {
            request: function(config){
                var base;
                // 忽略绝对路径的请求
                if(/^https?:/i.test(config.url)) {
                    return config;
                }
                // 忽略模板请求
                if(/\.html?$/i.test(config.url)) {
                    return config;
                }
                if(localStorage.dev_host) {
                    base = "//" + localStorage.dev_host;
                } else {
                    base = "//" + location.hostname + ":8081";
                }
                // TODO: handle relative url
                config.url = base + config.url;
                return config;
            }
        };
    });
}])
.run(['localize',function(localize) {
    localize.setLang();
}]);