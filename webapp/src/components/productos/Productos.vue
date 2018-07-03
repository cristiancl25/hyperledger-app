<template>
    <div>
      <div>
        <router-link to="/productos/crear" tag="a" active-class="active" exact><a>Crear Producto</a></router-link>
        <router-link to="/productos/all" tag="a" active-class="active" exact><a>Productos</a></router-link>
      </div>
      <div>
        <router-view></router-view>
      </div>
    </div>
</template>

<script>
export default {
}
</script>

<style scoped>

</style>
