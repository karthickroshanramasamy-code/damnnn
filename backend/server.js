const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

const PORT = process.env.PORT || 3000;

// In-memory room store (MVP only)
const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, videoUrl }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { videoUrl, time: 0, isPlaying: false };
    }

    // Send current state to new user
    socket.emit("init", rooms[roomId]);
  });

  socket.on("sync", ({ roomId, action, time }) => {
    if (!rooms[roomId]) return;

    rooms[roomId].time = time;
    rooms[roomId].isPlaying = action === "play";

    socket.to(roomId).emit("sync", { action, time });
  });
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
