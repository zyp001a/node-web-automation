var assert = require("assert");
var fs=require("fs");
describe('Crawler', function(){
	this.timeout(15000);
  describe('#navSeq()', function(){
		it('test basic', function(done){
			var Crawler = require('../index');
			Crawler.navSeq([
				{html: "http://www.baidu.com"},
				{html: "http://cn.bing.com/"}
			], function(){
				done();
			});				
		
		});

	});
});



