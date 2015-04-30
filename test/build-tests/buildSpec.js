var expect = require("chai").expect; // node.js core module
var build = require("../../lib/build.js");

describe('custom-props build', function(){
  it('should convert custom properties into a content tag with JSON data', function() {
    var css = [
      'selector {',
      '  color: red;', 
      '  --custom-color: blue;', 
      '  --custom-background: 123;',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.match(/\bcontent:'{"custom-color":"blue","custom-background":"123"}'/);
  });

  it('should create a duplicate content property prefixed with a slash', function() {
    var css = [
      'selector {',
      '  --prop-one: value;',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.match(/\bcontent:'{"prop-one":"value"}'/);
    expect(content).to.match(/-content:'{"prop-one":"value"}'/);
  });

  it('should wrap all custom property values in double quotes', function() {
    var css = [
      'selector {',
      '  --one: "one";', 
      '  --two: two;',
      '  --three: 3;',
      '  --four: four 4;',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.match(/\bcontent:'{"one":"one","two":"two","three":"3","four":"four 4"}'/);
  });

  it('should retain old styles within the existing declaration', function() {
    var css = [
      'selector {',
      '  color: gold;',
      '  property: one, two---three;',
      '  --prop-one: value;',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.contain('color: gold;');
    expect(content).to.contain('property: one, two---three;');
  });

  it('should retain the custom properties inline with the content property', function() {
    var css = [
      'selector {',
      '  --custom-prop:567;',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.contain('--custom-prop:567;');
    expect(content).to.match(/\bcontent:'{"custom-prop":"567"}'/);
  });

  it('should retain the structure of media queries when a selector within contains custom properties', function() {
    var css = [
      '@media (max-width: 600px) {',
      '  selector {',
      '    --custom-property-man:heyDude;',
      '  }',
      '}'
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.equal([
      '@media (max-width: 600px) {',
      '  selector {',
      '    --custom-property-man:heyDude;',
      '    content:\'{"custom-property-man":"heyDude"}\';',
      '    -content:\'{"custom-property-man":"heyDude"}\';',
      '  }',
      '}'
    ].join("\n"));
  });

  it('should not effect style declarations that do not contain any custom properties', function() {
    var css = [
      '#id, .class, [attr], element {',
      '  color:red;',
      '  background:maroon;',
      '}',
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.equal([
      '#id, .class, [attr], element {',
      '  color:red;',
      '  background:maroon;',
      '}',
    ].join("\n"));
  });

  it('should not effect style declarations that are defined on a media query that do not contain any custom properties', function() {
    var css = [
      '@media (max-width: 888px) {',
      '  #id, .class, [attr], element {',
      '    color:red;',
      '    background:maroon;',
      '  }',
      '}',
    ].join("\n");

    var content = build(css).trim();
    expect(content).to.equal([
      '@media (max-width: 888px) {',
      '  #id, .class, [attr], element {',
      '    color:red;',
      '    background:maroon;',
      '  }',
      '}',
    ].join("\n"));
  });
});
