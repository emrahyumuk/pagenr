const fs = require('fs');
const path = require('path');

const routes = require('./src/routes');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

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

const pageContents = {};
readFiles('./src/views', ({ name, contents }) => (pageContents[name] = contents));

const generatePage = ({
  path = '',
  template = './src/layouts/layout.ejs',
  title,
  htmlContents,
} = {}) =>
  new HtmlWebpackPlugin({
    filename: `${path && path + '/'}index.html`,
    template: '!!ejs-webpack-loader!' + template,
    title,
    htmlContents,
    inject: false,
    hash: true,
  });

const routesConfigs = routes.map(route =>
  generatePage({
    title: route.title,
    path: route.name === 'index' ? '' : route.name,
    htmlContents: pageContents[route.name],
  })
);

if (isDevelopment) routesConfigs.push(new HtmlBeautifyPlugin());

module.exports = routesConfigs;
