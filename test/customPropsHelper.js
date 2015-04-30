var createCustomProps = function(props) {
  var css = ['temp-selector {', objectToCss(props, '  '), '}'].join("\n");
  var compiled = module.exports(css);
  compiled = compiled.match(/{([\s\S]+)}/)[1];
  compiled = compiled.trim();
  return compiled;
};

function objectToCss(obj, tab) {
  tab = tab || '';
  var keys = Object.keys(obj);
  var props = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = obj[key];
    props.push(tab + key + ': ' + value + ';');
  }
  return props.join("\n");
}
