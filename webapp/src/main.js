import Vue from 'vue'
import App from './App.vue'
import VueNativeSock from 'vue-native-websocket'
import VueRouter from 'vue-router'
import { routes } from './routes'
import axios from 'axios'
import { store } from './store/store';

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'hash'
});

store.commit('setBaseUrl', process.env.REST_SERVER);

Vue.use(VueNativeSock, 'ws://' + store.state.baseUrl, {
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
  format: 'json'
})

Vue.prototype.$http = axios;
Vue.prototype.$axios = axios.create({
  'baseURL' : 'http://' + store.state.baseUrl,
  'withCredentials' : true,
  'headers': {
    'Accept' : "application/json",
    'Access-Control-Allow-Credentials' : true
  }
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
