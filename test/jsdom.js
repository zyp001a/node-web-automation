var assert = require("assert");

describe('Crawler', function(){
  describe('#run()', function(){
		it('use jsdom to parse example html', function(done){

			var Crawler = require('../index');
			function parse($){
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
				return table;
			}
			Crawler.emitter.on("testFinished", function(){
				done();
			});

			Crawler.run({
				html: "test/example.html",
				parseFn: parse,
				resultFn:  function(result){
					assert.equal(35, result.length);
				},
				finishEvent: "testFinished"
			});

    });
	});
});



