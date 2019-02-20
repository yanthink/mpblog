// pages/article/like-list.js
import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest } = require('../../utils/helpers')

const pageSize = 10

Page({
  data: {
    id: null,
    target: null,
    likes: [],
    page: 0,
    loading: false,
    noMoreData: false,
  },

  async fetchLike() {
    if (this.data.loading || this.data.noMoreData) {
      return false;
    }

    const { id, target } = this.data
    let { page, noMoreData } = this.data

    page++
    this.setData({ loading: true })

    const params = { include: 'user', page, pageSize }

    const { data: likes } = await wxRequest(`/api/wechat/${target}/${id}/like?${stringify(params)}`)

    if (likes.length != pageSize) {
      noMoreData = true
    }

    this.setData({
      loading: false,
      noMoreData,
      page,
      likes: this.data.likes.concat(likes),
    })
  },

  onLoad: function ({ id, target }) {
    this.setData({ id, target })

    this.fetchLike()
  },
})