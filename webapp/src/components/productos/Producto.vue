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
          <h5 align="center" v-if="datosProducto.estado==='PUJA'"><strong>Datos Puja: </strong>{{datosProducto.operacionActual.datosVenta.pujaId}}</h5>
          <h5 align="center"><strong>Propietaria: </strong>{{datosProducto.operacionActual.orgId}}</h5>
          <h5 align="center"><strong>Caracteristicas: </strong>{{datosProducto.caracteristicas}}</h5>
          <h5 align="center"><strong>OperacionActual: </strong>{{datosProducto.operacionActual}}</h5>
          <h5 align="center"><strong>operaciones: </strong>{{datosProducto.operaciones}}</h5>
        </div>
      </div>
    </div>


    

    <div class="row justify-content-center">
      <div class="btn-group col-md-6">
        <button class="btn btn-primary" @click="showMapMethod">Mostrar Mapa</button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PARADO'"
          @click="ponerVenta=true; datosVenta.productoId=datosProducto.productoId">
          Poner en venta
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='VENTA'"
          @click="cancelacionVenta=true">
          Cancelar Venta
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion !== datosProducto.operacionActual.orgId && 
                datosProducto.estado==='VENTA' && 
                datosProducto.operacionActual.datosVenta.tipoVenta==='NORMAL'"
          @click="compraProducto=true">
          Comprar Producto
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion !== datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PUJA'"
          @click="pujaProducto=true">
          Pujar Producto
        </button>
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PUJA'"
          @click="finPuja=true">
          Finalizar puja
        </button>

      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-10">
        <div v-if="showMap">
          <google-map v-bind:markers='markers' v-bind:lista='true'></google-map>
        </div>
      </div>
    </div>


    <div class="modal fade" id="ModalProducto" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">

        <div class="modal-content" v-if="ponerVenta">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Poner Venta</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- TODO Componente Info -->
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
            <div>
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
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); ponerVenta=false; modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="crearVenta">Crear</button>
          </div>
        </div>

        <div class="modal-content" v-if="compraProducto">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Comprar Producto</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- TODO Componente Info -->
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
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); compraProducto=false; modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="comprarProducto">Comprar</button>
          </div>
        </div>

        <div class="modal-content" v-if="cancelacionVenta">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Cancelar venta</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- TODO Componente Info -->
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
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); cancelacionVenta=false; modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="cancelarVenta">Cancelar</button>
          </div>
        </div>

        <div class="modal-content" v-if="pujaProducto">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Puja producto</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!--  TODO Componente Info -->
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
            <div class="form-group col-md-12">
              <label for="nombre">Precio</label>
              <input v-model="precioPuja" type=number step=0.01 class="form-control"  placeholder="Precio">
            </div>
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); pujaProducto=false; modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="pujarProducto">Pujar</button>
          </div>
        </div>

        <div class="modal-content" v-if="finPuja">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Finalizar puja</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- TODO Componente Info -->
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
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="inicializar(); finPuja=false; modalInfo.show=false" data-dismiss="modal">{{$t('close')}}</button>
            <button type="button" class="btn btn-primary" @click="finalizarPuja">Finalizar</button>
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
        markers: [],
        showMap: false,
        ponerVenta : false,
        compraProducto : false,
        cancelacionVenta : false,
        pujaProducto : false,
        finPuja : false,
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
      crearVenta : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.ponerVentaProducto(this.$axios, this.datosVenta);
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = 'Producto en venta'; this.modalInfo.tipo = "alert alert-success";
          this.datosVenta.precio = '';
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }
        this.progress = false;
      },
      cancelarVenta : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.cancelarVenta(this.$axios, this.datosProducto.productoId);
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = 'Venta cancelada'; this.modalInfo.tipo = "alert alert-success";
          this.datosVenta.precio = '';
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }
        this.progress = false;
      },
      comprarProducto : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.comprarProducto(this.$axios, this.datosProducto.productoId);
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = 'Producto Comprado'; this.modalInfo.tipo = "alert alert-success";
          this.datosVenta.precio = '';
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }
        this.progress = false;
      },
      pujarProducto : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.pujarProducto(this.$axios, this.datosProducto.productoId, this.precioPuja);
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = 'Producto pujado'; this.modalInfo.tipo = "alert alert-success";
          this.datosVenta.precio = '';
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }
        this.progress = false;
      },
      finalizarPuja : async function (){
        this.modalInfo.show = false;
        this.progress = true;
        let response = await composer.productos.finalizarPuja(this.$axios, this.datosProducto.productoId);
        if (response.statusCode === 200){
          this.modalInfo.show = true; this.modalInfo.message = 'Puja finalizada'; this.modalInfo.tipo = "alert alert-success";
          this.datosVenta.precio = '';
        } else {
          this.modalInfo.show = true; this.modalInfo.message = response.message; this.modalInfo.tipo = "alert alert-danger";
        }
        this.progress = false;
      }
    }
  }
</script>

<style scoped>

</style>
