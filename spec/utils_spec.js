describe("lan.utils", function() {
  it("should be defined", function() {
    expect(lan.utils).toBeDefined();
  });

  describe("lan.utils.each()", function() {
    it("should be defined", function() {
      expect(lan.utils.each).toBeDefined();
    });

    it("should pass the value of each element of the array to the callback", function() {
      var x = ['a', 'b', 'c'];
      var output = [];
      lan.utils.each(x, function(val, idx) { output.push(val); });
      expect(output).toEqual(x);
    });

    it("should pass the index (key) of each element of the array to the callback", function() {
      var x = ['a', 'b', 'c'];
      var output = [];
      lan.utils.each(x, function(val, idx) { output.push(idx); });
      expect(output).toEqual([0, 1, 2]);
    });
  });

  describe("lan.utils.merge()", function() {
    it("should be defined", function() {
      expect(lan.utils.merge).toBeDefined();
    });

    it("should merge the argument into the callee", function() {
      var x = {a: 1};
      var data = {b: 2};
      lan.utils.merge(x, data);
      expect(x).toEqual({a: 1, b: 2});
    });
  });

  describe("lan.utils.create_iframe()", function() {
    it("should return an iframe", function() {
      var frame = lan.utils.create_iframe();
      expect(frame.tagName).toBe("IFRAME");
    });

    it("should return an iframe that is not in the DOM", function(){
      var frame = lan.utils.create_iframe();
      expect(frame.parentNode).toBeFalsy(); 
    });

    describe("when passed {insert: true}", function() {
      var frame;

      afterEach(function() {
        frame.parentNode.removeChild(frame);
      });

      it("should return an iframe that has been inserted into the DOM", function(){
        frame = lan.utils.create_iframe({insert: true});
        expect(frame.parentNode).toBeTruthy(); 
      });
    });

    describe("when passed a data url containing 'HELLO'", function() {
      var data_url = 'data:text/html,<html><body>HELLO</body></html>';

      it("should return an iframe with a data URL in its src", function() {
        var frame = lan.utils.create_iframe({url: data_url});
        expect(frame.getAttribute('src')).toMatch(/data/);
      });
    });
  });

  describe("lan.utils.constants", function() {
    it("should be defined", function() {
      expect(lan.utils.constants).toBeDefined();
    });

    it("should not be empty", function() {
      expect(Object.keys(lan.utils.constants).length).toBeGreaterThan(0);
    });
  });
});