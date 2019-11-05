import stringify from 'qs/lib/stringify';
import request from '@/utils/request';

export async function queryFollowRelations (params) {
  return request(`user/follow_relations?${stringify(params)}`);
}
