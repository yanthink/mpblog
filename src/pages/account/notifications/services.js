import request from '@/utils/request';

export async function queryNotifications (params) {
  return request(`user/notifications`, {
    data: params,
  });
}
