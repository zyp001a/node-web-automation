var events = require('events');

var request = require('request');
var fs = require('fs');
var mkdirp = require("mkdirp");
var path = require('path');
var FormData = require('form-data');
var jquery = require('jquery');
var utils = require('./utils');
var env = require('jsdom').env;

var baseUrl, domain, protocal;
var emitter = new events.EventEmitter();
var dumpDir = "./dump";
module.exports = {
	nav: nav,

	getBaseUrl: function (){return baseUrl;},
	getDomain: function (){return domain;},
	getProtocal: function (){return protocal;},

	emitter: emitter,
	
	dumpDir: dumpDir,

	parseHref: parseHref,
	dumpEvent: dumpEvent,
	removeDumpEvent: removeDumpEvent,
	writeDumpEvent: writeDumpEvent,
	readEvent: readEvent,
	utils: utils,
	
	enableDumpEvent: true,
	forceRemote: false
};

function parseHref(href){
	var baseUrl = this.getBaseUrl();
	if(/^http|https|ftp:\/\/[^\/]+/.test(href))
    return href;
  else if(/^\/\//.test(href))
		return "http:" + href;
  else if(/^\//.test(href))
		return this.getDomain() + href;
	else if(/\/$/.test(baseUrl))
		return baseUrl + href;
	else
		return this.getDomain() + "/" + href;
}

function defaultParseFn($, window, fn){
	fn($("html").html());
}
function defaultResultFn(data, fn){
	console.log(data);
	fn();
}
function removeDumpEvent(event){
	var tarFile = this.dumpDir + "/" +event;
	fs.unlinkSync(tarFile);
}
function writeDumpEvent(event){
	var tarFile = this.dumpDir + "/" +event;
	fs.writeFileSync(tarFile, "test");
}
function dumpEvent(event, href){
	var tarFile = this.dumpDir + "/" +event;
	mkdirp.sync(path.dirname(tarFile));
	fs.writeFileSync(tarFile, href.toString());
}
function readEvent(event){
	var tarFile = this.dumpDir + "/" +event;
	if(fs.existsSync(tarFile)){
		var str = fs.readFileSync(tarFile);
		try {
			var json = JSON.parse(str);
			return json;
		} catch (e) {
			return str;
		}
	}
	else{
		return null;
	}
}
function wait(event, fn){
	var href = readEvent(event);
	if(href)
		fn(href);
	else
		this.emitter.on(event, fn);
}
function nav(config){
	var crawler = this;
	var localHref;
	if(!crawler.forceRemote){
		localHref = crawler.readEvent(config.event);
	}
//if forceRemote or not dump stored
	if(crawler.forceRemote || !localHref){

		if(!config || !config.hasOwnProperty("html")){
			console.error("config error");
			return;
		}
		var parseFn, resultFn, event;
		if(config.parseFn)
			parseFn = config.parseFn;
		else
			parseFn = defaultParseFn;
		if(config.resultFn)
			resultFn = config.resultFn;
		else
			resultFn = defaultResultFn;

		var arr = /^(((http|https|ftp):\/\/[^\/]+)\S+(?:[^\/]+)?)$/.exec(config.html);
		//	console.log(arr);
		if(arr != null){
			if(arr[1]) baseUrl = arr[1];
			if(arr[2]) domain = arr[2];
			if(arr[3]) protocal = arr[3];
		}
		env(config.html, function (errors, window) {
			var domenv = {};
			var $ = jquery(window);

			parseFn($, window, function(data){
				resultFn(data, function(){
					var href = null;
					if(config.nextFn)
						href = config.nextFn($, window);
					if(config.event){
						if(crawler.enableDumpEvent)
							crawler.dumpEvent(config.event, href);
						crawler.emitter.emit(config.event, href, true);
					}
				});
			});
		});		
	}
	else{
		crawler.emitter.emit(config.event, localHref, false);
	}
	
}

