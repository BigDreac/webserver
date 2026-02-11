<!DOCTYPE html>
<html>
<head>
    <title>Shared Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            display: flex;
            justify-content: center;
            margin-top: 40px;
        }

        .container {
            width: 450px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 20px;
        }

        #messages {
            height: 300px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
        }

        .message {
            background: #e9ecef;
            padding: 6px 10px;
            border-radius: 4px;
            margin: 5px 0;
        }

        .input-area {
            display: flex;
        }

        input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ccc;
            outline: none;
        }

        button {
            padding: 8px 15px;
            border: none;
            background: #2c3e50;
            color: white;
            cursor: pointer;
        }

        button:hover {
            background: #1a252f;
        }
    </style>
</head>
<body>

<div class="container">
    <div id="messages"></div>

    <div class="input-area">
        <input id="msg" placeholder="Enter text..." />
        <button onclick="send()">Send</button>
    </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io();

    function send() {
        const input = document.getElementById("msg");
        const text = input.value.trim();

        if (text !== "") {
            socket.emit("chat message", text);
            input.value = "";
        }
    }

    socket.on("chat message", function(msg) {
        const div = document.createElement("div");
        div.classList.add("message");
        div.textContent = msg;
        document.getElementById("messages").appendChild(div);
        div.scrollIntoView();
    });
</script>

</body>
</html>