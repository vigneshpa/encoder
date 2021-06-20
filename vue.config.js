module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    name: 'Encoder',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxOptions: {
      importWorkboxFrom: 'local',
    }
  },
  publicPath: ".",
  outputDir: "server/public",
  devServer: {
    port: 3000
  }
}