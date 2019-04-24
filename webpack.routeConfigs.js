const fs = require('fs');
const path = require('path');
let ejs = require('ejs');

const routes = require('./src/routes');
const appConfig = require('./src/config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

function readLocales(dir) {
  fs.readdirSync(dir).forEach(filename => {
    const name = path.parse(filename).name;
    locales[name] = require(path.resolve(dir, filename));
  });
}

function readFiles(dir, processFiles) {
  fs.readdirSync(dir).forEach(filename => {
    const filepath = path.resolve(dir, filename);
    const name = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const stat = fs.statSync(filepath);
    const isFile = stat.isFile();
    const contents = fs.readFileSync(filepath, 'utf8');

    if (isFile) processFiles({ filepath, name, ext, stat, contents });
  });
}

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

const pageContents = {};
readFiles('./src/views', ({ name, contents }) => (pageContents[name] = contents));

const generatePage = ({
  path = '',
  template = './src/layouts/layout.ejs',
  title,
  htmlContents,
  currentConfig,
} = {}) =>
  new HtmlWebpackPlugin({
    filename: `${path && path + '/'}index.html`,
    template: '!!ejs-webpack-loader!' + template,
    title,
    htmlContents,
    appConfig: currentConfig,
    inject: false,
    hash: true,
    templateParameters: templateParametersGenerator,
  });

const locales = [];
readLocales('./src/locales');

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
        htmlContents: ejs.render(pageContents[route.name], {
          locales: locales[localeKey],
          app: currentAppConfig,
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
  ])
);

module.exports = routesConfigs;
