var bouncy = require('bouncy');
var cicada = require('cicada');

module.exports = function (opts, cb) {
    if (typeof opts === 'function') { cb = opts; opts = {} }
    if (!opts) opts = {};
    if (typeof opts === 'string') {
        opts = { repodir: opts + '/repo', workdir: opts + '/work' };
    }
    
    var ci = cicada(opts);
    ci.on('push', function (push) {
        console.dir(push);
        push.accept();
    });
    ci.on('commit', function (commit) {
        console.dir(commit);
        
        /*
        var ps = commit.run('start', { env: env });
        ps.on('exit', function (code) {
            // ...
        });
        */
    });
    
    var bouncer = bouncy(opts, function (req, res, bounce) {
        var host = (req.headers.host || '').split(':')[0];
        var subdomain = host.split('.').slice(0,-2).join('.');
        
        if (subdomain === 'boiler') {
            ci.handle(req, res);
        }
        else if (boiler.branches[subdomain]) {
            bounce(boiler.branches[subdomain]);
        }
        else if (cb) {
            cb(req, res, bounce);
        }
        else {
            res.statusCode = 404;
            res.end('host not found');
        }
    });
    
    var boiler = new Boiler(bouncer);
    return boiler;
};

function Boiler (bouncer) {
    this.bouncer = bouncer;
    this.branches = {};
}

Boiler.prototype.move = function (src, dst) {
    if (!this.branches[src]) return;
    this.branches[dst] = this.branches[src];
};

Boiler.prototype.listen = function () {
    return this.bouncer.listen.apply(this.bouncer, arguments);
};
