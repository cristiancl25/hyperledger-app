import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        restServer: '',
        wsServer: '',
        sesionIniciada : false,
        rolParticipante : '', 
        participante : '',
        organizacion : ''
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
        },
        setParticipante(state, participante){
            state.rolParticipante = participante.rol;
            state.participante = participante.id;
        },
        setOrganizacion(state, organizacion){
            state.organizacion = organizacion;
        }
    },
    actions : {

    },
    modules: {

    }
});