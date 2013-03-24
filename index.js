var bouncy = require('bouncy');
var cicada = require('cicada');
var path = require('path');
var clone = require('clone');

module.exports = function (opts) {
    if (!opts) opts = {};
    if (typeof opts === 'string') {
        opts = {
            repodir: path.resolve(opts + '/repo'),
            workdir: path.resolve(opts + '/work')
        };
    }
    
    var ci = cicada(opts);
    ci.on('commit', function respawn (commit) {
        var env = clone(process.env);
        var port = Math.floor(Math.random() * (Math.pow(2,16)-1024) + 1024);
        env.PORT = port;
        
        var ps = commit.run('start', { env: env });
        var to = setTimeout(function () {
            // didn't crash in 3 seconds, add to routing table
            if (ploy.branches[commit.branch]) {
                ploy.remove(commit.branch);
            }
            ploy.add(commit.branch, {
                port: port,
                hash: commit.hash,
                process: ps
            });
        }, 3000);
        
        ps.on('exit', function (code) {
            clearTimeout(to);
            
            var b = ploy.branches[commit.branch];
            if (b && b.hash === commit.hash) {
                ploy.remove(commit.branch);
                respawn(commit);
            }
        });
    });
    
    var bouncer = bouncy(opts, function (req, res, bounce) {
        var host = (req.headers.host || '').split(':')[0];
        var subdomain = host.split('.').slice(0,-2).join('.');
        var branch = { '': 'master', 'www': 'master' }[subdomain] || subdomain;
        
        if (subdomain === 'ploy') {
            ci.handle(req, res);
        }
        else if (ploy.branches[branch]) {
            bounce(ploy.branches[branch]);
        }
        else {
            res.statusCode = 404;
            res.end('host not found');
        }
    });
    
    var ploy = new Ploy(bouncer);
    return ploy;
};

function Ploy (bouncer) {
    this.bouncer = bouncer;
    this.branches = {};
}

Ploy.prototype.add = function (name, rec) {
    if (this.branches[name]) this.remove(name);
    this.branches[name] = rec;
};

Ploy.prototype.remove = function (name) {
    var b = this.branches[name];
    if (b) b.process.kill();
    delete this.branches[name];
};

Ploy.prototype.move = function (src, dst) {
    if (!this.branches[src]) return;
    if (this.branches[dst]) this.remove(dst);
    this.branches[dst] = this.branches[src];
};

Ploy.prototype.listen = function () {
    return this.bouncer.listen.apply(this.bouncer, arguments);
};
