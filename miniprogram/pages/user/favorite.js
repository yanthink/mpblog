// pages/user/favorite.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')

const pageSize = 10

Page({
  data: {
    page: 0,
    favorites: [],
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

    try {
      const params = { include: 'target', page, pageSize }

      const { data: favorites } = await wxRequest(`/api/wechat/user/favorite?${stringify(params)}`)

      if (favorites.length != pageSize) {
        noMoreData = true
      }

      this.setData({
        loading: false,
        noMoreData,
        page,
        favorites: page === 1 ? favorites : this.data.favorites.concat(favorites),
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

  onLoad () {
    this.refresh()
  },
})