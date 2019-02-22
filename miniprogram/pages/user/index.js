import regeneratorRuntime from '../../utils/runtime'
const { login } = require('../../utils/helpers')
const {
  registerUnreadCountChangeListen,
  setTabBarBadgeByUnreadCount,
  getUnreadCount,
} = require('../../utils/websocket')

const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authSetting: {},
    unreadCount: 0,
  },

  async onGetUserInfo (e) {
    if (e.detail.userInfo) { // 用户按了允许授权按钮
      await login()
      app.globalData.authSetting['scope.userInfo'] = true
      this.setData({ authSetting: app.globalData.authSetting })
    }
  },

  async onShow () {
    setTabBarBadgeByUnreadCount()

    const unreadCount = getUnreadCount()
    this.setData({ unreadCount })
  },

  async onLoad() {
    await app.globalData.getAuthSettingPromise

    const { authSetting } = app.globalData

    this.setData({ authSetting })

    registerUnreadCountChangeListen(unreadCount => this.setData({ unreadCount }))
  },
})