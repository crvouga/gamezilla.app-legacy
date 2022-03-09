import { Server } from "colyseus";
import { COLYSEUS_DEV_PORT, COLYSEUS_DEV_URL } from "../common";
import { GameSessionRoom } from "./game-session-room";
import { monitor } from "@colyseus/monitor";
import express from "express";

const port = process.env.PORT ? parseInt(process.env.PORT) : COLYSEUS_DEV_PORT;

const gameServer = new Server();

gameServer.define("GameSession", GameSessionRoom);

gameServer.listen(port, undefined, undefined, () => {
  console.clear();
  console.log(
    `colyseus dev server running at:\n\n > Local: ${COLYSEUS_DEV_URL}\n`
  );
});

const app = express();

app.use("/", monitor());

app.listen(8000, () => {
  console.log("listening");
});
