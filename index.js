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
        
        if (subdomain === 'ploy') {
            ci.handle(req, res);
        }
        else if (ploy.branches[subdomain]) {
            bounce(ploy.branches[subdomain]);
        }
        else if (cb) {
            cb(req, res, bounce);
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

Ploy.prototype.move = function (src, dst) {
    if (!this.branches[src]) return;
    this.branches[dst] = this.branches[src];
};

Ploy.prototype.listen = function () {
    return this.bouncer.listen.apply(this.bouncer, arguments);
};
