<template>
  <div v-if="rooms.length > 0" class="container">
    <h1>Available rooms</h1>
    <div v-for="room in rooms" class="room">
      <h1>{{ room.name }}</h1>
      <p>Users connected: {{ room.sockets.length }}</p>
      <button @click="joinRoom(room)">Join room!</button>
    </div>
    <div class="searcher">
      <div class="form">
        <h2>Create new rooms!</h2>
        <input v-model="roomName" />
        <button @click="createRoom">Create!</button>
      </div>
    </div>
  </div>
  <div v-else class="containerForm">
    <div class="form">
      <h1>Create a room!</h1>
      <input v-model="roomName" />
      <button @click="createRoom">Create!</button>
    </div>
  </div>
</template>
<script setup>
import { ref, inject } from "vue";
//Get the socketManager
const manager = inject("socketManager");
const rooms = ref([]);
const roomName = ref("");

const emit = defineEmits(["isInRoom", "roomName"]);

function handleRooms(data) {
  rooms.value = data;
}

function createRoom() {
  manager.emit("createRoom", roomName.value);
  roomName.value = "";
}

function joinRoom(room) {
  manager.emit("connectToRoom", room.name);
  emit("isInRoom", true);
  emit("roomName", room);
}
//Get the rooms
manager.emit("getRooms");
//When we get the rooms data handle it
manager.on("roomsData", (data) => {
  handleRooms(data);
});
</script>
<style scoped>
.container {
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  grid-template-columns: 1fr 1fr 1fr;
  place-items: center;
  row-gap: 10px;
}

.container > h1 {
  grid-column: span 3;
}
.room {
  color: black;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  width: 300px;
  border-radius: 10px;
}

.room > button {
  font-size: 2em;
  padding: 20px 40px;
}

.form {
  color: black;
  display: flex;
  flex-direction: column;
  background-color: white;
  align-items: center;
  width: 300px;
  padding: 20px;
  border-radius: 10px;
}
.form > button {
  margin-top: 10px;
  padding: 20px 40px;
}

.containerForm {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 25vh;
}

.searcher {
  grid-column: 1 / 4; /* spans all 3 columns */
  justify-self: center; /* makes it span full width */
}
</style>
