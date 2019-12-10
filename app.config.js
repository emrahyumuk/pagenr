const path = require('path');

const appConfig = require(path.join(process.cwd(), 'pagenr.config.js'));

let config = {
  defaultLanguage: 'tr',
  path: {
    root: '/src',
    img: '/assets/img',
    js: '/assets/js',
    css: '/assets/css',
    localization: '/locales',
    view: '/views',
    layout: '/layouts',
  },
};

Object.assign(config, appConfig);

module.exports = config;
