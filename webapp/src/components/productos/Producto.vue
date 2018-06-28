<template>
  <div>
    <h1>Producto - {{ $route.params.id }}</h1>
    <h2></h2>
    <div v-if="error.show" class="alert alert-danger">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else>
      <p>{{datosProducto}}</p>
      <button class="btn btn-primary" @click="showMapMethod">Mostrar Mapa</button>
      <div v-if="showMap">
        <h2>Mapa de Google</h2>
        <google-map :markers='markers'></google-map>
      </div>
    </div>

  </div>

</template>

<script>
  import googleMap from './Mapa';
  import {composer} from '../../ComposerAPI'

  export default {
    components : {
      googleMap
    },
    data() {
      return{
        error :{
          show : false,
          message : ''
        },
        markers: [],
        showMap: false,
        datosProducto : {},
        id : this.$route.params.id
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
        let response = await composer.getProducto(this.$axios, this.$route.params.id);
        if (response.statusCode === 200){
          this.error.show = false
          this.datosProducto = response.data
        } else {
          this.error.show = true
          this.error.message = response.message
        }
      },
      showMapMethod () {
        if (this.showMap){
          this.showMap = false;
        } else {
          // TODO Solucionar coordenadas hardcodeadas
          /*var coordenadas = [];
          let coor = this.peixeData.operacionActual.coordenadas;
          coordenadas.push({'lat': coor.latitude, 'lng': coor.lonxitude, 'info' : 'Descripcion'});
          this.peixeData.operacions.forEach( operacion => {
            coordenadas.push({
              'lat': operacion.coordenadas.latitude,
              'lng': operacion.coordenadas.lonxitude,
              'info': 'Descripcion'});
          });*/
          
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
            this.error.show = false
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
              console.log(error)
              self.error.show = true
              self.error.message = error.message
              
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
