import * as services from '../services';

export default {
  namespaced: true,

  state: {
    loading: false,
    list: [],
    pagination: {
      current_page: 0,
    },
  },

  actions: {
    async fetch ({ commit }, { payload }) {
      commit('LOADING_SHOW');

      const { data: list, meta: pagination } = await services.queryArticles(payload);

      commit('queryList', { list, pagination });

      commit('LOADING_HIDE');
    },

    async appendFetch ({ commit, state }, { payload }) {
      commit('LOADING_SHOW');

      const { data: list, meta: pagination } = await services.queryArticles({
        ...payload,
        page: state.pagination.current_page + 1,
      });

      commit('appendList', { list, pagination });

      commit('LOADING_HIDE');
    },
  },

  mutations: {
    LOADING_SHOW (state) {
      state.loading = true;
    },
    LOADING_HIDE (state) {
      state.loading = false;
    },
    queryList (state, { list, pagination }) {
      state.list = list;
      state.pagination = pagination;
    },
    appendList (state, { list, pagination }) {
      state.list = state.list.concat(list);
      state.pagination = pagination;
    },
  },
};
