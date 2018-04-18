<template>
  <div id="app">
    <div id="container">
      <div id="header" align="center">
        <img src="./assets/hyperledger-logo.png" width="500" height="100" hspace="20">
        <img src="./assets/hyperledger-fabric-logo.png" width="280" height="60" hspace="20">
        <img src="./assets/hyperledger-composer-logo.png" width="100" height="100" hspace="20">
      </div>
      <div id="body">
        <div v-if="event.show" class="alert alert-info alert-dismissible fade show" role="alert">
          <strong>Info:</strong>
          <router-link
            :to="'/peixe/' + event.data"
            active-class="active">
            <a>Novo peixe capturado {{event.data}}</a>
          </router-link>
          <button @click="event.show = false" type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div>
          <ul class="nav nav-pills">
            <router-link to="/" tag="li" active-class="active" exact><a>Páxina Principal</a></router-link>
            <router-link to="/peixe" tag="li" active-class="active"><a>Peixes</a></router-link>
          </ul>
        </div>
        <hr>
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
  import HomePage from './components/HomePage'

  export default {
    name: 'app',
    data : function() {
      return {
        event : {
          show : false,
          data : ''
        }
      }
    },
    created: function () {
      this.$options.sockets.onmessage = (data) => {
        let peixe = JSON.parse(data.data);
        this.event.data = peixe.peixeId;
        this.event.show = true;
        setTimeout(()=>{
          this.event.show = false;
        }, 10000);
      }
    },
    components : {
      homePage : HomePage
    }
  }
</script>

<style scoped>

</style>
