<template>
  <canvas
    ref="backgroundRef"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    class="background"
  ></canvas>

  <canvas ref="foregroundRef" class="foreground"></canvas>
</template>
<script setup>
import { onMounted, ref, inject } from "vue";

const manager = inject("socketManager");
//For storing the users
const users = ref({});
const user = ref({});
//Socket callback block

function handleUserData(data) {
  user.value = data;
}

function handleUserMovement(data) {
  users.value = data.sockets;
  drawUsersPointers();
}

function handleUserDrawings(data) {
  const { userId, circle } = data;
  if (!users.value[userId]) return;
  users.value[userId].trail.push(circle);
}

function getUsersInRoom(data) {
  manager.emit("getUsersInRoom", data);
}

function checkForUsersInRoom(data) {
  users.value = data;
}

//Callsback and stores updated users on event
manager.on("userData", handleUserData);
manager.on("updateUsersPositions", handleUserMovement);
manager.on("circleAdded", handleUserDrawings);
manager.on("joinedRoom", getUsersInRoom);
manager.on("usersInRoom", checkForUsersInRoom);

//Ask for username
let username = prompt("Afegeix un nom d'usuari:");
manager.emit("addUsername", username);
//Drawing logic
const foregroundRef = ref(null);
const backgroundRef = ref(null);

let fgCtx = null;
let bgCtx = null;

// Drawing state
let isDrawing = false;

onMounted(() => {
  fgCtx = foregroundRef.value.getContext("2d");
  bgCtx = backgroundRef.value.getContext("2d");

  // Full screen size
  foregroundRef.value.width = window.innerWidth;
  foregroundRef.value.height = window.innerHeight;

  backgroundRef.value.width = window.innerWidth;
  backgroundRef.value.height = window.innerHeight;
  requestAnimationFrame(renderUsersDrawings);
});

function handleMouseDown(event) {
  isDrawing = true;
  drawCircle(event);
}

// Mouse move → draw while dragging
function handleMouseMove(event) {
  drawPointer(event);
  drawUsersPointers();
  if (isDrawing) drawCircle(event);
}

// Mouse up → stop drawing
function handleMouseUp() {
  isDrawing = false;
}

function drawCircle(event) {
  if (!bgCtx) return;

  const rect = backgroundRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const color = user.value?.color || "red";

  bgCtx.beginPath();
  bgCtx.arc(x, y, 10, 0, Math.PI * 2);
  bgCtx.fillStyle = color;
  bgCtx.fill();
  manager.emit("circleDrawn", { x: x, y: y });
}

function drawPointer(event) {
  if (!fgCtx) return;

  // Clear previous pointer
  fgCtx.clearRect(0, 0, foregroundRef.value.width, foregroundRef.value.height);

  const rect = foregroundRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const color = user.value?.color || "red";

  // Draw pointer at current mouse position
  fgCtx.beginPath();
  fgCtx.arc(x, y, 20, 0, Math.PI * 2);
  fgCtx.fillStyle = color;
  fgCtx.fill();

  // Draw the username box
  fgCtx.fillStyle = color; // same color as circle
  fgCtx.font = "20px Sans-serif";
  const textWidth = fgCtx.measureText(user.value.username).width; //How large is the text;
  const padding = 4;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = 25;

  // Draw rectangle above the circle
  fgCtx.fillRect(
    x - boxWidth / 2,
    y - 30 - boxHeight, // above the circle
    boxWidth,
    boxHeight,
  );

  // Draw username text inside rectangle
  fgCtx.fillStyle = "white"; // contrast with box
  fgCtx.textAlign = "center";
  fgCtx.textBaseline = "middle";
  fgCtx.fillText(user.value.username, x, y - 30 - boxHeight / 2);
  manager.emit("userMoving", {
    x: x,
    y: y,
  });
}

function drawUsersPointers() {
  if (!fgCtx || !foregroundRef.value) return;

  // Clear previous frame
  fgCtx.clearRect(0, 0, foregroundRef.value.width, foregroundRef.value.height);

  Object.values(users.value).forEach((u) => {
    if (!u.x || !u.y) return; // skip if no position

    const x = u.x;
    const y = u.y;
    const color = u.color || "red";
    const usernameText = u.username || "Anon";

    // Draw circle
    fgCtx.beginPath();
    fgCtx.arc(x, y, 20, 0, Math.PI * 2);
    fgCtx.fillStyle = color;
    fgCtx.fill();

    // Draw username box
    fgCtx.fillStyle = color;
    fgCtx.font = "14px Arial";
    const textWidth = fgCtx.measureText(usernameText).width;
    const padding = 4;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 20;

    fgCtx.fillRect(x - boxWidth / 2, y - 20 - boxHeight, boxWidth, boxHeight);

    // Draw username text
    fgCtx.fillStyle = "white";
    fgCtx.textAlign = "center";
    fgCtx.textBaseline = "middle";
    fgCtx.fillText(usernameText, x, y - 20 - boxHeight / 2);
  });
}

function renderUsersDrawings() {
  if (!bgCtx || !backgroundRef.value) return;
  bgCtx.clearRect(0, 0, backgroundRef.value.width, backgroundRef.value.height);
  Object.values(users.value).forEach((u) => {
    if (!u.trail) return;
    u.trail.forEach((circle) => {
      bgCtx.beginPath();
      bgCtx.arc(circle.x, circle.y, 20, 0, Math.PI * 2);
      bgCtx.fillStyle = u.color;
      bgCtx.fill();
    });
  });
  requestAnimationFrame(renderUsersDrawings);
}
</script>
<style scoped>
.foreground {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
</style>
