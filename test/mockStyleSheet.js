function createMockStyleSheet() {
  var doc = document;
  var wind = window;

  var node = doc.createElement('style');
  var head = doc.getElementsByTagName('head')[0];
  head.appendChild(node);

  var ss = doc.styleSheets[doc.styleSheets.length - 1];

  return {
    addRule: function(selector, styles) {
      try {
        ss.insertRule(selector + '{ ' + styles + '}', 0);
      }
      catch (e) {
        console.log(e);
        try {
          ss.addRule(selector, styles);
        }
        catch (e2) {
          console.log(e2);
        }
      }
    },

    destroy: function() {
      head.removeChild(node);
    }
  };
}
