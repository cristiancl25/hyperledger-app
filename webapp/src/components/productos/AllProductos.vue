<template>
  <div class="row">
    <div v-if="error.show" class="alert alert-danger col-md-8">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else class="col-md-4">
      <ul class="list-group">
        <router-link
          class="list-group-item"
          :to="'/productos/' + producto"
          tag="li"
          :key="producto"
          v-for="(producto) in productos"
          active-class="active">
        <a>{{producto}}</a>
        </router-link>
      </ul>
    </div>
  </div>

</template>

<script>
import {composer} from '../../ComposerAPI'
export default {
  data : function() {
    return {
      error : {
        show: false,
        message : ''
      },
      markers: [],
      showMap: false,
      productos : []
    }
  },
  created: async function () {
    let response = await composer.productos.getProducto(this.$axios, '');
    if (response.statusCode === 200){
      let productos = []
      this.error.show = false
      response.data.forEach((producto) => productos.push(producto.productoId))
      this.productos=productos
    } else {
      this.error.show = true
      this.error.message = response.message
    }
  }
}
</script>

<style>

</style>
