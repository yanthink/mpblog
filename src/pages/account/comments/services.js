import request from '@/utils/request';

export async function queryComments (params) {
  return request('user/comments', {
    data: params,
  });
}
