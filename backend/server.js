const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

//Serve Vue frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

const users = {};
//Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.emit("connection", "You have been connected!");

  socket.on("addUsername", (data) => {
    users[socket.id] = {
      username: data,
      color: getRandomColor(),
      trail: [],
    };
    socket.broadcast.emit("updateUsers", users);
    socket.emit("userData", users[socket.id]);
  });

  socket.on("userMoving", (data) => {
    if (!users[socket.id]) return;
    users[socket.id].x = data.x;
    users[socket.id].y = data.y;
    io.emit("updateUsersPositions", users);
  });
  socket.on("circleDrawn", (data) => {
    if (!users[socket.id]) return;
    users[socket.id].trail.push({
      x: data.x,
      y: data.y,
    });
    io.emit("circleAdded", {
      userId: socket.id,
      circle: { x: data.x, y: data.y, color: users[socket.id].color },
    });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("updateUsers", users);
  });
});

function getRandomColor() {
  const r = Math.floor(Math.random() * 256); // Random value for red
  const g = Math.floor(Math.random() * 256); // Random value for green
  const b = Math.floor(Math.random() * 256); // Random value for blue
  return `rgb(${r}, ${g}, ${b})`; // Return the RGB color as a string
}
server.listen(3000, () => console.log("Server running on port:3000"));
