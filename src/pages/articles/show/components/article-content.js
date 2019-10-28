Component({
  properties: {
    article: Object,
  },

  observers: {
    article (article) {
      if (article && article.id) {
        const articleUrl = `https://www.einsition.com/articles/${article.id}`;
        this.setData({ articleUrl });
      }
    },
  },

  data: {
    articleUrl: '',
  },

  methods: {
    onWxmlTagATap (e) {
      wx.setClipboardData({
        data: e.detail.src,
        success () {
          wx.showToast({
            title: '已复制到剪贴板！',
            icon: 'none',
          });
        },
      });
    },

    copyArticleUrl () {
      wx.setClipboardData({
        data: this.data.articleUrl,
        success () {
          wx.showToast({
            title: '已复制到剪贴板！',
            icon: 'none',
          });
        },
      });
    },
  },
});
