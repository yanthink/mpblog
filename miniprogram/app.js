import regeneratorRuntime from './utils/runtime'
const { login, wxRequest, wxGetSetting, checkVersionUpdate } = require('./utils/helpers.js')
const { createWebSocket, setTabBarBadgeByUnreadCount } = require('./utils/websocket.js')

//app.js
App({
  globalData: {
    authSetting: {},
  },

  async onShow () {
    await login()

    // 获取未读通知条数
    const { data } = await wxRequest(`/api/wechat/user/notification/unread_count`);
    setTabBarBadgeByUnreadCount(data)

    setTimeout(createWebSocket, 1000)
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

    wx.onNetworkStatusChange(isConnected => {
      if (isConnected) {
        setTimeout(createWebSocket, 1000)
      }
    })
  },

  async getAuthSetting () {
    return new Promise(async (resolve, reject) => {
      const { authSetting } = await wxGetSetting()

      this.globalData.authSetting = authSetting
      resolve()
    })
  }
})