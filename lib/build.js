function makeTabSpace(length) {
  var space = '';
  for(var i = 0; i < length; i++) {
    space += ' ';
  }
  return space;
}

function replaceCustomProps(content, tabLength) {
  var tab = makeTabSpace(tabLength);
  var data = {};
  var newStr = content.replace(/--(.+?)\s*:\s*(.+?)\s*(?=;|\n)/g, function(line, key, value) {
    data[key] = chomp(value);
    return line;
  });
  var styleData = JSON.stringify(data);
  return Object.keys(data).length > 0
      ? newStr + "\n" + tab + "content:'" + styleData + "';\n" + tab + "-content:'" + styleData + "';"
      : newStr;
}

function chomp(data) {
  var first = data.charAt(0);
  var a = (first === '"' || first === "'") ? 1 : 0;

  var last = data.charAt(data.length-1);
  var b = (last === '"' || last === "'") ? 1 : 0;

  return data.substring(a, data.length-b);
}

module.exports = function convert(content) {
  return content.replace(/{\s*[\n\r]([^{}]+?)(\s*?})/g, function(_, content, after) {
    var c, length = 0;
    while ((c = content[length]) === ' ') {
      length++;
    }
    return "{\n" + replaceCustomProps(content, length) + after;
  });
};
