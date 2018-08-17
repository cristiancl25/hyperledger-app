<template>
  <div>
    <div v-if="error.show" v-bind:class="error.tipo" role="alert">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-else class="row justify-content-center">
      <div class="col-md-10">
        <h1 align="center">{{$t('recent-transactions')}}</h1>
        <div class="form-group col-md-12">
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center mt-2 mr-2 border"
              :key="hist.transactionId"
              v-for="hist in historian">
                <div>
                  <p>
                    <strong>Tx: </strong>{{hist.transactionType | transaction}}
                    <br>
                    <strong>TimeStamp: </strong>{{hist.transactionTimestamp}}
                    <br>
                    <strong>{{$t('participant')}}: </strong> {{hist.participantInvoking | participant}}
                  </p>
                </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {composer} from '../ComposerAPI'

export default {
  data () {
    return {
      "cookie":{},
      "storage":{},
      error : {
        show : false,
        message : '',
        tipo : ''
      },
      historian: []
    }
  }, 
  filters: {
    transaction: function (value) {
      if (!value) return '';
      var n = value.lastIndexOf(".");
      var val = value.substr(0, n) + " " + value.substr(n + 1);
      return val;
    },
    participant: function (value) {
      if (!value) return '';
      var n = value.lastIndexOf(".");
      var val = value.substr(n + 1);
      return val;
    }
  },
  created : async function() {
    this.cookie = document.cookie
    this.storage = window.localStorage
    this.error.show = false;
    let response = await composer.consulta.historian(this.$axios);
    if (response.statusCode === 200){
      this.historian = response.data.slice(0,10);
    }else{
      this.error.show = true; this.error.message = response.message; this.error.tipo = "alert alert-danger";
    }
  }
}
</script>

<style scoped>

</style>
