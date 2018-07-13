<template>
  <div id="app">
    <div id="container">
      <div class="row justify-content-center">
        <div class="col-md-12 col-lg-10">
          <custom-navbar></custom-navbar>
        </div>
      </div>
      <div class="row justify-content-center" id="body">
        <div class="col-md-12 col-lg-10">
          <router-view></router-view>
        </div>
      </div>
      <!--<div id="footer">
        <hr>
        <footer>

        </footer>
      </div>
      -->
    </div>
  </div>

</template>

<script>
  import customNavbar from './components/navbar'

  export default {
    name: 'app',
    components : {
      customNavbar
    },
    data() {
      return {
        event : {
          show : false,
          data : ''
        }
      }
    },
    created: async function () {
      this.$options.sockets.onmessage = (data) => {
        let evento = JSON.parse(data.data);
        this.$store.commit('anadirEvento', evento);
      }
    }
  }
</script>

<style scoped>

</style>
