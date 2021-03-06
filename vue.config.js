const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/variables.scss";`
      }
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000/',
        ws: true,
        timeout: 6000,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      symlinks: false
    },
    plugins: [
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['java', 'javascript', 'css', 'html', 'typescript', 'json']
      })
    ]
  }
}
