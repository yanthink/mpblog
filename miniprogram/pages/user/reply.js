// pages/user/reply.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')

const pageSize = 10

Page({
  data: {
    page: 0,
    replys: [],
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

    const params = { include: 'target.user,parent.user,target.target', page, pageSize }

    const { data: replys } = await wxRequest(`/api/wechat/user/reply?${stringify(params)}`)

    if (replys.length != pageSize) {
      noMoreData = true
    }

    this.setData({
      loading: false,
      noMoreData,
      page,
      replys: page === 1 ? replys : this.data.replys.concat(replys),
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