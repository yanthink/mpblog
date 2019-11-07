import moment from 'moment';

export function diffForHumans (time) {
  const mtime = moment(time);
  const now = moment();

  if (now.diff(mtime, 'day') > 15) {
    return mtime.year() === now.year() ? mtime.format('MM-DD HH:ss') : mtime.format('YYYY-MM-DD HH:ss');
  }

  return mtime.fromNow();
}

export function friendlyNumbers (n) {
  if (n >= 1000) {
    return Math.floor(n / 1000) + 'k';
  }

  return String(n);
}

export function matchImages (markdown) {
  const image = /^!\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/;
  const label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  const href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
  const title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

  const edit = (regex, opt) => {
    regex = regex.source || regex;
    opt = opt || '';
    return {
      replace: function (name, val) {
        val = val.source || val;
        val = val.replace(/(^|[^\[])\^/g, '$1');
        regex = regex.replace(name, val);
        return this;
      },
      getRegex: function () {
        return new RegExp(regex, opt);
      },
    };
  };

  const imageReg = edit(image, 'gm')
    .replace('label', label)
    .replace('href', href)
    .replace('title', title)
    .getRegex();

  const images = [];
  let matches;

  while ((matches = imageReg.exec(markdown))) {
    images.push(matches[2]);
  }
  console.info();

  return images;
}

export function checkVersionUpdate () {
  const updateManager = wx.getUpdateManager();

  updateManager.onCheckForUpdate(function (res) {
    console.log(res.hasUpdate); // 请求完新版本信息的回调
  });

  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success (res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
  });
}
