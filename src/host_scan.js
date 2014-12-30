/*
 * scan.js implements a TCP port timing scanner for LAN discovery.
 * By analyzing timing responses, it is possible to get an idea of the
 * overall network layout.
 *
 * WebSockets or img tags are used to probe the local network space.
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

// creates a Hash with the BLOCKED_PORTS as keys, for faster lookup
var WS_BLOCKED_PORTS_OBJ = {};
lan.utils.each(WS_BLOCKED_PORTS, function(v, k) {
  WS_BLOCKED_PORTS_OBJ[''+k] = true;
});

/*
 * HostProbe constructor function
 * @param [String] address the host:port to scan
 */
var HostProbe = function(address) {
  if (!address) throw "HostProbe needs an address param.";

  /*
   * sends the TCP request
   * @param [Function(state, delta)] callback
   */
  this.fire = function(callback) {
    // skip blocked ports
    var matches = address.match(/\:(\d+)$/) || ['', '80'];
    var port = parseInt(matches[1], 10);
    // feature detect and run
    if ('WebSocket' in window && !this._illegal_ws_port(port)) {
      this._send_websocket_request(callback);
    } else {
      this._send_img_request(callback);
    }
  };

  /* 
   * @param [Number] port the port to check
   * @return [Boolean] websockets spec disallows connection on port
   */
  this._illegal_ws_port = function(port) {
    return WS_BLOCKED_PORTS_OBJ[''+port] || false;
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
      if (callback) callback('error', 0);
      return;
    }
    // called at a fast interval
    var check_socket = function() {
      var delta = (new Date()) - start_time;
      // check if the port has timed out
      if (delta > HostProbe.TIMEOUT) {
        if (callback) callback('timeout', delta);
        return;
      } else if (socket.readyState !== 0) {
        if (callback) callback('up', delta);
        return;
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
        if (callback) callback('up', delta());
        return;
      }
    };

    var check_timeout = function() {
      if (img) {
        img = null;
        if (callback) callback('timeout', delta());
      }
    };

    // if the request takes to long, report 'timeout' state
    clearme = setTimeout(check_timeout, HostProbe.TIMEOUT);
    // trigger the request
    img.onload = img.onerror = completed; // TODO: ensure this works in IE.
    img.src = window.location.protocol + '//' + address;
  };
};

/*
 * HostProbe static constants
 */
HostProbe.TIMEOUT = 2000; // 2s

/*
 * HostScan constructor function
 * @param [Array<String>, String] addresses the host:port(s) to scan
 */
var HostScan = function(addresses) {
  if (!addresses) throw "HostScan requests addresses param.";
  if (addresses.constructor != Array) addresses = [addresses];
  var responses = []; // used to build responses parameter for 'complete' callback to #start

  // starts sending requests to the addresses in #addresses
  // @param [Object] opts the options hash
  // @option opts [Function(results)] complete gets called at end of scan
  // @option opts [Function(address, state, deltat)] stream gets called on every result
  this.start = function(opts) {
    opts = opts || {};

    // run in batches
    var batch_idx = 0;
    var start_time = new Date();

    // sends the probes
    var sendProbe = function(i) { 
      var addr_idx = batch_idx * BATCH_SIZE + i;
      if (addr_idx >= addresses.length) return;
      var addr = addresses[addr_idx];
      var bidx = batch_idx; // local closure
      setTimeout(function() {
        var probe = new HostProbe(addr);
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
      }, bidx * BATCH_DELAY);
    };

    // run the loop
    while (batch_idx * BATCH_SIZE < addresses.length) {
      for (var k = 0; k < BATCH_SIZE; k++) {
        sendProbe(k);
      }
      batch_idx++;
    }
  };
};

/*
 * HostScan static methods
 */

/*
 * @param [Array<String>] addresses IPs/hostnames to scan
 * @param [Object] opts the options hash
 * @option opts [Function(resultsObject)] complete the complete callback (called once at end)
 * @option opts [Function(singleResult)] stream the update callback (called on every check)
 */
HostScan.start = function(addresses, opts) {
  new HostScan(addresses).start(opts);
};

// // DEBUG CODE: how to invoke the HostScan class
// new lan.HostScan(['192.168.1.1:80', '192.168.1.1:8080']).start({
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

//   new lan.HostScan(addrs).start({
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
  HostScan: HostScan,
  HostProbe: HostProbe
});

}).call(window);
