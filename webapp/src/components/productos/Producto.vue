<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-10" v-if="info.show" v-bind:class="info.tipo" role="alert">
        <strong></strong> {{ info.message }}
      </div>
    </div>


    <div class="row justify-content-center">
      <div class="col-md-12">
        <h1 align="center"><strong>Producto</strong></h1>
        <h5 align="center"><strong>ID: </strong>{{datosProducto.productoId}}</h5>
        <h5 align="center"><strong>Identificador: </strong>{{datosProducto.identificador}}</h5>
        <h5 align="center"><strong>Estado: </strong><span :class="colorEstado">{{datosProducto.estado}}</span></h5>
        <h5 align="center"><strong>Propietaria: </strong>{{datosProducto.operacionActual.orgId}}</h5>
      </div>
      <div class="col-md-6">
        <h5 align="center"><strong>Características: </strong></h5>
        <h6><strong>Tipo producto: </strong>{{datosProducto.caracteristicas.tipoProducto.tipo}}</h6>
        <h6><strong>Variedad: </strong>{{datosProducto.caracteristicas.variedadProducto}}</h6>
        <h6><strong>Tipo: </strong>{{datosProducto.caracteristicas.tipo}}</h6>
        <h6 v-if="datosProducto.caracteristicas.tipo==='PESO'"><strong>Peso: </strong>{{datosProducto.caracteristicas.peso}}</h6>
        <h6 v-if="datosProducto.caracteristicas.tipo==='UNIDAD'"><strong>Peso medio: </strong>{{datosProducto.caracteristicas.peso}}</h6>
        <h6 v-if="datosProducto.caracteristicas.tipo==='UNIDAD'"><strong>Unidades: </strong>{{datosProducto.caracteristicas.unidades}}</h6>
        <h6><strong>Magnitud: </strong>{{datosProducto.caracteristicas.magnitudPeso}}</h6>
        <h6><strong>Descripción: </strong></h6><p>{{datosProducto.caracteristicas.descripcion}}</p>
      </div>
      <div class="col-md-6" v-if="datosProducto.estado==='VENTA'">
        <h5 align="center"><strong>Datos Venta: </strong></h5>
        <h6 class="list-group-item d-flex justify-content-between align-items-center"><strong>Precio: </strong>{{datosProducto.operacionActual.datosVenta.precio}} {{datosProducto.operacionActual.datosVenta.unidadMonetaria}}</h6>
      </div>
      <div class="col-md-6" v-if="datosProducto.estado==='PUJA'">
        <h5 align="center"><strong>Datos Puja: </strong></h5>
        <h6><strong>Precio partida: </strong>{{datosPuja.precioPartida}}</h6>
        <h6><strong>Pujas: </strong></h6>
        <ul class="list-group col-md-12">
          <li class="list-group-item d-flex justify-content-between align-items-center"
            :key="puja.orgId"
            v-for="puja in datosPuja.organizaciones">
            <router-link
              :to="'/organizaciones/' + puja.orgId"
              tag="a">
              {{puja.orgId}}
            </router-link>
            {{puja.precio}}
          </li>
        </ul>
      </div>
      <div class="col-md-6" v-if="datosProducto.imagen">
        <h5 align="center"><strong>Imagen: </strong></h5>
        <h6 align="center"><strong>URL: </strong><a :href="datosProducto.imagen.url">{{datosProducto.imagen.url}}</a></h6>
        <h6 align="center"><strong>HASH: </strong>{{datosProducto.imagen.hashImagen}}</h6>
        <h6 align="center"><strong>Algoritmo: </strong>{{datosProducto.imagen.algoritmo}}</h6>
      </div>
      <div class="col-md-6" v-if="datosProducto.predecesor">
        <h5 align="center"><strong>Predecesor: </strong></h5>
        <router-link
          align="center"
          :to="'/productos/' + datosProducto.predecesor"
          tag="a">
          {{datosProducto.predecesor}}
        </router-link>

      </div>
      <div class="col-md-6" v-if="datosProducto.sucesores.length!==0">
        <h5 align="center"><strong>Sucesores: </strong></h5>
        <ul>
          <li align="center"
            :key="sucesor"
            v-for="(sucesor) in datosProducto.sucesores">
            <router-link
              :to="'/productos/' + sucesor"
              tag="a">
              {{sucesor}}
            </router-link>
          </li>
        </ul>
      </div>
          
    </div>


    

    <div class="row">
      <div class="btn-group flex-wrap col-md-12">
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
        <button class="btn btn-primary"
          data-toggle="modal" data-target="#ModalProducto"
          v-if="$store.state.rolParticipante === 'Usuario' && 
                $store.state.organizacion === datosProducto.operacionActual.orgId && 
                datosProducto.estado==='PARADO'"
          @click="modal.titulo='Dividir Producto'; modal.tipo='dividirProducto'">
          Dividir Producto
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

            <div id="ContenidoModal" v-if="modal.tipo==='dividirProducto'">
              <h6 v-if="datosProducto.caracteristicas.tipo==='PESO'">División por peso</h6>
              <h6 v-else>División por unidad</h6>

            <div class="row justify-content-center">
              <div class="col-md-12">

                  <div
                    :key="trozo.identificador"
                    v-for="(trozo, index) in trozos">
                    <div class="form-group col-md-12">
                      <label for="nombre">Identificador</label>
                      <input v-model="trozo.identificador" class="form-control"  placeholder="Identificador">
                      <small>opcional</small>
                    </div>
                    <div v-if="datosProducto.caracteristicas.tipo==='PESO'" class="form-group col-md-12">
                      <label for="nombre">Peso</label>
                      <input v-model="trozo.peso" type=number step=0.01 min="0.01" value="0.01" class="form-control"  placeholder="Peso">
                    </div>
                    <div v-else class="form-group col-md-12">
                      <label for="nombre">Unidades</label>
                      <input v-model="trozo.unidades" type=number step=1 min="1" value="1" class="form-control"  placeholder="Unidades">
                    </div>
                    <div v-if="trozo.imagen">
                      <div class="form-group col-md-12">
                        <label for="nombre">hashImagen</label>
                        <input v-model="trozo.imagen.hashImagen" class="form-control"  placeholder="Hash de la imagen">
                      </div>
                      <div class="form-group col-md-12">
                        <label for="nombre">url</label>
                        <input v-model="trozo.imagen.url" class="form-control"  placeholder="url">
                      </div>
                      <div class="form-group col-md-6">
                        <label for="exampleFormControlSelect1">Algoritmo</label>
                        <select class="form-control" v-model="trozo.imagen.algoritmo">
                          <option selected>sha1</option>
                          <option>md5</option>
                        </select>
                      </div>
                    </div>
                    <div class="row">
                    <div class="form-group col-md-12">
                      <button v-if="!trozo.imagen" type="button" class="btn btn-primary" @click="anadirImagen(index)">Añadir datos imagen</button>
                      <button v-else type="button" class="btn btn-primary" @click="eliminarImagen(index)">Eliminar datos imagen</button>
                    </div>
                    </div>
                    <hr>
                  </div>

              </div>
            </div>
            <br>
            <div class="row justify-content-center">
              <div class="col-md-12">
                <button type="button" class="btn btn-primary" @click="anadirTrozo">Añadir trozo</button>
                <button type="button" class="btn btn-primary" @click="eliminarTrozo" v-if="trozos.length>2">Eliminar Trozo</button>
              </div>
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
            <button type="button" v-if="modal.tipo==='dividirProducto'" class="btn btn-primary" @click="dividirProducto">Dividir producto</button>
          </div>
        </div>


      </div>
    </div>
  </div>

</template>

<script>
  import googleMap from '../mapas/Mapa';
  import {composer} from '../../ComposerAPI'
  import {util} from '../../util.js'

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
          sucesores : [],
          operacionActual : {},
          caracteristicas : {
            tipoProducto : {}
          },
          predecesor : ''
        },
        datosVenta : {
          "$class": "org.hyperledger.composer.productos.PonerVentaProducto",
          "productoId": "",
          "tipoVenta": "NORMAL",
          "unidadMonetaria": "euros",
          "precio": 0
        },
        datosPuja : {},
        precioPuja : 0,
        trozos : [{
          "$class": "org.hyperledger.composer.productos.Trozo",
          "unidades": 0,
          "peso": 0,
          "identificador": ""
        },
        {
          "$class": "org.hyperledger.composer.productos.Trozo",
          "unidades": 0,
          "peso": 0,
          "identificador": ""
        }]
      }
    },
    computed : {
      colorEstado(){
        return util.colorEstadoProducto(this.datosProducto.estado);
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
      },
      dividirProducto : async function (){
        this.modalInfo.show = false;
        
        let peso = 0;
        let unidades = 0
        for (let i = 0; i<this.trozos.length; i++){
          peso = peso +  Number(this.trozos[i].peso);
          unidades = unidades +  Number(this.trozos[i].unidades);
        }
        if (this.datosProducto.caracteristicas.tipo === 'PESO'){
          if (peso > this.datosProducto.caracteristicas.peso){
            this.modalInfo.show = true; this.modalInfo.message = 'El peso de los trozos supera al producto original'; this.modalInfo.tipo = "alert alert-warning";
            return;
          }
        }else{
          if (unidades > this.datosProducto.caracteristicas.unidades){
            this.modalInfo.show = true; this.modalInfo.message = 'Número de unidades inválidas'; this.modalInfo.tipo = "alert alert-warning";
            return;
          }
        }
        this.progress = true;
        let response = await composer.productos.dividirProducto(this.$axios, this.datosProducto.productoId, this.trozos);
        this.respuesta(response, 'Producto Dividido');
        this.progress = false;
      },
      anadirTrozo(){
        let peso = 0;
        let unidades = 0
        for (let i = 0; i<this.trozos.length; i++){
          peso = peso +  Number(this.trozos[i].peso);
          unidades = unidades +  Number(this.trozos[i].unidades);
        }
        if (this.datosProducto.caracteristicas.tipo === 'PESO'){
          if (peso >= this.datosProducto.caracteristicas.peso){
            return;
          }
        }else{
          if (unidades >= this.datosProducto.caracteristicas.unidades){
            return;
          }
        }
        this.trozos.push({
          "$class": "org.hyperledger.composer.productos.Trozo",
          "unidades": 0,
          "peso": 0,
          "identificador": ""
        })
      },
      eliminarTrozo(){
        this.trozos.pop(); 
      },
      anadirImagen(index){
        let trozos = this.trozos;
        this.trozos = [];
        trozos[index].imagen = {
          "$class": "org.hyperledger.composer.productos.Imagen",
          "hashImagen" : '',
          "url" : '',
          "algoritmo" : ''
        }
        this.trozos = trozos;
      },
      eliminarImagen(index){
        let trozos = this.trozos;
        this.trozos = [];
        delete trozos[index].imagen;
        this.trozos = trozos;
      }
    }
  }
</script>

<style scoped>

</style>
