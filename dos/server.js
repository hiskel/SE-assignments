var http = require('http');

var i = 12.345;

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var arr = []
    for (let j = 10000; j > 0; j--) {
        arr.push(j*i*i/j*i + j)
    }
    i += 0.0001;
    arr.sort();
    arr.reverse();
    arr.sort();
    result = arr.toString();
    console.log('responding...');
    res.end(result);
});

server.listen(8000);
console.log('server running on http://localhost:8000')
