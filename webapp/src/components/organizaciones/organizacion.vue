<template>
  <div>
    <div v-if="error.show" class="alert alert-danger">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else>
    <h1>Organizacion - {{ $route.params.id }}</h1>
      <p>{{organizacion}}</p>
    </div>
  </div>

</template>

<script>
  import {composer} from '../../ComposerAPI'

  export default {

    data() {
      return{
        organizacion : {},
        error : {
          show : false,
          message : ''
        }
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
          this.error.show = false;
          this.organizacion = response.data;
        } else {
          this.error.show = true;
          this.error.message = response.message;
        }
      }   
    }
  }
</script>

<style scoped>

</style>