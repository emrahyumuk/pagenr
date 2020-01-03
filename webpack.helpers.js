const fs = require('fs');
const path = require('path');

const config = require('./app.config.js');

const helpers = {
  getFullPath: pathProp => {
    return path.join(process.env.APP_DIR, config.path.root, pathProp);
  },
  getLocaleResources: () => {
    const localizationPath = helpers.getFullPath(config.path.localization);
    const locales = {};
    fs.readdirSync(localizationPath).forEach(filename => {
      const name = path.parse(filename).name;
      locales[name] = require(path.resolve(localizationPath, filename));
    });
    return locales;
  },
  getViewFileInfoes: () => {
    const viewFiles = {};
    const viewPath = helpers.getFullPath(config.path.view);
    fs.readdirSync(viewPath).forEach(filename => {
      const filepath = path.resolve(viewPath, filename);
      const stat = fs.statSync(filepath);
      const isFile = stat.isFile();
      if (isFile) {
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        const contents = fs.readFileSync(filepath, 'utf8');

        viewFiles[name] = { filepath, ext, stat, contents };
      }
    });
    return viewFiles;
  },
  getHtmlWebPluginConfigs: ({
    path = '',
    template = helpers.getFullPath('layout.ejs'),
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
    }),
};

module.exports = helpers;
