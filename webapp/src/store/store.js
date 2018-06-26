import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        baseUrl : 'localhost'
    },
    getters : {

    },
    mutations : {
        setBaseUrl(state, url){
            state.baseUrl = url
        }
    },
    actions : {

    },
    modules: {

    }
});