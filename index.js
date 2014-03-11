'use strict';

var request = require('request');
var fs = require('fs');
var FormData = require('form-data');
var env = require('jsdom').env;
var jquery = require('jquery');

var dumpData = function(data, storeKey){
	if(!storeKey){
		console.warn("result is not stored in database");
	}
};
var printTable = function(table, sep, seq){
	if(!table.length){
		console.warn("empty table");
		process.exit(0);
	}
	if(!sep) sep = "\t";
	if(!seq) seq = table[0];
	table.forEach(function(row){
		var line = '';
		for (var key in seq){
			if(line != '') line += sep;
			line += row[key];
		}
		line += '\n';
		process.stdout.write(line);
	});
};
var craw = 
	function (html, processFunction, storeKey) {
		// first argument can be html string, filename, or url
		env(html, function (errors, window) {
			//    console.warn(errors);
			var $ = jquery(window);
			var data = processFunction($);
			if(storeKey){
				dumpData(data, storeKey);
				printTable(data);
			}
		});
	};
var crawPostUrlEncoded = 
	function(url, postData, processFunction, storeKey){
		request.post(url, {form:postData}, function (error, res, body) {
			if (!error && res.statusCode == 200) {
				craw(body, processFunction, storeKey);
			}
			else{
				console.warn("error: "+error);
				console.warn("statusCode: "+res.statusCode);
			}
		});
	};
var crawPostFormData = 
	function(url, postData, processFunction, storeKey){
		var form = new FormData();
		for (var key in postData){
			form.append(key, postData[key]);
		}
		form.submit(url, function(error, res) {
			// res – response object (http.IncomingMessage)  //
			if (!error && res.statusCode == 200) {
				var body='';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function(chunk) {
					craw(body, processFunction, storeKey);
				});

			}
			else{
				console.warn("error: "+error);
				console.warn("statusCode: "+res.statusCode);
			}
		});
	};
var writeTestFile = 
	function($){
		var testFileName='test.html';
		var data=$('html').html();
		fs.writeFile(testFileName, data, function (err){
			if (err) throw err;
			console.warn('test.html is saved!');
		});
		return data;
	};
module.exports.printTable = printTable;
module.exports.craw = craw;	
module.exports.crawPostUrlEncoded = crawPostUrlEncoded;
module.exports.crawPostFormData = crawPostFormData;
module.exports.writeTestFile = writeTestFile;




	//craw("http://www.baidu.com", getTable);

