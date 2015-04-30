# Custom Props
(A Custom CSS Properties Polyfill)

### Blog Post
http://www.yearofmoo.com/2015/04/cross-browser-custom-css-properties.html
-----

This tool makes the creation of custom CSS properties in modern browsers posslble. The idea
of custom CSS properties is that they can be set in CSS and then read by JavaScript in the
browser.

Currently, the only browser is Firefox which supports this feature natively, but with a little
CSS magic using the `content` property mixed together with some JSON code, we can make this-
feature work on all browsers.

This tool consists of two parts: a **build script** and a **front-end JavaScript library**.
Both tools are required in order to make this feature work properly on all modern browsers.


## The Lowdown on Custom CSS Properties

Custom styles in CSS are **not in anyway understood by CSS**. The idea is simply to provide
additional property information in CSS that can later be consumed and rendered by JavaScript code.

Say for example we wanted to make a custom animation that would hide the element after
the transition is done. With this tool we could do the following:

```css
/* this code is run through a pre-processor */
.animate-and-destroy {
  transition:1s linear all;
  opacity:0;
  --after-animation: "destroy";
}
```

And then in our JavaScript code:

```js
function addClassAnimation(element, className) {
  element.classList.add(className);
  element.addEventListener('transitionend', function() {
    var afterOperation = CustomProps.read(element, 'after-animation');
    if (afterOperation === 'destroy') {
      element.remove();
    }
  });
}

addClassAnimation(element, 'animate-and-destroy');
```

If this is all still very unclear, then please read over a blog post that goes over everything here:

http://www.yearofmoo.com/2015/04/cross-browser-custom-css-properties.html

## Requirements & Browser Support

All modern browsers (Opera 15+ and higher) support this feature and do not have any visual side-effects. The only requirement
is that your CSS code must be run through a preprocessor (via grunt or gulp) and then the compiled CSS file + JavaScript
library is loaded into your website.


## Step 1 - Compiling the CSS

All custom CSS properties start with two starting dash values (the syntax is set this way since the CSS variables spec defines
custom properties to be declared this way). The following are all valid ways in which we can declare our CSS code in our application:

```css
/* my-file.css */
body {
  --custom-prop: value;
  --custom-prop-two: "value two";
  --another-value: 1,2,3,4,5;
}
```

The CSS code is considered valid, but the code does not work just yet. **We need to run the code through a build tool that will make
a compiled version that will work in all browsers**. This can be done in three ways:

### Gulp

Use Gulp to setup a task which will do this for you:

```
npm install gulp-custom-props
```

Then inside of your **Gulpfile.js**:

```js
var gulp = require('gulp');
var customProps = require('gulp-custom-props');

gulp.task('package-css', function() {
  return gulp.src('./my-file.css')
    .pipe(customProps())
    .pipe(gulp.dest('dist'));
});
```

### Grunt

Use Grunt to setup a task which will do this for you:

```
npm install grunt-custom-props
```

Then inside of your **Gruntfile.js**:

```js
module.exports = function(grunt) {
  grunt.initConfig({
    customProps: {
      package: {
        src: [
          './my-file.css'
        ],
        dest: './dist/my-file.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-custom-props');

  grunt.registerTask('package-css', ['customProps:package']);
});
```

### Manually 

Inside of this repo we have a script which will run the conversion for us. For us to
use it then we must have **NodeJS** and **NPM** installed.

Once that's installed then install `custom-props` via NPM:

```
npm install custom-props
```

And then setup a script which will run the converstion for you

```js
var fs = require('fs');
var customProps = require('custom-props');

var cssCode = fs.readFileSync('my-file.css', 'utf8');

var compiledCssCode = customProps(cssCode);

fs.writeFileSync('my-compiled-file.css', compiledCssCode);
```

## Step 2 - Reading properties in the browser

Once the CSS code is compiled we can load that into our webpage and then access the custom style properties
directly in our JavaScript code. For this to work we must download the `custom-props.js` file into our application.

To get ahold of the `custom-props.js` file, please install it using **npm**:

```
# first install this into your project
npm install custom-props

# then copy over the file from the `dist` folder:
# node_modules/custom-props/dist/custom-props.js
# node_modules/custom-props/dist/custom-props.min.js
```

Or via **bower**:

```
# first install this into your project
bower install custom-props 

# then copy over the file from the `dist` folder:
# bower_components/custom-props/custom-props.js
# bower_components/custom-props/custom-props.min.js
```

Once those files have been collected then include the `custom-props.js` (or the minified version) into your HTML code as a
JavaScript include:

```html
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" type="text/css" href="my-compiled-file.css" />
<script type="text/javascript" src="./custom-props.min.js"></script>
<script>
window.onload = function() {
  /*
    Remember that we defined these properties in our `my-file.css` file above:
      --custom-prop: value;
      --custom-prop-two: "value two";
      --another-value: 1,2,3,4,5;
  */

  // get properties one by one
  var customProp = CustomProps.read(document.body, 'custom-prop');
  var customPropTwo = CustomProps.read(document.body, 'custom-prop-two');
  var anotherValue = CustomProps.read(document.body, 'another-value');

  // get properties one by one
  var allProps = CustomProps.data(document.body);
  console.log(allProps); // { 'custom-prop': '...', 'custom-prop-two': '...', 'another-value': '1,2,3,4,5' }
};
</script>
</head>

<body></body>
</html>

```

### Dealing with the cache

When `CustomProps.read` or `CustomProps.data` are called it will cache the data fetched from the CSS world
to avoid excessive calls to `getComputedStyle` and `JSON.parse`. The cache is determined based on the
following characteristics:

```
// something like 10-header-fade-background-12
cacheKey = LEMENT_INDEX + "-" + element_class_value.replace(' ','-') + "-" + SIBLING_OR_PARENT_INDEX
```

What this basically means that if the element is moved around or the classes are changed then the cache
will not apply to the new state of the element.

In the event that your styles have a media query which **changes to another state** at some point and
the custom properties defined also change due to a new media query taking over then **CustomProps will
not clear the cache automatically** since there is no way it can keep track of what has changed. If this
does occur then run the following command:

```js
// Flush the entire cache for the element and
// all of it's cached states
CustomProps.flush(element);

// Flush the entire cache for all elements and
// their states
CustomProps.flush();
```

Have a look at the [Match Media API](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
to see how to detect media query changes within JavaScript.

## How it works

CustomProps works by taking advantage of the `content` CSS property when using with a standard CSS selector (not a pseudo-element selector).
Since nothing happens when `content` is used with such a selector, we can place custom string data inside of the content property.

```css
.my-normal-css-selector {
  background:red;
  color:blue;

  /* Modern browsers allow for detection of `content`, but don't display it when used here */
  content:'{"custom":"value"}';

  /* IE can only read this one */
  -content:'{"custom":"value"}';
}
```

But having to handcode JSON code and then duplicate it is not fun.  This is where the preprocessor comes in. By declaring custom properties 
using the double dash prefix, the preprocessor can figure out what properties are custom and then build the content JSON string and place that
into the compiled CSS code.

So code that looks like this:

```css
.my-normal-css-selector {
  background:red;
  color:blue;

  --custom: value;
}
```

Will turn into this:

```css
.my-normal-css-selector {
  background:red;
  color:blue;

  --custom: value;
  content:'{"custom":"value"}';
  -content:'{"custom":"value"}';
}
```

The reason why we retain the `--custom: value` style is to allow browsers that natively support custom CSS properties to make use of them directly.


### The JavaScript Code

Once the CSS code is compliled we have our JavaScript code figure out what the custom properties are on the given element by using `window.getComputedStyle(element).content` (for all modern browsers minus IE) and `element.currentStyle['-content']` (for IE). All of this happens behind the scenes when `CustomProps.read(element, prop)` or `CustomProps.data(element)` are called.


## More Info and Creating Issues

To learn how all of this works and to see some better examples please read over article at www.yearofmoo.com:

http://www.yearofmoo.com/2015/04/cross-browser-custom-css-properties.html

If you have found any issues with the tool then place create any issues on the github issue tracker page for this project:

https://github.com/yearofmoo/custom-props/issues

## Contributing

Be sure to first install everything:

```bash
npm install -g grunt
git clone git@github.com:yearofmoo/custom-props.git
npm install
```

The tests can be run via:

```bash
# run everything in one go
grunt test

# or watch the tests
grunt watch
```

The example file (under `example/`) can be build and previewed using:

```bash
# the files will be built & previewed under `dist/example`
gulp example
```

And the JavaScript code can be built via:

```bash
# the files will be built under `dist/`
gulp package
```

## License

[MIT](LICENSE)
