import unionBy from 'lodash/unionBy';
import * as services from '../services';

export default {
  namespaced: true,

  state: {
    article: {},
    comments: [],
    pagination: {
      current_page: 0,
    },
    fetchingComments: false,
    submittingComment: false,
  },

  actions: {
    async fetchArticle ({ commit }, { id, ...other }) {
      const { data: article } = await services.queryArticle(id, other);
      commit('setArticle', article);
    },

    async fetchComments ({ commit }, { article_id, ...other }) {
      commit('COMMENTS_LOADING_SHOW');

      try {
        const { data: comments, meta: pagination } = await services.queryArticleComments(article_id, other);
        commit('queryComments', { comments, pagination });
      } finally {
        commit('COMMENTS_LOADING_HIDE');
      }
    },

    async appendFetchComments ({ commit, state }, { article_id, ...other }) {
      commit('COMMENTS_LOADING_SHOW');

      try {
        const { data: comments, meta: pagination } = await services.queryArticleComments(article_id, {
          ...other,
          page: state.pagination.current_page + 1,
        });
        commit('appendComments', { comments, pagination });
      } finally {
        commit('COMMENTS_LOADING_HIDE');
      }
    },

    async submitComment ({ commit, state }, { article_id, content, ...other }) {
      commit('SUBMITTING_COMMENT_SHOW');

      try {
        const { data } = await services.postArticleComment(article_id, content, other);
        const comments = [data].concat(state.comments);
        commit('queryComments', { comments, pagination: state.pagination });
      } finally {
        commit('SUBMITTING_COMMENT_HIDE');
      }
    },
  },

  mutations: {
    COMMENTS_LOADING_SHOW (state) {
      state.fetchingComments = true;
    },

    COMMENTS_LOADING_HIDE (state) {
      state.fetchingComments = false;
    },

    SUBMITTING_COMMENT_SHOW (state) {
      state.submittingComment = true;
    },

    SUBMITTING_COMMENT_HIDE (state) {
      state.submittingComment = false;
    },

    setArticle (state, article) {
      state.article = article;
    },

    queryComments (state, { comments, pagination }) {
      state.comments = comments;
      state.pagination = pagination;
    },
    appendComments (state, { comments, pagination }) {
      state.comments = unionBy(state.comments.concat(comments), 'id');
      state.pagination = pagination;
    },
  },
};
