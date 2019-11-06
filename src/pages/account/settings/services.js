import request from '@/utils/request';

export async function updateBaseInfo (params) {
  return request('user/base_info', {
    method: 'POST',
    data: params,
  });
}

export async function updateSettings (params) {
  return request('user/settings', {
    method: 'POST',
    data: params,
  });
}

export async function updatePassword (params) {
  return request('user/password', {
    method: 'POST',
    data: params,
  });
}

export async function sendEmailCode (email) {
  return request('user/send_email_code', {
    method: 'POST',
    data: { email },
  });
}
