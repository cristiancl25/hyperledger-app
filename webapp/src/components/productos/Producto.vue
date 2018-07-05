<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-10" v-if="info.show" v-bind:class="info.tipo" role="alert">
        <strong></strong> {{ info.message }}
      </div>
    </div>


    <div class="row justify-content-center">
      <div class="col-md-10">
        <div>
          <h1>Producto - {{ $route.params.id }}</h1>
          <p>{{datosProducto}}</p>
        </div>
      </div>
    </div>


    <div class="row justify-content-center">
      <div class="col-md-10">
        <div>
          <button class="btn btn-primary" @click="showMapMethod">Mostrar Mapa</button>
          <div v-if="showMap">
            <h2>Mapa de Google</h2>
            <google-map v-bind:markers='markers' v-bind:lista='true'></google-map>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import googleMap from '../mapas/Mapa';
  import {composer} from '../../ComposerAPI'

  export default {
    components : {
      googleMap
    },
    data() {
      return{
        info : {
          show : false,
          message : '',
          tipo : ''
        },
        markers: [],
        showMap: false,
        datosProducto : {}
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
            'lat': 43,
            'lng': -8,
            'info': "Localización1"
          },{
            'lat': 43,
            'lng': -10,
            'info': "Localización2"
          }];
          /* Geolocalización */
          if ("geolocation" in navigator) {
            this.info.show = false
            let self = this;
            navigator.geolocation.getCurrentPosition(function(position) {
              const latitud = position.coords.latitude;
              const longitud = position.coords.longitude;
              self.markers.push({
                'lat': latitud,
                'lng': longitud,
                'info': "Localización Actual"
              });
            },function(error){
              self.info.show = true
              self.info.message = error.message
              
            });
          }
          this.showMap = true;
        }
      }
    }
  }
</script>

<style scoped>

</style>
