'use strict'

module.exports = config => {
  config.set({
    browsers: ['Electron', 'ChromeHeadless'],
    frameworks: ['mocha'],
    files: ['./karma-tests.js'],
    singleRun: true,
    preprocessors: {
      './karma-tests.js': ['webpack']
    },
    webpack: {
      externals: {
        'standard-settings': {
          amd: 'standard-settings',
          root: 'standardSettings',
          commonjs: 'standard-settings',
          commonjs2: 'standard-settings'
        }
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      }
    },
    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-electron',
      'karma-chrome-launcher'
    ]
  })
}
