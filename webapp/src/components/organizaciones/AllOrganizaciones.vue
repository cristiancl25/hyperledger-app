<template>
  <div class="row">
    <div v-if="error.show" class="alert alert-danger col-md-8">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else class="col-md-4">
      <ul class="list-group">
        <router-link
          class="list-group-item"
          :to="'/organizaciones/' + organizacion.orgId"
          tag="li"
          :key="organizacion.orgId"
          v-for="(organizacion) in organizaciones"
          active-class="active">
        <a>{{organizacion.orgId}}</a>
        </router-link>
      </ul>
    </div>
  </div>

</template>

<script>
import {composer} from '../../ComposerAPI'
export default {
  data : function() {
    return {
      error : {
        show: false,
        message : ''
      },
      markers: [],
      showMap: false,
      organizaciones : []
    }
  },
  created: async function () {
    let response = await composer.organizaciones.getOrganizacion(this.$axios);
    if (response.statusCode === 200){
      this.error.show = false
      this.organizaciones = response.data;
    } else {
      this.error.show = true
      this.error.message = response.message
    }
  }
}
</script>

<style>

</style>
