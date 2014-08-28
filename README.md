# Single Page Application Template

This is a basic setup for a single page application using [Knockout](http://knockoutjs.com/), [RequireJS](http://requirejs.org/), [Crossroads.js](http://millermedeiros.github.io/crossroads.js/), [Bootstrap](http://getbootstrap.com/), [jQuery](http://jquery.com/), [Font Awesome](http://fontawesome.io/) and [Q](http://documentup.com/kriskowal/q/)

**This is WIP, but soon it will be ready to be used.**


# Demo

A demo is available by using python2.7 and the simple HTTP server script:

    gulp dev-build
    cd ./dev
    python2.7 /usr/lib/python2.7/SimpleHTTPServer.py


An integrated server is also available by running:

    gulp dev-build-watch


# Install

Bower package will be available starting with 0.0.1 version.


# Build

The build system used is [Gulp](http://gulpjs.com/)

    gulp dev-build

or

    gulp dev-build-watch


The later will build the project and start watching for file changes.


# Test

    karma start
