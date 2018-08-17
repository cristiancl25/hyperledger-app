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
                  <router-link 
                    v-if="$store.state.rolParticipante === 'Usuario'"
                    class="dropdown-item" to="/productos/crear" tag="a" active-class="active" exact>
                    <a>{{$t('create-product')}}</a>
                  </router-link>
                  <router-link class="dropdown-item" to="/productos" tag="a" active-class="active" exact><a>{{$t('products')}}</a></router-link>
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
                  <router-link class="dropdown-item" 
                    :to="{path:'/organizaciones/:id', name:'org',params:{id:$store.state.organizacion}}"
                    tag="a"><a>{{$t('my-organization')}}</a>
                  </router-link>                   
                  <router-link class="dropdown-item" to="/organizaciones" tag="a"><a>{{$t('organizations')}}</a></router-link>
                </div>
              </li>
            </ul>  
          </div>
          <div class="navbar-nav" v-if="sesionIniciada">
            <router-link v-if="$store.state.rolParticipante === 'Usuario'" class="nav-item nav-link" to="/transacciones" tag="a">{{$t('transactions')}}</router-link>
            <router-link class="nav-item nav-link" to="/eventos" tag="a">
              <a>{{$t('events')}} 
                <span class="badge badge-success badge-pill"> {{eventos.length}}</span>
                <span v-if="!$store.state.notificaciones">&#x1f507;</span>
              </a>
            </router-link>
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
            <div class="col-md-12" v-if="progress">
              <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
              </div>
            </div>
            <ul class="list-group" >
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
                :key="perfil.name"
                @click="cambiarPerfil(index)"
                v-for="(perfil, index) in perfiles">
                {{ perfil.name }}
                <div v-if="perfil.default">
                  <span v-if="perfil.default" class="badge badge-success">{{$t('active')}}</span>
                  <button class="btn btn-info btn-sm" @click="exportarPerfil(perfil.name)">{{$t('export')}}</button>
                  <button class="btn btn-danger btn-sm" @click="eliminarPerfil(perfil.name)">{{$t('delete')}}</button>
                </div>
              </li>
            </ul>
            <div id="perfilConexion"></div>
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
      progress : false
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
    },
    eventos() {
      return this.$store.state.eventos
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
      await this.conexion();
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
      this.progress = true;
      this.errorModal.show = false;
      let response = await composer.sistema.setDefault(this.$axios, this.perfiles[index].name);
      if (response.statusCode !== 204){
        this.errorModal.show = true;
        this.errorModal.message = response.message;
      }
      await this.actualizarPerfiles();
      await this.conexion();
      this.progress = false;
    },
    conexion : async function(){
      let response = await composer.sistema.ping(this.$axios);
      if (response.statusCode === 200){
        if (response.data.participant.includes('org.hyperledger.composer.participantes.')){
          var user = response.data.participant.replace('org.hyperledger.composer.participantes.', '');
          var perfil = user.split('#');
          this.$store.commit('setParticipante', {'rol': perfil[0], 'id': perfil[1]});
          let res = await composer.participantes.getParticipante(this.$axios, this.$store.state.rolParticipante, this.$store.state.participante);
          if (res.statusCode === 200){
            this.$store.commit('setOrganizacion', res.data.orgId);
          } else {
            this.errorModal.show = true; this.errorModal.message = response.message;
            $('#ModalPerfiles').modal('show');
          }
        } else {
          this.errorModal.show = true; this.errorModal.message = 'Participante Inválido';
          $('#ModalPerfiles').modal('show');
        }
      } else {
        this.errorModal.show = true; this.errorModal.message = response.message;
        $('#ModalPerfiles').modal('show');
      }
    },
    exportarPerfil : async function(perfil){
      this.progress = true
      let response = await composer.sistema.exportarPerfil(this.$axios, perfil);
      this.progress = false;
      if (response.statusCode === 200){

        let data = response.data;
        const url = window.URL.createObjectURL(new Blob([data],  {type: "octet/stream"}));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', perfil);
        document.getElementById("perfilConexion").appendChild(link);
        link.click();
        
      } else {
        this.errorModal.show = true; this.errorModal.message = 'Error al procesar la petición'; this.errorModal.tipo = "alert alert-danger";
      }
    },
    eliminarPerfil : async function(perfil){
      this.progress = true
      let response = await composer.sistema.eliminarPerfil(this.$axios, perfil);
      this.progress = false;
      if (response.statusCode === 204){
        this.errorModal.show = true; this.errorModal.message = 'Perfil eliminado'; this.errorModal.tipo = "alert alert-success";
      } else {
        this.errorModal.show = true; this.errorModal.message = response.message; this.errorModal.tipo = "alert alert-danger";
      }
    },
  },
  created: async function () {
    let response = await composer.sistema.getWallet(this.$axios);
    if (response.statusCode === 200) {
      this.sesionIniciada = true
      this.perfiles = response.data;
      await this.conexion();
    } else {
      this.sesionIniciada = false
      this.$router.push('/')
      
    } 
  }
}
</script>

<style scoped>

</style>