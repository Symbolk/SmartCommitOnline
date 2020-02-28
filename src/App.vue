<template>
  <div id="app">
    <review msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import Review from './components/Review.vue'

export default {
  name: 'App',
  components: {
    Review
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
