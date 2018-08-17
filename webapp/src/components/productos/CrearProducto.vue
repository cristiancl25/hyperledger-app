<template>
    <div>
      
      <div class="row justify-content-center">
       
        <div class="col-md-10">
          
          <div class="progress" v-if= "progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
          </div>
          <div class="col-md-12" v-if="info.show" v-bind:class="info.tipo" role="alert">
            <strong></strong> {{ info.message }}
          </div>
           <h1>{{$t('create-product')}}</h1>
          <form>
            <div class="form-group col-md-6"> 
              <label for="identificador">{{$t('identifier')}}</label>
              <input v-model="caracteristicas.identificador" class="form-control" aria-describedby="emailHelp" placeholder="Identificador del producto">
                <small id="emailHelp" class="form-text text-muted">{{$t('optional')}}</small>
                <small id="emailHelp" class="form-text text-muted">
                  <a href="" data-toggle="modal"  @click="scannerQR=true" data-target="#ModalScannerQR">{{$t('qr-code-scanner')}}</a>
                </small>
            </div>

            <h3>{{$t('characteristics')}}</h3>

            <div class="form-row col-md-12">
              <div class="form-group col-md-4">
                <label for="variedad">{{$t('type-product')}}</label>
                <input v-model="caracteristicas.tipoProducto" class="form-control" aria-describedby="emailHelp" placeholder="" disabled="true">
                <small id="emailHelp" class="form-text text-muted">
                  <a href="" 
                    data-toggle="modal"
                    @click="modal.titulo='Crear tipo Producto'; modal.tipo='crearTipoProducto'"
                    data-target="#ModalCrearProducto">
                    {{$t('select-type-product')}}
                  </a>
                </small>
              </div>
              <div class="form-group col-md-4">
                <label for="variedad">{{$t('variety')}}</label>
                <input v-model="caracteristicas.variedadProducto" class="form-control" aria-describedby="emailHelp" placeholder="Variedad">
                <small id="emailHelp" class="form-text text-muted">{{$t('optional')}}</small>
              </div>
            </div>
              
            <div class="form-group col-md-12"> 
              <div class="form-row">
                <div class="form-group col-md-3">
                  <label for="inputState">{{$t('type')}}</label>
                  <select v-model="caracteristicas.tipo" id="inputState" class="form-control">
                    <option selected>UNIDAD</option>
                    <option>PESO</option>
                  </select>
                </div>
                <div v-if="caracteristicas.tipo==='UNIDAD'" class="form-group col-md-3">
                  <label for="Unidades">{{$t('units')}}</label>
                  <input v-model="caracteristicas.unidades" type="number" min="1" class="form-control" aria-describedby="emailHelp" placeholder="Unidades">
                </div>
                <div v-if="caracteristicas.tipo==='UNIDAD'" class="form-group col-md-3">
                  <label for="Peso Medio">{{$t('middleweight')}}</label>
                  <input v-model="caracteristicas.peso" type=number step=0.01 min="0.01" class="form-control" aria-describedby="emailHelp" placeholder="Peso medio">
                </div>
                <div v-if="caracteristicas.tipo==='PESO'" class="form-group col-md-3">
                  <label for="Peso">{{$t('weight')}}</label>
                  <input v-model="caracteristicas.peso" type=number step=0.01 min="0.01" class="form-control" aria-describedby="emailHelp" placeholder="Peso">
                </div>
                <div class="form-group col-md-3">
                  <label for="inputState">{{$t('magnitude')}}</label>
                  <select v-model="caracteristicas.magnitud" id="inputState" class="form-control">
                    <option selected>kilogramos</option>
                    <option>gramos</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group col-md-8"> 
              <label for="Descripción">{{$t('description')}}:</label>
              <textarea v-model="caracteristicas.descripcion" class="form-control" id="message-text"></textarea>
              <small id="emailHelp" class="form-text text-muted">{{$t('opcional')}}</small>
            </div>

            <h3>{{$t('initial-location')}}</h3>
            <div>
              <div>
                <fieldset class="form-group col-md-12">
                  <div class="row">
                    <legend class="col-form-label col-sm-3 pt-0">{{$t('methods')}}</legend>
                    <div class="col-sm-9">
                      <div class="form-check">
                        <input v-model="loc" @click="geolocalizacion" class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="gps" checked>
                        <label class="form-check-label" for="gridRadios1">
                          GPS
                        </label>
                      </div>
                      <div class="form-check">
                        <input v-model="loc" @click="getLocalizaciones" class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="org">
                        <label class="form-check-label" for="gridRadios2">
                          {{$t('organization')}}
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <div class="col-md-10" v-if="loc === 'gps'">
                  <h5>{{$t('coordinates')}}</h5>
                  <ul class="list-group">
                    <li><strong>{{$t('latitude')}}:</strong> {{coordenadas.latitud}}</li>
                    <li><strong>{{$t('longitude')}}:</strong> {{coordenadas.longitud}}</li>
                  </ul>
                  <div class="form-group col-md-12">
                    <label for="direccion">Dirección</label>
                    <input v-model="coordenadas.direccion" class="form-control" aria-describedby="emailHelp" placeholder="Dirección de la nueva localización">
                    <small id="emailHelp" class="form-text text-muted">{{$t('required')}}</small>
                  </div>
                </div>
                <div class="col-md-10" v-if="loc === 'org'">
                  <h5>{{$t('locations')}}</h5>
                  <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center"
                      v-for="(loc) in localizaciones"
                      :key="loc.direccion"
                      @click="localizacionId=loc.localizacionId; coordenadas.latitud = loc.latitud; coordenadas.longitud = loc.longitud; coordenadas.direccion = loc.direccion"
                      >{{loc.direccion}}
                      <span v-if="localizacionId === loc.localizacionId" class="badge badge-success">{{$t('active')}}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-12" v-if="this.loc === 'gps' && this.coordenadas.direccion!=='' || this.loc === 'org' && this.localizacionId!==''">
                <!-- TODO cambiar componentes a -->
                <small>
                    <a href="/#/productos/crear" v-if="!mapa" @click="mapa=!mapa" >Mostrar Localización</a>
                    <a href="/#/productos/crear"  v-if="mapa" @click="mapa=!mapa" >Ocultar Localización</a>
                </small>
                <google-map v-if="mapa" v-bind:markers="[{'lat':coordenadas.latitud, 'lng':coordenadas.longitud, 'info':coordenadas.direccion}]" v-bind:lista='false'></google-map>
              </div>
            </div>
          
            <h3>{{$t('image')}}</h3>
            <div class="form-group col-md-12">
              <input type="checkbox" id="jack" value="Jack" v-model="imagen.incluir">
              <label for="jack">Añadir datos imagen  </label>
              <small id="emailHelp" class="form-text text-muted">{{$t('optional')}}</small>
            </div>
            <div v-if="imagen.incluir"> 
              <div class="form-group col-md-12">
                <label for="url">URL</label>
                <input v-model="imagen.url" class="form-control" aria-describedby="emailHelp" placeholder="Url de la imagen">
              </div>
              <div class="form-group col-md-12">
                <label for="hash">Hash</label>
                <input v-model="imagen.hashImagen" class="form-control" aria-describedby="emailHelp" placeholder="Hash de la imagen">
              </div>
              <div class="form-group col-md-3">
                <label for="inputState">{{$t('algorithm')}}</label>
                <select v-model="imagen.algoritmo" id="inputState" class="form-control">
                  <option selected>sha1</option>
                  <option>sha256</option>
                  <option>md5</option>
                </select>
              </div>
            </div>

          </form>
          <div class="col-md-12">
            <button class="btn btn-primary"
              data-toggle="modal"
              @click="modal.titulo='Crear Producto'; modal.tipo='crearProducto'"
              data-target="#ModalCrearProducto">
              {{$t('create-product')}}
            </button>
          </div>
        </div>
      </div>


      <!-- ModalScannerQR-->
      <div class="modal fade" id="ModalScannerQR" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">{{$t('qr-scanner')}}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="row justify-content-center">
                <div>
                  <vue-qr-reader v-if="scannerQR" :responsive=true v-on:code-scanned="procesarCodigoQR" />
                </div>
              </div>
              <input v-model="caracteristicas.identificador" class="form-control" aria-describedby="emailHelp" placeholder="CódigoQR" disabled="true">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-info" @click="scannerQR=true">{{$t('retry')}}</button>
              <button type="button" class="btn btn-primary" @click="closeModal; scannerQR=false" data-dismiss="modal">{{$t('close')}}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ModalCrearProducto-->
      <div class="modal fade" id="ModalCrearProducto" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">{{modal.titulo}}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="col-md-12" v-if="modalProgress">
                <div class="progress">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
                </div>
              </div>
              <div v-if="infoModal.show" v-bind:class="infoModal.tipo">
               {{infoModal.message}}
              </div>

              <div v-if="modal.tipo==='crearTipoProducto'">
                <ul class="list-group" >
                  <li class="list-group-item d-flex justify-content-between align-items-center"
                    @click="caracteristicas.tipoProducto=tipo"
                    v-for="(tipo) in tiposProducto"
                    :key="tipo"
                    >{{tipo}}
                    <span v-if="tipo === caracteristicas.tipoProducto" class="badge badge-success">{{$t('active')}}</span>
                  </li>
                </ul>
                <hr>
                <h6>Crear nuevo tipo de producto</h6>
                <div class="form-group">
                  <input v-model="nuevoTipoProducto" class="form-control" aria-describedby="emailHelp" required="true" placeholder="Identificador del producto">
                </div>
                <button type="submit" @click="crearTipoProducto" class="btn btn-primary">{{$t('create')}}</button>
              </div>
              

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal" data-dismiss="modal">{{$t('close')}}</button>
              <button type="button" class="btn btn-primary" @click="crearProducto" v-if="modal.tipo==='crearProducto'">{{$t('create-product')}}</button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
</template>

<script>
import VueQrReader from 'vue-qr-reader/dist/lib/vue-qr-reader.umd.js';
import {composer} from '../../ComposerAPI'
import googleMap from '../mapas/Mapa'
//import crypto from 'crypto-js'

export default {
  components : {
    googleMap,
    VueQrReader
  },
  data(){
    return {
      caracteristicas :{
        identificador : '',
        tipoProducto : '',
        tipo : '',
        variedadProducto : '',
        descripcion : '',
        unidades : 0,
        peso:0,
        magnitud:'kilogramos',
      },
      loc:'',
      localizacionId:'',
      coordenadas : {
        latitud: '',
        longitud:'',
        direccion:''
      },
      imagen : {
        incluir : false,
        hashImagen : '',
        url : '',
        algoritmo : 'sha1'
      },
      localizaciones : [],
      modalProgress : false,
      infoModal :{
        show : false,
        message : 'Mensage de ERROR',
        tipo : ''
      },
      info :{
        show : false,
        message : 'Mensage de ERROR',
        tipo : ''
      },
      progress : false,
      modal : {
        titulo : '',
        tipo : ''
      },
      tiposProducto:[],
      nuevoTipoProducto : '',
      gps : false,
      mapa :false,
      scannerQR :false,
    }
  },
  computed : {
    producto(){
      let producto = {
        "$class": "org.hyperledger.composer.productos.CrearProducto",
        "caracteristicas": {
          "$class": "org.hyperledger.composer.productos.Caracteristicas",
          "tipo": this.caracteristicas.tipo,
          "descripcion" : this.caracteristicas.descripcion,
          "peso" : this.caracteristicas.peso,
          "magnitudPeso" : this.caracteristicas.magnitud,
        }
      };
      let imagen = {
        "$class": "org.hyperledger.composer.productos.Imagen",
        "hashImagen": this.imagen.hashImagen,
        "url": this.imagen.url,
        "algoritmo": this.imagen.algoritmo
      };

      let loc = {
        "$class": "org.hyperledger.composer.productos.Loc",
        "latitud": this.coordenadas.latitud,
        "longitud": this.coordenadas.longitud,
        "direccion": this.coordenadas.direccion
      };
      if (this.caracteristicas.tipoProducto !== ''){
        producto.caracteristicas.tipoProducto = "resource:org.hyperledger.composer.productos.TipoProducto#" + this.caracteristicas.tipoProducto;
      }
      if (this.caracteristicas.identificador !== ""){
        producto.identificador = this.caracteristicas.identificador;
      }
      if (this.caracteristicas.variedadProducto !== ""){
        producto.caracteristicas.variedadProducto = this.caracteristicas.variedadProducto;
      }
      if (this.caracteristicas.descripcion !== ""){
        producto.caracteristicas.descripcion = this.caracteristicas.descripcion;
      }
      if (this.imagen.incluir) {
        producto.imagen = imagen;
      }
      if (this.loc === 'gps'){
        producto.loc = loc;
      } else {
        producto.localizacionId = this.localizacionId;
      }
      if (this.caracteristicas.tipo === 'UNIDAD'){
        producto.caracteristicas.unidades = this.caracteristicas.unidades;
      } 

      return producto;
    }
  },
  created : async function(){
    await this.actualizarTipoProducto();
   
  },
  methods : {
    procesarCodigoQR (code) {
      this.caracteristicas.identificador = code;
      this.scannerQR = false;
    },
    closeModal : async function(){
      this.infoModal.show=false;
    },
    crearTipoProducto : async function(){
      this.modalProgress = true;
      let response = await composer.productos.crearTipoProducto(this.$axios, this.nuevoTipoProducto);
      if (response.statusCode === 200){
        this.infoModal.show = true;
        this.infoModal.message = 'Tipo de producto creado'
        this.infoModal.tipo = "alert alert-success"
        await this.actualizarTipoProducto();
      } else {
        this.infoModal.show = true
        this.infoModal.message = response.message
        this.infoModal.tipo = "alert alert-danger"
      }
      this.nuevoTipoProducto = '';
      this.modalProgress = false;

    },
    actualizarTipoProducto : async function() {
      let response = await composer.productos.getTipoProducto(this.$axios);

      if (response.statusCode === 200){
          this.info.show = false;
          let tipos = [];
          response.data.forEach((tipo) => tipos.push(tipo.tipo))
          this.tiposProducto = tipos;
      } else {
          this.info.show = true
          this.info.message = response.message
          this.info.tipo = "alert alert-danger"
      }
    },
    crearProducto : async function() {
      this.infoModal.show = false;
      if (!this.gps){
        if (this.loc === 'gps'){
          this.infoModal.show = true; this.infoModal.message = 'GPS no disponible'; this.infoModal.tipo = "alert alert-warning";
          return;
        }
      } else {
        if (this.coordenadas.direccion === '' && this.loc === 'gps'){
          this.infoModal.show = true; this.infoModal.message = 'Dirección no válida'; this.infoModal.tipo = "alert alert-warning";
          return;
        }
      }
      if (this.imagen.incluir){
        if(this.imagen.hashImagen === '' || this.imagen.url === ''){
          this.infoModal.show = true; this.infoModal.message = 'Datos de la imagen inválidos'; this.infoModal.tipo = "alert alert-warning";
          return;
        }
      }
      this.modalProgress = true;
      let response = await composer.productos.crearProducto(this.$axios, this.producto);
      this.modalProgress = false;
      if (response.statusCode === 200){
        this.infoModal.show = true; this.infoModal.message = 'Producto Creado'; this.infoModal.tipo = "alert alert-success";
      } else {
        this.infoModal.show = true; this.infoModal.message = response.message; this.infoModal.tipo = "alert alert-danger";
      }
    },
    geolocalizacion : async function(){
      this.mapa = false;
      this.info.show = false;
      if ("geolocation" in navigator) {
        let self = this;
        this.coordenadas.latitud = ""; this.coordenadas.longitud = ""; this.coordenadas.direccion = "";
        navigator.geolocation.getCurrentPosition(function(position) {
          self.gps = true;
          const latitud = position.coords.latitude;
          const longitud = position.coords.longitude;
          self.coordenadas.latitud = latitud;
          self.coordenadas.longitud = longitud;
        },function(error){
          self.gps = false;
          self.info.show = true;
          self.info.message = error.message;
          self.info.tipo = "alert alert-warning";
        });
      } else {
        this.gps = false;
        this.info.show = true;
        this.info.message = 'Geolocalización no disponible en este dispositivo';
        this.info.tipo = "alert alert-warning";
      }
    },
    getLocalizaciones : async function() {
      this.mapa = false;
      let response = await composer.organizaciones.getOrganizacionId(this.$axios, this.$store.state.organizacion);
      if (response.statusCode === 200){
        this.info.show = false;
        this.localizaciones = response.data.localizaciones;
        // let self = this;
        // response.data.localizaciones.forEach(async (loc) => {
        //   let response = await composer.organizaciones.getLocalizacion(self.$axios, loc.split('#')[1]);
        //   if (response.statusCode === 200){
        //     self.info.show = false;
        //     self.localizaciones.push(response.data);
        //   } else {
        //     self.info.show = true;
        //     self.info.message = response.message;
        //     self.info.tipo = "alert alert-danger";
        //   }
        // });
      } else {
        this.info.show = true;
        this.info.message = response.message;
        this.info.tipo = "alert alert-danger";
      }
    }
  }
}
</script>

<style scoped>

</style>
