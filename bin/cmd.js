#!/usr/bin/env node

var createServer = require('../');
var argv = require('optimist').argv;

var server = createServer(argv.dir || argv.d || argv._.shift() || '.');
server.listen(argv.port || argv.p || argv._.shift());
