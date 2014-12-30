/*
 * Small collection of shims and global functions.
 */
(function() {

// really hard to live without this
var merge = function(_this, hash) {
  for (var k in hash) { _this[k] = hash[k]; }
  return _this;
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
var createIframe = function(opts) {
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
  createIframe: createIframe,
  constants: constants,
  merge: merge,
  each: each
};

}).call(window);