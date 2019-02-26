// const env = 'production'

const config = {
  development: {
    baseUrl: 'https://api.blog.test',
    socketUrl: 'wss://api.blog.test/wss',
    socketHeartTimeout: 50000, // 50s
  },
  production: { // todo git 忽略
    baseUrl: 'https://www.einsition.com',
    socketUrl: 'wss://www.einsition.com/wss',
    socketHeartTimeout: 240000, // 4分钟
  },
}

const { development, production, ...globalConfig } = config
const envConfig = typeof env != 'undefined' && env === 'production' ? production : development

module.exports = { ...globalConfig, ...envConfig }