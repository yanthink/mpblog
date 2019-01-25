const app = getApp();

Page({
  data: {
    src: '',
  },

  onLoad({ src }) {
    this.setData({ src });
  },
})
