import regeneratorRuntime from '../../utils/runtime'
const { setToken } = require('../../utils/authority');
const { login } = require('../../utils/helpers')
const app = getApp();

Page({
  data: {
    authSetting: {},
    uuid: '',
  },

  async onGetUserInfo(e) {
    if (e.detail.userInfo) { // 用户按了允许授权按钮
      setToken();
      await login({ uuid: this.data.uuid });

      wx.reLaunch({
        url: '/pages/user/index'
      })

      app.globalData.authSetting['scope.userInfo'] = true;
      this.setData({ authSetting: app.globalData.authSetting });

      wx.showToast({
        title: '登录成功',
        icon: 'none',
      });
    }
  },

  async onLoad(query) {
    await app.globalData.getAuthSettingPromise;
    const { authSetting } = app.globalData;
    this.setData({ authSetting });

    const scene = decodeURIComponent(query.scene);
    const uuid = scene.split('/')[1];
    this.setData({ uuid });
  },
})