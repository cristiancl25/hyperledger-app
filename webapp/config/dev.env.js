'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  REST_SERVER: '"http://localhost:3000"',
  WS_SERVER: '"ws://localhost:3000"'
})
