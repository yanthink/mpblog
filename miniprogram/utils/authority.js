// use localStorage to store the authority info, which might be sent from server in actual project.
let token = null

function getToken() {
  if (token === null) {
    token = (wx.getStorageSync('token') || '||').split('|')
  }
  return token
}

function setToken(accessToken = '', tokenType = '', expiresIn = '') {
  token = [accessToken, tokenType, expiresIn.split(' ').join('T')]
  return wx.getStorageSync('token', token.join('|'))
}

function getAuthorization() {
  getToken()
  return [token[1], token[0]].filter(_ => _).join(' ')
}

function checkLogin() {
  getToken()

  if (token[2]) {
    return Date.parse(token[2]) > Date.now() ? 1 : 2
  }

  return 0
}

module.exports = {
  getToken,
  setToken,
  getAuthorization,
  checkLogin,
}
