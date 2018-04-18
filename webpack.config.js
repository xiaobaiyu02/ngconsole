var webpack = require("webpack");
var Mock = require("mockjs");
var helper = require("./buildHelper");
var path = require("path");
var fs = require("fs");

var indexEntry = [
	"./js/ng/ng.app.js",
	"./js/vdi/config.js",
	"./js/ng/ng.controllers.js",
	"./js/ng/ng.directives.js",
	"./js/vdi/vdi.js",
	"./js/vdi/auth/controllers.js",
	"./js/vdi/summary/controllers.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/terminal/controller.schoolroom.js",
	"./js/vdi/terminal/controller.terminal.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/resource/controllers.js",
	"./js/vdi/resource/storage/controllers.js",
	"./js/vdi/resource/console/controllers.js",
	"./js/vdi/resource/pool/controllers.js",
	"./js/vdi/network/controllers.js",
	"./js/vdi/network/manageNetwork/controllers.js",
	"./js/vdi/network/virtualSwitch/controllers.js",
	"./js/vdi/network/dataNetwork/controllers.js",
	"./js/vdi/network/dhcp/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/monitor/controllers.js",
	"./js/vdi/scheduler/controllers.js",
	"./js/vdi/plan/controllers.js",
	"./js/vdi/HA/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/about/controllers.js",

	"./views/view-bundles.js"
];

var initEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/init.js"
];
var splitEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/split.js"
];
var webloginEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./personal_login/js/webLogin.js"
];

var webloginSpiceEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./personal_login/js/webLoginSpice.js"
]

var spiceModifyEntry=[
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/spiceModify.page.js"
];


var spiceModifybtEntry=[
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/modify.page.js",
	"./js/vdi/template/spiceModify.bt.page.js"
];

var spiceModifyRdpEntry=[
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/spiceModifyRdp.page.js"
];

var spiceModifybtRdpEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.app.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/spiceModifyRdp.bt.page.js"
];

var templateModifyEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/modify.page.js"
];

var templateModifybtEntry = [
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/modify.bt.page.js"
];

var templateModifyRdpEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/modifyRdp.page.js"
];

var templateModifybtRdpEntry = [
	"./js/vdi/config.js",
	"./js/ng/ng.app.js",
	"./js/ng/ng.directives.js",
	"./js/ng/ng.controllers.js",
	"./js/vdi/vdi.js",
	"./js/vdi/desktop/controllers.js",
	"./js/vdi/system/controllers.js",
	"./js/vdi/user/controllers.js",
	"./js/vdi/template/controllers.js",
	"./js/vdi/template/controller.teach.js",
	"./js/vdi/template/controller.person.js",
	"./js/vdi/template/controller.hardware.js",
	"./js/vdi/template/modifyRdp.bt.page.js"
];

var defaultEntries = {
	index: indexEntry,
	init: initEntry,
	split: splitEntry,
	templateModify: templateModifyEntry,
	templateModifybt: templateModifybtEntry,
	templateModifyRdp: templateModifyRdpEntry,
	templateModifybtRdp: templateModifybtRdpEntry,
	weblogin: webloginEntry,
	webLoginSpice:webloginSpiceEntry,
	spiceModify:spiceModifyEntry,
	spiceModifybt:spiceModifybtEntry,
	spiceModifyRdp:spiceModifyRdpEntry,
	spiceModifybtRdp:spiceModifybtRdpEntry
};

var entries;

if(process.env.NODE_ENV === "production") {
	entries = defaultEntries;
} else {
	var keys = process.env.NGCONSOLE_MODULES;
	if(typeof keys === "string") {
		keys = keys.split(" ");
	} else {
		keys = [];
	}
	if(keys.length === 0) {
		entries = defaultEntries;
	} else if(keys.length === 1) {
		if(keys[0] === "all" || keys[0] === "*") {
			entries = defaultEntries;
		}
	}
	if(!entries) {
		entries = {};
		keys.forEach(function(k){
			if(defaultEntries.hasOwnProperty(k)) {
				entries[k] = defaultEntries[k];
			} else {
				throw new Error("can't resolve ngconsole module: " + k);
			}
		});
	}
}

module.exports = {
	entry: entries,
	output: {
		path: __dirname + "/built/",
		publicPath: "/devbuild/",
		filename: '[name].js',
		chunkFilename: "[id].js",
		sourceMapFilename: "[name].map"
	},
	stats: "minimal",
	devtool: "#source-map",
	devServer: {
		host: "0.0.0.0",
		disableHostCheck: true,
		before (app) {
			// 重定向资源文件到 ngconsole_resources
			app.get(/^\/resources\/pkg\/([a-zA-Z0-9\-]+)\/(lang|code|images)\.js$/, function(req, resp){
				let file = path.join(process.cwd(), "../ngconsole_resources" + req.url);
				resp.setHeader("Use-File", file);
				resp.setHeader("Content-Type", "application/json");
				fs.createReadStream(file).pipe(resp);
			});
			// 开发时动态修改 js/env.js，并注入合适的代码
			app.get("/js/env.js", function(req, resp){
				var code = fs.readFileSync("js/env.js", "utf-8");
				code += "\nwindow.vdiEnvironment = 'development';\n";
				resp.setHeader("Content-Type", "application/javascript");
				resp.end(code.replace("/built/", "/devbuild/"));
			});
			app.get("/built/weblogin.js", function(req, resp){
				resp.redirect("/devbuild/weblogin.js");
			});
			app.get("/personal_login/", function(req, resp){
				var file = path.join(__dirname, req.url, "index.html");
				var code = fs.readFileSync(file, "utf-8");
				resp.status(200).set("Content-Type", "text/html");
				resp.end(code.replace("</head>", "<script>window.vdiEnvironment = \"development\";</script></head>"));
			});
			app.get("/js/all.bundle.js", function(req, resp){
				helper.handleAllBundleRequest(req, resp);
			});
		},
		after (app){
			// serve mock data
			app.all("*", function(req, resp, next){
				var pathname = req.path;
				if(pathname.endsWith('/')) {
					pathname = pathname.substring(0, pathname.length - 1);
				}
				var realpathname = path.join(__dirname, "./.data", pathname);
				var dirname = path.dirname(realpathname);
				var filename = path.basename(realpathname) + ".json";
				var localpath = [
					dirname + "/" + req.method.toLowerCase() + "-" + filename,
					dirname + "/" + filename
				].filter(function(pathstr){
					return fs.existsSync(pathstr);
				})[0];
				if(localpath) {
					if(fs.lstatSync(localpath).isDirectory()) {
						resp.status(404).end("unexpected directory:", localpath);
					} else {
						try {
							resp.set("Content-Type", "application/json");
							let text = fs.readFileSync(localpath, "utf-8");
							let obj = JSON.parse(text);
							resp.json(Mock.mock(obj));
						} catch(e) {
							resp.status(500).end(e.message);
						}
					}
				} else {
					next();
				}
			});
		}
	},
	module: {
		rules: [{
			test: path.resolve("./views/view-bundles.js"),
			use: "val-loader"
		}, {
			test: /\.js$/i,
			use: "babel-loader"
		}]
	},
	plugins: []
};
