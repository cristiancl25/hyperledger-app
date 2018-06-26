import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        baseUrl : 'localhost',
        sesionIniciada : false
    },
    getters : {

    },
    mutations : {
        setBaseUrl(state, url){
            state.baseUrl = url
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