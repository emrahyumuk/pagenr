const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const routeConfigs = require('./webpack.routeConfigs');

module.exports = (env, options) => {
  const isDevMode = options.mode !== 'production';
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevMode ? 'assets/js/[name].js' : 'assets/js/[name].[chunkhash].js',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isDevMode ? 'assets/css/[name].css' : 'assets/css/[name].[contenthash].css',
      }),
      ...routeConfigs,
      new CopyWebpackPlugin([
        {
          from: './src/assets',
          to: './assets',
        },
        {
          from: './src/robots.txt',
          to: './',
        },
      ]),
      // new CompressionPlugin({
      //   algorithm: 'gzip',
      // }),
    ],
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      writeToDisk: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDevMode,
              },
            },
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'ejs-webpack-loader',
              options: {
                htmlmin: true,
              },
            },
          ],
        },
      ],
    },
  };
};
