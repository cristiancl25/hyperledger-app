<template>
  <div>
    <div class="col-md-12">
      <div class="col-md-12" v-if="info.show" v-bind:class="info.tipo" role="alert">
          <strong></strong> {{ info.message }}
      </div>
      <h3 align="center">{{$t('filters')}}</h3>
      <div class="row justify-content-center">
        <div v-if="filtros.id===''" class="form-group col-md-2">
          <input type="checkbox" v-model="filtros.miOrg">
          <label>{{$t('my-products')}}</label>
        </div>
        <div v-if="filtros.id===''" class="col-md-2">
          <label for="inputState">{{$t('type-product')}}</label>
          <select v-model="filtros.tipoProducto" class="form-control">
            <option value=""></option>
            <option 
              :key="tipo.tipo"
              v-for="(tipo) in tipoProductos">
              {{tipo.tipo}}
            </option>
          </select>
        </div>
        <div v-if="filtros.id===''" class="col-md-2">
          <label for="inputState">{{$t('type')}}</label>
          <select v-model="filtros.tipo" class="form-control">
            <option value=""></option>
            <option>UNIDAD</option>
            <option>PESO</option>
          </select>
        </div>
        <div v-if="filtros.id===''" class="col-md-2">
          <label for="inputState">{{$t('state')}}</label>
          <select v-model="filtros.estado" class="form-control">
            <option value=""></option>
            <option>PARADO</option>
            <option>VENTA</option>
            <option>TRANSACCION</option>
            <option>PUJA</option>
            <option>CONSUMIDO</option>
            <option>PERDIDO</option>
            <option>DIVIDIDO</option>
          </select>
        </div>
        <div v-if="filtros.id===''" class="form-group col-md-3"> 
          <label for="identificador">{{$t('variety')}}</label>
          <input v-model="filtros.variedad" class="form-control" placeholder="">
        </div>
        <div v-if="!filtros.miOrg && filtros.id===''" class="col-md-2">
          <label for="inputState">{{$t('organizations')}}</label>
          <select v-model="filtros.orgId" class="form-control">
            <option value=""></option>
            <option
              :value="org.orgId"
              :key="org.orgId"
              v-for="(org) in organizaciones">
              {{org.nombre}}
            </option>
          </select>
        </div>
        <div class="form-group col-md-4"> 
          <label for="identificador">{{$t('identifier')}}</label>
          <input v-model="filtros.id" class="form-control" placeholder="">
          <small id="emailHelp" class="form-text text-muted">
            <a href="" data-toggle="modal"  @click="scannerQR=true" data-target="#ModalScannerQRFilter">{{$t('qr-code-scanner')}}</a>
          </small>
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-md-2">
          <div class="btn-group">
            <button 
              type="button"
              @click="filtros.id=''; filtros.miOrg=false; filtros.orgId=''; filtros.tipoProducto=''; filtros.variedad=''; filtros.tipo=''"
              class="btn btn-secondary">
              {{$t('restart')}}
            </button>
            <button type="button" class="btn btn-primary" @click="filtrado()">{{$t('filter')}}</button>
          </div> 
        </div>
      </div>

      <br>
      <h3 align="center" v-if="paginacion.show" >{{$t('products')}}</h3>
      <div class="row justify-content-center">
        <div align="center" v-if="paginacion.contenido.length === 0" class="alert alert-warning col-md-6">
          <strong>{{$t('no-products')}}</strong>
        </div>
        <div class="mt-2 mr-2 border col-md-5 div-default"
          :key="producto.productoId"
          v-for="(producto) in paginacion.contenido">
          <h6><strong>ID: </strong>
            <router-link
              :to="'/productos/' + producto.productoId"
              tag="a">
              {{producto.productoId}}
            </router-link>
          </h6>
          <h6 align="center"><span :class="colorEstado(producto.estado)">{{producto.estado}}</span></h6>
          <h6><strong>{{$t('organization-id')}}: </strong>
            <router-link
              :to="'/organizaciones/' + producto.operacionActual.orgId"
              tag="a">
              {{producto.operacionActual.orgId}}
            </router-link>
          </h6>
          <h6><strong>{{$t('type-product')}}: </strong>{{getTipoProducto(producto.caracteristicas.tipoProducto)}}</h6>
          <h6><strong>{{$t('variety')}}: </strong>{{producto.caracteristicas.variedadProducto}}</h6>
          <h6><strong>{{$t('type')}}: </strong>{{producto.caracteristicas.tipo}}</h6>
        </div>
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

    <!-- ModalScannerQRFilter-->
    <div class="modal fade" id="ModalScannerQRFilter" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
            <input v-model="filtros.id" class="form-control" aria-describedby="emailHelp" placeholder="CódigoQR" disabled="true">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-info" @click="scannerQR=true">{{$t('retry')}}</button>
            <button type="button" class="btn btn-primary" @click="scannerQR=false" data-dismiss="modal">{{$t('close')}}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import VueQrReader from 'vue-qr-reader/dist/lib/vue-qr-reader.umd.js';
import {composer} from '../../ComposerAPI'
import {util} from '../../util.js'
import Paginate from 'vuejs-paginate'

export default {
  components : {
    Paginate,
    VueQrReader
  },
  data : function() {
    return {
      info : {
        show : false,
        message : '',
        tipo : ''
      },
      productos : [],
      paginacion : {
        show : false,
        paginas : 1,
        contenido : []
      }, 
      filtros : {
        id : '',
        miOrg : 'false',
        orgId : '',
        tipoProducto : '', 
        variedad : '', 
        tipo : '',
        estado : ''
      },
      tipoProductos : [],
      organizaciones : [],
      scannerQR : false
    }
  },
  created: async function () {
    let response = await composer.productos.getTipoProducto(this.$axios);
    this.tipoProductos = response.data;
    response = await composer.organizaciones.getOrganizacion(this.$axios);
    this.organizaciones = response.data;
    this.filtros.miOrg=true;
    this.filtrado();

  },
  methods : {
    colorEstado(estado){
      return util.colorEstadoProducto(estado);
    },
    cambiarPagina(pagina){
      this.paginacion.contenido = this.productos.slice((pagina-1)*10, (pagina-1)*10 + 10);
    },
    getTipoProducto(tipo){
      return tipo.replace('resource:org.hyperledger.composer.productos.TipoProducto#','');
    },
    filtrado : async function(){
      this.info.show = false;
      this.paginacion.show = false;
      let filtro = '?filter=';
      if (this.filtros.id !== ''){
        filtro = filtro + '{"where": {"identificador": "' + this.filtros.id +'"}}'
      }else{
        let filter = []
        if (this.filtros.miOrg) {
          filter.push({"operacionActual.orgId": this.$store.state.organizacion});
        } else if (this.filtros.orgId !== ''){
          filter.push({"operacionActual.orgId": this.filtros.orgId});
        }
        if(this.filtros.estado !== ''){
          filter.push({"estado": this.filtros.estado});
        }
        if(this.filtros.tipoProducto !== ''){
          filter.push({"caracteristicas.tipoProducto": "resource%3Aorg.hyperledger.composer.productos.TipoProducto%23" + this.filtros.tipoProducto});
        }
        if(this.filtros.variedad !== ''){
          filter.push({"caracteristicas.variedadProducto": this.filtros.variedad});
        }
        if(this.filtros.tipo !== ''){
          filter.push({"caracteristicas.tipo": this.filtros.tipo});
        }
        
        if (filter.length === 0){
          this.info.show = true; this.info.message = 'Ningún filtro activado'; this.info.tipo = "alert alert-warning";
          return;
        } else if (filter.length ===1){
          filtro = filtro + JSON.stringify({"where" : filter[0]});
        } else {
          filtro = filtro + JSON.stringify({"where" : {"and" : filter}});
        }
      }
      // console.log(filtro);
      let response = await composer.productos.getProductos(this.$axios, filtro);
      if (response.statusCode === 200){
        this.productos=response.data;
        this.cambiarPagina(1);
        this.paginacion.paginas = Math.ceil(this.productos.length/10);
        this.paginacion.show = true;
      } else {
        this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-warning";
      }
    },
    procesarCodigoQR (code) {
      this.filtros.id = code;
      this.scannerQR = false;
    }
  }
}
</script>

<style scoped>
  .div-default{
    background-color: #f7fdfd 
  }

</style>
