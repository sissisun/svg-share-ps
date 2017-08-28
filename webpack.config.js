const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const SRC_DIR = path.join(__dirname, 'src')
const DIST_DIR = path.join(__dirname, 'public')

const pages = ['index']

module.exports = {
  resolve: {
      extensions: ['.js', '.scss'], //省略后缀，必须有''，否则全部都有时反而找不到
      alias: {
          Styles: path.resolve(SRC_DIR, 'styles')
      }
  },
  entry: pages.reduce((result, page) => {  //webpack开始打包的入口
        result[page] = path.join(SRC_DIR, 'scripts', page + '.js')
        return result
    }, {}),
  output: {
    path: DIST_DIR,
    publicPath: '/',
    filename: 'scripts/[name].js'
  },
  module: {
    rules: [
      {test: /\.js$/, include: [ SRC_DIR ], loader: 'babel-loader', options: {presets: ["es2015"]}}, // 使用babel-loader将src_dir目录下的js转义成安全的js
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader!sass-loader'
        })
      },
      {test: /\.(png|jpg|jpeg)$/, loader: 'url-loader?limit=2048&name=styles/images/[hash].[ext]'}
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles/[name].css')
  ]
}