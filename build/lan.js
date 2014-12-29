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
 * Creates and returns an <iframe> element.
 *
 * @param [Object] opts the options object
 * @option opts [String] url the url to point the iframe to. defaults to about:blank.
 * @option opts [Boolean] insert insert into DOM. defaults to false.
 */
var create_iframe = function(opts) {
  opts = opts || {};
  var url = opts.url || 'about:blank';
  var iframe = document.createElement('iframe');
  iframe.setAttribute('style', constants.HIDDEN_STYLE);
  iframe.setAttribute('src', url);
  if (opts.insert) { document.body.appendChild(iframe); }
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
      if (delta > TcpProbe.TIMEOUT) {
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
    clearme = setTimeout(check_timeout, TcpProbe.TIMEOUT);
    // trigger the request
    img.onload = img.onerror = completed; // TODO: ensure this works in IE.
    img.src = window.location.protocol + '//' + address;
  };
};

/*
 * TcpProbe static constants
 */
TcpProbe.TIMEOUT = 2000; // 2s

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
    opts = opts || {};

    // run in batches
    var batch_idx = 0;
    var start_time = new Date();

    // sends the probes
    var sendProbe = function(i) { 
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
  TcpScan: TcpScan,
  TcpProbe: TcpProbe
});

}).call(window);

/*
 * devices.js - a database of <img> fingerprints from the web interfaces of
 * popular routers and other LAN devices.
 *
 * MIT license.
 * @author joev
 */
(function(){

// set up namespaces
this.lan = this.lan || {};
this.lan.db = this.lan.db || {};

// Most of this database came from the jslanscanner project (https://code.google.com/p/jslanscanner).
// Big thanks to Gareth Heyes (thespanner.co.uk) for creating the database
// and allowing me to relicense it under MIT.
// I'm still deciding what to do with this exactly.

this.lan.db.devices = [
  {
    make: "2Wire",
    model: "1000 Series",
    fingerprints:[
      {
        type: "image",
        url: "/base/web/def/def/images/nav_sl_logo.gif"
      }
    ]
  }, {
    make: "Cisco",
    model: "2600",
    fingerprints:[
      {
        type: "image",
        url: "/images/logo.png"
      }
    ]
  }, {
    make: 'Epson',
    model: 'EpsonNet WebAssist',
    fingerprints: [
      {
        type: 'image',
        url: '/epsonlogo.gif',
        width: 79,
        height: 28
      }, {
        type: 'image',
        url: '/sig_u.gif',
        width: 30,
        height: 80
      }
    ]
  }, {
    make: 'DLink',
    model: 'dgl4100',
    fingerprints: [
      {
        type: 'image',
        url: '/html/images/dgl4100.jpg'
      }
    ]
  }, {
    make: 'DLink',
    model: 'dgl4300',
    fingerprints: [
      {
        type: 'image',
        url: '/html/images/dgl4300.jpg'
      }
    ]
  }, {
    make: 'DLink',
    model: 'di524',
    fingerprints: [
      {
        type: 'image',
        url: '/html/images/di524.jpg'
      }
    ]
  }, {
    make: "DLink",
    model: "di624",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/di624.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "di624s",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/di624s.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "di724gu",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/di724gu.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dilb604",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dilb604.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir130",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir130.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir330",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir330.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir450",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir450.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir451",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir451.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir615",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir615.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir625",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir625.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir635",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir635.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir655",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir655.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dir660",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dir660.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "ebr2310",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/ebr2310.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "kr1",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/kr1.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "tmg5240",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/tmg5240.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wbr1310",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wbr1310.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wbr2310",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wbr2310.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl604",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl604.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl2320b",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl2320b.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl2540b",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl2540b.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl2640b",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl2640b.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl302g",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl302g.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dsl502g",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dsl502g.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dgl3420",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dgl3420.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl2100ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl2100ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl2130ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl2130ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl2200ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl2200ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl2230ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl2230ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl2700ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl2700ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl3200ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl3200ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl7100ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl7100ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl7130ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl7130ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl7200ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl7200ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl7230ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl7230ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl7700ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl7700ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl8200ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl8200ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwl8220ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwl8220ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlag132",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlag132.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlag530",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlag530.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlag660",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlag660.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlag700ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlag700ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg120",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg120.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg122",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg122.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg132",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg132.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg510",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg510.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg520",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg520.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg520m",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg520m.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg550",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg550.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg630",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg630.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg650",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg650.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg650m",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg650m.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg680",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg680.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg700ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg700ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg710",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg710.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg730ap",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg730ap.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "dwlg820",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/dwlg820.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wda1320",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wda1320.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wda2320",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wda2320.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wna1330",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wna1330.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wna2330",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wna2330.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wua1340",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wua1340.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "wua2340",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/wua2340.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "DSL502T",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/help_p.jpg"
      }
    ]
  }, {
    make: "DLink",
    model: "DSL524T",
    fingerprints:[
      {
        type: "image",
        url: "/html/images/device.gif"
      }
    ]
  }, {
    make: "Linksys",
    model: "WRT54GL",
    fingerprints:[
      {
        type: "image",
        url: "/WRT56GL.gif"
      }
    ]
  }, {
    make: "Linksys",
    model: "WRT54GC",
    fingerprints:[
      {
        type: "image",
        url: "/UI_Linksys.gif"
      }
    ]
  }, {
    make: "Linksys",
    model: "WRT54G",
    fingerprints:[
      {
        type: "image",
        url: "/WRT54G.gif"
      }
    ]
  }, {
    make: "Linksys",
    model: "WRT54GS",
    fingerprints:[
      {
        type: "image",
        url: "/UILinksys.gif"
      }
    ]
  }, {
    make: 'Linksys',
    model: 'WRT100',
    auth: 'basic',
    fingerprints: [
      {
        type: 'image',
        url: '/logo.gif', // FIXME!
        width: 800,
        height: 20
      }
    ]
  }, {
    make: 'Linksys',
    model: 'WRT110',
    auth: 'basic',
    fingerprints: [
      {
        type: 'image',
        url: '/logo.gif', // FIXME
        width: 800,
        height: 300
      }
    ]
  }, {
    make: 'Linksys',
    model: 'WRT120N',
    auth: 'basic',
    fingerprints: [
      {
        type: 'image',
        url: '/logo.gif', // FIXME
        width: 800,
        height: 300
      }
    ]
  }, {
    make: 'Motorola',
    model: 'SURFboard Gateway SBG6580',
    auth: 'ip',
    fingerprints: [
      {
        type: 'image',
        url: '/logo_new.gif',
        width: 176,
        height: 125
      }, {
        type: 'image',
        url: '/title.gif',
        width: 100,
        height: 88
      }
    ]
  }, {
    make: "Netgear",
    model: "CG814WG",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsCG814WG.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "CM212",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsCM212.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG632",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG632.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG632B",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG632B.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG814",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG814.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG824M",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG824M.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834B",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834B.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834G",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834G.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834GB",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834GB.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834GT",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834GT.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834GTB",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834GTB.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834GV",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834GV.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "dg834N",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsdg834N.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DG834PN",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDG834PN.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DGFV338",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDGFV338.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DM111P",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDM111P.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "DM602",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsDM602.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FM114P",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFM114P.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FR114P",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFR114P.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FR114W",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFR114W.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FR314",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFR314.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FR318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFR318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FR328S",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFR328S.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FV318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFV318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVG318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVG318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVL328",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVL328.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVM318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVM318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVS114",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVS114.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVS124G",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVS124G.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVS318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVS318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVS328",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVS328.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVS338",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVS338.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FVX538",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFVX538.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FWAG114",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFWAG114.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "FWG114P",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsFWG114P.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA302T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA302T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA311",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA311.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA511",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA511.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA620",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA620.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA621",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA621.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "GA622T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsGA622T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "HE102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsHE102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "HR314",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsHR314.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JFS516",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJFS516.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JFS524",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJFS524.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JFS524F",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJFS524F.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JGS516",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJGS516.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JGS524",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJGS524.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "JGS524F",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsJGS524F.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "KWGR614",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsKWGR614.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "ME101",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsME101.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "ME102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsME102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "ME103",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsME103.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "MR314",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsMR314.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "MR814",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsMR814.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RH340",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRH340.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RH348",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRH348.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RM356",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRM356.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RO318",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRO318.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RP114",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRP114.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RP334",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRP334.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RP614",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRP614.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RT311",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRT311.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RT314",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRT314.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RT328",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRT328.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "RT338",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsRT338.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WAB102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWAB102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WAG102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWAG102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WAG302",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWAG302.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WAGL102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWAGL102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WAGR614",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWAGR614.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG111",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG111.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG111T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG111T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG302",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG302.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG311",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG311.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WG602",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWG602.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGE101",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGE101.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGE111",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGE111.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGL102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGL102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGM124",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGM124.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGR101",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGR101.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGR614",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGR614.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGT624",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGT624.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGT624SC",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGT624SC.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGT634U",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGT634U.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGU624",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGU624.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WGX102",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWGX102.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN121T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN121T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN311B",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN311B.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN311T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN311T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN511B",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN511B.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN511T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN511T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WN802T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWN802T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WNR834B",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWNR834B.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WNR834M",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWNR834M.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WNR854T",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWNR854T.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WPN802",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWPN802.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "WPN824",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsWPN824.gif"
      }
    ]
  }, {
    make: "Netgear",
    model: "XM128",
    fingerprints:[
      {
        type: "image",
        url: "/images/../settingsXM128.gif"
      }
    ]
  }, {
    make: "Sitecom",
    model: "WL114",
    fingerprints:[
      {
        type: "image",
        url: "/slogo.gif"
      }
    ]
  }, {
    make: "SurfinBird",
    model: "313",
    fingerprints:[
      {
        type: "image",
        url: "/images/help_p.gif"
      }
    ]
  }, {
    make: "SMC",
    model: "7004ABR",
    fingerprints:[
      {
        type: "image",
        url: "/images/logo.gif"
      }
    ]
  }, {
    make: "Thomson",
    model: "Cable Modem A801",
    fingerprints:[
      {
        type: "image",
        url: "/images/thomson.gif"
      }
    ]
  }, {
    make: "Vigor",
    model: "2600V",
    fingerprints:[
      {
        type: "image",
        url: "/images/logo1.jpg"
      }
    ]
  }, {
    make: "ZyXEL",
    model: "Prestige 660H61",
    fingerprints:[
      {
        type: "image",
        url: "/dslroutery/imgshop/full/NETZ1431.jpg"
      }
    ]
  }, {
    make: "ZyXEL",
    model: "Zywall",
    fingerprints:[
      {
        type: "image",
        url: "/images/Logo.gif"
      }
    ]
  }
];

this.lan.db.manufacturers = {
  Cisco: {

  },
  Linksys: {
    default_addresses: [
      '192.168.0.1', '192.168.1.1'
    ]
  },
  Dlink: {
    default_addresses: [
      '192.168.1.30',
      '192.168.1.50'
    ]
  },
  Motorola: {
    default_addresses: [
      '192.168.0.1'
    ]
  },
  Thomson: {

  }
};

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
if (lan.db && lan.db.devices) {
  lan.utils.each(lan.db.devices, function(device, i){
    console.log(device);
  });
}

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
    opts = opts || {};
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
