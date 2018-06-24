import Vue from 'vue'
import App from './App.vue'
import VueNativeSock from 'vue-native-websocket'
import VueRouter from 'vue-router'
import { routes } from './routes'
import axios from 'axios'

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'hash'
});

Vue.use(VueNativeSock, 'ws://' + process.env.REST_SERVER, {
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
  format: 'json'
})

Vue.prototype.$http = axios;
Vue.prototype.$axios = axios.create({
  baseURL: 'http://' + process.env.REST_SERVER,
  withCredentials : true,
  //timeout: 1000,
  //headers: {'X-Custom-Header': 'foobar'}
});
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
