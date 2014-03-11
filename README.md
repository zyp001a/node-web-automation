A jquery based web crawler and parser.
The crawler example is simple:
```javascript
var Parser = require("web-htmlparser");
Parser.craw("http://www.baidu.com", Parser.writeTestFile);
Parser.crawPostFormData("http://www.baidu.com/s", {wd:'hello'}, Parser.writeTestFile);
```
