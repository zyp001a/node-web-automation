var assert = require("assert");
var fs=require("fs");
describe('Crawler', function(){
	this.timeout(15000);
  describe('#navIter()', function(){
		it('test basic', function(done){
			var Crawler = require('../index');
//			Crawler.debug = true;
			Crawler.navIter(
				{
					html: "http://sh.58.com/baomuxin",
					run: function(window, fn){
						var $=window.$;
						var href = $(".next").attr("href");
						if($("#infolist dl dd").last().text().match("\\d+-\\d+"))
							fn(null);
						else
							fn(href);
					}
				}
			, function(){
				done();
			});				
		});

	});
});



