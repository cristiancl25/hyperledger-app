<template>
  <div class="row">
    <div v-if="error.e" class="alert alert-danger col-md-8">
      <strong>Error:</strong> {{ error.message }}.
    </div>
    <div v-else class="col-md-4">
      <ul class="list-group">
        <router-link
          class="list-group-item"
          :to="'/peixe/' + peixe"
          tag="li"
          :key="peixe"
          v-for="(peixe) in peixes"
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
