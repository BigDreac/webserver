const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let activeUsers = 0;
const MAX_USERS = 2;

const ADMIN_PASSWORD = "ChangeThisStrongPassword"; // CHANGE THIS

let connectedUsers = {};

app.use(express.static("public"));
app.use(express.json());

// Serve main site
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Serve admin page
app.get("/admin", (req, res) => {
    res.sendFile(__dirname + "/public/admin.html");
});

io.on("connection", (socket) => {

    const ip =
        socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
        socket.handshake.address;

    socket.isAdmin = false;

    // Limit normal users only
    if (activeUsers >= MAX_USERS) {
        socket.emit("serverError", {
            code: 503,
            message: "SERVER FULL - Only 2 users allowed."
        });
        setTimeout(() => socket.disconnect(true), 500);
        return;
    }

    activeUsers++;

    connectedUsers[socket.id] = {
        ip: ip,
        socket: socket
    };

    console.log("User connected:", ip);

    socket.on("update", (data) => {
        socket.broadcast.emit("update", data);
    });

    // 🔐 Admin login
    socket.on("admin_login", (password) => {
        if (password === ADMIN_PASSWORD) {
            socket.isAdmin = true;
            socket.emit("admin_success");
            console.log("Admin logged in.");
        } else {
            socket.emit("admin_fail");
        }
    });

    // 🔐 Get users (admin only)
    socket.on("admin_get_users", () => {
        if (!socket.isAdmin) return;

        const userList = Object.keys(connectedUsers).map(id => ({
            socketId: id,
            ip: connectedUsers[id].ip
        }));

        socket.emit("admin_user_list", userList);
    });

    // 🔐 Kick user (admin only)
    socket.on("admin_kick_user", (socketId) => {
        if (!socket.isAdmin) return;

        if (connectedUsers[socketId]) {
            connectedUsers[socketId].socket.emit("serverError", {
                code: 403,
                message: "You were removed by admin."
            });

            setTimeout(() => {
                connectedUsers[socketId].socket.disconnect(true);
            }, 500);
        }
    });

    socket.on("disconnect", () => {
        activeUsers--;
        delete connectedUsers[socket.id];
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});