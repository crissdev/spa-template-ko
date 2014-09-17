# Single Page Application Template

This is a basic setup for a single page application using [Knockout](http://knockoutjs.com/), [RequireJS](http://requirejs.org/), [Crossroads.js](http://millermedeiros.github.io/crossroads.js/), [Bootstrap](http://getbootstrap.com/), [jQuery](http://jquery.com/), [Font Awesome](http://fontawesome.io/) and [Q](http://documentup.com/kriskowal/q/)

**This is WIP, but soon it will be ready to be used.**


# Demo

A demo is available by using python2.7 and the simple HTTP server script:

    gulp
    cd ./dev
    python -m SimpleHTTPServer


An integrated server is also available by running:

    gulp watch --app-server
or

    gulp watch --app-debug --app-server


# Install

Bower package will be available starting with 0.0.1 version.


# Build

The build system used is [Gulp](http://gulpjs.com/)

    gulp

or

    gulp watch


The later will build the project and start watching for file changes.


# Test

    karma start
