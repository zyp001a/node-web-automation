var fs = require('fs');
function defaultCallback(data){
//	dumpData(data, storeKey);
	printTable(data);
}
function dumpData(data, storeKey){
	if(!storeKey){
		console.warn("result is not stored in database");
	}
};
function printTable(table, sep, seq){

	if(!table || !table.length){
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
function writeLine(content, file){
	
}
function writeTestFile($){
	var testFileName='test.html';
	var data=$('html').html();
	fs.writeFile(testFileName, data, function (err){
		if (err) throw err;
		console.warn('test.html is saved!');
	});
	return data;
};


module.exports = {
	dumpData: dumpData,
	defaultCallback: defaultCallback,
	printTable: printTable,
	writeTestFile: writeTestFile
};
