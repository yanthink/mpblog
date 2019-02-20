import { stringify } from 'qs'
import regeneratorRuntime from '../../utils/runtime'
const { wxRequest, login } = require('../../utils/helpers')

const app = getApp()

const pageSize = 5

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authSetting: {},
    replyId: null,
    id: null,
    anchorPoint: '',
    commentContent: '',
    commentFocus: false,
    comment: {},
    commentByReply: null,
    page: 0,
    replys: [],
    replyLoading: false,
    noMoreReply: false,
    committing: false,
  },

  onGetUserInfo: function (e) {
    if (e.detail.userInfo) { // 用户按了允许授权按钮
      app.globalData.authSetting['scope.userInfo'] = true
      this.setData({ authSetting: app.globalData.authSetting })

      login()
    }
  },

  onCommentFocus () {
    this.setData({ commentFocus: true })
  },

  onCommentBlur () {
    if (this.triggerOnTapReply) {
      this.triggerOnTapReply = false
      return false
    }
    this.triggerOnCommentBlur = true
    this.setData({ commentFocus: false, commentByReply: null })
  },

  onCommentContentChange (e) {
    this.setData({ commentContent: e.detail.value })
  },

  onTapReply (e) {
    if (this.triggerOnCommentBlur) {
      this.triggerOnCommentBlur = false
      return false
    }

    this.triggerOnTapReply = true

    const { commentByReply } = this.data
    if (!commentByReply) {
      const { reply } = e.currentTarget.dataset
      this.setData({ commentByReply: reply, commentFocus: true })
    } else {
      this.setData({ commentByReply: null, commentFocus: false })
    }
  },

  async tapLikeByComment(e) {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { commentId } = e.currentTarget.dataset
      const { data: comment } = await wxRequest(`/api/wechat/comment/${commentId}/like`, {
        method: 'POST',
        data: { include: 'user' },
      })

      this.setData({ comment, committing: false })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async tapLikeByReply(e) {
    if (this.data.committing) {
      return false
    }

    await login()

    try {
      this.setData({ committing: true })

      const { replyId } = e.currentTarget.dataset
      const { data: reply } = await wxRequest(`/api/wechat/reply/${replyId}/like`, {
        method: 'POST',
        data: { include: 'user' },
      })

      const { replys } = this.data

      for (const value of replys) {
        if (value.id === reply.id) {
          value.like_count = reply.like_count
          value.likes = reply.likes
          break
        }
      }

      this.setData({ replys, committing: false })
    } catch (e) {
      this.setData({ committing: false })
    }
    
  },

  async sendReply (e) {
    if (this.data.committing) {
      return false
    }

    const { id, commentContent: content, commentByReply } = this.data
    
    if (!content) {
      return false
    }

    await login()

    try {
      this.setData({ anchorPoint: '' })

      const params = { content, include: 'user,parent.user' }
      if (commentByReply) {
        params.parent_id = commentByReply.id
      }
      const { data } = await wxRequest(`/api/wechat/comment/${id}/reply`, {
        method: 'POST',
        data: params,
      })

      const { replys, comment } = this.data
      replys.unshift(data)
      comment.reply_count++

      this.setData({
        comment,
        replys,
        commentContent: '',
        anchorPoint: 'comment-box',
        committing: false,
      })
    } catch (e) {
      this.setData({ committing: false })
    }
  },

  async fetchReply () {
    if (this.data.replyLoading || this.data.noMoreReply) {
      return false;
    }

    const { id } = this.data
    let { page, noMoreReply } = this.data

    page++
    this.setData({ replyLoading: true })

    const params = { include: 'user,parent.user', page, pageSize }

    const { data: replys } = await wxRequest(`/api/wechat/comment/${id}/reply?${stringify(params)}`)

    if (replys.length != pageSize) {
      noMoreReply = true
    }

    this.setData({
      replyLoading: false,
      noMoreReply,
      page,
      replys: this.data.replys.concat(replys),
    })
  },

  async onLoad({ id }) {
    await app.globalData.getAuthSettingPromise

    const { authSetting } = app.globalData
    this.setData({ id, authSetting })

    const commentParams = { include: 'user' }

    const commentPromise = wxRequest(`/api/wechat/comment/${id}?${stringify(commentParams)}`)
    const replyPromise = this.fetchReply()

    const { data: comment } = await commentPromise
    this.setData({ comment })
  },
})