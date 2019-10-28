Component({
  properties: {
    relation: String,
    item: {
      type: Object,
    },
    hideText: Boolean,
  },

  methods: {
    afterToggle (e) {
      const item = { ...this.data.item };
      e.detail ? item.cache.likes_count++ : item.cache.likes_count--;
      this.setData({ item });

      this.triggerEvent('after-toggle');
    },
  },
});
