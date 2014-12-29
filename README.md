lan.js [![Build Status](https://travis-ci.org/jvennix-r7/lan-js.svg?branch=master)](https://travis-ci.org/jvennix-r7/lan-js)
===

Probe LAN devices from a web browser.

#### Classes:

- lan.TcpProbe: sends a single request out to a LAN address
- lan.TcpScan: scans an array of addresses with TcpProbes (using WebSockets with an <img> fallback)
- lan.DeviceFingerprint: correlates a device to an image, stylesheet, or script-based fingerprint
- lan.DeviceScan: scans an array of addresses for known DeviceFingerprints

#### Sample code:

Scan the following devices on your network, and print any device matches

```
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
```

#### Development environment:

1. First install [node](http://nodejs.org/).
2. Install the grunt plugin and run `npm install` in the project root:

```
$ sudo npm i -g grunt-cli
$ cd ~/Projects/lan.js/
$ npm install
```

#### Compiling

To compile, from the project root run:

```
grunt
```

To have grunt "watch" your filesystem and recompile on change, do:

```
grunt compile:watch
```

#### Running specs:

This project includes a number of specs. To run them, simply:

```
grunt spec
```

To have grunt "watch" your filesystem and run specs on change, do:

```
grunt spec:watch
```
