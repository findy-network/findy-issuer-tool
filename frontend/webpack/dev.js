const merge = require('webpack-merge');

const common = require('./common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: common.output.path,
    historyApiFallback: true
  }
});
