<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-12 col-lg-10">
        <h1 align="center">Eventos</h1>
        <ul class="list-group col-md-12">
          <li class="list-group-item d-flex justify-content-between align-items-center"
            :key="evento.eventId"
            v-for="evento in listaEventos">
            {{evento}}
            <!--<router-link
              :to="'/organizaciones/' + puja.orgId"
              tag="a">
              {{puja.orgId}}
            </router-link>
            -->
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      listaEventos : []
    }
  },
  computed : {
    eventos : {
      get() {
        return this.$store.state.eventos
      },
      set(value) {
        this.$store.commit('setEventos', value);
      }
    }
  },
  created : async function(){
    this.listaEventos = this.eventos;
  }
}
</script>

<style scoped>

</style>
