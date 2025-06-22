<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    if(!this.$store.state.isConnected){
      this.connectToStore();
    }
  },
  methods: {
      connectToStore() {
        this.$store.dispatch('connect')
      }
  },
  destroyed() {
    this.$store.dispatch('disconnect')
  }
}
</script>

