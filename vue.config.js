const fs = require('fs');

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/styles/_variables.scss";`,
      },
    },
  },
  devServer: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  }
}
