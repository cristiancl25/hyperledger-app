<template>
  <div>
    <h1 align="center">{{$t('events')}}</h1>
    <div class="row justify-content-center">
      <div class="col-md-3">
        <label for="inputState">{{$t('filter')}}</label>
        <select v-model="filtros.tipoEvento" class="form-control">
          <option @click="filtrado()" value="ALL">{{$t('all')}}</option>
          <option @click="filtrado()" >ProductoEnVenta</option>
          <option @click="filtrado()" >NuevaPuja</option>
          <option @click="filtrado()" >GanadorPuja</option>
          <option @click="filtrado()" >ProductoComprado</option>
          <option @click="filtrado()" >EstadoTransaccion</option>
        </select>
      </div>
      <div class="form-group col-md-2">
        <input type="checkbox" v-model="notificaciones">
        <label>{{$t('a-d-notifications')}}</label>
      </div>
      <div>
        <button
          v-if="filtros.tipoEvento === 'ALL'"
          @click="eventos = []"
          class="btn btn-danger btn-sm">
          {{$t('delete-events')}}
        </button>
      </div>
    </div>
    
    <br>
    <div class="row justify-content-center">
      <div align="center" v-if="paginacion.contenido.length === 0" class="alert alert-warning col-md-6">
        <strong>{{$t('no-recent-events')}}</strong>
      </div>
      <div class="col-md-12 col-lg-10">
        <ul class="list-group col-md-12">
          <li :class="getTipoEventoColor(evento)"
            :key="evento.eventId"
            v-for="(evento) in paginacion.contenido">
            <div> 
              <button type="button" class="close"
                @click="$store.commit('eliminarEvento', evento.eventId)"
                >
                <span aria-hidden="true">&times;</span>
              </button>
              <h5><strong>{{evento.$class}}</strong></h5> 
            </div>
            <div>
              <h6>
                <strong>{{$t('product')}}: </strong>
                <router-link
                :to="'/productos/' + evento.productoId"
                tag="a">
                {{evento.productoId}}
                </router-link>
              </h6>
              <h6>
                <strong>{{$t('organization')}}: </strong>
                <router-link
                :to="'/organizaciones/' + evento.orgOrigen"
                tag="a">
                {{evento.orgOrigen}}
                </router-link>
              </h6>
              <h6 v-if="evento.$class === 'EstadoTransaccion'"><strong>{{$t('confirmation')}}: </strong>{{evento.confirmacion}}</h6>
              <h6 v-if="evento.$class === 'ProductoEnVenta'"><strong>{{$t('type-product')}}: </strong>{{evento.tipoProducto}}</h6>
              <h6 v-if="evento.$class === 'ProductoEnVenta'"><strong>{{$t('variety')}}: </strong>{{evento.variedad}}</h6>
              <h6 v-if="evento.$class === 'ProductoEnVenta'"><strong>Tipo Venta: </strong>{{evento.tipoVenta}}</h6>
                
              
              
            </div>

          </li>
        </ul>
      </div>
    </div>

    <div class="row justify-content-center">
      <div>
        <paginate v-if="paginacion.show"
          :page-count="paginacion.paginas"
          :click-handler="cambiarPagina"
          :prev-text="'Anterior'"
          :next-text="'Siguiente'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-link-class="'page-link'"
          :next-link-class="'page-link'"
          :container-class="'pagination justify-content-center'">
        </paginate>
      </div>
    </div>
  </div>
</template>

<script>
import Paginate from 'vuejs-paginate'

export default {
  components : {
    Paginate,
  },
  data(){
    return {
      listaEventos : [],
      paginacion : {
        show : false,
        paginas : 1,
        contenido : []
      },
      filtros : {
        tipoEvento : 'ALL'
      }
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
    },
    notificaciones : {
      get() {
        return this.$store.state.notificaciones
      },
      set(value) {
        this.$store.commit('setNotificaciones', value);
      }
    }
  },
  watch : {
    eventos : async function(){
      await this.filtrado()
    }
  },
  created : async function(){
    await this.inicializar()
  },
  methods : {
    inicializar : async function(){
      await this.filtrado();
    },
    cambiarPagina(pagina){
      this.paginacion.contenido = this.listaEventos.slice((pagina-1)*10, (pagina-1)*10 + 10);
    },
    filtrado : async function () {
      if (this.filtros.tipoEvento === 'ALL'){
        this.listaEventos = this.eventos;
      } else {
        this.listaEventos = this.eventos.filter(evento => evento.$class === this.filtros.tipoEvento);
      }
      
      this.cambiarPagina(1);
      this.paginacion.paginas = Math.ceil(this.listaEventos.length/10);
      this.paginacion.show = true;
    },
    getTipoEventoColor(evento){
      switch (evento.$class) {
        case 'EstadoTransaccion':
          if(evento.confirmacion){
            return 'list-group-item mb-2 border border-success'
          } else {
            return 'list-group-item mb-2 border border-danger'
          }
        case 'ProductoEnVenta':
          return 'list-group-item mb-2 border border-info'
        case 'NuevaPuja':
          return 'list-group-item mb-2 border border-primary'
        case 'GanadorPuja':
          return 'list-group-item mb-2 border border-warning'
        case 'ProductoComprado':
          return 'list-group-item mb-2 border border-secondary'
      }
      
    }
  }
}
</script>

<style scoped>

</style>
