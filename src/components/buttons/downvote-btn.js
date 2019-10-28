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
      e.detail ? item.cache.down_voters_count++ : item.cache.down_voters_count--;
      this.setData({ item });

      this.triggerEvent('after-toggle');
    },
  },
});
