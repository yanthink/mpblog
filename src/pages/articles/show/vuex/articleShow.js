import * as services from '../services';

export default {
  namespaced: true,

  state: {
    article: {},
  },

  actions: {
    async fetchArticle ({ commit }, { id, ...other }) {
      const { data: article } = await services.queryArticle(id, other);
      commit('setArticle', article);
    },
  },

  mutations: {
    setArticle (state, article) {
      state.article = article;
    },
  },
};
