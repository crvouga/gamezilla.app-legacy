import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";

const app = express();

app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

const port = Number(process.env.port) || 5000;

gameServer.listen(port);

console.log("HELLO");
