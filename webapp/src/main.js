import Vue from 'vue'
import App from './App.vue'
import VueNativeSock from 'vue-native-websocket'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import { routes } from './routes'
import axios from 'axios'
import { store } from './store/store';
import {es} from './i18n/es'
import {en} from './i18n/en'

store.commit('setRestServer', process.env.REST_SERVER);
store.commit('setWsServer', process.env.WS_SERVER);

Vue.use(VueRouter)
Vue.use(VueI18n)
Vue.use(VueNativeSock, store.state.wsServer, {
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
  format: 'json'
})

const router = new VueRouter({
  routes,
  mode: 'hash'
});

router.beforeResolve((to, from, next) => {
  if (to.fullPath === "/"){
    next()
  } else if (to.fullPath === from.fullPath) {
    next();
  } else if (!store.state.sesionIniciada) {
    next('/');
  } else {
    next();
  } 
})

const i18n = new VueI18n({
  locale: 'en',
  messages : {es,en}
})

Vue.prototype.$http = axios;
Vue.prototype.$axios = axios.create({
  'baseURL' : store.state.restServer,
  'withCredentials' : true,
  'headers': {
    'Accept' : "application/json",
    'Access-Control-Allow-Credentials' : true
  }
});

new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: h => h(App)
})
