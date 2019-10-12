import request from '@/utils/request';

export async function queryArticles (params) {
  return request('articles', {
    data: params,
  });
}
