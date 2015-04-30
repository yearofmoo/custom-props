var CustomProps = (function(window, document) {

  var nextKey = 0;
  var cache = {};

  function touchKey(element) {
    var key = element.$$customPropsUid;
    if (!key) {
      key = element.$$customPropsUid = ++nextKey;
    }
    return key.toString();
  }

  function previousSibling(element) {
    if (element.previousElementSibling) return element.previousElementSibling;
    var prev = element;
    while(prev != null) {
      prev = prev.previousSibling;
    }
    return prev;
  }

  function computeCacheKey(element) {
    var first = touchKey(element);
    var last = touchKey(previousSibling(element) || element.parentNode);
    var classes = element.getAttribute('class');
    return [first + '-' + classes.replace(' ', '-') + '-' + last].join('-');
  }

  function getDOMNode(element) {
    return element.length >= 0 && !element.nodeType ? element[0] : element;
  }

  function chomp(data) {
    var first = data.charAt(0);
    var a = (first === '"' || first === "'") ? 1 : 0;

    var last = data.charAt(data.length-1);
    var b = (last === '"' || last === "'") ? 1 : 0;

    return data.substring(a, data.length-b);
  }
  
  var self;
  return self = {
    hasNativeSupport: function() {
      if (self._nativeSupport !== undefined) return self._nativeSupport;

      var TEST_KEY = '--test-value';
      var TEST_VALUE = 'some value';

      var body = document.body;
      body.style.setProperty(TEST_KEY, TEST_VALUE);
      self._nativeSupport = body.style.getPropertyValue(TEST_KEY) === TEST_VALUE;
      if (self._nativeSupport) {
        body.style.removeProperty(TEST_KEY);
      }
      return self._nativeSupport;
    },

    data: function(element) {
      element = getDOMNode(element);
      var key = computeCacheKey(element);
      var data = cache[key];
      if (!data) {
        data = element.currentStyle
          ? element.currentStyle['-content']
          : window.getComputedStyle(element).content;
        if (data.length) {
          data = chomp(data);
          data = data.replace(/\\"/g,'"');
          data = JSON.parse(data);
        } else {
          data = {};
        }
        cache[key] = data;
      }
      return data;
    },

    read: function(element, prop) {
      if (self.hasNativeSupport()) {
        var value = window.getComputedStyle(getDOMNode(element)).getPropertyValue('--' + prop);
        return value ? chomp(value.trim()) : "";
      } else {
        return self.data(element)[prop];
      }
    },

    flush: function(element) {
      if (arguments.length) {
        var id = element.$$customPropsUid.toString();
        if (id) {
          var i, key = computeCacheKey(element);
          for (i in cache) {
            if (i.substring(0, id.length) === id) {
              delete cache[i];
            } 
          }
        }
      } else {
        cache = {};
      }
    }

  };

})(window, document);
