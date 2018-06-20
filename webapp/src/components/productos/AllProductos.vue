<template>
  <div class="row">
    <div v-if="error.e" class="alert alert-danger col-md-8">
      <strong>Error:</strong> {{ error.message }}.
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
  export default {
    data : function() {
      return {
        error : {
          e: false,
          message : ''
        },
        markers: [],
        showMap: false,
        productos : []
      }
    },
    created: function () {
      this.$axios.get('/api/org.hyperledger.composer.productos.Producto')
        .then(response => {
          let productos = [];
          response.data.forEach((producto) => productos.push(producto.productoId));
          this.productos=productos;
        }).catch(error => {
          this.error.e = true;
          this.error.message = error.bodyText;
        })
    }
  }
</script>

<style>

</style>
