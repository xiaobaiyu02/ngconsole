var $hashstr = location.hash.substr(1) || "";
var $hash = $hashstr.replace(/^\/+/, "").split("&");
var $id = parseInt($hash[0].split('=')[1])
var $is_windows = $hash[1] && $hash[1].indexOf('Windows') > -1;
var $instance_id;
var $name = $hash[2]?decodeURIComponent($hash[2].split('=')[1]):'';
var $is_personalTemp = $hashstr.indexOf('personal')>=0?true:false;
var $is_systemTemp = $hashstr.indexOf('sytem_desktop')>=0?true:false;
angular.module("vdi.rdp", [
    "app.controllers",
    "app.localize",
    "ngResource",
    "ui.bootstrap",
    "vdi",
    "vdi.desktop",
    "vdi.template",
    "vdi.template.teach",
    "vdi.template.person",
    "vdi.template.hardware",
    "vdi.system",
    "vdi.user"
])
.config(["$locationProvider", function($locationProvider){
    $locationProvider.html5Mode(true);
}])
.controller("updateTemplateController", ["$scope", "$modalInstance","SystemISO", function($scope, $modalInstance, isos){
    $scope.isos = [];
    isos.get(function(data){
        $scope.isos = data.isos;
    })

    $scope.ok = function(){
        $modalInstance.close();
    };
    $scope.close = function(){
        $modalInstance.close();
    };
    
}])

.controller("rdpController", [
    "$scope", "VMCommon", "VNC", "TeachTemplate", "PersonTemplate", "SystemISO", "Admin", "PersonDesktop", "$modal", "$timeout", "Scene", "$$$os_types", "UserRole", "$$$I18N",
    function($scope, vm, vnc, template, personTemplate, iso, admin, desktop, $modal, $timeout, scen, $$$os_types, UserRole, $$$I18N){
                var wsBase = "";
                var RIMtablet = navigator.appVersion && (-1 != navigator.appVersion.indexOf('RIM Tablet'));
                var mhx = 100;
                var mhy = 100;
                var dragX = 0;
                var dragY = 0;
                var inDrag = false;
                var rdp = null;
                var vkbd = null;
                var embedded = false;
                var hostBase = '';
                var button = '';

                var externalConnection = false;

                function initBody(){
                    //apply old settings
                    settingsApply();
                    initPopUpDeck();
                }


                //pop up message procedure
                var popUpDeck = null;
                var popUpElements = [];

                function initPopUpDeck(){
                    popUpDeck = document.createElement('div');
                    document.body.appendChild(popUpDeck);

                    popUpDeck.set('class', 'popupwrapper');
                }

                function cleanPopUpDeck(){
                    for(var i=0; i<popUpElements.length; i++){
                        popUpElements[i].removeEvents();
                        popUpElements[i].destroy();
                    }
                }

                function popUpMessage(type, msg, timeout, callback, center){
                    var newMessage = document.createElement('div');
                    popUpDeck.appendChild(newMessage);

                    newMessage.set('class', 'popupmessage');
                    newMessage.set('text', msg);
                    newMessage.addEvent('mousedown',
                        function(){
                            if(callback)
                                callback();
                            newMessage.destroy();
                            newMessage = null;
                        });

                    var color = {
                        r: 255,
                        g: 255,
                        b: 255
                    };

                    if(type=='error'){
                        color.r = 247;
                        color.g = 203;
                        color.b = 30;
                    }else
                    if(type=='message'){
                        color.r = 107;
                        color.g = 180;
                        color.b = 229;
                    }else
                    if(type=='critical'){
                        color.r = 255;
                        color.g = 0;
                        color.b = 0;
                    }

                    if(center){
                        newMessage.setStyle('position','absolute');
                        newMessage.setStyle('top', document.body.offsetHeight/2);
                        newMessage.setStyle('z-index', '1235');
                    }
                    newMessage.setStyle('background-color','rgba(' + color.r
                                                             + ',' + color.g
                                                             + ',' + color.b
                                                             + ', 0.8)' );

                    if(timeout){
                        window.setTimeout(
                            function(){
                                if(newMessage){
                                    if(callback)
                                        callback();
                                    newMessage.destroy();
                                }
                            },
                            timeout*1000);
                    }

                    popUpElements.push(newMessage);

                    return newMessage;
                }

                function noInstancePopUp(){
                    popUpMessage('critical', "This instance seems to be not working. Try to enter the console again.", 0, noInstancePopUp, true);
                }

                function RDPStart(host, uri, title){
                    if(host === undefined){
                        host = hostBase;
                    }
                    if(uri === undefined){
                        uri = wsBase;
                    }
                    if(title === undefined){
                        // title = "FreeRDP WebConnect: connected to " + $('#rdphost')[0].value.trim();
                        title = $$$I18N.get('编辑')
                    }
                    if(!embedded){
                        $('#rdp_status').text('Loading');
                    }
                    rdp = new wsgate.RDP(uri, $('#screen')[0], !RIMtablet, RIMtablet, vkbd, host);
                    rdp.addEvent('tokenTimeout', function(msg) {
                        if(msg){
                            console.log(44444444, msg)
                            template.update(
                                { id: $id },
                                function(res){
                                    $scope.websocket_url = res.rdp.websocket_url;
                                    $scope.rdphost = res.rdp.access_url.slice(0, res.rdp.access_url.indexOf('?')-1);
                                    domready(res.rdp.websocket_url, $scope.rdphost);
                                },
                                function(){
                                }
                            );
                        }
                        });
                    rdp.addEvent('alert', function(msg) {
                        popUpMessage('error', msg, 5);
                        });
                    rdp.addEvent('connected', function() {
                            $('#rdp_status').text('Connected');
                            cleanPopUpDeck();
                            document.title = title;
                            button = $("#rdpconnect")[0];
                            button.removeEvents();
                            window.removeEvent('resize', OnDesktopSize);
                            button.value = 'Disconnect';
                            button.addEvent('click', rdp.Disconnect.bind(rdp));
                            window.addEvent("beforeunload", rdp.Disconnect.bind(rdp));
                            });
                    rdp.addEvent('disconnected', function() {
                            showDialog(true);
                            if(embedded){
                                $('#maindialog')[0].addClass('invisible');
                                noInstancePopUp()
                            }
                            button = $("#rdpconnect")[0];
                            button.removeEvents();
                            button.value = 'Connect';
                            button.addEvent('click', function(){RDPStart(host);});
                            OnDesktopSize();
                            window.addEvent('resize', OnDesktopSize);
                            });
                    rdp.addEvent('mouserelease', ResetRdpMouseFlags);
                    rdp.addEvent('touch2', function() {
                        ShowMouseHelper($('#mousehelper')[0].hasClass('invisible'));
                    });
                    rdp.addEvent('touch3', function() {
                        vkbd.toggle();
                    });
                    rdp.addEvent('touch4', function() {
                        if (confirm('Are you sure you want to disconnect?')) {
                            rdp.Disconnect();
                        }
                    });
                    showDialog(false);
                    rdp.Run();
                }

                function SetRdpMouseFlags() {
                    var mf = {
                        'r': $('#rclick')[0].checked,
                        'm': $('#mclick')[0].checked,
                        'a': $('#aclick')[0].checked,
                        's': $('#sclick')[0].checked,
                        'c': $('#cclick')[0].checked,
                    };
                    rdp.SetArtificialMouseFlags(mf);
                }
                function ResetRdpMouseFlags() {
                    $('#rclick')[0].checked = false;
                    $('#mclick')[0].checked = false;
                    $('#aclick')[0].checked = false;
                    $('#sclick')[0].checked = false;
                    $('#cclick')[0].checked = false;
                    rdp.SetArtificialMouseFlags(null);
                }
                function ShowMouseHelper(show) {
                    var mh = $('#mousehelper')[0];
                    inDrag = false;
                    if (show) {
                        mh.setStyles({'position':'absolute','top':mhy,'left':mhx,'z-index':999});
                        mh.addEvent('mousedown',DragStart);
                        $('#rclick')[0].addEvent('change', SetRdpMouseFlags);
                        $('#mclick')[0].addEvent('change', SetRdpMouseFlags);
                        $('#aclick')[0].addEvent('change', SetRdpMouseFlags);
                        $('#sclick')[0].addEvent('change', SetRdpMouseFlags);
                        $('#cclick')[0].addEvent('change', SetRdpMouseFlags);
                        mh.removeClass('invisible');
                    } else {
                        mh.removeEvents();
                        mh.addClass('invisible');
                        $('#rclick')[0].removeEvents();
                        $('#mclick')[0].removeEvents();
                        $('#aclick')[0].removeEvents();
                        $('#sclick')[0].removeEvents();
                        $('#cclick')[0].removeEvents();
                    }
                }

                function OnDesktopSize() {
                   ResizeCanvas($('#dtsize')[0].value);
                   // DrawLogo();
                }

                function DragStart(evt) {
                    var mh = $('#mousehelper')[0];
                    if (!mh.hasClass('invisible')) {
                        inDrag = true;
                        dragX = evt.page.x;
                        dragY = evt.page.y;
                        window.addEvent('mouseup',DragEnd);
                        window.addEvent('touchmove',DragMove);
                    }
                }
                function DragEnd(evt) {
                    inDrag = false;
                    var mh = $('#mousehelper')[0];
                    window.removeEvent('touchmove',DragMove);
                    window.removeEvent('mouseup',DragEnd);
                }
                function DragMove(evt) {
                    if (inDrag) {
                        var dx = evt.page.x - dragX;
                        var dy = evt.page.y - dragY;
                        dragX = evt.page.x;
                        dragY = evt.page.y;
                        var mh = $('#mousehelper')[0];
                        if (!mh.hasClass('invisible')) {
                            mhx += dx;
                            mhy += dy;
                            mh.setStyles({'top':mhy,'left':mhx});
                        }
                    }
                }

                function DrawLogo() {
                    var logo = new Element('img', {'src': 'empty_on_purpose'});
                    logo.addEvent('load', function() {
                    var scaleWCoeficient = 0.5;
                    var scaleHCoeficient = 0.5;
                                var iw = this.width * scaleWCoeficient;
                                var ih = this.height * scaleHCoeficient;
                                var scale = ($('#screen')[0].height - 20) / ih;
                                $('#screen')[0].getContext('2d').drawImage(this, 10, 10, Math.round(iw * scale), Math.round(ih * scale));
                        }.bind(logo));
                }

                function ResizeCanvas(sz) {
                    var w, h;
                    if (sz == 'auto') {
                        w = window.getCoordinates().width;
                        h = window.getCoordinates().height;
                        if (RIMtablet) {
                            // Toplevel bar not removable
                            h -= 31;
                        }
                        if (w % 2) {
                            w -= 1;
                        }
                    } else {
                        var sza = sz.split('x');
                        var w = sza[0];
                        var h = sza[1];
                    }
                    $('#screen')[0].width = w-50;
                    $('#screen')[0].height = h-50;
                    $('#screen')[0].style["margin"] = "0 auto";
                }

                var sendDisconnect = function() {
                if (confirm('Are you sure you want to disconnect ?')) {
                    rdp.Disconnect();
                    $('#rdp_status').text('Server disconnected');
                }
                }

                var altTabOn = false;
                function altTabEvent(){
                    if(altTabOn){
                        altTabOn = false;
                        rdp.SendKey(2);//alt+tab release
                        $('#alttab')[0].removeClass('extracommandshold');
                    }
                    else{
                        altTabOn = true;
                        rdp.SendKey(1);//alt+tab
                        $('#alttab')[0].addClass('extracommandshold');
                    }
                }

                function showDialog(show) {
                    if (show) {
                        ShowMouseHelper(false);
                        var dlg = $('#maindialog')[0];
                        var x = Math.round((window.getCoordinates().width - dlg.getCoordinates().width) / 2) + 'px';
                        var y = Math.round((window.getCoordinates().height - dlg.getCoordinates().height) / 2) + 'px';
                        $('#rdp_status').text('Server disconnected');
                        $('#rdp_status.loadISO').text('Select package');
                        // DrawLogo();
                        dlg.setStyles({
                                'position': 'absolute',
                                'top': y,
                                'left': x,
                                'z-index': 999
                                }).removeClass('invisible');
                    } else {
                        $('#maindialog')[0].addClass('invisible');
                        $('#ctrlaltdelete')[0].addEvent('click', function(){ rdp.SendKey(0); });
                        $('#alttab')[0].addEvent('click', altTabEvent);
                        $('#disconnect')[0].addEvent('click', sendDisconnect);
                    }
                }

                var RDPCookieKey = "RDPinfoJSON";
                //sets a cookie with the settings inserted in the form
                function settingsSet(){
                    var infoJSON = settingsGetJSON();
                    //remove password
                    infoJSON.pass = "";
                    document.cookie = RDPCookieKey + "=" + JSON.stringify(infoJSON) + "; expires=Fri, 31 Dec 2030 23:59:59 GMT;";
                }
                //change the form fields with respect with the cookie
                function settingsApply(){
                    var cookie = document.cookie;
                    if(cookie){
                        var cookieValues = cookie.split(';');
                        var i = 0;
                        //get the cookie for infoJSON
                        console.log(2222222,cookieValues)
                        while(cookieValues[i] && cookieValues[i].indexOf(RDPCookieKey) == -1){
                            i++;
                        }
                        //get the value of the cookie then parse it to a JSON
                        try{
                            var infoJSON = JSON.parse(cookieValues[i].split('=')[1]);
                            //if we found a JSON we apply the values to the form fields
                            if(infoJSON){
                                $('#rdphost')[0].set('value',infoJSON.host);
                                $('#rdpport')[0].set('value',infoJSON.port);
                                $('#rdppcb')[0].set('value',infoJSON.pcb);
                                $('#rdpuser')[0].set('value',infoJSON.user);
                                $('#nowallp')[0].set('checked', infoJSON.nowallp != 0);
                                $('#nowdrag')[0].set('checked', infoJSON.nowdrag != 0);
                                $('#nomani')[0].set('checked', infoJSON.nomani != 0);
                                $('#notheme')[0].set('checked', infoJSON.notheme != 0);
                                $('#nonla')[0].set('checked', infoJSON.nonla != 0);
                                $('#notls')[0].set('checked', infoJSON.notls != 0);
                            }
                        } catch (e){
                            console.log("Bad JSON format");
                            console.log(e.message);
                        }
                    }
                }
                //gets a JSON with the settings inserted in the form
                function settingsGetJSON(){
                    return {"host"   : $('#rdphost')[0].value.trim()
                           ,"port"   : parseInt($('#rdpport')[0].value.trim())
                           ,"pcb"    : $('#rdppcb')[0].value.trim()
                           ,"user"   : $('#rdpuser')[0].value.trim()
                           ,"pass"   : $('#rdppass')[0].value
                           ,"perf"   : parseInt($('#perf')[0].value.trim())
                           ,"fntlm"  : parseInt($('#fntlm')[0].value.trim())
                           ,"nowallp": parseInt($('#nowallp')[0].checked ? '1' : '0')
                           ,"nowdrag": parseInt($('#nowdrag')[0].checked ? '1' : '0')
                           ,"nomani" : parseInt($('#nomani')[0].checked ? '1' : '0')
                           ,"notheme": parseInt($('#notheme')[0].checked ? '1' : '0')
                           ,"nonla"  : parseInt($('#nonla')[0].checked ? '1' : '0')
                           ,"notls"  : parseInt($('#notls')[0].checked ? '1' : '0')
                           ,"dtsize" : $('#screen')[0].width + 'x' + $('#screen')[0].height
                           };
                }

                window.addEventListener("beforeunload", function() {
                    if ($('#maindialog')[0].hasClass('invisible')){
                        var ans = confirm("Are you sure you want to disconnect?");
                        if (ans) {
                            rdp.Disconnect();
                        }
                    }
                }, false);
                function domready(wsUrl, host){
                    wsBase = wsUrl;
                    hostBase = host;
                    // var querystring = window.location.href.slice(window.location.href.indexOf('?'))

                    $('#dtsize')[0].addEvent('change', OnDesktopSize);
                    // var tabs = new SimpleTabs('rdpdialog',{selector:'h4'});
                    OnDesktopSize();
                    if (RIMtablet) {
                        // Set default performance flags to modem
                        $('#perf')[0].value = '2';
                    }
                    window.addEvent('resize', OnDesktopSize);
                    // Special handling of webkit nightly builds
                    var webkitOK = false;
                    var wkVA = RegExp("( AppleWebKit/)([^ ]+)").exec(navigator.userAgent);
                    if (wkVA && (wkVA.length > 2)) {
                        if (wkVA[2].indexOf('+') != -1) {
                            webkitOK = true;
                        }
                    }
                    var wsOK = RIMtablet || webkitOK ||
                        (Browser.firefox && (Browser.version >= 11.0)) ||
                        (Browser.chrome && (Browser.version >= 17)) ||
                        (Browser.safari && (Browser.version >= 6)) ||
                        (Browser.ie && (Browser.version >= 10.0));
                    if(externalConnection == true)
                    {
                        RDPStart(host);
                        vkbd = new wsgate.vkbd({
                            version:false,
                            sizeswitch:false,
                            numpadtoggle:false,
                            domain: host
                        });
                    }
                    if (wsOK) {
                        RDPStart(host);
                        vkbd = new wsgate.vkbd({
                            version:false,
                            sizeswitch:false,
                            numpadtoggle:false,
                            domain: host
                        });
                    } else {
                        alert('Sorry!\nYour Browser (' + Browser.name + ' ' + Browser.version
                                + ') does not yet\nprovide the required HTML5 features '
                                + 'for this application.\n');
                    }
                }
                initBody();


    $scope.instance_id = "";
    $scope.os_type = "";
    $scope.is_template = false;
    $scope.installed = false;
    $scope.is_windows = $is_windows;
    $scope.is_personalTemp = $is_personalTemp;
    $scope.instance_count = 0;
    $scope.virtual_type = '';
    $scope.name = $name;
    
    function getStatus(){
        $timeout(function(){
            personTemplate.status({ id: $id }, function(res){
                $scope.installed = (res.status === "installed" || res.status === "alive") ? true : false;
                getStatus();
            }, function(){
            });
        }, 3000);
    }

    var flag = false;
    var oldBigBox = $.bigBox;
    $.bigBox = null;
    function checkLoad(){
        $timeout(function(){
            if(!flag){
                template.update(
                    { id: $id },
                    function(res){
                        flag = true;
                        $scope.is_template = res.is_template;
                        $scope.instance_id = res.instance_id;
                        $scope.os_type = res.os_type;
                        $instance_id =  res.instance_id;
                        $scope.image_name = res.image_name;
                        $scope.instance_count = res.instance_count;
                        $scope.websocket_url = res.rdp.websocket_url;
                        $scope.rdphost = res.rdp.access_url.slice(0, res.rdp.access_url.indexOf('?')-1);
                        $scope.virtual_type = res.virtual_type;
                        getStatus();
                        $.bigBox = oldBigBox;
                        domready(res.rdp.websocket_url, $scope.rdphost);
                        
                    },
                    function(){
                        checkLoad();
                    }
                );

            }
        }, 3000);
    }
    checkLoad();


    $scope.status = function(){
        return rdp ? rdp.log.ws : "";
    }

    $scope.start = function(){
        if(!$scope.status()){
            vm.start({instance_ids:[$scope.instance_id]},function(){
                function _loop(){
                    template.get_image_rdp_info({instance_id:$instance_id},function(res){
                        if(res.result.websocket_url){
                            domready(res.result.websocket_url, res.result.access_url.slice(0, res.result.access_url.indexOf('?')-1));
                        }
                        setTimeout(function(){
                            if(!res.result.websocket_url){
                                _loop();
                            }
                        }, 2000);
                    },function(){});
                }
                _loop();
            })
        }
        else{
            alert("System has been in the boot state")
        }
    };
    $scope.shutdown = function(){
        var instance_id = $scope.instance_id;
        if($scope.status()){
            $modal.open({
            template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>"+
                    "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENTMODIFY_SHUT'></p><footer class='text-right'><img data-ng-if='loading' src='../../img/building.gif' width='24px'><button class='btn btn-primary' data-ng-if='!loading' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-if='!loading' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                controller : function($scope, $modalInstance){
                    $scope.ok = function(){
                        $scope.loading = true;
                        vm.shutdowns(
                            {instance_ids:[instance_id]},
                            function(){
                                $scope.loading = false;
                                $modalInstance.close();
                            },
                            function(){ $scope.loading = false; alert("shutdown error") }
                        );
                    },
                    $scope.close = function(){
                        $modalInstance.close();
                    }
                },
                size : "sm"
            });
        }
        else{
            alert("System has been in the under off state")
        }
    };
    $scope.CAD = function(){
        rdp.SendKey(0);
        return false;
    };
    $scope.updateTemplate = function(){
        var instance_id = $scope.instance_id;
        var image_name = $scope.image_name;
        var is_personalTemp = $scope.is_personalTemp;
        var instance_count = $scope.instance_count;
        /*4.5.0添加模板更新提示*/
        var is_update = false;
        template.update_tpl_tip(function(res){
            var resp = res.result;
            if(resp.storage_type!=="remote" && resp.ha_mode==="active_passive"){
                is_update = true;
            }
        })
        if(is_update){
            $.bigBox({
                title: $$$I18N.get("INFOR_TIP"),
                content:$$$I18N.get("HA_MODE_REMOTE"),
                timeout:6000
            });
            return false; 
        }
        if($scope.is_template){
            $modal.open({
                templateUrl: "views/vdi/dialog/template/template_update.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
                    $scope.hasSchool = false;
                    $scope.is_personalTemp = is_personalTemp;
                    $scope.instance_count = instance_count;
                    if($scope.is_personalTemp){
                        desktop.update_instance({id: $id},function(res){
                            $scope.instance = res.values;
                        })
                    }else{
                        scen.query(function(res){
                            var schools = [];$scope.schools=[];
                            res.modes.filter(function(item){
                                if(item.image_name === image_name)
                                    return item;
                            }).forEach(function(item){
                                if(!schools[item.schoolroom]){
                                    schools[item.schoolroom] = {name: item.schoolroom, modes: [item]};
                                    $scope.schools.push({name: item.schoolroom, modes: [item]});
                                }
                                else{
                                    schools[item.schoolroom].modes.push(item);
                                    $scope.schools.forEach(function(sch){
                                        if(sch.name == item.schoolroom){
                                            sch.modes.push(item);
                                        }
                                    })
                                }
                            });
                            if($scope.schools.length){ $scope.hasSchool = true; }
                        })
                    }
                    $scope.ok = function(){
                        $scope.loading = true;
                        vnc.save({
                            instance_id: instance_id,
                            image_id: $id
                        }, function(){
                            $scope.loading = false;
                            $('#rdp_status').text('Update directive has been sent');
                            rdp.Disconnect();
                            $modalInstance.close();
                            window.close();
                        }, function(){
                            $scope.loading = false;
                            rdp.Disconnect();
                            $modalInstance.close();
                            $('#rdp_status').text('Update failed');
                            // window.close();
                        });
                    };
                    $scope.close = function(){
                        $modalInstance.close();
                    };
                } ]
            });

        }
        else{
            $scope.saveTem_loading = true;
            var p_scope = $scope;
            vnc.save({
                instance_id: p_scope.instance_id,
                image_id: $id
            }, function(res){
                rdp.Disconnect();
                window.close();
            },function(){ $scope.saveTem_loading = false; });
            // $modal.open({
            //     templateUrl: "views/vdi/dialog/desktop/personal_save_template.html",
            //     size: "md",
            //     controller: ["$scope", "$modalInstance", "UserRole", function($scope, $modalInstance, UserRole){
            //         let user = UserRole.currentUser;
            //         $scope.min_namelength=2;
            //         $scope.max_namelength=20;
            //         $scope.saveTemp = true;
            //         if(user){
            //             var userName = user.name || "admin";
            //         }
            //         admin.query(function(res){
            //             $scope.owners = res.users;
            //             $scope.owner = $scope.owners.filter(function(item){ return item.name === userName })[0];
            //         });
            //         $scope.classifys = $$$os_types;
            //         $scope.classify = $scope.classifys[0];

            //         $scope.selectTemplate = function(item){
            //             $scope.template = item;
            //         };
            //         $scope.ok = function(){
            //             var aa = {
            //                     instance_id: p_scope.instance_id,
            //                     image_id: $id
            //                 }
            //                 vnc.save({
            //                     instance_id: p_scope.instance_id,
            //                     image_id: $id
            //                 }, function(res){
            //                     //console.log(124124);
            //                     $modalInstance.close();
            //                 });
            //         };
            //         $scope.close = function(){
            //             location.reload();
            //             $modalInstance.close();
            //             init_params(it.passwd, it.instance_id);
            //         };
            //     } ]
            // });
        }
    };
    $scope.loadISO = function(){
        $('#rdp_status').addClass('loadISO');
        var virtual_type = $scope.virtual_type;
        rdp && rdp.Disconnect();
        $modal.open({
            templateUrl: "/select-iso.html",
            controller: function($scope, $modalInstance){
                $scope.isos = [];
                iso.get(function(data){
                    // console.log(data);
                    $scope.isos = data.isos;
                    $scope.selectIsos = {
                        'package': [],
                        'other': [],
                        'system': []
                    };
                    $scope.isos_package = data.isos.filter(function(item){
                        return item.type == 'package';
                    });
                    angular.forEach(data.isos,function(item){
                        if(item['type'] == 'package'){
                            $scope.selectIsos['package'].push(item);
                        }else if(item['type'] == 'other'){
                            $scope.selectIsos['other'].push(item);
                        }else{
                            $scope.selectIsos['system'].push(item);
                        }
                    });
                });

                $scope.ok = function(iso){
                    $('#rdp_status').removeClass('loadISO');
                    /*  thor/image/loadISO post instance_id iso_name */
                    console.log($scope, iso);

                    vnc.loadISO({
                        instance_id: $instance_id,
                        id: iso ? iso.id : "-1",
                        virtual_type: virtual_type
                    }, function(){
                        rdp && RDPStart();
                        $modalInstance.close();
                    }, function(err){
                        rdp && RDPStart();
                        //alert(err);
                    });

                };
                $scope.close = function(){
                    $('#rdp_status').removeClass('loadISO');
                    $modalInstance.close();
                    rdp && RDPStart();
                };
            },
            // controller: "isoListController",
            size: "md"
        });
    };

}])
.run(["$rootScope", "settings", "localize", function($rootScope, settings, localize){
    var lang_code = $$$storage.getSessionStorage('lang_code');
    settings.currentLang = settings.languages.filter(function(lang){
        return lang.langCode === lang_code;
    })[0] || settings.languages[0]; // zh_cn
    //console.log(settings.currentLang, settings, localize);
    localize.setLang(settings.currentLang);
}]);

;