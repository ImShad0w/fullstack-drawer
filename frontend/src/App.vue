<script setup>
import { ref, provide } from "vue";
import Canvas from "./components/Canvas.vue";
import Rooms from "./components/Rooms.vue";
import SocketManager from "../services/socketManager.js";

const manager = new SocketManager();
manager.connect();
//So i can use it in every other component
provide("socketManager", manager);

const inRoom = ref(false);
const room = ref([]);
</script>

<template>
  <Canvas v-if="inRoom" :room="room" />
  <Rooms
    v-else
    @isInRoom="(msg) => (inRoom = msg)"
    @roomName="(roomData) => (room = roomData)"
  />
</template>

<style>
body {
  color: white;
  font-family: sans-serif;
  background-color: #000919;
}
</style>
