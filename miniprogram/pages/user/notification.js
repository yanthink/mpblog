// pages/user/notification.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest, login } = require('../../utils/helpers')
const { subUnreadCount } = require('../../utils/websocket')

const pageSize = 10

Page({
  data: {
    page: 0,
    notifications: [],
    loading: false,
    noMoreData: false,
    reading: false,
  },

  async onReadTap (e) {
    if (this.data.reading) {
      return false
    }

    this.setData({ reading: true })

    const { notification } = e.currentTarget.dataset

    switch (notification.type) {
      case 'App\\Notifications\\LikeArticle':
        wx.navigateTo({
          url: `/pages/article/details?id=${notification.data.target_id}`,
        })
        break;
      case 'App\\Notifications\\LikeComment':
        wx.navigateTo({
          url: `/pages/article/comment-details?id=${notification.data.target_id}&withTarget=1`,
        })
        break;
      case 'App\\Notifications\\LikeReply':
        if (notification.data.comment_id > 0) {
          wx.navigateTo({
            url: `/pages/article/comment-details?id=${notification.data.comment_id}&withTarget=1&replyId=${notification.data.target_id}`,
          })
        }
        break;
      case 'App\\Notifications\\CommentArticle':
        wx.navigateTo({
          url: `/pages/article/details?id=${notification.data.target_id}&commentId=${notification.data.form_id}`,
        })
        break;
      case 'App\\Notifications\\ReplyComment':
        if (notification.data.comment_id > 0) {
          wx.navigateTo({
            url: `/pages/article/comment-details?id=${notification.data.comment_id}&withTarget=1&replyId=${notification.data.form_id}`,
          })
        }
        break;
    }

    try {
      if (!notification.read_at) {
        const { data } = await wxRequest(`/api/wechat/user/notification/${notification.id}/read`, {
          method: 'post',
        })

        if (data) {
          const { notifications } = this.data
          for (const value of notifications) {
            if (value.id === notification.id) {
              value.read_at = 1
              break
            }
          }

          this.setData({ notifications })
          subUnreadCount()
        }
      }
    } catch (e) {
    }

    this.setData({ reading: false })
  },

  refresh() {
    if (this.data.loading) {
      return false;
    }

    this.setData({ page: 0, noMoreData: false })
    this.fetchMore()
  },

  async fetchMore() {
    if (this.data.loading || this.data.noMoreData) {
      return false;
    }

    let page = this.data.page
    let noMoreData = this.data.noMoreData
    page++

    this.setData({ loading: true })

    try {
      const params = { page, pageSize }

      const { data: notifications } = await wxRequest(`/api/wechat/user/notification?${stringify(params)}`)

      if (notifications.length != pageSize) {
        noMoreData = true
      }

      this.setData({
        loading: false,
        noMoreData,
        page,
        notifications: page === 1 ? notifications : this.data.notifications.concat(notifications),
      })
    } catch(e) {
      this.setData({ loading: false })
    }
    
    wx.stopPullDownRefresh()
  },

  onPullDownRefresh() {
    this.refresh()
  },

  onReachBottom() {
    this.fetchMore()
  },

  async onLoad() {
    await login()
    this.refresh()
  },
})