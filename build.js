"use strict";
let argv = require("yargs")
.usage("Usage: $0 [options]")
.option('no-client', {
	type: "boolean",
	describe: "do not build client",
	default: false
}).option("no-ngconsole", {
	type: "boolean",
	describe: "do not build ngconsole",
	default: false
}).help().argv;

let fs = require("fs-extra");
let path = require("path");
let debug = require("debug")("ngconsole:build");
let moment = require('moment');
let Promise = require("bluebird");
let child_process = require("child_process");


// 强制设置为 production
process.env.NODE_ENV = "production";
// 强制启用
debug.enabled = true;

// 设置环境变量后引入
let helper = require("./buildHelper");

let clientRoot = path.join(__dirname, "../ngconsole_resources");
let resourceRoot = path.join(clientRoot, "resources");
let publicClients = ["classCh", "classEn", "e-vdi", "pc"];

debug("start build ngconsole");
syncResource();
buildNgconsole().then(isClientCommited).catch(function(error){
	debug(error);
});

function buildNgconsole() {
	if(argv["no-ngconsole"] !== false) {
		return Promise.resolve();
	}
	
	// 创建目录
	fs.mkdirs("./built");
	fs.mkdirs("./zips");
	fs.mkdirs("./resources/pkg");
	let webpackBin = path.join(__dirname, "node_modules/webpack/bin/webpack.js");
	let proc = child_process.fork(webpackBin, {silent: true, cwd: __dirname});
	return waitExit(proc).then(function(){
		var indexhtml = path.join(__dirname, "index.html");
		var content = fs.readFileSync(indexhtml, "utf-8");
		var versionRe = /js\/all\.bundle\.js(\?d=\d+)?/;
		if(versionRe.test(content)) {
			content = content.replace(versionRe, "js/all.bundle.js?d=" + Date.now());
			fs.writeFileSync(indexhtml, content);
		}
	}).then(function(){
		// 生成此文件需要 built/index.js
		helper.getLibsBundleStream().pipe(fs.createWriteStream("js/all.bundle.js"));
	}).then(function(){
		debug("build ngconsole success!");
	});
}

function buildClient(){
	let oem = getCurrentOEM();
	let clientDir;
	if(argv["no-client"] !== false) {
		return Promise.resolve();
	}
	if(oem === "") {
		clientDir = "public";
	} else {
		clientDir = oem;
	}
    let pkgs = clientDir === "public" ? publicClients : [clientDir];
	let gulpBin = path.join(clientRoot, "node_modules/gulp/bin/gulp.js");
	return Promise.each(pkgs, function(pkg){
        let dir = path.join(clientRoot, "client", clientDir);
        let proc = child_process.fork(gulpBin, [pkg], {cwd: dir, silent: true, execPath: process.execPath});
        debug("build client: " + pkg);
        return waitExit(proc);
	}).then(function(){
    	debug("build all clients success!");
		return Promise.each(pkgs, function(pkg){
			let zipfile = path.join(__dirname, "zips", pkg + ".zip");
			let md5file = path.join(__dirname, "zips", pkg + ".md5");
			return generateMD5(zipfile).then(function(md5){
				fs.writeFileSync(md5file, md5);
			});
		});
	}).then(function(){
		let colWidths = [0, 0];
		let rows = pkgs.map(function(pkg){
			let md5file = path.join(__dirname, "zips", pkg + ".md5");
			let md5 = fs.readFileSync(md5file, "utf-8");
			colWidths[0] = Math.max(colWidths[0], pkg.length);
			colWidths[1] = Math.max(colWidths[1], md5.length);
			return [pkg, md5];
		});
		// 生成 client | md5 表格
		let width = colWidths[0] + colWidths[1] + 7;
		debug("=".repeat(width));
		rows.forEach(function(row){
			debug("| %s | %s |", padRight(row[0], colWidths[0]), padRight(row[1], colWidths[1]));
		});
		debug("=".repeat(width));
	});
}

function syncResource(){
	let oem = getCurrentOEM();
	let pkgs;
	if(oem === "") {
		pkgs = publicClients;
	} else {
		pkgs = [oem];
	}
	let cwd = process.cwd();
	let resourcedir = path.join(__dirname, "resources");
	pkgs.forEach((pkg) => {
		let fromdir = path.join(__dirname, "../ngconsole_resources/resources/pkg/" + pkg);
		let todir = path.join(__dirname, "resources/pkg/" + pkg);
		debug("copy " + path.relative(cwd, fromdir) + " to " + path.relative(cwd, todir));
		fs.copy(fromdir, todir);
	});
	let allInfos = require(path.join(resourceRoot, "info_all.json"));
    allInfos.resources = allInfos.resources.filter(function(item){
		return pkgs.indexOf(item.key) > -1;
	});
	debug("write resources/info.json");
	fs.writeFileSync(path.join(resourcedir, "info.json"), JSON.stringify(allInfos));
	// 某些情况会导致不属于当前分支的包也存在，直接删除
	let pkgdir = path.join(resourcedir, "pkg");
	let uselessfiles = fs.readdirSync(pkgdir).filter(function(dir){
		return pkgs.indexOf(dir) === -1;
	});
	uselessfiles.forEach(function(file){
		let ff = path.join(pkgdir, file);
		debug("remove useless file/directory: " + ff);
		fs.removeSync(ff);
	});
}

function getCurrentOEM(){
	let proc = child_process.spawnSync("git", ["branch"], {cwd: __dirname, encoding: "utf-8"});
	let branches = proc.stdout.split("\n");
	let current;
	branches.forEach((b) => {
		if(/^\* /.test(b)) {
			current = b.replace("* ", "").trim();
		}
	});
	if(!current) {
		throw new Error("can't retrive current branch");
	}
	let parts = current.split("-");
	let oem = parts.pop();
	let isOEM = parts.pop() === "OEM";
	if(isOEM) {
		return oem;
	} else {
		return "";
	}
}

function waitExit(proc) {
	return new Promise(function(resolve, reject){
		proc.on("exit", function(code){
			if(code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
}

function generateMD5(file) {
	return new Promise(function(resolve, reject){
		var md5 = require("crypto").createHash("md5");
		var reader = fs.createReadStream(file);
		reader.on("data", ck => md5.update(ck));
		reader.on("end", () => {
			resolve(md5.digest("hex"));
		});
		reader.on("error", reject);
	});
}

function padRight(str, len, c) {
	let chars = [];
	if(!c) {
		c = " ";
	}
	while(str.length + chars.length < len) {
		chars.push(c);
	}
	return chars.length === 0 ? str : str + chars.join("");
}

function isClientCommited(){
	let oem = getCurrentOEM();
	let pkgs;
	if(oem === "") {
		pkgs = publicClients;
	} else {
		pkgs = [oem];
	}
	var alert = false;
	pkgs.forEach(function(pkg){
		var zipfile = pkg + ".zip";
		var file = path.join(__dirname, "zips", zipfile);
		if(!fs.existsSync(file)) {
			return console.error("客户端包", zipfile, "不存在，请打包！！！");
		}
		var stat = fs.statSync(file);
		var lastModifiedTime = moment(stat.mtime);
		var hours = (Date.now() - lastModifiedTime.toDate()) / (3 * 60 * 60 * 1000);
		console.error("客户端包", zipfile, "最近打包时间：" + lastModifiedTime.fromNow());
		if(hours >= 3) {
			alert = true;
		}
	});
	if(alert) {
		console.log("请务必确认客户端是否已更新！");
		console.log("请务必确认客户端是否已更新！");
		console.log("请务必确认客户端是否已更新！");
	}
}
