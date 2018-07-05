<template>
    <div>

      <!-- Navbar -->
      <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <router-link class="navbar-brand" to="/" tag="a">{{$t('homePage')}}</router-link>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <a class="nav-item nav-link" active-class="active" v-if="!sesionIniciada" :href="logIn">{{$t('log.in')}}</a>
            </div>
            <div class="nav navbar-nav navbar-right" v-if="sesionIniciada">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{$t('products')}}
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">                    
                    <router-link class="dropdown-item" to="/productos/crear" tag="a" active-class="active" exact><a>Crear Producto</a></router-link>
                    <router-link class="dropdown-item" to="/productos/all" tag="a" active-class="active" exact><a>Productos</a></router-link>
                  </div>
                </li>
              </ul>  
            </div>
            <div class="nav navbar-nav navbar-right" v-if="sesionIniciada">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{$t('organizations')}}
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">                    
                    <router-link class="dropdown-item" to="/organizaciones" tag="a" active-class="active"><a>{{$t('organizations')}}</a></router-link>
                  </div>
                </li>
              </ul>  
            </div>
            <div class="navbar-nav" v-if="sesionIniciada">
              <router-link class="nav-item nav-link" to="/" tag="a">Transacciones</router-link>
              <router-link class="nav-item nav-link" to="/" tag="a"><a>Eventos <span class="badge badge-success badge-pill"> 0</span></a></router-link>
            </div>
            <div class="nav navbar-nav navbar-right" v-if="sesionIniciada">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{$t('session')}}
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">                    
                    <a class="dropdown-item" data-toggle="modal"  data-target="#ModalPerfiles">{{$t('profiles')}}</a>
                    <a class="dropdown-item" data-toggle="modal" data-target="#ModalPing" @click="ping()">Ping</a>
                    <div class="dropdown-divider"></div>
                    <a class=" dropdown-item" active-class="active" @click="cerrarSesion">{{$t('log.out')}} </a>
                  </div>
                </li>
              </ul>  
            </div>
            <div class="nav navbar-nav navbar-right">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{$t('language')}}
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <a class="dropdown-item" @click="cambiarIdioma('es')">Español <span v-if="lang==='es'">&#9989;</span></a>
                    <a class="dropdown-item" @click="cambiarIdioma('en')">English <span v-if="lang==='en'">&#9989;</span></a>                
                  </div>
                </li>
              </ul>  
            </div>
          </div>
        </nav>
      </div>

      <!-- ModalPerfiles -->
      <div class="modal fade" id="ModalPerfiles" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">{{$t('conectionProfiles')}}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div v-if="errorModal.show" class="alert alert-danger">
                <strong>Error:</strong> {{errorModal.message}}
              </div>
              <ul class="list-group" >
                <li
                  class="list-group-item"
                  :key="perfil.name"
                  @click="cambiarPerfil(index)"
                  v-for="(perfil, index) in perfiles">
                  {{ perfil.name }}
                  <span v-if="perfil.default" class="badge badge-success">{{$t('active')}}</span>
                </li>
              </ul>
              <br>
              <label>{{$t('import.profile')}}</label>
              <br>
              <input type="file" @change="onFileChanged">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">{{$t('close')}}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ModalPing -->
      <div class="modal fade" id="ModalPing" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Ping</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div v-if="errorPing.show" class="alert alert-danger">
                <strong>Error:</strong> {{errorPing.message}}
              </div>
              <div v-if="!errorPing.show">
                <h6>{{pingData.version}}</h6>
                <h6>{{pingData.participant}}</h6>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">{{$t('close')}}</button>
            </div>
          </div>
        </div>
      </div>

    </div>
</template>

<script>
import {composer} from '../ComposerAPI'

export default {
  data() {
    return {
      lang : 'es',
      pingData : {},
      perfiles : [],
      errorModal :{
        show : false,
        message : 'Mensage de ERROR'
      },
      errorPing :{
        show : false,
        message : ''
      },
    }
  },
  computed : {
    logIn () {
      return this.$store.state.restServer + '/auth/google'
    },
    logOut() {
      return this.$store.state.restServer + '/auth/logout'
    },
    sesionIniciada:{
      get() {
        return this.$store.state.sesionIniciada
      },
      set(value) {
        this.$store.commit('setSesionIniciada', value);
      }
    }
  },
  methods: {
    cambiarIdioma(lang) {
      this.lang = lang
      this.$i18n.locale = lang
    },
    cerrarSesion :async function(){
      try{
        await this.$axios.get(this.logOut);
      } catch (error){
        // TODO Ajustar error
        console.log(error);
      }
      this.sesionIniciada = false;
      this.$router.push({"path" : '/'});
    },
    actualizarPerfiles : async function (){
      var response = await composer.sistema.getWallet(this.$axios);
      this.perfiles = response.data;
      if (response.statusCode !== 200){
        this.errorModal.show = true;
        this.errorModal.message = response.message;
      }
    },
    onFileChanged : async function (event) {
      if (event.target.files.lenght > 1) {
        this.errorModal.show = true;
        this.errorModal.message = "Solo se puede subir un archivo";
      } else {
        let response = await composer.sistema.importarPerfil(this.$axios, event.target.files[0]);
        if(response.statusCode === 204){
          this.errorModal.show = false;
        }else{
          this.errorModal.show = true;
          this.errorModal.message = response.message;
        }
      }
      await this.actualizarPerfiles();
    },
    ping : async function(){
      let response = await composer.sistema.ping(this.$axios);
      if (response.statusCode === 200){
        this.errorPing.show = false;
        this.pingData = response.data;
      } else {
        this.errorPing.show = true;
        this.errorPing.message = response.message;
      }
    },
    cambiarPerfil : async function(index){
      this.errorModal.show = false;
      let response = await composer.sistema.setDefault(this.$axios, this.perfiles[index].name);
      if (response.statusCode !== 204){
        this.errorModal.show = true;
        this.errorModal.message = response.message;
      }
      await this.actualizarPerfiles();
    }
  },
  created: async function () {
    let response = await composer.sistema.getWallet(this.$axios);
    if (response.statusCode === 401) {
      this.sesionIniciada = false
      this.$router.push('/')
    } else if (response.statusCode === 200) {
      this.sesionIniciada = true
      this.perfiles = response.data;
    }

    // TODO Ajustar Navbar
    response = await composer.sistema.ping(this.$axios);
    if (response.statusCode === 200){
      if (response.data.participant.includes('org.hyperledger.composer.participantes.')){
        var user = response.data.participant.replace('org.hyperledger.composer.participantes.', '');
        var perfil = user.split('#');
        this.$store.commit('setParticipante', {'rol': perfil[0], 'id': perfil[1]});
        // TODO Controlar Errores
        let res = await composer.participantes.getParticipante(this.$axios, this.$store.state.rolParticipante, this.$store.state.participante);
        this.$store.commit('setOrganizacion', res.data.orgId);
      }
    } else {
      this.errorPing.show = true;
      this.errorPing.message = response.message;
    }
  }
}
</script>

<style scoped>

</style>