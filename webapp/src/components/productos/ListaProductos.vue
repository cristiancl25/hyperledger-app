<template>
    <div>
      <div class="col-md-12">
        <div class="col-md-12" v-if="info.show" v-bind:class="info.tipo" role="alert">
            <strong></strong> {{ info.message }}
        </div>
        <div class="row justify-content-center">
          <div class="mt-2 mr-2 border col-md-5"
            :key="producto.productoId"
            v-for="(producto) in productos">
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
    </div>
</template>

<script>
import {composer} from '../../ComposerAPI'
import {util} from '../../util.js'

export default {
  data : function() {
    return {
      info : {
        show : false,
        message : '',
        tipo : ''
      },
      productos : []
    }
  },
  created: async function () {
    let response = await composer.productos.getProducto(this.$axios, '');
    if (response.statusCode === 200){
      this.productos=response.data;
    } else {
      this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-warning";
    }
  },
  methods : {
    colorEstado(estado){
      return util.colorEstadoProducto(estado);
    }
  },
}
</script>

<style scoped>

</style>
