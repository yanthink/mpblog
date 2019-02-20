import regeneratorRuntime from './runtime'
const { getAuthorization } = require('./authority')
const config = require('../config')

let socketTask = null
let lockConnect = false // 避免ws重复连接

function createWebSocket () {
  (async () => {
    if (lockConnect) {
      return false
    }
    lockConnect = true

    socketTask = await wxConnectSocket(config.socketUrl, {
      header: {
        Authorization: getAuthorization(),
      },
    })

    heartbeat.reset().start() // 心跳检测重置

    socketTask.onMessage(({ data: msg }) => { // 通知消息
      heartbeat.reset().start() // 拿到任何消息都说明当前连接是正常的
      const { event, data } = JSON.parse(msg)
      switch (event) {
        case 'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated':
          addUnreadCount()
          break
      }
    })

    socketTask.onClose((data) => {
      lockConnect = false
      socketTask = null
      // createWebSocket()
    })
  })()
}

function getSocketTask() {
  return socketTask
}

function wxConnectSocket(url, options) {
  const socketTask = wx.connectSocket({
    url,
    ...options,
  })

  wx.onSocketOpen(() => {
    console.info('websocket opened!')
  })

  wx.onSocketClose(() => {
    console.info('websocket fail!')
  })

  return new Promise((resolve, reject) => {
    socketTask.onOpen(() => {
      resolve(socketTask)
    })

    socketTask.onError(reject)
  })
}

const heartbeat = {
  timeout: config.socketHeartTimeout,
  pingTimeout: null,
  reset () {
    clearTimeout(this.pingTimeout)
    return this;
  },
  start () {
    this.pingTimeout = setTimeout(async () => {
      await wxApiPromiseWrap(socketTask.send.bind(socketTask), { data: 'ping' }) // 这里发送一个心跳
      this.reset().start()
    }, this.timeout)
  },
}

let unreadCount = 0 // 未读消息条数
function setTabBarBadgeByUnreadCount(count) {
  if (count && count != unreadCount) {
    unreadCount = count
  }
  if (unreadCount > 0) {
    wx.setTabBarBadge({
      index: 1,
      text: String(unreadCount > 99 ? '99+' : unreadCount),
    })
  } else {
    wx.removeTabBarBadge({ index: 1 })
  }
}

function addUnreadCount() {
  unreadCount++
  setTabBarBadgeByUnreadCount()
}

function subUnreadCount() {
  unreadCount--
  setTabBarBadgeByUnreadCount()
}

function wxApiPromiseWrap(fn, options = {}) {
  return new Promise((resolve, reject) => {
    fn({
      ...options,
      success: resolve,
      fail: reject,
    })
  })
}

module.exports = {
  createWebSocket: createWebSocket,
  getSocketTask: getSocketTask,
  setTabBarBadgeByUnreadCount,
  addUnreadCount,
  subUnreadCount,
}
