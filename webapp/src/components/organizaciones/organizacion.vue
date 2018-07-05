<template>
  <div class="row justify-content-center">
    <div v-if="info.show" v-bind:class="info.tipo" role="alert">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else>
    <h1>Organizacion - {{ $route.params.id }}</h1>
      <!--<p>{{organizacion}}</p>-->
    </div>
  </div>

</template>

<script>
  import {composer} from '../../ComposerAPI'

  export default {

    data() {
      return{
        organizacion : {},
        info : {
          show : false,
          message : '',
          tipo : ''
        },
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
        let response = await composer.organizaciones.getOrganizacion(this.$axios, this.$route.params.id);
        if (response.statusCode === 200){
          this.info.show = false;
          this.organizacion = response.data;
        } else {
          this.info.show = true; this.info.message = response.message; this.info.tipo = "alert alert-warning";
        }
      }   
    }
  }
</script>

<style scoped>

</style>