<template>
  <div id="app">
    <div v-if="error.e" class="alert alert-danger">
      <strong>Error:</strong> {{ error.message }}.
    </div>
    <div v-else="error.e">
      <ul>
        <router-link
          :to="'/peixe/' + peixe"
          tag="li"
          :key="peixe"
          v-for="(peixe, index) in peixes"
          active-class="active">
        <a>{{peixe}}</a>
        </router-link>
      </ul>
    </div>
  </div>

</template>

<script>
  export default {
    name: 'peixe',
    data : function() {
      return {
        error : {
          e: false,
          message : ''
        },
        markers: [],
        showMap: false,
        peixes : []
      }
    },
    created: function () {
      var coordenadas = [];
      this.$http.get('http://localhost:3000/api/org.peixeencadeado.peixe.Peixe/')
        .then(response => {
          let peixes = [];
          response.data.forEach((peixe) => peixes.push(peixe.peixeId));
          this.peixes=peixes;
        }).catch(error => {
          this.error.e = true;
          this.error.message = error.bodyText;
        })
    }
  }
</script>

<style>

</style>
