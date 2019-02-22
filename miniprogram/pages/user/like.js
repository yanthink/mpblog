// pages/user/like.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')

const pageSize = 10

Page({
  data: {
    page: 0,
    likes: [],
    loading: false,
    noMoreData: false,
  },

  async onLikeReplyTap (e) {
    const { like } = e.currentTarget.dataset

    const params = { include: 'target' }
    const { data: reply } = await wxRequest(`/api/wechat/reply/${like.target_id}?${stringify(params)}`)

    if (reply.target_type === 'App\\Models\\Comment') {
      wx.navigateTo({
        url: `/pages/article/comment-details?id=${reply.target_id}&withTarget=1&replyId=${reply.id}`,
      })
    }
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

    const params = { include: 'target', page, pageSize }

    const { data: likes } = await wxRequest(`/api/wechat/user/like?${stringify(params)}`)

    if (likes.length != pageSize) {
      noMoreData = true
    }

    this.setData({
      loading: false,
      noMoreData,
      page,
      likes: page === 1 ? likes : this.data.likes.concat(likes),
    })

    wx.stopPullDownRefresh()
  },

  onPullDownRefresh() {
    this.refresh()
  },

  onReachBottom() {
    this.fetchMore()
  },

  onLoad() {
    this.refresh()
  },
})