const merge = require('webpack-merge');
const VersionFile = require('webpack-version-file');

const common = require('./common.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: `[contenthash].${common.output.filename}`
  },
  plugins: [
    new VersionFile({
      output: `${common.output.path}/version.txt`
    })
  ]
});
