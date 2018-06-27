<template>
  <div>
    <h1>{{$t('homePage')}}</h1>
    <hr>
    <h4> Cookies </h4>
    <h6>{{cookie}}</h6>
    <hr>
    <h4> localStorage </h4>
    <h6>{{storage}}</h6>
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
