export default {
  computed: {
    user () {
      return this.$app.$options.store.state.auth.user;
    },

    unreadCount () {
      return this.$app.$options.store.state.auth.unread_count;
    },

    isLogged () {
      return !!this.user.id;
    },
  },

  watch: {
    user (newUser, oldUser) {
    },

    unreadCount (newUnreadCount, oldUnreadCount) {
    },
  },
};
