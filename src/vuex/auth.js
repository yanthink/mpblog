import isEmpty from 'lodash/isEmpty';
import * as services from '../services';

export default {
  namespaced: true,

  state: {
    token: null,
    user: {},
    unread_count: 0,
  },

  mutations: {
    setToken (state, token) {
      state.token = token;
    },
    setUser (state, user) {
      state.user = user;
    },
  },

  actions: {
    async attemptLogin ({ dispatch }) {
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success (res) {
            resolve(res);
          },
          fail (res) {
            reject(res);
          },
        });
      });

      const { data } = await services.login(code);

      await dispatch('setToken', data.access_token);

      dispatch('loadUser');
    },

    async attemptRegister ({ dispatch }) {
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success (res) {
            resolve(res);
          },
          fail (res) {
            reject(res);
          },
        });
      });

      const userInfo = await new Promise((resolve, reject) => {
        wx.getUserInfo({
          withCredentials: true,
          success (res) {
            resolve(res);
          },
          fail (res) {
            reject(res);
          },
        });
      });

      const { data } = await services.register(code, userInfo);

      await dispatch('setToken', data.access_token);

      dispatch('loadUser');
    },

    async setToken ({ commit }, token) {
      commit('setToken', token);
    },

    async setUser ({ commit }, user) {
      commit('setUser', user);
    },

    async checkUserToken ({ dispatch, state }) {
      if (!isEmpty(state.token)) {
        return state.token;
      }

      const token = wx.getStorageSync(USER_TOKEN_STORAGE_KEY);
      if (isEmpty(token)) {
        return dispatch('attemptLogin');
      }

      await dispatch('setToken', token);

      try {
        await dispatch('loadUser');
      } catch (e) {
        if (e.response && e.response.statusCode === 401) {
          dispatch('attemptLogin');
        }
      }
    },

    async loadUser ({ dispatch }) {
      const { data } = await services.loadUserData();
      dispatch('setUser', data);
    },
  },
};
