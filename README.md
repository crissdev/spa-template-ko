# Single Page Application Template

This is a basic setup for a single page application using [Knockout](http://knockoutjs.com/), [RequireJS](http://requirejs.org/), [Crossroads.js](http://millermedeiros.github.io/crossroads.js/), [Bootstrap](http://getbootstrap.com/), [jQuery](http://jquery.com/), [Font Awesome](http://fontawesome.io/) and [Q](http://documentup.com/kriskowal/q/)

**This is WIP, but soon it will be ready to be used.**


## Demo

A demo is available by using python2.7 and the simple HTTP server script:

```sh
gulp
cd ./dev
python -m SimpleHTTPServer
```

An integrated server is also available by running:

```sh
gulp watch --server
```

or

```sh
gulp watch --debug --server
```

## CoffeeScript

A CoffeeScript implementation is available in the [coffee](https://github.com/CrissDev/spa-template-ko/tree/coffee) branch.
It has the same code base and it will be maintained as the master branch evolves.

CoffeeScript compilation is also supported in the master branch - see [gulpfile.js](https://github.com/CrissDev/spa-template-ko/blob/master/gulpfile.js#L165).


## Install

Bower package will be available starting with 0.0.1 version.


## Build

The build system used is [Gulp](http://gulpjs.com/)

```sh
gulp
```

or

```sh
gulp watch
```

The later will build the project and start watching for file changes.


## Test

    karma start


## License

MIT © [Cristian Trifan](http://crissdev.com)
