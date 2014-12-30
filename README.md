lan-js [![Build Status](https://travis-ci.org/jvennix-r7/lan-js.svg?branch=master)](https://travis-ci.org/jvennix-r7/lan-js)
===

Probe LAN devices from a web browser.

#### Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md).

#### Sample code:

Scan the following devices on your network, and print any device matches

    lan.DeviceScan.start(['192.168.0.1', '192.168.0.2', '192.168.1.1', '10.0.0.1'], {
      found: function(address, fingerprint) {
        console.log("["+address+"] Found device: "+fingerprint);
      },
      complete: function(results) {
        console.log("Scan complete.")
      },
      hostup: function(address) {
        console.log("Host up: "+address);
      }
    });

#### Fingerprints

The `DeviceScan` class is in charge of scanning for responsive hosts and then looking for fingerprintable images, scripts, or stylesheets served by an HTTP service on that host.

A fingerprint is a set of criteria for matching a device. There are three types of fingerprints: images, scripts, and stylesheets.
  
    // image fingerprint
    {
      type: 'image',
      url: '/epsonlogo.gif',
      width: 79,
      height: 28
    }

    // style
    {
      type: 'css',
      url: '/style.css',
      html: '<html><div id="x"></div></html>',
      id: 'x',
      styles: { color: 'red' }
    }

    // script
    {
      type: 'js',
      url: '/script.js',
      expression: 'LINKSYS_VERSION === 1'
    }

#### Development environment:

1. First install [node](http://nodejs.org/).
2. Install the grunt plugin and run `npm install` in the project root:

        $ sudo npm i -g grunt-cli
        $ cd ~/Projects/lan.js/
        $ npm install

#### Compiling

To compile, from the project root run:

    grunt

To have grunt "watch" your filesystem and recompile on change, do:

    grunt compile:watch

#### Running specs:

This project includes a number of specs. To run them, simply:

    grunt spec

To have grunt "watch" your filesystem and run specs on change, do:

    grunt spec:watch

#### License

`lan-js` is released under the [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause).

#### Copyright

2006-2014, Rapid7, Inc.
