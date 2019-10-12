const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function checkStatus (res) {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res;
  }

  const { data: { message }, statusCode } = res;
  const errorText = message || codeMessage[statusCode];

  switch (res.statusCode) {
    case 400:
    case 403:
    case 404:
    case 422:
    case 429:
      wx.showToast({
        title: errorText,
        icon: 'none',
      });
      break;
    case 401:
      // todo;
      break;
    case 500:
    case 501:
    case 503:
      wx.showToast({
        title: '服务器出了点小问题！',
        icon: 'none',
      });
  }

  const error = new Error(errorText);
  error.response = res;
  throw error;
}

function Http () {
  this.setToken = token => this.defaults.header.Authorization = `Bearer ${token}`;

  this.request = async (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const opts = {
        ...this.defaults,
        ...options,
        url: `${API_URL}${url}`,
        success (res) {
          try {
            checkStatus(res);
          } catch (e) {
            reject(e);
          }
          const { data, ...meta } = res.data;
          res.data = data;
          resolve({ ...res, ...meta });
        },
        fail (res) {
          console.info(res);
          reject(res);
        },
      };

      wx.request(opts);
    });
  };
}

Http.prototype.defaults = {
  method: 'GET',
  header: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  },
  dataType: 'json',
};

export const http = new Http();
export const setToken = http.setToken;
export default http.request;
