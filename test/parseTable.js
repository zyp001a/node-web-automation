var assert = require("assert");
var fs=require("fs");
describe('Crawler', function(){
  describe('#nav()', function(){
		it('use jsdom to parse example html', function(done){

			var Crawler = require('../index');
			function parse($, window, fn){
				//	$('.next').click();
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
				fn(table);
			}



			Crawler.emitter.on("testFinished", function(href, isRemote){
				console.log(href);
				assert.equal(false, !Crawler.readEvent("testFinished"));
				assert.equal(true, isRemote);
				Crawler.writeDumpEvent("testFinished2");
				Crawler.nav({
					html: "test/example.html",
					parseFn: parse,
					resultFn:  function(result, fn){
						assert.equal(35, result.length);
						fn();
					},
					nextFn: function($, window){
						return window.location.href;
					},
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
        parseFn: parse,
        resultFn:  function(result, fn){
          assert.equal(35, result.length);
					fn();
        },
        nextFn: function($, window){
          return window.location.href;
        },
        event: "testFinished"
      }); //test 

    });
	});
});



