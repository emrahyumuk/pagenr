#! /usr/bin/env node
var shell = require('shelljs');

shell.exec('NODE_ENV=production webpack --mode production');
