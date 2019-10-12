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

  mutations: {
    LOADING_SHOW (state) {
      state.loading = true;
    },
    LOADING_HIDE (state) {
      state.loading = false;
    },
    queryList (state, { payload }) {
      state.list = payload.list;
      state.pagination = payload.pagination;
    },
    appendList (state, { payload }) {
      state.list = state.list.concat(payload.list);
      state.pagination = payload.pagination;
    },
  },

  actions: {
    async fetch ({ commit }, { payload }) {
      commit('LOADING_SHOW');

      const { data, meta } = await services.queryArticles(payload);

      commit({
        type: 'queryList',
        payload: {
          list: data,
          pagination: meta,
        },
      });

      commit('LOADING_HIDE');
    },

    async appendFetch ({ commit, state }, { payload }) {
      commit('LOADING_SHOW');

      const { data, meta } = await services.queryArticles({
        ...payload,
        page: state.pagination.current_page + 1,
      });

      commit({
        type: 'appendList',
        payload: {
          list: data,
          pagination: meta,
        },
      });

      commit('LOADING_HIDE');
    },
  },
};
