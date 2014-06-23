var assert = require("assert");
var path = require("path");
var fs=require("fs");
describe('Crawler', function(){
	this.timeout(10000);
  describe('#nav()', function(){
		it('test done', function(done){
			var Crawler = require('../index');
			Crawler.nav({
				html: "test/example.html", 
				done: function(href){
					assert.equal("example.html", path.basename(href));
					done();
				}
			});
		});
		it('test event', function(done){
			var Crawler = require('../index');
			Crawler.emitter.on("test", function(href){
				assert.equal("example.html", path.basename(href));
				done();
			});
			Crawler.nav({
				html: "test/example.html",
				event: "test"
			});
		});
		it('test run', function(done){
			var Crawler = require('../index');
			Crawler.nav({
				html: "test/example.html", 
				run: function(window, fn){
					assert.equal("58", window.$("title").text());
					fn();
					done();
				}
			});
		});
		it('use jsdom to parse example html', function(done){
			var Crawler = require('../index');
			function parse(window, fn){
				//	$('.next').click();
				var $ = window.$;
				var table = $('#infolist dl').map(function() {
					// $(this) is used more than once; cache it for performance.
					var $row = $(this);			
					// For each row that's "mapped", return an object that
					//  describes the first and second <td> in the row
					return {
						job: $row.find('dt .t').text(),
						score: $row.find('.posCom span').text(),
						company: $row.find('.titbar h2').text()		
					};
				}).get();
        assert.equal(35, table.length);
				fn(window.location.href);
			}

			Crawler.emitter.on("testFinished", function(href, isRemote){
//				console.log(href);
				assert.equal(false, !Crawler.readEvent("testFinished"));
				assert.equal(true, isRemote);
				Crawler.writeDumpEvent("testFinished2");
				Crawler.nav({
					html: "test/example.html",
					run: parse,
					event: "testFinished2"
				});

			});
			Crawler.emitter.on("testFinished2", function(href, isRemote){
				assert.equal(false, isRemote);
				done();
			});
			if(Crawler.readEvent("testFinished"))
				Crawler.removeDumpEvent("testFinished");
			assert.equal(null, Crawler.readEvent("testFinished"));
			Crawler.nav({
        html: "test/example.html",
        run: parse,
        event: "testFinished"
      }); //test 

    });


	});
});



