<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import CreateRedPacket from "@/views/redPacket/CreateRedPacket.vue";
import ReceiveRedPacket from "@/views/redPacket/ReceiveRedPacket.vue";

export default {
  name: "App",
  components: {
    CreateRedPacket,
    ReceiveRedPacket,
  },
};
</script>

<style>
body {
  background-color: black !important;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>
