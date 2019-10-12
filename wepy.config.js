const path = require('path');
const DefinePlugin = require('@wepy/plugin-define');
const PluginUglifyjs = require('@wepy/plugin-uglifyjs');
const prod = process.env.NODE_ENV === 'production';

const plugins = [
  DefinePlugin({
    API_URL: !prod ? '"https://api.blog.test/api/"' : '"https://www.einsition.com/api/"',
    USER_TOKEN_STORAGE_KEY: '"APP_USER_TOKEN"',
  }),
];

if (prod) {
  plugins.push(PluginUglifyjs({}));
}

module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  cliLogs: !prod,
  build: {},
  static: [
    'src/static',
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    aliasFields: ['wepy', 'weapp'],
    modules: ['node_modules'],
  },
  compilers: {
    less: {
      compress: prod,
    },
    babel: {
      sourceMap: !prod,
      presets: [
        '@babel/preset-env',
      ],
      plugins: [
        '@wepy/babel-plugin-import-regenerator',
        [
          '@babel/plugin-proposal-decorators',
          { legacy: true },
        ],
      ],
    },
  },
  plugins,
  appConfig: {
    noPromiseAPI: ['createSelectorQuery'],
  },
};

