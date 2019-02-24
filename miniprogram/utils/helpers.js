import regeneratorRuntime from './runtime'
const { getAuthorization, getToken, setToken, checkLogin } = require('./authority')
const { getSocketTask, createWebSocket, setTabBarBadgeByUnreadCount } = require('./websocket')
const config = require('../config')

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function checkStatus(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res
  }

  const { data: { message }, statusCode } = res
  const errorText = message || codeMessage[statusCode]

  wx.showToast({
    title: errorText,
    icon: 'none',
  })

  if (statusCode === 401) {
    const token = getToken()
    if (token[2]) {
      setToken(token[0], token[1], Date.now() - 1)
    }
    login()
  }

  const error = new Error(errorText)
  error.name = statusCode
  error.res = res
  throw error
}

function wxRequest (url, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      method: 'GET',
      header: {
        Accept: 'application/x.sheng.v1+json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: getAuthorization(),
      },
      dataType: 'json',
    }

    const newOptions = {
      ...defaultOptions,
      ...options,
      url: config.baseUrl + url,
      success (res) {
        checkStatus(res)
        res.data = res.data.data;
        resolve(res)
      },
      fail (res) {
        reject(res)
      },
    }

    try {
      wx.request(newOptions)
    } catch (e) {
      reject(e)
    }
    
  })
}

function wxLogin(options) {
  return wxApiPromiseWrap(wx.login, options)
}

function wxGetUserInfo(options) {
  return wxApiPromiseWrap(wx.getUserInfo, options)
}

function wxGetSetting(options) {
  return wxApiPromiseWrap(wx.getSetting, options)
}

function wxAuthorize(options) {
  return wxApiPromiseWrap(wx.authorize, options)
}

function wxCheckSession(options) {
  return wxApiPromiseWrap(wx.checkSession, options)
}

function checkAuthorize () {
  return new Promise(async (resolve, reject) => {
    const { authSetting } = await wxGetSetting()

    if (!authSetting['scope.userInfo']) {
      wx.showToast({
        title: '尚未授权！',
        icon: 'none',
      })
      reject()
    } else {
      resolve()
    }
  })
}

function login() {
  return new Promise(async (resolve, reject) => {
    const loginStatus = checkLogin()

    if (loginStatus === 0) {
      await checkAuthorize()
    }

    if (loginStatus !== 1) {
      const { code } = await wxLogin()
      const res = await wxGetUserInfo({ withCredentials: true })

      const { data } = await wxRequest('/api/wechat/auth/login', {
        method: 'POST',
        data: {
          ...res,
          code,
        }
      })
      const {
        access_token: token,
        token_type: type,
        expires_in: expires,
        unread_count: unreadCount,
      } = data
      setToken(token, type, expires)
      
      // 设置未读消息
      setTabBarBadgeByUnreadCount(unreadCount)

      // websocket
      const socketTask = getSocketTask()
      if (socketTask && socketTask.readyState === 1) {
        await wxApiPromiseWrap(socketTask.close.bind(socketTask))
      }

      createWebSocket()
    }

    resolve()
  })
}

function wxSetClipboardData(data, name = '内容') {
  return new Promise(async (resolve, reject) => {
    try {
      await wxApiPromiseWrap(wx.setClipboardData, { data })
      await wxGetClipboardData()
      wx.showToast({
        title: `${name}已复制！`,
        icon: 'none',
      })
      resolve()
    } catch (e) {
      wx.showToast({
        title: `复制失败！`,
        icon: 'none',
      })
      reject()
    }
  })
}

function wxGetClipboardData() {
  return wxApiPromiseWrap(wx.getClipboardData)
}

function checkVersionUpdate () {
  const updateManager = wx.getUpdateManager()
  
  updateManager.onCheckForUpdate(function (res) {
    console.log(res.hasUpdate) // 请求完新版本信息的回调
  })

  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      }
    })
  })

  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
  })
}

function wxApiPromiseWrap (fn, options = {}) {
  return new Promise((resolve, reject) => {
    fn({
      ...options,
      success: resolve,
      fail: reject,
    })
  })
}

module.exports = {
  wxRequest,
  wxLogin,
  wxGetUserInfo,
  wxGetSetting,
  wxAuthorize,
  wxCheckSession,
  login,
  wxSetClipboardData,
  wxGetClipboardData,
  checkVersionUpdate,
  wxApiPromiseWrap,
}