const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let activeUsers = 0;
const MAX_USERS = 2;

// Serve static files from public folder
app.use(express.static("public"));

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {

    console.log("Incoming connection attempt...");

    // 🚫 If server full
    if (activeUsers >= MAX_USERS) {

        socket.emit("serverError", {
            code: 503,
            message: "The server is full(only 2 users allowed at a time).Contect Luv Gautam for more details."
        });

        console.log("Connection rejected. Server full.");

        // Allow time for error to be shown
        setTimeout(() => {
            socket.disconnect(true);
        }, 500);

        return;
    }

    // ✅ Accept user
    activeUsers++;
    console.log("User connected. Active users:", activeUsers);

    // Broadcast updates
    socket.on("update", (data) => {
        socket.broadcast.emit("update", data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        activeUsers--;
        console.log("User disconnected. Active users:", activeUsers);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});