import Debounce from 'lodash-decorators/debounce';

export default {
  methods: {
    @Debounce(600)
    register (e) {
      if (e.$wx.detail.userInfo) {
        this.$app.$options.store.dispatch('auth/attemptRegister');
      }
    },
  },
};
