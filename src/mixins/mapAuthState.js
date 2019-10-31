export default {
  computed: {
    token () {
      return this.$app.$store.state.auth.token;
    },

    user () {
      return this.$app.$store.state.auth.user;
    },

    unreadCount () {
      return this.$app.$store.state.auth.unread_count;
    },

    authorized () {
      return !!this.token;
    },

    isLogged () {
      return !!this.user.id;
    },
  },

  created () {
    ['token', 'user', 'unreadCount'].map(k => this.$watch(k, () => {}));
  },

  onUnload () {
    this._watcher.teardown();
  },
};
