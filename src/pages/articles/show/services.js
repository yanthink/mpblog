import request from '@/utils/request';

export async function queryArticle (id, params) {
  return request(`articles/${id}`, {
    data: params,
  });
}
