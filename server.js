const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let activeUsers = 0;
const MAX_USERS = 2;

// Serve static files (if you later add CSS/JS files)
app.use(express.static("public"));

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {

    // 🚫 Block if limit reached
    if (activeUsers >= MAX_USERS) {
        socket.emit("limitReached", "Server full. Only 2 users allowed at a time.");
        socket.disconnect(true);
        return;
    }

    activeUsers++;
    console.log("User connected. Active users:", activeUsers);

    // Send updates to others
    socket.on("update", (data) => {
        socket.broadcast.emit("update", data);
    });

    // When user leaves
    socket.on("disconnect", () => {
        activeUsers--;
        console.log("User disconnected. Active users:", activeUsers);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});