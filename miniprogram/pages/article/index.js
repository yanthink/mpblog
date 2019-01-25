const app = getApp()
const {
  config
} = app

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
    this.setData({
      inputShowed: true
    })
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    })
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    })
  },
  
  onSearch: function (e) {
    this.setData({
      inputVal: e.detail.value
    })

    this.refresh()
  },

  refresh() {
    if (this.data.loading) {
      return false;
    }

    this.setData({ page: 0, articles: [], noMoreData: false })
    this.fetchMore()
  },

  fetchMore() {
    if (this.data.loading || this.data.noMoreData) {
      return false;
    }

    let page = this.data.page
    let noMoreData = this.data.noMoreData
    const keyword = this.data.inputVal
    page++

    this.setData({ loading: true })

    wx.request({
      url: config.baseUrl + '/api/article?keyword=' + keyword + '&page=' + page + '&pageSize=' + pageSize,
      headers: {
        Accept: 'application/x.sheng.v1+json',
        'Content-Type': 'application/json charset=utf-8',
      },
      success: ({
        data: {
          data: articles
        }
      }) => {
        if (articles.length != pageSize) {
          noMoreData = true
        }

        this.setData({
          loading: false,
          noMoreData,
          page,
          articles: this.data.articles.concat(articles)
        })
      }
    })

  },

  onPullDownRefresh: function () {
    console.info(111);
  },

  onLoad() {
    this.refresh()
  },
})