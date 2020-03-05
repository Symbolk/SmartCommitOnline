<template>
  <div id="app">
    <Review msg="Welcome to SmartCommit" />
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
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
