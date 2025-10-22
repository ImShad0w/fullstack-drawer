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
const rooms = [];
//Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.emit("connection", "You have been connected!");
  //Create the base user
  users[socket.id] = {
    id: socket.id,
    username: null, // will be set later
    color: getRandomColor(),
    trail: [],
  };

  socket.on("addUsername", (username) => {
    if (users[socket.id]) {
      users[socket.id].username = username;

      // Update the same user inside all room socket lists
      rooms.forEach((room) => {
        const idx = room.sockets.findIndex((u) => u.id === socket.id);
        if (idx !== -1) {
          room.sockets[idx].username = username;
        }
      });

      socket.emit("userData", users[socket.id]);
      io.emit("updateUsers", users);
      io.emit("roomsData", rooms);
    }
  });

  socket.on("userMoving", (data) => {
    // Skip if user or rooms missing
    if (!users[socket.id] || !rooms) return;

    // Update user's global position
    users[socket.id].x = data.x;
    users[socket.id].y = data.y;

    // Update user inside each room they’re in
    rooms.forEach((room) => {
      const idx = room.sockets.findIndex((u) => u.id === socket.id);
      if (idx !== -1) {
        room.sockets[idx].x = data.x;
        room.sockets[idx].y = data.y;

        // 🔹 Only broadcast to that specific room
        io.to(room.name).emit("updateUsersPositions", {
          roomName: room.name,
          sockets: room.sockets,
        });
      }
    });
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
  socket.on("getRooms", () => {
    socket.emit("roomsData", rooms);
  });

  socket.on("createRoom", (roomName) => {
    // Check if room already exists
    let room = rooms.find((r) => r.name === roomName);

    if (!room) {
      room = { name: roomName, sockets: [] };
      rooms.push(room);
    } else {
      socket.join(roomName);
      socket.emit("joinedRoom", roomName);
    }
    // Notify everyone of room updates
    io.emit("roomsData", rooms);
  });

  socket.on("connectToRoom", (roomName) => {
    //Connect the user to the room
    socket.join(roomName);
    //find if the room exists
    let room = rooms.find((r) => r.name === roomName);
    if (!room) {
      console.log("Error, the room doesn't exist!");
    }
    //Get the user
    const user = users[socket.id];
    //Add the user to the room
    if (user && !room.sockets.find((u) => u.id === socket.id)) {
      room.sockets.push(user);
      console.log("User joining room:", users[socket.id]);
      io.emit("roomsData", rooms);
      socket.emit("joinedRoom", roomName);
    }
  });
  socket.on("getUsersInRoom", (roomName) => {
    let room = rooms.find((r) => r.name === roomName);
    if (!room) {
      console.log("No such room!");
    }
    //Emit the current users in the room
    socket.emit("usersInRoom", room.sockets);
  });
  //Disconnect logic
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    //Delete user from the room
    rooms.forEach((room) => {
      room.sockets = room.sockets.filter((u) => u.id !== socket.id);
    });
    //Delete user entirely
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
