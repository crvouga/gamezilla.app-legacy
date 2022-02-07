import express from "express";
import socketio from "socket.io";
import http from "http";

const startServer = async ({
  port,
  mode,
}: {
  port: number;
  mode: "development" | "production";
}) => {
  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  const socketServer = new socketio.Server(httpServer, {
    cors: {
      origin: mode === "development" ? "*" : [],
      credentials: true,
    },
  });

  socketServer.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("subscribe", (channelId: string) => {
      socket.join(channelId);
    });
    socket.on("unsubscribe", (channelId: string) => {
      socket.leave(channelId);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server Listening: http://localhost:${port}/`);
  });
};

startServer({
  port: Number(process.env.PORT ?? 8000),
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
});
