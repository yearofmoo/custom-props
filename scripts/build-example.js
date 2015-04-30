#!/usr/bin/env node

var convert = require('../lib/build.js');

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var buffer = ''
rl.on('line', function(line){
  buffer += line + "\n";
}).on('close', function() {
  console.log(convert(buffer));
});
