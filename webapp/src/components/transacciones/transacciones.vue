<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-10">
        <ul class="list-group">
          <li
            class="list-group-item"
            :key="tran.trasaccionId"
            v-for="(tran) in transaccionesVenta">
            <div>
              <h5><strong>ID: </strong>{{tran.transaccionId}}</h5>
              <router-link :to="'/productos/' + getProductoId(tran.producto)" tag="a"> <a>producto</a> </router-link>
              <h5><strong>Comprador</strong> {{tran.orgCompra.orgId}} - {{tran.orgCompra.confirmacion}}</h5>
              <h5><strong>Vendedor</strong> {{tran.orgVenta.orgId}} - {{tran.orgVenta.confirmacion}}</h5>
              <button class="btn btn-primary"
                data-toggle="modal" data-target="#ModalTransaccion"
                @click="modal.titulo='Confirmar transaccion';
                  getLocalizaciones();
                  transaccion.orgCompra=tran.orgCompra.orgId;
                  transaccion.productoId=getProductoId(tran.producto)">
                Confirmar Transaccion
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>




    <div class="modal fade" id="ModalTransaccion" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">

        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">{{modal.titulo}}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="col-md-12" v-if="modalInfo.show">
                <div v-bind:class="modalInfo.tipo" role="alert">
                  <strong></strong> {{ modalInfo.message }}
                </div>
            </div>
            <div class="col-md-12" v-if="progress">
              <div class="progress" >
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
              </div>
            </div>

            <div id="ContenidoModal">
              <form> 
                <div class="form-group col-md-6">
                  <label for="exampleFormControlSelect1">Respuesta</label>
                  <select class="form-control" v-model="transaccion.confirmar" id="exampleFormControlSelect1">
                    <option value="true" selected>Confirmar</option>
                    <option value="false">Rechazar</option>
                  </select>
                </div>
                <div class="form-group col-md-12" v-if="$store.state.organizacion===transaccion.orgCompra">
                  <h5>Localizaciones de la organizacion</h5>
                  <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center"
                      v-for="(loc) in localizaciones"
                      :key="loc.direccion"
                      @click="transaccion.nuevaLocalizacion=loc.localizacionId; coordenadas.latitud = loc.latitud; coordenadas.longitud = loc.longitud; coordenadas.direccion = loc.direccion"
                      >{{loc.direccion}}
                      <span v-if="transaccion.nuevaLocalizacion === loc.localizacionId" class="badge badge-success">{{$t('active')}}</span>
                    </li>
                  </ul>
                </div>
              </form>
              <div class="col-md-12"> 
                <div v-if="$store.state.organizacion===transaccion.orgCompra">
                  <button class="btn btn-primary" v-if="!coordenadas.mapa" @click="coordenadas.mapa=!coordenadas.mapa">Mostrar Localización</button>
                  <button class="btn btn-primary" v-if="coordenadas.mapa" @click="coordenadas.mapa=!coordenadas.mapa">Ocultar Localización</button>
                </div>
                <google-map v-if="coordenadas.mapa" v-bind:markers="[{'lat':coordenadas.latitud, 'lng':coordenadas.longitud, 'info':coordenadas.direccion}]" v-bind:lista='false'></google-map>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="confirmarTransaccion">Enviar</button>
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
      modalInfo : {
        show : false,
        message : '',
        tipo : ''
      },
      modal : {
        titulo : '',
        tipo : ''
      },
      coordenadas : {
        mapa : false,
        latitud: 0,
        longitud:0,
        direccion:''
      },
      localizaciones : [],
      transaccion : {
        "orgCompra" : "",
        "productoId": "",
        "confirmar": "true",
        "nuevaLocalizacion": ""
      },
      progress : false,
      transaccionesVenta : []
    
    }
  },
  computed : {
    recursoTransaccion(){
      let rec = {
        "$class": "org.hyperledger.composer.productos.ConfirmarTransaccion",
        "productoId": this.transaccion.productoId,
        "confirmar": this.transaccion.confirmar,
      }

      if (this.transaccion.nuevaLocalizacion !== ''){
        rec.nuevaLocalizacion = this.transaccion.nuevaLocalizacion;
      }
      return rec
    }
  },
  watch: {
    // TODO Mejorar
    '$store.store.organizacion' : async function(to, from) {
      await this.inicializar();
    }
  },
  created : async function () {
      await this.inicializar();
  },
  methods : {
    inicializar : async function() {
      let response = await composer.productos.getTransacciones(this.$axios);
      // let response = await composer.productos.getTransaccionesVenta(this.$axios, this.$store.state.organizacion);
      // let resp = await composer.productos.getTransaccionesCompra(this.$axios, this.$store.state.organizacion);
      this.transaccionesVenta = response.data;
    },
    getProductoId(recurso){ return recurso.split("#")[1] },
    getLocalizaciones : async function() {
      let response = await composer.organizaciones.getOrganizacionId(this.$axios, this.$store.state.organizacion);
      this.localizaciones = response.data.localizaciones;
      // if (response.statusCode === 200){
      //   this.info.show = false;
      //   this.localizaciones = response.data.localizaciones;
      // } else {
      //   this.info.show = true;
      //   this.info.message = response.message;
      //   this.info.tipo = "alert alert-danger";
      // }
    },
    respuesta(response, mensaje){
      if (response.statusCode === 200){
        this.modalInfo.show = true; this.modalInfo.message = mensaje; this.modalInfo.tipo = "alert alert-success";
      } else {
        this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
      }
    },
    confirmarTransaccion : async function (){
      this.modalInfo.show = false;
      this.progress = true;
      let response = await composer.productos.confirmarTransaccion(this.$axios, this.recursoTransaccion);
      this.respuesta(response, 'Confirmado');
      this.progress = false;
    },
  }
}
</script>

<style scoped>

</style>