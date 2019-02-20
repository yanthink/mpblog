import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest, login } = require('../../utils/helpers')
const { setToken, checkLogin } = require('../../utils/authority')

const app = getApp()

const pageSize = 10

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authSetting: {},
    id: null,
    commentContent: '',
    anchorPoint: '',
    commentFocus: false,
    article: {},
    highlightLanguages: [
      'bash',
      'css',
      'ini',
      'java',
      'json',
      'less',
      'scss',
      'php',
      'python',
      'go',
      'sql',
      'swift',
    ],
    page: 0,
    comments: [],
    commentLoading: false,
    noMoreComment: false,
    committing: false,
  },

  onGetUserInfo: function (e) {
    if (e.detail.userInfo) { // 用户按了允许授权按钮
      app.globalData.authSetting['scope.userInfo'] = true
      this.setData({ authSetting: app.globalData.authSetting })

      login()
    }
  },

  onCommentFocus() {
    this.setData({ commentFocus: true })
  },

  onCommentBlur() {
    this.setData({ commentFocus: false })
  },

  onCommentContentChange(e) {
    this.setData({ commentContent: e.detail.value })
  },

  async tapLikeByArticle () {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { id } = this.data
      const { data: article } = await wxRequest(`/api/wechat/article/${id}/like`, {
        method: 'POST',
      })

      this.setData({ article, committing: false })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async tapLikeByComment (e) {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { commentId } = e.currentTarget.dataset
      const { data: comment } = await wxRequest(`/api/wechat/comment/${commentId}/like`, {
        method: 'POST',
      })

      const { comments } = this.data
      for (const value of comments) {
        if (value.id === comment.id) {
          value.like_count = comment.like_count
          value.likes = comment.likes
          break
        }
      }

      this.setData({ comments, committing: false })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async sendComment () {
    if (this.data.committing) {
      return false
    }

    const { id, commentContent: content } = this.data

    if (!content) {
      return false
    }

    await login()

    try {
      this.setData({ anchorPoint: '', committing: true })

      const { data } = await wxRequest(`/api/wechat/article/${id}/comment`, {
        method: 'POST',
        data: {
          content,
          include: 'user',
        },
      })

      const { comments, article } = this.data
      comments.unshift(data)
      article.comment_count++

      this.setData({
        article,
        comments,
        commentContent: '',
        anchorPoint: 'comment-box',
        committing: false,
      })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async fetchComment () {
    if (this.data.commentLoading || this.data.noMoreComment) {
      return false;
    }

    const { id } = this.data
    let { page, noMoreComment } = this.data
    
    page++
    this.setData({ commentLoading: true })

    const params = { include: 'user', page, pageSize }

    const { data: comments } = await wxRequest(`/api/wechat/article/${id}/comment?${stringify(params)}`)

    if (comments.length != pageSize) {
      noMoreComment = true
    }

    this.setData({
      commentLoading: false,
      noMoreComment,
      page,
      comments: this.data.comments.concat(comments),
    })
  },

  wxmlTagATap (e) {
    wx.navigateTo({
      url: `/pages/webview/index?src=${e.detail.src}`,
    })
  },

  scrollToComment () {
    const { anchorPoint } = this.data

    if (anchorPoint === 'comment-box') {
      this.setData({ anchorPoint: 'article-box' })
    } else {
      this.setData({ anchorPoint: 'comment-box' })
    }
  },

  async onLoad({ id }) {
    await app.globalData.getAuthSettingPromise
    
    const { authSetting } = app.globalData 
    this.setData({ id, authSetting })

    const articlePromise = wxRequest(`/api/wechat/article/${id}`)
    const commentPromise = this.fetchComment()

    const { data: article } = await articlePromise
    this.setData({ article })
  },
})