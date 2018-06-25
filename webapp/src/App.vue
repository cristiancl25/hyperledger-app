<template>
  <div id="app">
    <div id="container">
      <custom-navbar></custom-navbar>
      <div id="body">
        <!-- TODO modificar eventos de los websockets -->
        <!-- <div v-if="event.show" class="alert alert-info alert-dismissible fade show" role="alert">
          <strong>Info:</strong>
          <router-link
            :to="'/productos/' + event.data"
            active-class="active">
            <a>Novo peixe capturado {{event.data}}</a>
          </router-link>
          <button @click="event.show = false" type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div> -->
        <router-view></router-view>
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
      // this.$options.sockets.onmessage = (data) => {
      //   let peixe = JSON.parse(data.data);
      //   this.event.data = peixe.peixeId;
      //   this.event.show = true;
      //   setTimeout(() => {
      //     this.event.show = false
      //   }, 10000);
      // }
    }
  }
</script>

<style scoped>

</style>
