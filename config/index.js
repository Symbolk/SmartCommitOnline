module.exports = {
  dev: {
    proxyTable: {
      assetsSubDirectory: 'static',
      assetsPublicPath: '/',
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  }
}
