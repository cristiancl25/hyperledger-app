<template>
  <div>
    <h1>Producto - {{ $route.params.id }}</h1>
    <h2></h2>
    <div v-if="error.show" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error</strong> {{ error.message }}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
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
    created() {
       
      this.$axios.get('/api/org.hyperledger.composer.productos.Producto/' + this.$route.params.id)
        .then(response => {
            this.datosProducto = response.data;
        }).catch(error => {
          this.error.show = true;
          this.error.message = error.bodyText;
      })
    },
    watch: {
      '$route'(to, from) {
        this.id = to.params.id;
        this.showMap = false;
      }
    },
    methods : {
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
          if ("geolocation" in navigator) {
            /* la geolocalización está disponible */
            let self = this;
            navigator.geolocation.getCurrentPosition(function(position) {
              const latitud = position.coords.latitude;
              const longitud = position.coords.longitude;
              self.markers.push({
                'lat': latitud,
                'lng': longitud,
                'info': "Localización Actual"
              });
              console.log(markers);
            });
          } else {
            /* la geolocalización NO está disponible */
          }
          this.showMap = true;
        }
      }
    }
  }
</script>

<style scoped>

</style>
