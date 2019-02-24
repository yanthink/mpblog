import regeneratorRuntime from './utils/runtime'
const { login, wxGetSetting, checkVersionUpdate } = require('./utils/helpers.js')
const { createWebSocket } = require('./utils/websocket.js')

//app.js
App({
  globalData: {
    authSetting: {},
  },

  async onShow () {
    await login()
    createWebSocket()
  },

  onLaunch () {    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    checkVersionUpdate()

    this.globalData.getAuthSettingPromise = this.getAuthSetting()
  },

  async getAuthSetting () {
    return new Promise(async (resolve, reject) => {
      const { authSetting } = await wxGetSetting()

      this.globalData.authSetting = authSetting
      resolve()
    })
  }
})