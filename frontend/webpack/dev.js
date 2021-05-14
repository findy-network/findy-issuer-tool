const { merge } = require('webpack-merge');

const common = require('./common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: common.output.path,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
      'Access-Control-Allow-Origin': '*',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
});
