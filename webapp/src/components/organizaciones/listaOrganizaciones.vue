<template>
  <div>
    <div class="row justify-content-center">
      <div v-if="error.show" class="alert alert-danger col-md-8">
        <strong>Error:</strong> {{ error.message }}
      </div>
      <div>
        <h1 align="center"><strong>{{$t('organizations')}}</strong></h1>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="form-group col-xs-12 col-md-6">
        <label>{{$t('filter-type-organization')}}</label>
        <select class="form-control" v-model="filtroTipo">
          <option @click="filtroOrganizaciones('ALL')">Todos</option>
          <option
            @click="filtroOrganizaciones(tipo.tipo)"
            :key="tipo.tipo"
            v-for="(tipo) in tipoOrganizaciones">
            {{tipo.tipo}}
          </option>
        </select>
      </div>
    </div>
    <div class="row justify-content-center">
        <div class="mt-2 mr-2 border col-md-5 div-default"
          :key="organizacion.orgId"
          v-for="(organizacion) in paginacion.contenido">
          <h6><strong>ID :</strong>
            <router-link
              :to="'/organizaciones/' + organizacion.orgId"
              tag="a">
              {{organizacion.orgId}}
              </router-link>
          </h6>
          <h6><strong>{{$t('name')}}: </strong>{{organizacion.nombre}}</h6>
          <h6><strong>{{$t('type')}}: </strong>{{getTipoProducto(organizacion.tipoOrganizacion)}}</h6>
      </div>
    </div>
    <br>
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
import {composer} from '../../ComposerAPI'
import Paginate from 'vuejs-paginate'

export default {
  components : {
    Paginate
  },
  data : function() {
    return {
      error : {
        show: false,
        message : ''
      },
      showMap: false,
      organizaciones : [],
      orgs : [],
      filtroTipo : 'Todos',
      tipoOrganizaciones : [],
      paginacion : {
        show : true,
        paginas : 1,
        contenido : []
      }
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
    this.orgs = this.organizaciones;
    this.cambiarPagina(1);
    this.paginacion.paginas = Math.ceil(this.organizaciones.length/10);

    response = await composer.organizaciones.getTipoOrganizacion(this.$axios);
    this.tipoOrganizaciones = response.data;
  },
  methods : {
    // TODO getTipoProducto -> getTipoOrganizacion
    getTipoProducto(tipo){
      return tipo.replace('resource:org.hyperledger.composer.organizaciones.TipoOrganizacion#','');
    },
    filtroOrganizaciones(tipo){
      this.paginacion.show = false;
      if (tipo === 'ALL'){
        this.orgs = this.organizaciones;
      } else {
        this.orgs = this.organizaciones.filter(organizacion => this.getTipoProducto(organizacion.tipoOrganizacion) === tipo);
      }
      this.cambiarPagina(1);
      this.paginacion.paginas = Math.ceil(this.orgs.length/10);
      this.paginacion.show = true;
      
    },
    cambiarPagina(pagina){
      this.paginacion.contenido = this.orgs.slice((pagina-1)*10, (pagina-1)*10 + 10);
    }
  }
}
</script>

<style scoped>
  .div-default{
    background-color: #f7fdfd 
  }

</style>
