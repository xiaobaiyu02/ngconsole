/**
 * 这个文件打包所有的模板文件到一个 js。
 * 除了 vdi/dialog/*
 */
const minifyHtml = require("html-minifier").minify;
const glob = require("glob");
const path = require("path");
const fs = require("fs");

export default function(options){
	let views = {};
	let dependencies = [];
	let includeDir = path.join(__dirname, "../");
	glob.sync("includes/*.html", {cwd: includeDir}).forEach((key) => {
		var file = path.join(includeDir, key);
		views[key] = fs.readFileSync(file, "utf-8");
		dependencies.push(file);
	});
	let viewsDir = path.join(__dirname, "..");
	glob.sync("views/vdi/**/*.html", {
		cwd: viewsDir,
		ignore: "views/vdi/dialog/**/*.html"
	}).forEach((key) => {
		var file = path.join(viewsDir, key);
		views[key] = fs.readFileSync(file, "utf-8");
		dependencies.push(file);
	});
	options = options || {};
	if(options.minify) {
		let minOptions = {
			removeComments: true,
			collapseWhitespace: true,
			keepClosingSlash: true,
			caseSensitive: true
		};
		for(let key of views) {
			views[key] = minifyHtml(views[key], minOptions);
		}
	}
	return {code: `var views = ${JSON.stringify(views)};
	angular.module("ng").run(["$templateCache", function(c){
		Object.keys(views).forEach(function(key){
			c.put(key, views[key]);
		});
	}]);
	module.exports = views;`, dependencies: dependencies, cacheable: true};
}
