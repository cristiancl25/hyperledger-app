<template>
    <div>
      <div>
        <div class="col-md-12" v-if="info.show" v-bind:class="info.tipo" role="alert">
            <strong></strong> {{ info.message }}
        </div>
        <div class="row justify-content-center ">
          <ul class="list-group col-md-10">
            <li class="list-group-item d-flex justify-content-between align-items-center"
              :key="producto.productoId"
              @click
              v-for="(producto) in productos">
              {{producto}}
              <router-link
                class="badge badge-success"
                :to="'/productos/' + producto.productoId"
                tag="span">
                Más
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
</template>

<script>
import {composer} from '../../ComposerAPI'
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
    let response = await composer.getProducto(this.$axios, '');
    if (response.statusCode === 200){
      this.productos=response.data;
    } else {
      this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-warning";
    }
  }
}
</script>

<style scoped>

</style>
