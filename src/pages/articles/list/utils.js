const image = /^!\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/;
const label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
const href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
const title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

function edit (regex, opt) {
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
}

export function matchImages (markdown) {
  const imageReg = edit(image, 'gm')
    .replace('label', label)
    .replace('href', href)
    .replace('title', title)
    .getRegex();

  const images = [];
  let matches;

  while(matches = imageReg.exec(markdown)) {
    images.push(matches[2]);
  }
  console.info()

  return images;
}
