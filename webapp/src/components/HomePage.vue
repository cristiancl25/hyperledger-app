<template>
  <div>
    <h1>Página Principal</h1>
    <a href="http://localhost:3000/auth/google">Iniciar sesión</a>
    <input type="file" @change="onFileChanged">

  </div>
</template>

<script>
export default {
  data () {
    return {
      
    }
  },
  methods: {
    onFileChanged : async function (event) {
      console.log(event);
      const file = event.target.files[0];
      const formData = new FormData()
      formData.append('card', file, file.name)
      try{
        var response = await this.$axios.post('/api/wallet/import?name=' + file.name, formData, {
          headers : {
            "Content-Type" : "multipart/form-data",
            "Accept" : "application/json"
          }
        });
        console.log(response);
      }catch(error){
        console.log(error);
      }
    }
  }, 
  created : async function() {
    try{
      var response = await this.$http.get('http://localhost:3000/api/org.hyperledger.composer.productos.Producto', {
        withCredentials : true,
        headers:{
          "Access-Control-Allow-Origin" : "*", 
        }
      });
      console.log(response);
    }catch(error){
      console.log(error);
    }
  }
}
</script>

<style scoped>

</style>
