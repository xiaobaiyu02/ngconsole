"use strict";
const pathIsAbsolute = require("path-is-absolute");
const loaderUtils = require("loader-utils");
const htmlMinifier = require("html-minifier");
const cheerio = require("cheerio");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

const cwd = process.cwd() + "/";


module.exports = function (source) {
    let options = loaderUtils.getOptions(this) || {};
    let callback = this.async();
    let files = parseTemplate(source, this.context);

    Promise.all(files.map((file) => transform(file, options))).then((contents) => {
        let output = [`// vdi templates
let ng;
try {
    ng = angular.module("ng");
} catch(e) {
    ng = angular.module("ng", []);
}
ng.run(["$templateCache", function(c){
    `];
        let cache = {};
        files.forEach((f, i) => {
            cache[f.replace(cwd, '')] = contents[i];
        });
        output.push('let views = ');
        output.push(JSON.stringify(cache));
        output.push(';');
        output.push(`Object.keys(views).forEach(function(key){ c.put(key, views[key]); });`);
        output.push('}]);');
        callback(null, output.join(''));
    }).catch(callback);
    files.forEach((file) => this.addDependency(file));
    this.cacheable && this.cacheable();
};

function transform(file, options) {
    let p = new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (e, result) => {
            if(e) {
                reject(e);
            } else {
                resolve(result);
            }
        });
    });
    return p.then((content) => {
        // if arg lang_js is not set, just return
        if(!options.lang_js) {
            return content;
        }
        // wrap to one root
        let id = 'temp-' + (Math.random() + '').substring(2);
        let $ = cheerio.load(`<div id="${id}">${content}</div>`);
        $('[localize], [data-localize]').each((i, el) => {
            let $el = $(el);
            // ignore localize with params
            if($el.attr("param1") || $el.attr("data-param1")) {
                return;
            }
            let key = $el.attr("localize") || $el.attr("data-localize");
            let value = translate(key, options.lang_js);
            if(value === null) { return; }
            $el.removeAttr("localize");
            $el.removeAttr("data-localize");
            if($el.is("input, textarea")) {
                $el.attr("placeholder", value);
            } else {
                $el.html(value);
            }
        });
        $('[localize-title], [data-localize-title]').each((i, el) => {
            let $el = $(el);
            let key = $el.attr("localize-title") || $el.attr("data-localize-title");
            let value = translate(key, options.lang_js);
            if(value === null) { return; }
            $el.removeAttr("localize-title");
            $el.removeAttr("data-localize-title");
            $el.attr("title", value);
        });
        $('[localize-placeholder], [data-localize-placeholder]').each((i, el) => {
            let $el = $(el);
            let key = $el.attr("localize-placeholder") || $el.attr("data-localize-placeholder");
            let value = translate(key, options.lang_js);
            if(value === null) { return; }
            $el.removeAttr("localize-placeholder");
            $el.removeAttr("data-localize-placeholder");
            $el.attr("placeholder", value);
        });
        return $('#' + id).html();
    }).then((content) => {
        try {
            return htmlMinifier.minify(content, {
                removeComments: true,
                collapseWhitespace: true
            });
        } catch(e) {
            console.log(e);
            console.log("fail on file:" + file);
        }
    });
}

function parseTemplate(source, dirname) {
    let lines = source.split("\n");
    let include_files = [];
    let exclude_files = [];
    lines.forEach(function (line) {
        line = line.trim();
        let file = line.substring(1).trim();
        // ignore empty lines
        if(file.length === 0) {
            return;
        }
        if(!pathIsAbsolute(file)) {
            file = path.join(dirname, file);
        }
        switch(line.charAt(0)) {
            case '+':
                include_files = include_files.concat(glob.sync(file));
                break;
            case '-':
                exclude_files = exclude_files.concat(glob.sync(file));
                break;
            case '#':
                // this is comment, ignore
                break;
            default:
                throw new Error("unexpected line: " + line);
        }
    });
    // remove exclude files
    while(exclude_files.length > 0) {
        let file = exclude_files.pop();
        let index = include_files.indexOf(file);
        if(index > -1) {
            include_files.splice(index, 1);
        }
    }
    return include_files;
}

let resourceCache = null;

function translate(key, lang_js) {
    if(!resourceCache) {
        if(lang_js && !pathIsAbsolute(lang_js)) {
            lang_js = path.join(cwd, lang_js);
        }
        try {
            let data = fs.readFileSync(lang_js, "utf-8");
            resourceCache = JSON.parse(data);
        } catch(e) {
            // ignore
        }
    }
    return resourceCache && resourceCache.hasOwnProperty(key) ? resourceCache[key] : null;
}
