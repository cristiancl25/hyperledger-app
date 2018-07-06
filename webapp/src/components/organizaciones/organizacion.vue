<template>
  <div>
    <div v-if="info.show" v-bind:class="info.tipo" role="alert">
      <strong>Error:</strong> {{ info.message }}
    </div>
    <div v-else>
      <div class="row justify-content-center">
        <div>
          <h1 align="center"><strong>{{ organizacion.nombre}}</strong></h1>
          <h5 align="center"><strong>ID: </strong>{{organizacion.orgId}}</h5>
          <h5 align="center"><strong>Tipo de organización: </strong>{{tipoOrganizacion}}</h5>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <h5 align="center"><strong>Usuarios</strong></h5>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center"
              :key="usuario"
              v-for="(usuario, index) in organizacion.usuarios">
              {{getUsuario(index)}}
              <button
                v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === administrador"
                @click="eliminarParticipante(index,'Usuario')"
                class="btn btn-danger btn-sm">
                Eliminar
              </button>
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          <h5 align="center"><strong>Invitados</strong></h5>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center"
              :key="usuario"
              v-for="(usuario, index) in organizacion.invitados">
              {{getInvitado(index)}}
              <button
                v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === administrador"
                @click="eliminarParticipante(index,'Invitado')"
                class="btn btn-danger btn-sm">
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="row" v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === administrador">
        <div class="col-md-6">
          <button class="btn btn-primary" @click="nuevoParticipante = !nuevoParticipante">nuevoParticipante</button>
          <form v-if="nuevoParticipante">
            
            <div class="col-md-12" v-if="error.show">
              <div v-bind:class="error.tipo" role="alert">
                <strong>Error:</strong> {{ error.message }}
              </div>
            </div>

            <div class="col-md-12" v-if="progress">
              <div class="progress" >
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
              </div>
            </div>
            
            <div class="form-group col-md-12">
              <label for="id">Identificador</label>
              <input v-model="participante.id" class="form-control"  placeholder="Identificador del participante">
            </div>
            <div class="form-group col-md-12">
              <label for="nombre">Nombre</label>
              <input v-model="participante.nombre" class="form-control"  placeholder="Nombre del participante">
            </div>
            <div class="form-group col-md-12">
              <label for="email">Email</label>
              <input type="email" v-model="participante.email" class="form-control"  placeholder="Email del participante">
            </div>
            <div class="form-group col-md-6">
              <label for="exampleFormControlSelect1">Tipo de Participante</label>
              <select class="form-control" v-model="participante.tipoUsuario" id="exampleFormControlSelect1">
                <option selected>Usuario</option>
                <option>Invitado</option>
              </select>
            </div>
            <button class="btn btn-primary" @click="crearParticipante">Submit</button>
          </form>
        </div>
      </div>

    </div>

  </div>

</template>

<script>
  import {composer} from '../../ComposerAPI'

  export default {

    data() {
      return{
        organizacion : {
          tipoOrganizacion : '',
          administrador : ''
        },
        info : {
          show : false,
          message : '',
          tipo : ''
        },
        error : {
          show : false,
          message : '',
          tipo : ''
        },
        nuevoParticipante : false,
        participante : {
          "$class": "org.hyperledger.composer.participantes.CrearParticipante",
          "id": "",
          "email": "",
          "nombre": "",
          "tipoUsuario": "Usuario",
        },
        progress : false,
      }
    },
    computed : {
      tipoOrganizacion() {
        return this.organizacion.tipoOrganizacion.split('#')[1];
      },
      administrador(){
        return this.organizacion.administrador.split('#')[1];
      }

    },
    created : async function () {
        await this.inicializar();
    },
    watch: {
      '$route' : async function(to, from) {
        await this.inicializar();
      }
    },
    methods : {
      str2bytes (str) {
        var bytes = new Uint8Array(str.length);
        for (var i=0; i<str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
      },
      crearParticipante : async function(){
        // TODO Mostrar error
        this.error.show = false;
        if (this.participante.id !== '' && this.participante.email !== '' && this.participante.nombre !== ''){
          this.progress = true;
          let response = await composer.participantes.crearParticipante(this.$axios, this.participante);
          this.progress = false;
          if (response.statusCode === 200){
            const participante = "resource:org.hyperledger.composer.participantes." + this.participante.tipoUsuario + "#" + this.participante.id;
            const id = this.participante.id + "_" + this.organizacion.orgId;

            // var xhr = new XMLHttpRequest();
            // xhr.open("POST", 'http://localhost:3000/api/system/identities/issue', true);
            // xhr.withCredentials = true;
            // xhr.setRequestHeader("Content-type","application/json");
            // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            // xhr.onreadystatechange = function() {
            //   if (xhr.readyState == 4 && xhr.status == 200) {
            //     // alert("Failed to download:" + xhr.status + "---" + xhr.statusText);
            //     console.log(xhr.response);
            //     console.log(typeof xhr.response);
            //     const url = window.URL.createObjectURL(new Blob([xhr.response], {type: "octet/stream"}));
            //   const link = document.createElement('a');
            //   link.href = url;
            //   link.setAttribute('download', id + '.card');
            //   document.body.appendChild(link);
            //   link.click();
            //   }
            // }
            // xhr.responseType = "arraybuffer";
            // xhr.send(JSON.stringify({
            //         "participant": participante,
            //         "userID": id,
            //         "options": {}
            //     }));
            
            this.progress = true;
            let response = await composer.sistema.generarIdentidad(this.$axios, participante ,id);
            this.progress = false;
            console.log(response);
            if (response.statusCode === 200){
              let data = response.data;
              // console.log(data);
              // console.log(typeof data);
              const url = window.URL.createObjectURL(new Blob([data],  {type: "octet/stream"}));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', id + '.card');
              var t = document.createTextNode("CLICK MEEEEEEEEEEEEEEEEEEEEEEEEE");
              link.appendChild(t);  
              document.body.appendChild(link);
              //link.click();
            } else {
              this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
            }
          }else{
            this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
          }

        } else {
          this.error.show = true; this.error.message = 'Datos Icorrectos'; this.error.tipo = "alert alert-danger";
        }
        //await this.inicializar();
      },
      eliminarParticipante : async function(index, tipo){
        let id;
        if (tipo === 'Usuario'){
          id = this.getUsuario(index);
        } else {
          id = this.getInvitado(index);
        }
        let response = await composer.participantes.eliminarParticipante(this.$axios, id, tipo);
        if (response.statusCode !== 200) {
          this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-danger";
        }
        await this.inicializar();
      },
      getUsuario(index){
        return this.organizacion.usuarios[index].split('#')[1];
      },
      getInvitado(index){
        return this.organizacion.invitados[index].split('#')[1];
      },
      inicializar : async function() {
        let response = await composer.organizaciones.getOrganizacion(this.$axios, this.$route.params.id);
        if (response.statusCode === 200){
          this.info.show = false;
          this.organizacion = response.data;
        } else {
          this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-danger";
        }
      },  
    }
  }
</script>

<style scoped>

</style>