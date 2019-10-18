import Echo from 'laravel-echo';
// https://github.com/10cella/weapp.socket.io/issues/46#issuecomment-541518603
import io from '@/libs/weapp.socket.io';
import {
  setToken as httpSetToken,
  setSocketId as httpSetSocketId,
} from '@/utils/request';

export function setToken (store) {
  store.subscribe((mutation, { auth }) => {
    if (mutation.type === 'auth/setToken') {
      httpSetToken(auth.token);

      wx.setStorageSync(USER_TOKEN_STORAGE_KEY, auth.token);
    }
  });
}

export function createWebSocketPlugin (store) {
  let echo;

  store.subscribe((mutation, { auth }) => {
    if (mutation.type === 'auth/setUser') {

      if (echo) {
        httpSetSocketId('');
        echo.disconnect();
      }

      echo = new Echo({
        client: io,
        transports: ['websocket'],
        broadcaster: 'socket.io',
        host: SOCKET_HOST,
        withoutInterceptors: true,
        auth: {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      });

      httpSetSocketId(echo.socketId());

      echo.private(`App.Models.User.${auth.user.id}`)
        .listen('UnreadNotificationsChange', (data) => {
          store.commit('auth/setUnreadCount', data.unread_count);
        })
        .notification(notification => {
          console.info(notification);
        });
    }
  });
}
