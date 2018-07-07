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
          <h5 align="center"><strong>Tipo de organización: </strong>{{organizacion.tipoOrganizacion.tipo}}</h5>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <h5 align="center"><strong>Usuarios</strong></h5>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center"
              :key="usuario.id"
              v-for="(usuario) in organizacion.usuarios">
              {{usuario.email}}
              <button
                v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === organizacion.administrador.id"
                data-toggle="modal" data-target="#ModalParticipante"
                @click="delParticipante=true; datosParticipanteBorrar=usuario; datosParticipanteBorrar.tipo='Usuario'"
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
              :key="usuario.id"
              v-for="(usuario) in organizacion.invitados">
              {{usuario.email}}
              <button
                v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === organizacion.administrador.id"
                data-toggle="modal" data-target="#ModalParticipante"
                @click="delParticipante=true; datosParticipanteBorrar=usuario; datosParticipanteBorrar.tipo='Invitado'"
                class="btn btn-danger btn-sm">
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <h5 align="center"><strong>Localizaciones</strong></h5>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center"
              :key="localizacion.nombre"
              @click="coordenadas.latitud = localizacion.latitud; coordenadas.longitud = localizacion.longitud; coordenadas.info = coordenadas.direccion; locSelec=localizacion.localizacionId"
              v-for="(localizacion) in organizacion.localizaciones">
              {{localizacion.direccion}}
              <span v-if="locSelec === localizacion.localizacionId" class="badge badge-success">{{$t('active')}}</span>
              <button
                v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === organizacion.administrador.id"
              
                @click="eliminarLocalizacion(localizacion.localizacionId)"
                class="btn btn-danger btn-sm">
                Eliminar
              </button>
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          <google-map v-if="locSelec!==''" v-bind:markers="[{'lat':coordenadas.latitud, 'lng':coordenadas.longitud, 'info':coordenadas.direccion}]" v-bind:lista='false'></google-map>
        </div>

      </div>
      <br>
      <div class="row" v-if="$store.state.rolParticipante === 'OrgAdmin' && $store.state.participante === organizacion.administrador.id">
        <div class="btn-group col-md-6">
          <button class="btn btn-primary" data-toggle="modal" data-target="#ModalParticipante" @click="nuevoParticipante=true">Crear Participante</button>
          <button class="btn btn-primary" data-toggle="modal" data-target="#ModalParticipante" @click="nuevaLocalizacion=true">Crear localizacion</button>
        </div>
      </div>

    </div>

    <!-- ModalParticipante-->
      <div class="modal fade" id="ModalParticipante" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 v-if="nuevoParticipante" class="modal-title" id="exampleModalLabel">Crear Participante</h5>
              <h5 v-if="delParticipante" class="modal-title" id="exampleModalLabel">Eliminar Participante</h5>
              <h5 v-if="nuevaLocalizacion" class="modal-title" id="exampleModalLabel">Nueva localizacion</h5>
            </div>
            <div class="modal-body">
              <div class="col-md-12" v-if="error.show">
                <div v-bind:class="error.tipo" role="alert">
                  <strong></strong> {{ error.message }}
                </div>
              </div>
              <div class="col-md-12" v-if="progress">
                <div class="progress" >
                  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
                </div>
              </div>
              <div v-if="nuevaLocalizacion">
                <form> 
                  <div class="form-group col-md-12">
                    <label>Nombre</label>
                    <input v-model="localizacion.nombre" class="form-control"  placeholder="Nombre de la localizacion">
                  </div>
                  <div class="form-group col-md-12">
                    <label>Latitud</label>
                    <input v-model="localizacion.latitud" type=number step=0.01 class="form-control"  placeholder="Latitud">
                  </div>
                  <div class="form-group col-md-12">
                    <label>Longitud</label>
                    <input v-model="localizacion.longitud" type=number step=0.01 class="form-control"  placeholder="Longitud">
                  </div>
                  <div class="form-group col-md-12">
                    <label>Dirección</label>
                    <input v-model="localizacion.direccion" class="form-control"  placeholder="Dirección">
                  </div>
                </form>
                <div class="col-md-6">
                  <button class="btn btn-primary" @click="crearLocalizacion">Submit</button>
                </div>
              </div>

              <div v-if="nuevoParticipante">
                <form> 
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
                  <div id="card" class="form-group col-md-12"></div>
                  <br>
                </form>
                <div class="col-md-6">
                  <button class="btn btn-primary" @click="crearParticipante">Submit</button>
                </div>
              </div>
              
            </div>
            <div class="modal-footer">
              <button type="button" v-if="nuevaLocalizacion" class="btn btn-primary" @click="inicializar(); nuevaLocalizacion=false; error.show=false" data-dismiss="modal">Cerrar</button>
              <button type="button" v-if="nuevoParticipante" class="btn btn-primary" @click="inicializar(); nuevoParticipante=false; error.show=false" data-dismiss="modal">Cerrar</button>
              <button type="button" v-if="delParticipante" class="btn btn-primary" @click="inicializar(); delParticipante=false; error.show=false" data-dismiss="modal">Cerrar</button>
              <button type="button" v-if="delParticipante" class="btn btn-danger" @click="eliminarParticipante()" >Borrar</button>
            </div>
          </div>
        </div>
      </div>

  </div>

</template>

<script>
  import {composer} from '../../ComposerAPI'
  import googleMap from '../mapas/Mapa'

  export default {
    components : {
      googleMap,
    },
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
        nuevaLocalizacion : false,
        nuevoParticipante : false,
        delParticipante : false,
        datosParticipanteBorrar:{},
        participante : {
          "$class": "org.hyperledger.composer.participantes.CrearParticipante",
          "id": "",
          "email": "",
          "nombre": "",
          "tipoUsuario": "Usuario",
        },
        localizacion : {
          "$class": "org.hyperledger.composer.organizaciones.CrearLocalizacion",
          "nombre": "",
          "latitud": 0,
          "longitud": 0,
          "direccion": ""
        },
        coordenadas : {
          "latitud" : 0,
          "longitud" : 0, 
          "info" : ""
        },
        locSelec : "",      
        progress : false,
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
      crearLocalizacion : async function(){
        if (this.localizacion.direccion === '' || this.localizacion.nombre === ''){
          this.error.show = true; this.error.message = 'Datos inválidos'; this.error.tipo = "alert alert-warning";
          return;
        }
        this.error.show = false;
        this.progress = true;
        let response = await composer.organizaciones.crearLocalizacion(this.$axios, this.localizacion);
        this.progress = false;
        
        if (response.statusCode === 200){
          this.localizacion.direccion = ''; this.localizacion.nombre = ''; this.localizacion.latitud = 0; this.localizacion.longitud = 0;
          this.error.show = true; this.error.message = 'Localización creada'; this.error.tipo = "alert alert-success";
        } else {
          this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
          this.localizacion.nombre = '';
        }
      },
      eliminarLocalizacion : async function (loc) {

        // TODO Mejorar
        let response = await composer.organizaciones.eliminarLocalizacion(this.$axios, loc);
        this.inicializar();

      },
      crearParticipante : async function(){
        this.error.show = false;
        if (this.participante.id !== '' && this.participante.email !== '' && this.participante.nombre !== ''){
          this.progress = true;
          let response = await composer.participantes.crearParticipante(this.$axios, this.participante);
          this.progress = false;
          if (response.statusCode === 200){
            const participante = "resource:org.hyperledger.composer.participantes." + this.participante.tipoUsuario + "#" + this.participante.id;
            const id = this.participante.id + "_" + this.organizacion.orgId;
            this.progress = true;
            let response = await composer.sistema.generarIdentidad(this.$axios, participante ,id);
            this.progress = false;
            if (response.statusCode === 200){
              let data = response.data;
              const url = window.URL.createObjectURL(new Blob([data],  {type: "octet/stream"}));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', id + '.card');
              var t = document.createTextNode("Descargar perfil de conexión");
              link.appendChild(t);
              document.getElementById("card").appendChild(link);
              link.click();
              this.error.show = true; this.error.message = 'Participante creado'; this.error.tipo = "alert alert-success";
              this.participante.id = ''; this.participante.email = ''; this.participante.nombre = '';
              
            } else {
              this.progress = true;
              // TODO mejorar
              await composer.participantes.eliminarParticipante(this.$axios, this.participante.id, this.participante.tipoUsuario);
              this.progress = false;
              this.error.show = true; this.error.message = 'Error al procesar la petición'; this.error.tipo = "alert alert-danger";
            }
          }else{
            this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
          }

        } else {
          this.error.show = true; this.error.message = 'Datos Icorrectos'; this.error.tipo = "alert alert-danger";
        }
      },
      eliminarParticipante : async function(){
        this.progress = true;
        let id = this.datosParticipanteBorrar.id;
        let tipo = this.datosParticipanteBorrar.tipo;
        let response = await composer.participantes.eliminarParticipante(this.$axios, id, tipo);
        this.progress = false;
        if (response.statusCode === 200) {
          let identidad = await composer.consulta.getIdentity(this.$axios, tipo, id);
          let response = await composer.sistema.revocarIdentidad(this.$axios, identidad.data[0].identityId);
          if (identidad.statusCode !== 200 && response.statusCode !== 204){
            this.error.show = true; this.error.message = 'La identidad del participante non pudo ser revocada'; this.error.tipo = "alert alert-danger";
          } else {
            this.error.show = true; this.error.message = 'Participante eliminado'; this.error.tipo = "alert alert-success";
          }
        } else {
          this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
        }
      },
      inicializar : async function() {
        let response = await composer.organizaciones.getOrganizacionId(this.$axios, this.$route.params.id);
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