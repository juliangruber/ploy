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
