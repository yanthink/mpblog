import { setToken as httpSetToken } from '@/utils/request';

export function setToken (store) {
  store.subscribe((mutation, { auth }) => {
    if (mutation.type === 'auth/setToken') {
      httpSetToken(auth.token);

      wx.setStorageSync(USER_TOKEN_STORAGE_KEY, auth.token);
    }
  });
}

