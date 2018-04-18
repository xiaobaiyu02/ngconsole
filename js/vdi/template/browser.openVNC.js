var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0]);
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2]?decodeURIComponent($hash[2]):'';
var $is_personalTemp = $hash[3]=="personal"?true:false;
console.log('openVNC123')
angular.module("vdi.vnc", [
    "app.controllers",
    "app.localize",
    "ngResource",
    "ui.bootstrap",
    "vdi"
])
.config(["$locationProvider", function($locationProvider){
    $locationProvider.html5Mode(true);
}])
.controller("browserVncController", [
    "$scope","$http", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "Scene", "$$$os_types", "UserRole",
    function($scope,$http, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, scen, $$$os_types, UserRole){
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
        var s, sb, cad, level;
        s = $D('noVNC_status');
        sb = $D('noVNC_status_bar');
        cad = $D('sendCtrlAltDelButton');
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

    $scope.instance_id = "";
    $scope.os_type = "";
    $scope.is_template = false;
    $scope.installed = false;
    $scope.is_windows = $is_windows;
    $scope.is_personalTemp = $is_personalTemp;
    $scope.instance_count = 0;
    $scope.name = $name;
    var flag = false;
    $http({
        method: "post",
        url: "http://172.16.201.188:8081/thor/desktop/connect",
        data: {
            vm_id: $id
        }
    }).then(function(res){
        var url,passwd,token,host;
        url=res.data.result.access_url;
        passwd=res.data.result.password;
        token=url.split('=')[1];
        init_params(passwd, $id, '172.16.201.21', token);
    })
}])
.run(["$rootScope", "settings", "localize", function($rootScope, settings, localize){
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function(lang){
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);