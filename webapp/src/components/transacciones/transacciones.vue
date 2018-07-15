<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-2">
        <label for="inputState">Filtro</label>
        <select v-model="filtros.compraVenta" class="form-control">
          <option @click="filtrado()" value="">Todas</option>
          <option @click="filtrado()" >Compra</option>
          <option @click="filtrado()" >Venta</option>
        </select>
      </div>
    </div>
    <h1 align="center">Transacciones</h1>
    <div class="row justify-content-center">
      <div align="center" v-if="paginacion.contenido.length === 0" class="alert alert-warning col-md-6">
        <strong>No existen transacciones</strong>
      </div>
      <div class="col-md-10">
        <ul class="list-group">
          <li
            class="list-group-item mb-2"
            :key="tran.trasaccionId"
            v-for="(tran) in paginacion.contenido">
            <div>
              <h6><strong>ID: </strong>{{tran.transaccionId}}</h6>
              <router-link :to="'/productos/' + getProductoId(tran.producto)" tag="a"> <a>producto</a> </router-link>
              <h6>
                <span v-if="tran.orgCompra.orgId===$store.state.organizacion">&#10132; </span><strong>Comprador</strong>
                <router-link
                  :to="'/organizaciones/' + tran.orgCompra.orgId"
                  tag="a">
                  {{tran.orgCompra.orgId}}
                </router-link>
                <span v-if="tran.orgCompra.confirmacion">&#x2705;</span>
                <span v-else>&#10008;</span>
              </h6>
              <h6>
                <span v-if="tran.orgVenta.orgId===$store.state.organizacion">&#10132; </span><strong>Vendedor</strong>
                <router-link
                  :to="'/organizaciones/' + tran.orgVenta.orgId"
                  tag="a">
                  {{tran.orgVenta.orgId}}
                </router-link> 
                <span v-if="tran.orgVenta.confirmacion">&#x2705;</span>
                <span v-else>&#10008;</span>
              </h6>
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
    <br>
    <div class="row justify-content-center">
      <div>
        <paginate v-if="paginacion.show"
          :page-count="paginacion.paginas"
          :click-handler="cambiarPagina"
          :prev-text="'Anterior'"
          :next-text="'Siguiente'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-link-class="'page-link'"
          :next-link-class="'page-link'"
          :container-class="'pagination justify-content-center'">
        </paginate>
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
import Paginate from 'vuejs-paginate'

export default {
  components : {
    Paginate,
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
      transacciones : [],
      paginacion : {
        show : false,
        paginas : 1,
        contenido : []
      },
      filtros : {
        compraVenta : ''
      }
    
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
  created : async function () {
      await this.filtrado();
  },
  methods : {
    inicializar : async function(){
      await this.filtrado();
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
    cambiarPagina(pagina){
      this.paginacion.contenido = this.transacciones.slice((pagina-1)*10, (pagina-1)*10 + 10);
    },
    filtrado : async function () {
      let filtro = '';
      if (this.filtros.compraVenta === 'Compra'){
        filtro = '?filter={"where": {"orgCompra.orgId": "' + this.$store.state.organizacion +'"}}'
      } else if (this.filtros.compraVenta === 'Venta'){
        filtro = '?filter={"where": {"orgVenta.orgId": "' + this.$store.state.organizacion +'"}}'
      }
      
      let response = await composer.productos.getTransacciones(this.$axios, filtro);
      this.transacciones=response.data;
      this.cambiarPagina(1);
      this.paginacion.paginas = Math.ceil(this.transacciones.length/10);
      this.paginacion.show = true;
    }
  }
}
</script>

<style scoped>

</style>