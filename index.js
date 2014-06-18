var events = require('events');

var request = require('request');
var fs = require('fs');
var FormData = require('form-data');
var jquery = require('jquery');
var utils = require('./utils');
var env = require('jsdom').env;

var baseUrl, domain, protocal;
var emitter = new events.EventEmitter();
module.exports = {
	run: run,

	getBaseUrl: function (){return baseUrl;},
	getDomain: function (){return domain;},
	getProtocal: function (){return protocal;},

	emitter: emitter,

	parseHref: parseHref
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

function defaultParseFn($){
	return $("html").html();
}
function defaultResultFn(data){
	console.log(data);
}

function run(config){
	var crawler = this;
	if(!config || !config.hasOwnProperty("html")){
		console.error("config error");
		return;
	}
	var parseFn, resultFn, finishEvent;
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
    //    console.warn(errors);
    var domenv={};
    var $ = jquery(window);

    var data = parseFn($);
//		console.log("begin");
    resultFn(data);
//		console.log("finish");
		var href = null;
		if(config.nextFn)
			href = config.nextFn($);

//		console.log(href);
		if(config.finishEvent)
			emitter.emit(config.finishEvent, href);
  });		
	
}

