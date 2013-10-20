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
var WEBSOCKET_CHECK_INTERVAL = 10 // (ms)
var TIMEOUT = 2000 // 2s max timeout

// TcpProbe constructor function
// @param [String] address the host:port to scan
var TcpProbe = function(address) {
  if (!address) throw "TcpProbe needs an address param.";

  // sends the TCP request
  // @param [Function(state, delta)] callback
  this.fire = function(callback) {
    // feature detect and run
    if ('WebSocket' in window) {
      this._send_websocket_request(callback);
    } else {
      this._send_img_request(callback);
    }
  };

  // WebSocket scan works by sending a WebSocket request, then measures
  // latency after sending to determine if the service is up.
  // WebSockets are a bit sneakier, since http basic auth will not trigger a popup
  this._send_websocket_request = function(callback) {
    // create the websocket and remember when we started
    var start_time = new Date;
    try {
      var socket = new WebSocket('ws://'+address);
    } catch (sec_exception) {
      return callback('error', 0);
    }
    // called at a fast interval
    var check_socket = function() {
      var delta = (new Date) - start_time;
      // check if the port has timed out
      if (delta > TIMEOUT) {
        return callback('timeout', delta);
      } else if (socket.readyState != 0) {
        return callback('up', delta);
      }
      setTimeout(check_socket, WEBSOCKET_CHECK_INTERVAL);
    };
    // wait a sec, then start the checks
    setTimeout(check_socket, WEBSOCKET_CHECK_INTERVAL);
  };

  // Image scan simply sets an <img> src to the address, and waits for a response.
  this._send_img_request = function(callback) {
    // create the image object and attempt to load from #src
    var start_time = new Date;
    var img = new Image;
    var delta = function() { return (new Date) - delta; };

    var completed = function() {
      console.log('onerror/onload');
      return callback('up', delta());
      clearTimeout(clearme);
      img = null; // make doubly sure we dont call timeout
    };

    var check_timeout = function() {
      if (img) {
        img = null;
        callback('timeout', delta());
      }
    };

    // if the request takes to long, report 'timeout' state
    var clearme = setTimeout(check_timeout, TIMEOUT);
    // trigger the request
    img.setAttribute('onerror', completed);
    img.setAttribute('onload', completed);
    img.src = window.location.protocol + '//' + address;
  }
}


// TcpScan constructor function
// @param [Array<String>, String] addresses the host:port(s) to scan
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
    var batch_idx = 0;
    var start_time = new Date;
    while (batch_idx * BATCH_SIZE < addresses.length) {
      for (var i = 0; i < BATCH_SIZE; i++) {
        (function(i) {
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
                  opts.complete(responses, (new Date)-start_time);
                  opts.complete = null; // don't call this again :)
                }
              }
            });
          }, batch_idx * BATCH_DELAY);
        })(i);
      }
      batch_idx++;
    }
  };
}

// DEBUG CODE: invoke the TcpScan class

var scan_hosts = function(hosts) {
  new TcpScan(hosts).start({
    complete: function(responses, duration) {
      console.log('complete callback: '+duration);
      var results = { up: 0, timeout: 0 };
      for (var i in responses) {
        results[responses[i].state]++;
      }
      console.log(results);
    },
    stream: function(addr, state, duration) {
      // console.log(addr+":" +state.toUpperCase());
    }
  });
};

var scan_ports = function(ip, start, end) {
  if (!start || !end || start > end) throw "Argument error";

  var addrs = []; // holds ip:port strings
  while (start < end) addrs.push(ip+':'+start++);

  new TcpScan(addrs).start({
    complete: function(responses, duration) {
      console.log('complete callback: '+duration);
      var results = { up: 0, timeout: 0, error: 0 };
      for (var i in responses) {
        results[responses[i].state]++;
      }
      console.log(results);
    },
    stream: function(addr, state, duration) {
      // console.log(addr+" - " +state.toUpperCase());
    }
  });
}

scan_ports('192.168.0.1', 77, 83);

var hosts = ['192.168.0.1', '192.168.0.2', '192.168.0.3',
             '192.188.2.1', '192.168.0.4', '192.168.0.5',
             '127.0.0.1', 'localhost', '10.0.0.1', '192.168.1.2'];
// scan_hosts(hosts);

})();
