import Vuex from '@wepy/x';
import auth from './auth';
import { setToken as setTokenPlugin } from './plugin';

export default new Vuex.Store({
  modules: {
    auth,
  },

  plugins: [setTokenPlugin],
});
