/*
This is a simple config that has a default config checked into Git and a
local config that overwrites conflicting values in the default config.

The local config should be at vogogo-utils/userConfig.js


Example:

defaultConfig = {
  foo: 'bar',
  spam: 'eggs'
  up: 'down',
  baz: {
    red: 'blue',
    green: 'purple'
  }
}

localConfig = {
  foo: 'goo',
  spam: 'eggs',
  left: 'right',
  baz: {
    red: 'black',
    white: 'black'
  }
}

finalConfig = {
  foo: 'goo',
  spam: 'eggs',
  up: 'down',
  left: 'right',
  baz: {
    red: 'black',
    green: 'purple',
    white: 'black'
  }
}

*/

'use strict';

var fs = require('fs');
var merge = require('merge');

var defaultConfig = require('./defaultConfig');

var config;

var localConfigPath = process.env.HOME + './userConfig.js';

var localExists = fs.existsSync(localConfigPath);

if (localExists) {
  var localConfig = require(localConfigPath);
  config = merge.recursive(defaultConfig, localConfig); //order of arguments is important! the second overwrites the first
} else {
  config = defaultConfig;
}

module.exports = config;
