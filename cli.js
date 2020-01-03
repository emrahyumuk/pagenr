#! /usr/bin/env node
const shell = require('shelljs');
const program = require('commander');
let command = '';
program
  .arguments('<actionName>')
  .option('-m, --mode <mode>', 'environment (develeopment, production)')
  .option('-d, --dev', 'development environment')
  .option('-p, --prod', 'production environment')
  .action(function(actionName) {
    if (!program.mode || program.dev) {
      program.mode = 'development';
    } else if (program.prod) {
      program.mode = 'production';
    }
    command = `NODE_ENV=${program.mode} `;
    if (actionName === 'serve') {
      command += `webpack-dev-server --mode ${program.mode} --hot`;
    } else if (actionName === 'build') {
      command += `webpack --mode ${program.mode}`;
    }
  })
  .parse(process.argv);
const appDir = process.cwd();
process.env.APP_DIR = appDir;
const pagenrDir = __dirname;
shell.cd(pagenrDir);
shell.exec('node ./data.js');
shell.exec(command);
