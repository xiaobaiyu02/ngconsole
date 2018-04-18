var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2]?decodeURIComponent($hash[2]):'';
var $pname=$hash[3]?decodeURIComponent($hash[3]).split(';')[1]:'';
var $deskName=$pname || decodeURIComponent(location.hash).split('&')[3];
var $is_personalTemp = $hash[3]=="personal"?true:false;
angular.module("vdi.vnc", [])
.factory('BrowserConnect', ["$resource", "$Domain", function($resource,$Domain){
    return $resource($Domain + "/thor/desktop/connect", null, {
        connect:
            { method: "POST"},
    });
}])
.controller("browserVncController", ["$scope","$http",function($scope,$http){
    var rfb;
    var it = $scope;
    function passwordRequired(rfb) {
        var msg;
        msg = '<form onsubmit="return setPassword();"';
        msg += '  style="margin-bottom: 0px">';
        msg += 'Password Required: ';
        msg += '<input type=password size=10 id="password_input" class="noVNC_status">';
        msg += '<\/form>';
        $D('noVNC_status_bar').setAttribute("class", "noVNC_status_warn");
        $D('noVNC_status').innerHTML = msg;
    }
    function setPassword() {
        rfb.sendPassword($D('password_input').value);
        return false;
    }
    function sendCtrlAltDel() {
        rfb.sendCtrlAltDel();
        return false;
    }
    function init_params(password, instance_id, vnc_host, vnc_token){
        var host, port, password, path, token;
        host = WebUtil.getQueryVar('host', vnc_host); // vnc_host
        port = WebUtil.getQueryVar('port', 6080);
        password = WebUtil.getQueryVar('password', password);
        //path = WebUtil.getQueryVar('path', 'websockify?instance_id=' + instance_id);
        token = WebUtil.getQueryVar('token', null);
        if (token) {
           WebUtil.createCookie('token', token, 1)
        }       
        path = WebUtil.getQueryVar('path', 'websockify?token=' + vnc_token);

        rfb = new RFB({'target':       $D('noVNC_canvas'),
                       'encrypt':      WebUtil.getQueryVar('encrypt',
                                (window.location.protocol === "https:")),
                       'repeaterID':   WebUtil.getQueryVar('repeaterID', ''),
                       'true_color':   WebUtil.getQueryVar('true_color', true),
                       'local_cursor': WebUtil.getQueryVar('cursor', true),
                       'shared':       WebUtil.getQueryVar('shared', false),
                       'view_only':    WebUtil.getQueryVar('view_only', false),
                       'onUpdateState':  updateState,
                       // 'onXvpInit':    xvpInit,
                       'onPasswordRequired':  passwordRequired});
        rfb.connect(host, port, password, path);
    }
    function updateState(rfb, state, oldstate, msg) {
        var s, sb, cad, level,save_as_temp,load_iso;
        s = $D('noVNC_status');
        sb = $D('noVNC_status_bar');
        cad = $D('sendCtrlAltDelButton');
        save_as_temp = $D('save_as_template');
        load_iso = $D('load_iso')
        switch (state) {
            case 'failed':     level = "error";  break;
            case 'fatal':       level = "error";  break;
            case 'normal':     level = "normal"; break;
            case 'disconnected': level = "normal"; break;
            case 'loaded':     level = "normal"; break;
            default:             level = "warn";   break;
        }

        if (typeof(msg) !== 'undefined') {
        //    sb.setAttribute("class", "noVNC_status_" + level);
            s.innerHTML = msg;
        }
    }

    $scope.CAD=function(){
        sendCtrlAltDel();
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
        init_params(password,$id,host,token);
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
}]);