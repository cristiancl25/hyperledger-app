<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 align="center">{{$t('homePage')}}</h1>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      "cookie":{},
      "storage":{}
    }
  }, 
  created : async function() {
    this.cookie = document.cookie
    this.storage = window.localStorage
  }
}
</script>

<style scoped>

</style>
