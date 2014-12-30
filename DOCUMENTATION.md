lan-js
===

`lan-js` is a Javascript library for probing (cross-domain) hosts on your LAN from a browser. `lan-js` operates in two stages: 

1. `HostScan`: An initial scan of the desired address range is performed with `WebSockets` (and `Image` fallbacks for older browsers). Alive hosts are identified via timing differences when a connection is attempted.

2. `DeviceScan`: A secondary scan for known device fingerprints accessible via HTTP. A small example database is provided in `src/db.js`, 

#### lan.HostScan

The `lan.HostScan` class handles running a single scan over an array of hosts.

    var scan = new lan.HostScan(['192.168.0.1', '192.168.0.2']);
    scan.start({
      stream: function(address, state, deltat) {
        // called while the scan is running anytime we discover a new alive host
        console.log("Host at "+address+" is "+state);
      },
      complete: function(results) {
        // called at the end of the scan
        console.log("Complete!");
      }
    });

#### lan.DeviceScan

The `lan.DeviceScan` class handles running a scan to fingerprint specific devices on your network. It first performs a `lan.TcpScan` to find alive hosts, and then tries to identify them by sending a catalog of requests for known images, stylesheets, and Javascript files that can be read by a cross-domain website.

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
