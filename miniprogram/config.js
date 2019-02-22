// const env = 'production'

const config = {
  development: {
    baseUrl: 'https://api.blog.test',
    socketUrl: 'wss://api.blog.test/wss',
    socketHeartTimeout: 5000, // 50s
  },
  production: {
    baseUrl: 'https://www.einsition.com',
    socketUrl: 'wss://www.einsition.com/wss',
    socketHeartTimeout: 540000, // 9分钟
  },
}

const { development, production, ...globalConfig } = config
const envConfig = typeof env != 'undefined' && env === 'production' ? production : development

module.exports = { ...globalConfig, ...envConfig }