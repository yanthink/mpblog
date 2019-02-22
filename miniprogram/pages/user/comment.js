// pages/user/comment.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')

const pageSize = 10

Page({
  data: {
    page: 0,
    comments: [],
    loading: false,
    noMoreData: false,
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

    const { data: comments } = await wxRequest(`/api/wechat/user/comment?${stringify(params)}`)

    if (comments.length != pageSize) {
      noMoreData = true
    }

    this.setData({
      loading: false,
      noMoreData,
      page,
      comments: page === 1 ? comments : this.data.comments.concat(comments),
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