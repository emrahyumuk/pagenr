const fs = require('fs');
const path = require('path');
let handlebars = require('handlebars');

const routes = require('./src/routes');
const appConfig = require('./src/config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('./webpack.helpers');

const isDevelopment = process.env.NODE_ENV !== 'production';

function getConfig(locale) {
  let modifiedConfig = JSON.parse(JSON.stringify(appConfig));
  if (modifiedConfig.defaultLanguage && modifiedConfig.defaultLanguage !== locale) {
    modifiedConfig.path.img = '..' + appConfig.path.img;
    modifiedConfig.path.js = '..' + appConfig.path.js;
    modifiedConfig.path.css = '..' + appConfig.path.css;
  }
  return modifiedConfig;
}

function templateParametersGenerator(compilation, assets, options) {
  return {
    compilation: compilation,
    webpack: compilation.getStats().toJson(),
    webpackConfig: compilation.options,
    htmlWebpackPlugin: {
      files: assets,
      options: options,
    },
    app: options.appConfig,
  };
}

const viewInfoes = helpers.getViewFileInfoes();

const generatePage = ({
  path = '',
  template = './src/layouts/layout.hbs',
  title,
  htmlContents,
  currentConfig,
} = {}) =>
  new HtmlWebpackPlugin({
    filename: `${path && path + '/'}index.html`,
    template: template,
    title,
    htmlContents,
    appConfig: currentConfig,
    inject: false,
    hash: true,
    templateParameters: templateParametersGenerator,
  });

const locales = helpers.getLocaleResources();

// const routesConfigs = routes.map(route =>
//   generatePage({
//     title: route.title,
//     path: route.name === 'index' ? '' : route.name,
//     htmlContents: pageContents[route.name],
//   })
// );

const routesConfigs = [];

// if (locales.length < 1) {
//   locales.push({ defaultLang: {} });
//   appConfig.defaultLanguage = 'defaultLang';
// }

Object.keys(locales).forEach(localeKey => {
  routes.forEach(route => {
    const currentAppConfig = getConfig(localeKey);
    routesConfigs.push(
      generatePage({
        title: route.title,
        path:
          (appConfig.defaultLanguage === localeKey ? '' : localeKey + '/') +
          (route.name === 'index' ? '' : route.name),
        htmlContents: handlebars.compile(viewInfoes[route.name].contents, {
          locales: locales[localeKey],
          app: currentAppConfig,
          data: route.fetch ? require(`./.temp/${route.name}.json`) : null,
        }),
        currentConfig: currentAppConfig,
      })
    );
  });
});

if (isDevelopment) routesConfigs.push(new HtmlBeautifyPlugin());

routesConfigs.push(
  new CopyWebpackPlugin([
    {
      from: './src/assets/img',
      to: '.' + appConfig.path.img,
    },
    {
      from: './src/assets/js',
      to: '.' + appConfig.path.js,
    },
    {
      from: './src/assets/css',
      to: '.' + appConfig.path.css,
    },
    {
      from: './src/robots.txt',
      to: './',
    },
    {
      from: './node_modules/html5shiv/dist/html5shiv.min.js',
      to: './' + appConfig.path.js,
    },
    {
      from: './node_modules/respond.js/dest/respond.min.js',
      to: './' + appConfig.path.js,
    },
  ])
);

module.exports = routesConfigs;
