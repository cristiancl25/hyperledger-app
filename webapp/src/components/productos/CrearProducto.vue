<template>
    <div>
      <h1>Crear Producto</h1>
      <div class="row">
        <div class="col-md-7">
          <div class="progress" v-if= "progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
          </div>
          <div v-if="info.show" v-bind:class="info.tipo" role="alert">
            <strong></strong> {{ info.message }}
          </div>

          <form>
            <div class="form-group col-md-12"> 
              <label for="identificador">Identificador</label>
              <input v-model="caracteristicas.identificador" class="form-control" aria-describedby="emailHelp" placeholder="Identificador del producto">
            </div>

            <h3>Características</h3>
            <div class="form-group col-md-12"> 
              <a href="" data-toggle="modal"  data-target="#ModalTipoProducto">Configurar tipo de producto</a>
            </div>

            <div class="form-group col-md-4">
              <label for="identificador">Variedad</label>
              <input v-model="caracteristicas.variedadProducto" class="form-control" aria-describedby="emailHelp" placeholder="Variedad">
            </div>
              
            <div class="form-group col-md-12"> 
              <div class="form-row">
                <div class="form-group col-md-3">
                  <label for="inputState">Tipo</label>
                  <select v-model="caracteristicas.tipo" id="inputState" class="form-control">
                    <option selected>UNIDAD</option>
                    <option>PESO</option>
                  </select>
                </div>
                <div v-if="caracteristicas.tipo==='UNIDAD'" class="form-group col-md-3">
                  <label for="Unidades">Unidades</label>
                  <input v-model="caracteristicas.unidades" type="number" class="form-control" aria-describedby="emailHelp" placeholder="Unidades">
                </div>
                <div v-if="caracteristicas.tipo==='UNIDAD'" class="form-group col-md-3">
                  <label for="Peso Medio">Peso medio</label>
                  <input v-model="caracteristicas.peso" type=number step=0.01 class="form-control" aria-describedby="emailHelp" placeholder="Peso medio">
                </div>
                <div v-if="caracteristicas.tipo==='PESO'" class="form-group col-md-3">
                  <label for="Peso">Peso</label>
                  <input v-model="caracteristicas.peso" type=number step=0.01 class="form-control" aria-describedby="emailHelp" placeholder="Peso">
                </div>
                <div class="form-group col-md-3">
                  <label for="inputState">Magnitud</label>
                  <select v-model="caracteristicas.magnitud" id="inputState" class="form-control">
                    <option selected>Kilogramos</option>
                    <option>gramos</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group col-md-12"> 
              <label for="Descripción">Descripción:</label>
              <textarea v-model="caracteristicas.descripcion" class="form-control" id="message-text"></textarea>
            </div>

            <h3>Localización Inicial</h3>
            <div>
              <fieldset class="form-group col-md-12">
                <div class="row">
                  <legend class="col-form-label col-sm-3 pt-0">Localización</legend>
                  <div class="col-sm-9">
                    <div class="form-check" @click="geolocalizacion">
                      <input v-model="loc" class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="gps" checked>
                      <label class="form-check-label" for="gridRadios1">
                        GPS
                      </label>
                    </div>
                    <div class="form-check" @click="getLocalizaciones">
                      <input v-model="loc" class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="org">
                      <label class="form-check-label" for="gridRadios2">
                        Organización
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
              <div v-if="loc === 'gps'">
                gps
              </div>
              <div v-if="loc === 'org'">
                org
              </div>
            </div>
          
            <h3>Imagen</h3>
            
          </form>
          <div class="col-sm-12">
            <button @click="crearProducto" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>



      <!-- ModalTipoProducto-->
      <div class="modal fade" id="ModalTipoProducto" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Tipos de productos</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div v-if="infoModal.show" v-bind:class="infoModal.tipo">
               {{infoModal.message}}
              </div>
              <ul class="list-group" >
                <li class="list-group-item"
                  @click="caracteristicas.tipoProducto=tipo"
                  v-for="(tipo) in tiposProducto"
                  :key="tipo"
                  >{{tipo}}
                  <span v-if="tipo === caracteristicas.tipoProducto" class="badge badge-success">{{$t('active')}}</span>
                </li>
              </ul>
              <hr>
              <h6>Crear nuevo tipo de producto</h6>
              <div class="form-group">
                <input v-model="nuevoTipoProducto" class="form-control" aria-describedby="emailHelp" required="true" placeholder="Identificador del producto">
              </div>
              <button type="submit" @click="crearTipoProducto" class="btn btn-primary">Crear</button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="closeModal" data-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
</template>

<script>
import {composer} from '../../ComposerAPI'

export default {
  data(){
    return {
      caracteristicas :{
        identificador : '',
        tipoProducto : '',
        tipo : '',
        variedadProducto : '',
        descripcion : '',
        unidades : 0,
        peso:0,
        magnitud:'',
      },
      loc:'',
      localizacionId:'',
      coordenadas : {
        latitud: '',
        longitud:'',
        direccion:''
      },
      localizaciones : [],
      progress : false,
      info : {
        show : false,
        message : '',
        tipo : ''
      },
      infoModal :{
        show : false,
        message : 'Mensage de ERROR',
        tipo : ''
      },
      tiposProducto:[],
      nuevoTipoProducto : ''
    }
  },
  computed : {
    producto(){
      let producto = {
        "$class": "org.hyperledger.composer.productos.CrearProducto",
        "identificador": this.caracteristicas.identificador,
        "caracteristicas": {
          "$class": "org.hyperledger.composer.productos.Caracteristicas",
          "tipoProducto": "resource:org.hyperledger.composer.productos.TipoProducto#" + this.caracteristicas.tipoProducto,
          "tipo": this.caracteristicas.tipo,
          "variedadProducto": this.caracteristicas.variedadProducto,
          "descripcion" : this.caracteristicas.descripcion,
          "peso" : this.caracteristicas.peso,
          "magnitudPeso" : this.caracteristicas.magnitud,
        }
      };
      let loc = {
        "$class": "org.hyperledger.composer.productos.Loc",
        "latitud": this.coordenadas.latitud,
        "longitud": this.coordenadas.longitud,
        "direccion": this.coordenadas.direccion
      };

      if (this.loc === 'gps'){
        producto.loc = loc;
      } else {
        producto.localizacionId = 'loc1';
      }

      if (this.caracteristicas.tipo === 'UNIDAD'){
        producto.caracteristicas.unidades = this.caracteristicas.unidades;
      } 

      return producto;
    }
  },
  created : async function(){
    await this.actualizarTipoProducto();   
   
  },
  methods : {
    closeModal : async function(){
      this.infoModal.show=false;
    },
    crearTipoProducto : async function(){
      let response = await composer.crearTipoProducto(this.$axios, this.nuevoTipoProducto);
      if (response.statusCode === 200){
        this.infoModal.show = true;
        this.infoModal.message = 'Tipo de producto creado'
        this.infoModal.tipo = "alert alert-success"
        await this.actualizarTipoProducto();
      } else {
        this.infoModal.show = true
        this.infoModal.message = response.message
        this.infoModal.tipo = "alert alert-danger"
      }
      this.nuevoTipoProducto = '';

    },
    actualizarTipoProducto : async function() {
      let response = await composer.getTipoProducto(this.$axios);

      if (response.statusCode === 200){
          this.info.show = false;
          let tipos = [];
          response.data.forEach((tipo) => tipos.push(tipo.tipo))
          this.tiposProducto = tipos;
      } else {
          this.info.show = true
          this.info.message = response.message
          this.info.tipo = "alert alert-danger"
      }
    },
    crearProducto : async function() {
      this.progress = true;
      let response = await composer.crearProducto(this.$axios, this.producto);
      this.progress = false;
      if (response.statusCode === 200){
        this.info.show = true;
        this.info.message = 'Producto Creado'
        this.info.tipo = "alert alert-success"
      } else {
        this.info.show = true
        this.info.message = response.message
        this.info.tipo = "alert alert-danger"
      }
    },
    geolocalizacion : async function(){
      // TODO mejorar método
      if ("geolocation" in navigator) {
        let self = this;
        navigator.geolocation.getCurrentPosition(function(position) {
          const latitud = position.coords.latitude;
          const longitud = position.coords.longitude;
          self.coordenadas.latitud = latitud;
          self.coordenadas.longitud = longitud;
          self.coordenadas.direccion = 'Dirección';
        },function(error){
          console.log(error)
          // self.error.show = true
          // self.error.message = error.message
          
        });
      } else {
        console.log('Geolocalización no disponible en este dispositivo');
      }
    },
    getLocalizaciones : async function() {
      // TODO Mejorar
      let response = await composer.getOrganizacion(this.$axios, this.$store.state.organizacion);
      if (response.statusCode === 200){
          this.info.show = false;
          this.localizaciones = response.data.localizaciones;
          //response.data.forEach((tipo) => tipos.push(tipo.tipo));
      } else {
          this.info.show = true;
          this.info.message = response.message;
          this.info.tipo = "alert alert-danger";
      }
    }

  }
}
</script>

<style scoped>

</style>
