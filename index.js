var events = require('events');
var request = require('request');
var fs = require('fs');
var mkdirp = require("mkdirp");
var path = require('path');
var FormData = require('form-data');
var jquery = require('jquery');
var utils = require('./utils');
var env = require('jsdom').env;
var uuid = require('node-uuid').v1;

var baseUrl, domain, protocal;
var emitter = new events.EventEmitter();

var dumpDir = "./dump";

module.exports = {
	nav: nav,
	navHomo: navHomo,
	navSeq: navSeq,
	navIter: navIter,
	runHomo: runHomo,
	runIter: runIter,

	getBaseUrl: function (){return baseUrl;},
	getDomain: function (){return domain;},
	getProtocal: function (){return protocal;},


	emitter: emitter,
	scheduler: null,
	count: 0,
	
	dumpDir: dumpDir,

	parseHref: parseHref,
	dumpEvent: dumpEvent,
	removeDumpEvent: removeDumpEvent,
	writeDumpEvent: writeDumpEvent,
	readEvent: readEvent,
	utils: utils,

	limit: 0, //0 means unlimited	
	debug: false
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
function defaultRun(window, fn){
	if(fn) fn(window.location.href);
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
	if(href)
		fs.writeFileSync(tarFile, href.toString());
	else
		fs.writeFileSync(tarFile, "1");
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

function runHomo(array, runFn, fn)
// run function must have a callback
{
	var crawler = this;
	if(!array || !runFn){
		console.log("param error for runHomo");
		return;
	}
	var event = uuid();
	var ci = 0;
	crawler.emitter.on(event, function(){
		if(ci < array.length){
			ci ++;
			runFn(array[ci-1], function(){
				crawler.emitter.emit(event);
			});
		}
		else{
			if(fn) fn();
		}
	});
	crawler.emitter.emit(event);
}

function navHomo(array, iterator, config, fn)
//navigate similar pages
{
	if(!config)
		config = {};
	if(config.event || config.done){
		console.log("config with event/done is not supported, event/done removed");
		config.event = null;
		config.done = null;
	}
	var crawler = this;
	crawler.runHomo(array, function(c, callback){
		var href;
		if(iterator){
			href = iterator(c);
		}
		else{
			href = c;
		}
//		console.log(typeof iterator);
		config.html = href;
		config.done = function(){
			callback();
		};
		crawler.nav(config);
	}, fn);

}
//sequential nav
function navSeq(configs, fn){
	var crawler = this;
	configs.forEach(function(config){
		if(config.event || config.done){
			console.log("config with event/done is not supported, event/done removed");
			config.event = null;
			config.done = null;
		}
	});
	crawler.runHomo(configs, function(config, callback){
		config.done = function(){
			callback();
		};
		crawler.nav(config);
	}, fn);
}
/*
runFn(function(item){})
fn()
*/
function runIter(runFn, fn){
	var crawler = this;
  if(!runFn){
    console.log("must have run  function");
    return;
  }
	var event = uuid();
	crawler.emitter.on(event, function(item){
		if(item)
			runFn(function(item){
				crawler.emitter.emit(event, item);
			});
		else
			if(fn) fn();
	});
	runFn(function(item){
    crawler.emitter.emit(event, item);
  });

}

function navIter(config, fn){
	var crawler = this;
	if(!config){
		console.error("no config");
		return;
	}

	if(config.event || config.done){
		console.log("config with event/done is not supported, event/done removed");
		config.event = null;
		config.done = null;
	}
	crawler.runIter(function(fn){
		config.done = function(item){
			config.html = crawler.parseHref(item);
			fn(item);
		};
		crawler.nav(config);
	}, function(){
		fn();
	});
}

function defaultWait(fn){
	setTimeout(fn, 1000);
}
function nav(config){
	
	var crawler = this;
	var wait;
	if(config.wait)
		wait = config.wait;
	else 
		wait = defaultWait;
	wait(function(){
		if(crawler.limit && crawler.count >= crawler.limit){
			console.log("reach limit");
			return;
		}

		if(!config.hasOwnProperty("enableDumpEvent"))
			config.enableDumpEvent = true;
		if(!config.hasOwnProperty("forceRemote"))
			config.forceRemote = false;

		var localHref;
		if(!config.forceRemote){
			localHref = crawler.readEvent(config.event);
		}
		//if forceRemote or not dump stored
		if(config.forceRemote || !localHref){

			if(!config || !config.hasOwnProperty("html")){
				console.error("config error");
				return;
			}

			console.log(config.html);
			var run, event;
			if(config.run)
				run = config.run;
			else
				run = defaultRun;

			var arr = /^(((http|https|ftp):\/\/[^\/]+)\S+(?:[^\/]+)?)$/.exec(config.html);
			//	console.log(arr);
			if(arr != null){
				if(arr[1]) baseUrl = arr[1];
				if(arr[2]) domain = arr[2];
				if(arr[3]) protocal = arr[3];
			}

			env(config.html, function (errors, window) {
				if(errors)
					console.log(errors);
				if(crawler.debug) console.log("load window");
				var $ = jquery(window);
				window.$ = $;

				run(window, function(href){
					if(config.done){
						if(crawler.debug) console.log("call done");
						config.done(href, true);
					}
					if(config.event){
						if(config.enableDumpEvent)
							crawler.dumpEvent(config.event, href);
						if(crawler.debug) console.log("emit "+config.event);
						crawler.emitter.emit(config.event, href, true);
					}					
				});
			});
		}
		else{
			if(crawler.debug) console.log("use dump "+config.html);
			if(config.done)
				config.done(localHref, false);
			if(config.event)
				crawler.emitter.emit(config.event, localHref, false);
			
		}
	});
}

