var createServer = require('../');
var argv = require('optimist').argv;

var server = createServer('./data');
server.listen(5000);
