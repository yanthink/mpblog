import regeneratorRuntime from '../../utils/runtime'
const { setTabBarBadgeByUnreadCount } = require('../../utils/websocket')

const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authSetting: {},
  },

  async onShow () {
    setTabBarBadgeByUnreadCount()
  },

  async onLoad() {
    await app.globalData.getAuthSettingPromise

    const { authSetting } = app.globalData

    this.setData({ authSetting })
  },
})