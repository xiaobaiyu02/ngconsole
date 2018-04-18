/**
 * Created by zhangyao on 2017/6/23.
 */
var fs = require("fs");
var crypto = require("crypto");
var gulp = require("gulp");
var gulpConcat = require("gulp-concat");
var through = require("through2");
var bl = require("bl");

var production = process.env.NODE_ENV === "production";

function getLibsBundleStream(){
    var files = fs.readFileSync("jslib.files", "utf-8").split(/\r?\n/);
    files = files.map(function(file){
        var f = file.trim();
        // 忽略空行和以 # 开头的行
        if(f.length === 0 || f.indexOf("#") === 0) {
            return null;
        }
        return f;
    }).filter(function(file){
        return !!file;
    });
    return gulp.src(files).pipe(gulpConcat("libs.bundle.js")).pipe(through.obj(function(file, enc, callback){
        this.push(file.contents);
        callback();
    }, function(callback){
        if(production) {
            this.push('loadScripts("/built/index.js?d=' + getFileMD5("built/index.js") + '");');
	    this.push('\nwindow.vdiEnvironment = "production";');
        } else {
            this.push('loadScripts("/devbuild/index.js");');
	    this.push('\nwindow.vdiEnvironment = "development";');
        }
        callback();
    }));
};

exports.getLibsBundleStream = getLibsBundleStream;

exports.handleAllBundleRequest = (function(){
    var bundleCache = null;
    getLibsBundleStream().pipe(bl(function(err, data){
        if(err) {
            throw err;
        }
        bundleCache = data;
    }));

    return function(req, resp){
        resp.setHeader("Content-Type", "application/json");
        resp.end(bundleCache);
    };
})();

function getFileMD5(file) {
    var hash = crypto.createHash("md5");
    hash.update(fs.readFileSync(file));
    return hash.digest("hex");
}
