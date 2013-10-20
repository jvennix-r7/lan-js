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
