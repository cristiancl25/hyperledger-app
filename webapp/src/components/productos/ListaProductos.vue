<template>
  <div>
    <div class="col-md-12">
      <div class="col-md-12" v-if="info.show" v-bind:class="info.tipo" role="alert">
          <strong></strong> {{ info.message }}
      </div>
      <div class="row justify-content-center">
        <div class="mt-2 mr-2 border col-md-5 div-default"
          :key="producto.productoId"
          v-for="(producto) in paginacion.contenido">
          <h5><strong>ID: </strong>
            <router-link
              :to="'/productos/' + producto.productoId"
              tag="a">
              {{producto.productoId}}
            </router-link>
          </h5>
          <h5 align="center"><span :class="colorEstado(producto.estado)">{{producto.estado}}</span></h5>
          <h5><strong>Organización ID: </strong>
            <router-link
              :to="'/organizaciones/' + producto.operacionActual.orgId"
              tag="a">
              {{producto.operacionActual.orgId}}
            </router-link>
          </h5>
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
  </div>
</template>

<script>
import {composer} from '../../ComposerAPI'
import {util} from '../../util.js'
import Paginate from 'vuejs-paginate'

export default {
  components : {
    Paginate
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
        show : true,
        paginas : 1,
        contenido : []
      }
    }
  },
  created: async function () {
    let response = await composer.productos.getProducto(this.$axios, '');
    if (response.statusCode === 200){
      this.productos=response.data;
      this.cambiarPagina(1);
      this.paginacion.paginas = Math.ceil(this.productos.length/10);
    } else {
      this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-warning";
    }
  },
  methods : {
    colorEstado(estado){
      return util.colorEstadoProducto(estado);
    },
    cambiarPagina(pagina){
      this.paginacion.contenido = this.productos.slice((pagina-1)*10, (pagina-1)*10 + 10);
    }
  },
}
</script>

<style scoped>
  .div-default{
    background-color: #f7fdfd 
  }

</style>
