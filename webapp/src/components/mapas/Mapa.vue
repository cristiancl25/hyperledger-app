<template>
  <div>
    <div class="row" v-if="lista">
      <div class="col-md-6">
        <ul class="list-group" style="text-align:center" >
          <li class="list-group-item d-flex justify-content-between align-items-center"
              @click="center=mark; seleccionada=index"
              :key="mark.info"
              v-for="(mark,index) in markers">{{mark.info}}
              <span v-if="seleccionada===index" class="badge badge-success">Seleccionada</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <gmap-map :center="center" :zoom="7" class="google-map">
          <gmap-marker
            :key="mark.info"
            v-for="(mark) in markers"
            :position="mark"
            :clickable="true"
            :draggable="true"
          ></gmap-marker>
        </gmap-map>
      </div>
    </div>
  </div>
</template>

<script>

  import * as VueGoogleMaps from 'vue2-google-maps'
  import Vue from 'vue'
  import { mapsKey } from './key'

  Vue.use(VueGoogleMaps, {
    load: {
      key : mapsKey,
      // libraries: 'places', //// If you need to use place input
    }
  });

  export default {
    props : {
      markers : Array,
      lista : Boolean
    },
    data () {
      return {
        center : this.markers[0],
        seleccionada : 0
      }
    }
  }
</script>

<style scoped>
  .google-map {
    width: 100%;
    height: 600px;
    margin: 0 auto;
  }
</style>