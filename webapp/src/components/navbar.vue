<template>
    <div>

      <!-- Navbar -->
      <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <a class="navbar-brand" href="#">Navbar</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <router-link class="nav-item nav-link" to="/" tag="a" active-class="active" exact><a>Página Principal</a></router-link>
              <router-link class="nav-item nav-link" to="/productos" tag="a" active-class="active"><a>Productos</a></router-link>
            </div>
            <div class="nav navbar-nav navbar-right">
              <ul class="navbar-nav">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Sesión
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <!-- TODO elimiar URL HARCODEADA -->
                    <a class="dropdown-item" active-class="active" v-if="!sesionIniciada" :href="logIn">Iniciar Sesión</a>
                    <a class="dropdown-item" data-toggle="modal" v-if="sesionIniciada" data-target="#ModalPerfiles">Perfiles</a>
                    <a class="dropdown-item" data-toggle="modal" v-if="sesionIniciada" data-target="#ModalPing" @click="ping()">Ping</a>
                    <div class="dropdown-divider" v-if="sesionIniciada"></div>
                    <a class=" dropdown-item" active-class="active" v-if="sesionIniciada" :href="logOut">Cerrar Sesión </a>
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
              <h5 class="modal-title" id="exampleModalLabel">Perfiles de conexión</h5>
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
                  @click="cambiarPerfil(index)"
                  v-for="(perfil, index) in perfiles">
                  {{ perfil.name }}
                  <span v-if="perfil.default" class="badge badge-success">Activa</span>
                </li>
              </ul>
              <br>
              <label>Importar Perfil</label>
              <br>
              <input type="file" @change="onFileChanged">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
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
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
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
      sesionIniciada : false,
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
      return 'http://' + this.$store.state.baseUrl + '/auth/google'
    },
    logOut() {
      return 'http://' + this.$store.state.baseUrl + '/auth/logout'
    }
  },
  methods: {
    actualizarPerfiles : async function (){
      var perfiles = await composer.getWallet(this.$axios);
      this.perfiles = perfiles.data;
    },
    onFileChanged : async function (event) {
      if (event.target.files.lenght > 1) {
        this.errorModal.show = true;
        this.errorModal.message = "Solo se puede subir un archivo";
      } else {
        let response = await composer.importarPerfil(this.$axios, event.target.files[0]);
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
      let response = await composer.ping(this.$axios);
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
      let response = await composer.setDefault(this.$axios, this.perfiles[index].name);
      if (response.statusCode !== 204){
        this.errorModal.show = true;
        this.errorModal.message = response.message;
      }
      await this.actualizarPerfiles();
      
    }
  },
  created: async function () {
    var response = await composer.getWallet(this.$axios);
    console.log(response);
    if (response.statusCode === 401) {
      this.sesionIniciada = false
    } else if (response.statusCode === 200) {
      this.sesionIniciada = true
      this.perfiles = response.data;
    }
  }
}
</script>

<style scoped>

</style>