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
