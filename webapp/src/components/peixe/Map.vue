<template>
  <div>
    <div>
      <ul class="list-group" style="text-align:center" >
        <li class="list-group-item"
            @click="center=mark"
            v-for="(mark, index) in markers">{{mark}}
        </li>
      </ul>
    </div>
    <gmap-map
      :center="center"
      :zoom="7"
      class="google-map">
        <gmap-marker
          :key="index"
          v-for="(m, index) in markers"
          :position="m"
          :clickable="true"
          :draggable="true"
        ></gmap-marker>
    </gmap-map>
  </div>
</template>

<script>

  import * as VueGoogleMaps from 'vue2-google-maps';
  import Vue from 'vue';
  import { mapsKey } from './key';

  Vue.use(VueGoogleMaps, {
    load: {
      key : mapsKey,
      // libraries: 'places', //// If you need to use place input
    }
  });

  export default {
    props : ['markers'],
    data () {
      return {
        center : this.markers[0]
      }
    }
  }
</script>

<style scoped>
  .google-map {
    width: 1200px;
    height: 600px;
    margin: 0 auto;
  }
</style>