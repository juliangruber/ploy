#!/usr/bin/env node

var createServer = require('../');
var argv = require('optimist').argv;
var exec = require('child_process').exec;
var hyperquest = require('hyperquest');

var cmd = argv._[0];
if (cmd === 'list' || cmd === 'ls') {
    getRemotes(function (err, remotes) {
        if (err) return error(err);
        remotes.forEach(function (remote) {
            var hq = hyperquest(remote + '/list');
            hq.pipe(process.stdout);
            hq.on('error', function (err) {
                var msg = 'Error connecting to ' + remote + ': ' + err.message;
                console.error(msg);
            });
        });
    });
}
else if (cmd === 'move' || cmd === 'mv') {
    argv._.shift();
    var src = argv.src || argv._.shift();
    var dst = argv.dst || argv._.shift();
    getRemotes(function (err, remotes) {
        if (err) return error(err);
        
        if (remotes.length === 0) {
            return error('No ploy remotes found. Add a remote or pass -r.');
        }
        if (remotes.length >= 2) {
            return error('More than one ploy remote. Disambiguate with -r.');
        }
        
        var remote = remotes[0];
        var hq = hyperquest(remote + '/move/' + src + '/' + dst);
        hq.pipe(process.stdout);
        hq.on('error', function (err) {
            var msg = 'Error connecting to ' + remote + ': ' + err.message;
            console.error(msg);
        });
    });
}
else if (cmd === 'remove' || cmd === 'rm') {
    argv._.shift();
    var name = argv.name || argv._.shift();
    getRemotes(function (err, remotes) {
        if (err) return error(err);
        
        if (remotes.length === 0) {
            return error('No ploy remotes found. Add a remote or pass -r.');
        }
        if (remotes.length >= 2) {
            return error('More than one ploy remote. Disambiguate with -r.');
        }
        
        var remote = remotes[0];
        var hq = hyperquest(remote + '/remove/' + name);
        hq.pipe(process.stdout);
        hq.on('error', function (err) {
            var msg = 'Error connecting to ' + remote + ': ' + err.message;
            console.error(msg);
        });
    });
}
else {
    var server = createServer(argv.dir || argv.d || argv._.shift() || '.');
    server.listen(argv.port || argv.p || argv._.shift());
}

function error (err) {
    console.error(err);
    process.exit(1);
}

function getRemotes (cb) {
    var r = argv.r || argv.remote;
    if (/^https?:/.test(r)) return cb(null, [r]);
    
    exec('git remote -v', function (err, stdout, stderr) {
        if (err) return cb(err);
        
        var remotes = stdout.split('\n').reduce(function (acc, line) {
            var xs = line.split(/\s+/);
            var name = xs[0], href = xs[1];
            var re = RegExp('^https?://[^?#]+/_ploy/[^?#]+\\.git$');
            if (re.test(href)) {
                acc[name] = href.replace(RegExp('/_ploy/.+'), '/_ploy');
            }
            return acc;
        }, {});
        
        if (r) cb(null, [ remotes[r] ].filter(Boolean));
        else cb(null, Object.keys(remotes).map(function (name) {
            return remotes[name];
        }));
    });
}
