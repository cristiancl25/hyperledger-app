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
      }
    },
    created: async function () {
      if ('Notification' in window){
        Notification.requestPermission(function(){});
      }
      this.$options.sockets.onmessage = (data) => {
        let evento = JSON.parse(data.data);
        evento.$class = this.getTipoEvento(evento.$class)
        if(evento.$class === 'ProductoEnVenta' || evento.orgDestino === this.$store.state.organizacion){
          this.$store.commit('anadirEvento', evento);
          if ('Notification' in window && Notification.permission === 'granted'){
            let notification = new Notification('Evento Hyperledger', {
              body: evento.$class,
              tag: evento.$class
            });
            notification.onclick = function() {
              parent.focus();
              window.focus();
              this.close();
            };
            //setTimeout(notification.close.bind(notification), 5000);
          }
        }
      }
    },
    methods : {
      getTipoEvento(evento){
        return evento.replace('org.hyperledger.composer.productos.','');
      },
    }
  }
</script>

<style scoped>

</style>
