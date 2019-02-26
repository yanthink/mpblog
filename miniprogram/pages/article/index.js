import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')
const { setTabBarBadgeByUnreadCount } = require('../../utils/websocket')

const pageSize = 10

Page({
  data: {
    page: 0,
    inputShowed: false,
    inputVal: "",
    articles: [],
    loading: false,
    noMoreData: false,
  },

  showInput: function () {
    this.setData({ inputShowed: true })
  },
  hideInput: function () {
    this.setData({ inputVal: '', inputShowed: false })
  },
  clearInput: function () {
    this.setData({ inputVal: '' })
  },
  
  onSearch: function (e) {
    this.setData({ inputVal: e.detail.value })

    this.refresh()
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
    const keyword = this.data.inputVal
    page++

    this.setData({ loading: true })

    try {
      const params = { keyword, page, pageSize }

      const { data: articles } = await wxRequest(`/api/wechat/article?${stringify(params)}`)

      if (articles.length != pageSize) {
        noMoreData = true
      }

      this.setData({
        loading: false,
        noMoreData,
        page,
        articles: page === 1 ? articles : this.data.articles.concat(articles),
      })
    } catch (e) {
      this.setData({ loading: false })
    }

    wx.stopPullDownRefresh()
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    this.fetchMore()
  },

  async onShow() {
    setTabBarBadgeByUnreadCount()
  },

  onLoad() {
    this.refresh()
  },
})