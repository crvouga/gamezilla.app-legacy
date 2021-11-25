import * as express from "express";
import * as socketio from "socket.io";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: "http://localhost:4200",
  },
});

app.get("/api", (_req, res) => {
  res.send({ message: "Welcome to server!" });
});

const port = process.env.port ?? 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

io.on("connection", (socket) => {
  console.log("a client connected");

  socket.emit("hello", "hello");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
