import request from '@/utils/request';

Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    relation: String,
    action: String,
    item: Object,
  },

  data: {
    types: {
      article: 'App\\Models\\Article',
      comment: 'App\\Models\\Comment',
    },
    actions: {
      like: 'has_liked',
      favorite: 'has_favorited',
      upvote: 'has_up_voted',
      downvote: 'has_down_voted',
    },
  },

  methods: {
    async toggle () {
      await request(`relations/${this.data.action}`, {
        method: 'POST',
        data: {
          followable_type: this.data.types[this.data.relation],
          followable_id: this.data.item.id,
        },
      });

      const item = { ...this.data.item };
      item[this.data.actions[this.data.action]] = !item[this.data.actions[this.data.action]];

      this.triggerEvent('after-toggle', item[this.data.actions[this.data.action]]);

      this.setData({ item });
    },
  },
});
