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
 * @options opts [String] base the base url, defaults to null for relative path
 * @options opts [Number] width the expected width of the image
 * @options opts [Number] height the expected height of the image
 */
var ImageProbe = function(opts) {
  var _this = this; // used to bind methods to constructor's `this`
  var _img = document.createElement('img');
  _img.setAttribute('style', lan.utils.constants.HIDDEN_STYLE);
  document.body.appendChild(_img);

  var _url = opts.url;
  if (opts.base) {
    _url = opts.base + _url;
  }

  /*
   * Sends the request for the image, then checks expected dimensions (if specified)
   * @param [Function(statusBool, probe)] callback
   */
  this.fire = function(callback) {
    _img.onload = function() {
      if (opts.width || opts.height) { // user specified explicit dimensions
        // ensure width/height match expected dimensions
        callback((!opts.width  || _img.width  === opts.width) &&
                 (!opts.height || _img.height === opts.height), _this);
      } else {
        // just make sure *something* loaded.
        callback(true, _this);
      }
      // cleanup after ourselves
      _this.cleanup();
    };
    _img.onerror = function() {
      callback(false, _this);
      _this.cleanup();
    };
    _img.src = _url; // fire the request!
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
 * @param [Hash] device the device information
 */
var DeviceFingerprint = function(type, device, fingerprint) {
  lan.utils.merge(this, fingerprint);
  lan.utils.merge(this, device);

  /*
   * Starts the Fingerprint request
   * @param [String] base the https:// or http:// base URL
   * @param [Function(statusBoolean)] callback
   */
  this.check = function(opts, callback) {
    var Probe = this.constructor.PROBES[type];
    if (!Probe) {
      if (callback) callback(false);
      console.log("Error: invalid type '"+(type||'')+"'");
      return false;
    } else {
      new Probe(lan.utils.merge(fingerprint, { base: opts.base })).fire(callback);
    }
  };

  
  /*
   * Patch toString() for a nice debug display
   * @return [String] serialized representation
  */
  this.toString = function() {
    return (this.make || "") + " " + (this.model || "");
  };
};

/*
 * Fingerprint static constants and variables
 */
DeviceFingerprint.PROBES = {
  image: ImageProbe,
  css:   CSSProbe,
  js:    JSGlobalProbe
};

DeviceFingerprint.db = [];
if (lan.db && lan.db.devices) {
  lan.utils.each(lan.db.devices, function(device) {
    lan.utils.each(device.fingerprints, function(fingerprint) {
      DeviceFingerprint.db.push(new DeviceFingerprint(fingerprint.type, device, fingerprint));
    });
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
   * @option opts [Function(address, device)] found called when a device is successfully fingerprinted
   * @option opts [Function(address, device)] failed called when a device fails a fingerprint
   * @option opts [Function(results)] complete called when the scan is over
   */
  this.start = function(opts) {
    opts = opts || {};
    var scan = new lan.TcpScan(addresses);
    scan.start({
      stream: function(address, state, deltat) {
        if (state == 'up') {
          // try every probe in the database
          lan.utils.each(DeviceFingerprint.db, function(fingerprint, i) {
            fingerprint.check({base: 'http://'+address }, function(probeState) {
              if (probeState && opts.found) {
                opts.found(address, fingerprint);
              } else if (!probeState && opts.failed) {
                opts.failed(address, fingerprint);
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
