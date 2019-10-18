import request from '@/utils/request';

export async function login (code) {
  return request('auth/wechat_login', {
    method: 'POST',
    data: { code },
  });
}

export async function scanLogin (code, uuid) {
  return request('auth/wechat_scan_login', {
    method: 'POST',
    data: { code, uuid },
  });
}

export async function register (code, params) {
  return request('auth/wechat_register', {
    method: 'POST',
    data: {
      code,
      ...params,
    },
  });
}

export async function loadUserData () {
  return request('me');
}
