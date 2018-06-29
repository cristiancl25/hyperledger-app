import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        restServer: '',
        wsServer: '',
        sesionIniciada : false
    },
    getters : {

    },
    mutations : {
        setRestServer(state, url){
            state.restServer = url
        },
        setWsServer(state, url){
            state.wsServer = url
        },
        setSesionIniciada(state, sesion){
            state.sesionIniciada = sesion
        }
    },
    actions : {

    },
    modules: {

    }
});