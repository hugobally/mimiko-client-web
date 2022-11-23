const fs = require('fs')

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/styles/_variables.scss";`,
      },
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  devServer: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
  },

  pluginOptions: {
    svgLoader: {
      svgo: {
        plugins: [],
      },
    },
  },
}
