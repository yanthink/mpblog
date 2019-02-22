import regeneratorRuntime from '../../utils/runtime'
const { login, wxRequest } = require('../../utils/helpers')
const {
  registerUnreadCountChangeListen,
  setTabBarBadgeByUnreadCount,
  getUnreadCount,
  createWebSocket,
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

  async onPullDownRefresh() {
    // todo 获取通知
    await login() // 如果登录过期则重新登录

    const { data } = await wxRequest(`/api/wechat/user/notification/unread_count`);
    setTabBarBadgeByUnreadCount(data)

    createWebSocket() // 如果socket断线的话则重新连接socket

    wx.stopPullDownRefresh()
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