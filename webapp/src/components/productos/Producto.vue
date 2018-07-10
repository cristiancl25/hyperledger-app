<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-10" v-if="info.show" v-bind:class="info.tipo" role="alert">
        <strong></strong> {{ info.message }}
      </div>
    </div>


    <div class="row justify-content-center">
      <div class="col-md-10">
        <div>
          <!-- TODO imagen -->
          <h1 align="center"><strong>producto</strong></h1>
          <h5 align="center"><strong>ID: </strong>{{datosProducto.productoId}}</h5>
          <h5 align="center"><strong>Identificador: </strong>{{datosProducto.identificador}}</h5>
          <h5 align="center"><strong>Estado: </strong><span class="badge badge-primary">{{datosProducto.estado}}</span></h5>
          <h5 align="center" v-if="datosProducto.operacionActual.datosVenta"><strong>Datos Venta: </strong>{{datosProducto.operacionActual.datosVenta}}</h5>
          <h5 align="center" v-if="datosProducto.estado==='PUJA'"><strong>Datos Puja: </strong>{{datosPuja}}</h5>
          <h5 align="center"><strong>Propietaria: </strong>{{datosProducto.operacionActual.orgId}}</h5>
          <h5 align="center"><strong>Caracteristicas: </strong>{{datosProducto.caracteristicas}}</h5>
          <h5 align="center"><strong>OperacionActual: </strong>{{datosProducto.operacionActual}}</h5>
          <h5 align="center"><strong>operaciones: </strong>{{datosProducto.operaciones}}</h5>
        </div>
      </div>
    </div>


    

    <div class="row">
      <div class="btn-group col-md-12">
        <button class="btn btn-primary" @click="showMapMethod">Mostrar Mapa</button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PARADO'"
          @click="datosVenta.productoId=datosProducto.productoId; modal.titulo='Poner en venta'; modal.tipo='crearVenta'">
          Poner en venta
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='VENTA'"
          @click="modal.titulo='Cancelar venta'; modal.tipo='cancelarVenta'">
          Cancelar Venta
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion !== datosProducto.operacionActual.orgId && 
                datosProducto.estado==='VENTA' && 
                datosProducto.operacionActual.datosVenta.tipoVenta==='NORMAL'"
          @click="modal.titulo='Comprar producto'; modal.tipo='comprarProducto'">
          Comprar Producto
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion !== datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PUJA'"
          @click="modal.titulo='Pujar producto'; modal.tipo='pujarProducto'">
          Pujar Producto
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PUJA'"
          @click="modal.titulo='Finalizar puja'; modal.tipo='finalizarPuja'">
          Finalizar puja
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PARADO'"
          @click="modal.titulo='Consumir Producto'; modal.tipo='consumirProducto'">
          Consumir producto
        </button>
        <!-- TODO ajustar estados -->
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId &&
                datosProducto.estado !== 'PERDIDO' &&
                datosProducto.estado !== 'CONSUMIDO' &&
                datosProducto.estado !== 'TRANSACCION' &&
                datosProducto.estado !== 'DIVIDIDO'"
          @click="modal.titulo='Producto perdido'; modal.tipo='productoPerdido'">
          Producto perdido
        </button>

      </div>
    </div>

    <div class="row justify-content-center" v-if="showMap">
      <div class="col-md-10">
        <div>
          <google-map v-bind:markers='markers' v-bind:lista='true'></google-map>
        </div>
      </div>
    </div>


    <div class="modal fade" id="ModalProducto" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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

            <div id="ContenidoModal" v-if="modal.tipo==='crearVenta'">
              <form> 
                <div class="form-group col-md-6">
                  <label for="exampleFormControlSelect1">Unidad monetaria</label>
                  <select class="form-control" v-model="datosVenta.unidadMonetaria" id="exampleFormControlSelect1">
                    <option selected>euros</option>
                    <option>dolares</option>
                  </select>
                </div>
                <div class="form-group col-md-12">
                  <label for="nombre">Precio</label>
                  <input v-model="datosVenta.precio" type=number step=0.01 class="form-control"  placeholder="Precio">
                </div>
                <div class="form-group col-md-6">
                  <label for="exampleFormControlSelect1">Tipo de venta</label>
                  <select class="form-control" v-model="datosVenta.tipoVenta" id="exampleFormControlSelect1">
                    <option selected>NORMAL</option>
                    <option>PUJA</option>
                  </select>
                </div>
                <div id="card" class="form-group col-md-12"></div>
                <br>
              </form>
            </div>

            <div id="ContenidoModal" v-if="modal.tipo==='pujarProducto'">
              <div class="form-group col-md-12">
                <label for="nombre">Precio</label>
                <input v-model="precioPuja" type=number step=0.01 class="form-control"  placeholder="Precio">
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" v-if="modal.tipo==='crearVenta'" class="btn btn-primary" @click="crearVenta">Crear venta</button>
            <button type="button" v-if="modal.tipo==='comprarProducto'" class="btn btn-primary" @click="comprarProducto">Comprar Producto</button>
            <button type="button" v-if="modal.tipo==='cancelarVenta'" class="btn btn-primary" @click="cancelarVenta">Cancelar Venta</button>
            <button type="button" v-if="modal.tipo==='pujarProducto'" class="btn btn-primary" @click="pujarProducto">Pujar Producto</button>
            <button type="button" v-if="modal.tipo==='finalizarPuja'" class="btn btn-primary" @click="finalizarPuja">Finalizar Puja</button>
            <button type="button" v-if="modal.tipo==='consumirProducto'" class="btn btn-primary" @click="consumirProducto">Consumir producto</button>
            <button type="button" v-if="modal.tipo==='productoPerdido'" class="btn btn-primary" @click="productoPerdido">Producto perdido</button>
          </div>
        </div>


      </div>
    </div>
  </div>

</template>

<script>
  import googleMap from '../mapas/Mapa';
  import {composer} from '../../ComposerAPI'

  export default {
    components : {
      googleMap
    },
    data() {
      return{
        progress : false,
        modalInfo : {
          show : false,
          message : '',
          tipo : ''
        },
        info : {
          show : false,
          message : '',
          tipo : ''
        },
        modal : {
          titulo : '',
          tipo : ''
        },
        markers: [],
        showMap: false,
        datosProducto : {
          operacionActual : {}
        },
        datosVenta : {
          "$class": "org.hyperledger.composer.productos.PonerVentaProducto",
          "productoId": "",
          "tipoVenta": "NORMAL",
          "unidadMonetaria": "euros",
          "precio": 0
        },
        datosPuja : {},
        precioPuja : 0
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
      inicializar : async function() {
        this.showMap = false;
        let response = await composer.productos.getProducto(this.$axios, this.$route.params.id);
        if (response.statusCode === 200){
          this.info.show = false
          this.datosProducto = response.data
          if (this.datosProducto.estado === 'PUJA'){
            let response = await composer.productos.getPuja(this.$axios, this.datosProducto.operacionActual.datosVenta.pujaId);
            console.log(response);
            this.datosPuja = response.data;
          }
        } else {
          this.info.show = true
          this.info.message = response.message
        }
      },
      showMapMethod () {
        if (this.showMap){
          this.showMap = false;
        } else {
          this.markers = [{
            'lat': this.datosProducto.operacionActual.localizacion.latitud,
            'lng': this.datosProducto.operacionActual.localizacion.longitud,
            'info': this.datosProducto.operacionActual.localizacion.direccion,
            'org': this.datosProducto.operacionActual.orgId
          }];
          let self = this;
          this.datosProducto.operaciones.forEach(async (operacion) => {
            self.markers.push({
              'lat': operacion.localizacion.latitud,
              'lng': operacion.localizacion.longitud,
              'info': operacion.localizacion.direccion,
              'org': operacion.orgId
            });
          });         
          this.showMap = true;
        }
      },
      respuesta(response, mensaje){
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = mensaje; this.modalInfo.tipo = "alert alert-success";
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }

      },
      crearVenta : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.ponerVentaProducto(this.$axios, this.datosVenta);
        this.respuesta(response, 'Producto en venta');
        this.datosVenta.precio = '';
        this.progress = false;
      },
      cancelarVenta : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.cancelarVenta(this.$axios, this.datosProducto.productoId);
        this.respuesta(response, 'Venta cancelada');
        this.progress = false;
      },
      comprarProducto : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.comprarProducto(this.$axios, this.datosProducto.productoId);
        this.respuesta(response, 'Producto comprado');
        this.progress = false;
      },
      pujarProducto : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.pujarProducto(this.$axios, this.datosProducto.productoId, this.precioPuja);
        this.respuesta(response, 'Producto pujado');
        this.progress = false;
      },
      finalizarPuja : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.finalizarPuja(this.$axios, this.datosProducto.productoId);
        this.respuesta(response, 'Puja finalizada');
        this.progress = false;
      },
      consumirProducto : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.consumirProducto(this.$axios, this.datosProducto.productoId);
        this.respuesta(response, 'Producto consumido');
        this.progress = false;
      },
      productoPerdido : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.productoPerdido(this.$axios, this.datosProducto.productoId);
        this.respuesta(response, 'Producto perdido');
        this.progress = false;
      }
    }
  }
</script>

<style scoped>

</style>
