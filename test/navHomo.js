var assert = require("assert");
var fs=require("fs");
describe('Crawler', function(){
	this.timeout(15000);
  describe('#navHomo()', function(){
		it('test basic', function(done){
			var Crawler = require('../index');
			Crawler.navHomo([
				"http://www.baidu.com",
				"http://cn.bing.com"
			], null, null, function(){
				done();
			});				
		
		});

	});
});



