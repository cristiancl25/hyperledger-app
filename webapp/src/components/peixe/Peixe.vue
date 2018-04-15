<template>
  <div>
    <h1>Peixe - {{ $route.params.id }}</h1>
    <h2></h2>
    <div v-if="error.e" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error</strong> {{ error.message }}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div v-else>
      <p>{{peixeData}}</p>
      <button class="btn btn-primary" @click="showMapMethod">Mostrar Mapa</button>
      <div v-if="showMap">
        <h2>Mapa de Google</h2>
        <google-map :markers='markers'></google-map>
      </div>
    </div>

  </div>

</template>

<script>
  import GMap from './Map';

  export default {
    name: "Peixe",
    components : {
      googleMap : GMap
    },
    data() {
      return{
        error :{
          e : false,
          message : ''
        },
        markers: [],
        showMap: false,
        peixeData : {},
        id : this.$route.params.id
      }
    },
    created() {
      this.$http.get('http://localhost:3000/api/org.peixeencadeado.peixe.Peixe/' + this.$route.params.id)
        .then(response => {
          console.log(response);
            this.peixeData = response.data;
        }).catch(error => {
          this.error.e = true;
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
          var coordenadas = [];
          let coor = this.peixeData.operacionActual.coordenadas;
          coordenadas.push({'lat': coor.latitude, 'lng': coor.lonxitude, 'info' : 'Descripcion'});
          this.peixeData.operacions.forEach( operacion => {
            coordenadas.push({
              'lat': operacion.coordenadas.latitude,
              'lng': operacion.coordenadas.lonxitude,
              'info': 'Descripcion'});
          });
          this.markers = coordenadas;
          this.showMap = true;
          //TODO Engadir descripcion en operacion
        }

      }
    }
  }
</script>

<style scoped>

</style>
