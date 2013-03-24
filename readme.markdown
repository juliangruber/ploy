# ploy

git deploy to this http router, hosting branches at subdomains

# example

first start the ploy server:

```
$ sudo ploy ./data -p 80
```

then from a git repo with a `server.js` and/or a `scripts.start` in its
package.json:

`server.js` should host its http server on `process.env.PORT`.

```
$ git push http://localhost/_ploy/server.git master
```

Now your server.js will be running on `http://localhost/`.
If you push again to master, in a few seconds the new master code will be
running on `http://localhost/`.

To launch a staging instance on a subdomain, just push to a non-master branch:

```
$ git push http://localhost/_ploy/server.git master:staging
```

Now go to `http://staging.localhost/` to see your staging instance.
(Set up dns wildcards with
[dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) to test locally).

# methods

``` js
var ploy = require('ploy')
```

## var server = ploy(opts)

Create a new ploy instance, splitting `opts` between
the underlying
[bouncy](https://github.com/substack/bouncy)
and [cicada](https://github.com/substack/cicada)
instances.

* opts.repodir - directory to put git repo data
* opts.workdir - directory to check out git repos into

If `opts` is a string, it will be used as the basedir for `opts.repodir` and
`opts.workdir`.

The rest of the options will be looked over by bouncy to do things like set up
an https server or whatever.

## server.listen(port, ...)

Call `.listen()` on the underlying http or https server.

## server.add(name, rec)

Add a a service under a branch `name`. `rec` should have:
* rec.port - port where the http server lives
* rec.hash - commit hash string
* rec.process - process object to call .kill() on

## server.remove(name)

Remove the process at the branch `name`, killing as necessary.

## server.move(src, dst)

Move the process at branch name `src` to `dst`, killing the branch process at
`src` if it was running.

# todo

* authentication
* branch swapping
* process start/stop api

# install

With [npm](https://npmjs.org) do:

```
npm install -g ploy
```

to get the `ploy` command or just

```
npm install ploy
```

to get the library.

# license

MIT
