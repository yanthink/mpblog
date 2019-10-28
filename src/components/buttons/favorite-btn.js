Component({
  properties: {
    relation: String,
    item: {
      type: Object,
    },
  },

  methods: {
    afterToggle (e) {
      const item = { ...this.data.item };
      e.detail ? item.cache.favorites_count++ : item.cache.favorites_count--;
      this.setData({ item });

      this.triggerEvent('after-toggle');
    },
  },
});
