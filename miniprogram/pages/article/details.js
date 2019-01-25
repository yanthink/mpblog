const app = getApp();
const {
  config
} = app;

Page({
  data: {
    commentContent: '',
    article: {},
    highlightLanguages: [
      'bash',
      'css',
      'ini',
      'java',
      'json',
      'less',
      'scss',
      'php',
      'python',
      'go',
      'sql',
      'swift',
    ],
  },

  sendComment(e) {
    const login = function () {
      wx.login({
        success(res) {
          if (res.code) {
            // todo 登录
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }

    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success: login, 
          })
        } else {
          login()
        }
      }
    })

    console.info(111)

    this.setData({
      commentContent: e.detail.value
    })
  },

  wxmlTagATap(e) {
    wx.navigateTo({
      url: '/pages/webview/index?src=' + e.detail.src,
    })
  },

  onLoad({
    id
  }) {
    wx.request({
      url: config.baseUrl + '/api/article/' + id,
      headers: {
        Accept: 'application/x.sheng.v1+json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      success: ({
        data: {
          data: article
        }
      }) => {
        this.setData({
          article
        });
      }
    });
  },
})