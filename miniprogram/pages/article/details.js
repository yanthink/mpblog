import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest, login, wxSetClipboardData } = require('../../utils/helpers')
const { setToken, checkLogin } = require('../../utils/authority')

const app = getApp()

const pageSize = 10

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authSetting: {},
    systemInfo: {},
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

  onGetUserInfo (e) {
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

  async tapFavorite() {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { id, article } = this.data
      const { data } = await wxRequest(`/api/wechat/article/${id}/favorite`, {
        method: 'POST',
      })

      this.setData({ article: { ...article, ...data }, committing: false })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async tapLikeByArticle () {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { id, article } = this.data
      const { data } = await wxRequest(`/api/wechat/article/${id}/like`, {
        method: 'POST',
      })

      this.setData({ article: { ...article, ...data }, committing: false })
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

  onWxmlTagATap (e) {
    wxSetClipboardData(e.detail.src, '链接地址')
  },

  onArticleLinkTap (e) {
    const { url } = e.currentTarget.dataset
    wxSetClipboardData(url, '文章链接')
  },

  scrollToComment () {
    const { anchorPoint } = this.data

    if (anchorPoint === 'comment-box') {
      this.setData({ anchorPoint: 'article-box' })
    } else {
      this.setData({ anchorPoint: 'comment-box' })
    }
  },

  async onLoad({ id, commentId }) {
    await app.globalData.getAuthSettingPromise
    
    const { authSetting } = app.globalData 
    const systemInfo = wx.getSystemInfoSync()
    this.setData({ id, authSetting, systemInfo })

    const params = {}
    if (commentId > 0) {
      params.comment_id = commentId
    }

    const articlePromise = wxRequest(`/api/wechat/article/${id}?${stringify(params)}`)
    const commentPromise = this.fetchComment()

    const { data: article } = await articlePromise
    this.setData({ article })
  },
})