/*
 * Small collection of shims and global functions.
 */
(function() {

// really hard to live without this
var merge = function(_this, hash) {
  for (var k in hash) { _this[k] = hash[k]; }
};

// normalize #forEach() implementation, for my sanity.
var each = function(_this, cb) {
  for (var i = 0; i < _this.length; i++) cb(_this[i], i);
};

// list some useful constants
var constants = {
  // set #style of any DOMElement to this to hide
  HIDDEN_STYLE: 'position:fixed;top:-500px;left:-500px;visibility:hidden;'
};

/*
 * @param [Object] opts the options object
 * @option opts [String] url the url to point the iframe to. defaults to about:blank.
 */
var create_iframe = function(opts) {
  opts = opts || {};
  var url = opts.url || 'about:blank';
  var iframe = document.createElement('iframe');
  iframe.setAttribute('style', constants.HIDDEN_STYLE);
  iframe.setAttribute('src', url);
  return iframe;
};

/*
 * exports
 */
this.lan = this.lan || {};
this.lan.utils = {
  create_iframe: create_iframe,
  constants: constants,
  merge: merge,
  each: each
};

}).call(window);
/*
 * scan.js implements a TCP port timing scanner for LAN discovery.
 * By analyzing timing responses, it is possible to get an idea of the overall network layout.
 * WebSockets (or iframes) are used to probe the local network space.
 *
 * Browser nuances:
 *  - non-WebSocket browsers (IE9 and below) fallback to <img> loading
 *
 * @author joev
 */

// wrap it all in an outer context to prevent leaks
(function() {

// constants
var BATCH_SIZE = 10;
var BATCH_DELAY = 1500; // interval to send batch of requests

// interval (ms) to poll the WebSocket's status attribute
var WS_CHECK_INTERVAL = 10; // (ms)
var TIMEOUT = 2000; // 2s max timeout

/*
 * no requests are allowed from browser to any of these ports.
 * From the WebSockets spec (http://dev.w3.org/html5/websockets/):
 * If port is a port to which the user agent is configured to block access, then throw
 * a SECURITY_ERR exception. (User agents typically block access to well-known ports like SMTP.)
 */
var WS_BLOCKED_PORTS = [1,7,9,11,13,15,17,19,20,21,22,23,25,37,42,43,53,
                        77,79,87,95,101,102,103,104,109,110,111,113,115,
                        117,119,123,135,139,143,179,389,465,512,513,514,
                        515,526,530,531,532,540,556,563,587,601,636,993,
                        995,2049,4045,6000];

/*
 * TcpProbe constructor function
 * @param [String] address the host:port to scan
 */
var TcpProbe = function(address) {
  if (!address) throw "TcpProbe needs an address param.";

  /*
   * sends the TCP request
   * @param [Function(state, delta)] callback
   */
  this.fire = function(callback) {
    // skip blocked ports
    var matches = address.match(/\:(\d+)$/) || ['', '80'];
    var port = parseInt(matches[1], 10);
    // feature detect and run
    if ('WebSocket' in window && WS_BLOCKED_PORTS.indexOf(port) < 0) {
      this._send_websocket_request(callback);
    } else {
      this._send_img_request(callback);
    }
  };

  /*
   * WebSocket scan works by sending a WebSocket request, then measures
   * latency after sending to determine if the service is up.
   * WebSockets are a bit sneakier, since http basic auth will not trigger a popup
   */
  this._send_websocket_request = function(callback) {
    // create the websocket and remember when we started
    var start_time = new Date();
    try {
      var socket = new WebSocket('ws://'+address);
    } catch (sec_exception) {
      return callback('error', 0);
    }
    // called at a fast interval
    var check_socket = function() {
      var delta = (new Date()) - start_time;
      // check if the port has timed out
      if (delta > TIMEOUT) {
        return callback('timeout', delta);
      } else if (socket.readyState !== 0) {
        return callback('up', delta);
      }
      setTimeout(check_socket, WS_CHECK_INTERVAL);
    };
    // wait a sec, then start the checks
    setTimeout(check_socket, WS_CHECK_INTERVAL);
  };

  // Image scan simply sets an <img> src to the address, and waits for a response.
  this._send_img_request = function(callback) {
    // create the image object and attempt to load from #src
    var clearme = null; // for holding a timeout ref
    var start_time = new Date();
    var img = new Image();
    var delta = function() { return (new Date()) - start_time; };

    var completed = function() {
      if (img) {
        img = null;
        clearTimeout(clearme);
        return callback('up', delta());
      }
    };

    var check_timeout = function() {
      if (img) {
        img = null;
        callback('timeout', delta());
      }
    };

    // if the request takes to long, report 'timeout' state
    clearme = setTimeout(check_timeout, TIMEOUT);
    // trigger the request
    img.onload = img.onerror = completed; // TODO: ensure this works in IE.
    img.src = window.location.protocol + '//' + address;
  };
};

/*
 * TcpScan constructor function
 * @param [Array<String>, String] addresses the host:port(s) to scan
 */
var TcpScan = function(addresses) {
  if (!addresses) throw "TcpScan requests addresses param.";
  if (addresses.constructor != Array) addresses = [addresses];
  var responses = []; // used to build responses parameter for 'complete' callback to #start

  // starts sending requests to the addresses in #addresses
  // @param [Object] opts the options hash
  // @option opts [Function(results)] complete gets called at end of scan
  // @option opts [Function(address, state, deltat)] stream gets called on every result
  this.start = function(opts) {
    // run in batches
    var i;
    var batch_idx = 0;
    var start_time = new Date();

    // sends the probes
    var sendProbe = (function(i) { 
      var addr_idx = batch_idx * BATCH_SIZE + i;
      if (addr_idx >= addresses.length) return;
      var addr = addresses[addr_idx];
      setTimeout(function() {
        var probe = new TcpProbe(addr);
        probe.fire(function(state, duration) {
          if (opts.stream) opts.stream(addr, state, duration);
          responses.push({ address: addr, state: state, duration: duration });
          if (responses.length >= addresses.length) {
            if (opts.complete) {
              opts.complete(responses, (new Date())-start_time);
              opts.complete = null; // don't call this again :)
            }
          }
        });
      }, batch_idx * BATCH_DELAY);
    })(i);

    // run the loop
    while (batch_idx * BATCH_SIZE < addresses.length) {
      for (i = 0; i < BATCH_SIZE; i++) {
        sendProbe(i);
      }
      batch_idx++;
    }
  };
};

// // DEBUG CODE: how to invoke the TcpScan class
// new TcpScan(['192.168.1.1:80', '192.168.1.1:8080']).start({
//   complete: function(responses, duration) {
//     console.log('complete callback: '+duration);
//     var results = {};
//     lan.utils.each(responses, function(response) {
//       results[response.state] = results[response.state] || 0;
//       results[response.state]++;
//     });
//     console.log(results);
//   },
//   stream: function(addr, state, duration) {
//     console.log(addr+" - " +state.toUpperCase());
//   }
// });

// var scan_ports = function(ip, start, end) {
//   if (!start || !end || start > end) throw "Argument error";

//   var addrs = []; // holds ip:port strings
//   while (start <= end) addrs.push(ip+':'+start++);

//   new TcpScan(addrs).start({
//     complete: function(responses, duration) {
//       console.log('complete callback: '+duration);
//       var results = {};
//       lan.utils.each(responses, function(response) {
//         results[response.state] = results[response.state] || 0;
//         results[response.state]++;
//       });
//       console.log(results);
//     },
//     stream: function(addr, state, duration) {
//       console.log(addr+" - " +state.toUpperCase() + "(" + duration + ")");
//     }
//   });
// }
// scan_ports('localhost', 2950, 3005)

// exports
lan.utils.merge(lan, {
  TcpScan: TcpScan
});

}).call(window);

/*
 * device_scan.js: Look for known devices on a network by using various
 * HTTP fingerprints (xdomain images, CSS styles, and <script> globals).
 *
 * @author joev
 */

(function(){

/*
 * ImageProbe checks if the target address responds with an image of
 * a particular width and height.
 *
 * @param [Object] opts the options object
 * @options opts [String] url the url to the image
 * @options opts [Number] width the expected width of the image
 * @options opts [Number] height the expected height of the image
 */
var ImageProbe = function(opts) {
  var _this = this; // used to bind methods to constructor's `this`
  var _img = document.createElement('img');
  _img.setAttribute('style', lan.utils.constants.HIDDEN_STYLE);
  document.body.appendChild(_img);

  /*
   * Sends the request for the image, then checks expected dimensions (if specified)
   * @param [Function(statusBool, probe)] callback
   */
  this.fire = function(callback) {
    _img.onerror = _img.onload = function() {
      if (opts.width || opts.height) { // user specified explicit dimensions
        // ensure width/height match expected dimensions
        callback((!opts.width  || _img.width  === opts.width) &&
                 (!opts.height || _img.height === opts.height), _this);
      } else {
        // just make sure *something* loaded.
        callback((_img.width > 0 && _img.height > 0), _this);
      }
      // cleanup after ourselves
      _this.cleanup();
    };
    _img.src = opts.url; // fire the request!
  };

  // removes DOM elements and events, aborting the request immediately
  this.cleanup = function() {
    _img.onerror = _img.onload = null;
    if (_img) {
      if (_img.parentNode) { _img.parentNode.removeChild(_img); }
      _img = null;
    }
  };
};

/*
 * CSSProbe checks if the target address responds with a CSS stylesheet
 * containing a particular rule. It works by creating a new <iframe> and
 * loading the xdomain stylesheet into the frame, then checking the .style
 * of different elements.
 *
 * @param [Object] opts the options object
 * @options opts [String] url the url to the image
 * @options opts [String] html the markup to render inside the frame and test for a style
 * @options opts [String] id the id of the DOM element to test
 * @options opts [Object] styles map of CSS properties and values to match
 */
var CSSProbe = function(opts) {
  // private variables
  var _this     = this;  // used to bind methods
  var _callback = null;  // used to hold on to the callback fn
  var _timer    = null;  // used to hold the setInterval timer
  var _frame    = null;

  // initialization
  _frame = lan.utils.create_iframe();
  _frame.contentDocument.write('<html>'+opts.html+'</html>');
  document.body.appendChild(_frame);

  /*
   * Requests the stylesheet in an <iframe>, then checks expected styles
   * @param [Function(statusBool, probe)] callback
   */
  this.fire = function(callback) {
    _callback = callback; // remember me
    var link = document.createElement('link');
    link.setAttribute('href', opts.url);
    // trigger the request
    _frame.contentDocument.body.appendChild(link);
    // start checking for an update
    _timer = setInterval(_this._poll, _this.constructor.POLL_INTERVAL);
  };

  // removes DOM elements, intervals, and fn refs, aborting the request immediately
  this.cleanup = function() {
    if (_frame) {
      if (_frame.parentNode) { _frame.parentNode.removeChild(_frame); }
      _frame = null;
    }
    if (_timer) { clearInterval(_timer); _timer = null; }
    _callback = null;
  };

  // Private method called repeatedly to check for the style in the iframe
  this._poll = function() {
    var el = _frame.contentDocument.getElementById(opts.id);
    if (el) {
      for (var prop in styles) {
        if (el.style[prop] !== styles[prop]) {
          return;
        }
      }
      if (_callback) _callback(true, this);
      _this.cleanup();
    }
  };
};

/*
 * CSSProbe constants
 */
CSSProbe.POLL_INTERVAL = 10;

/*
 * JSGlobalProbe checks if the target address responds with valid javascript
 * that adds some known variables to the global scope. It works by creating a
 * new <iframe> and loading the xdomain <script> into the frame, then checking
 * the frame's window object for the new vars.
 *
 * @param [Object] opts the options object
 * @options opts [String] url the url to the image
 */
var JSGlobalProbe = function(opts) {
  // private variables
  var _this = this;  // used to bind methods


  this.fire = function(callback) {
  };
};

/*
 * JSGlobalProbe constants
 */
JSGlobalProbe.POLL_INTERVAL = 10;

/*
 * A Fingerprint represents a single device check
 * @param [String] type img|css|js
 */
var DeviceFingerprint = function(type, data) {
  /*
   * Starts the Fingerprint request
   * @param [Function(statusBoolean)] callback
   */
  this.check = function(callback) {
    var Probe = this.constructor.PROBES[type];
    if (!Probe) {
      if (callback) callback(false);
      console.log("Error: invalid type '"+(type||'')+"'");
      return false;
    } else {
      new Probe(data).fire(callback);
    }
  };
};

/*
 * Fingerprint static constants and variables
 */
DeviceFingerprint.PROBES = {
  'image': ImageProbe,
  'css': CSSProbe,
  'js': JSGlobalProbe
};

DeviceFingerprint.db = [];

/*
 * DeviceScan constructor
 * @param [Array<String>] addresses IPs to scan
 */
var DeviceScan = function(addresses) {
  if (!addresses) throw "DeviceScan requests addresses param.";
  if (addresses.constructor != Array) addresses = [addresses];

  /*
   * Looks for known devices in the addresses array.
   * - First, tcp probe requests are sent to the IP:port addresses.
   * - Then, a series of HTTP probes are sent: images of known length, known CSS styles, known JS globals
   * - Everytime a device is found, the :found callback is invoked
   * - At the end of the scan, the :complete callback is invoked
   * @param [Object] opts the options object
   * @option opts [Function(result)] found called when a device is successfully fingerprinted
   * @option opts [Function(results)] complete called when the scan is over
   */
  this.start = function(opts) {
    var scan = new lan.TcpScan(addresses);
    scan.start({
      stream: function(address, state, deltat) {
        if (state) {
          // try every probe in the database
          // FIXME: match the address to known default IPs
          lan.utils.each(DeviceFingerprint.db, function(fingerprint, i) {
            fingerprint.check(function(probeState) {
              if (probeState) {
                if (opts.found) opts.found(address, fingerprint);
              } 
            });
          });
        }
      },
      complete: function(results) {
        if (opts.complete) opts.complete(results);
      }
    });
  };
};

/*
 * DeviceScan static methods
 */

/*
 * @param [Array<String>] addresses IPs/hostnames (no ports!) to scan
 * @param [Object] opts the options hash
 * @option opts [Function(resultsObject)] complete the complete callback (called once at end)
 * @option opts [Function(singleResult)] update the update callback (called on every check)
 */
DeviceScan.start = function(addresses, opts) {
  new DeviceScan(addresses).start(opts);
};

/*
 * exports
 */
lan.utils.merge(lan, {
  DeviceScan: DeviceScan,
  DeviceFingerprint: DeviceFingerprint
});

}).call(window);
