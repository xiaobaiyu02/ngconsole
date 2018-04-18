window.$$$storage = {
    getSessionStorage: function(key){
        return sessionStorage.getItem('vdi_'+ key);
    },
    setSessionStorage: function(key, value){
        sessionStorage.setItem('vdi_'+ key, value);
    },
    clearSessionStorage: function(){
        sessionStorage.clear()
    }
}
window.$BootScript = function(name){
	var el = document.createElement("script");
	el.type = "text/javascript";
	el.src = "/built/" + name + ".js";
	document.head.appendChild(el);
};