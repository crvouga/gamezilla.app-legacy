import { monitor } from "@colyseus/monitor";
import { Server } from "colyseus";
import express from "express";
import { GameRoom } from "../common/games/game-room/backend/game-room";
import {
  COLYSEUS_DEV_PORT,
  COLYSEUS_DEV_URL,
  RoomNames,
} from "../common/infrastructure/colyseus/colyseus";

const port = process.env.PORT ? parseInt(process.env.PORT) : COLYSEUS_DEV_PORT;

const gameServer = new Server();

gameServer.define(RoomNames.Game, GameRoom);

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
