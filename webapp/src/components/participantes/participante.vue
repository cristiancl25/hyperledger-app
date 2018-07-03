<template>
  <div>
    <h1>Participante - {{ $route.params.id }}</h1>
    <h2></h2>
    <div v-if="error.show" class="alert alert-danger">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else>
      <p>{{participante}}</p>
    </div>
  </div>

</template>

<script>
  import {composer} from '../../ComposerAPI'

  export default {

    data() {
      return{
        participante : {},
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
        let response = await composer.getParticipante(this.$axios, this.$route.params.rol, this.$route.params.id);
        if (response.statusCode === 200){
          this.error.show = false;
          this.participante = response.data;
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