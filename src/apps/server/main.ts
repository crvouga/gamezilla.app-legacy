import { Server } from "colyseus";
import {
  COLYSEUS_DEVELOPMENT_SERVER_PORT,
  RoomNames,
} from "../../libs/server-interface";
import { GameSessionRoom } from "./game-session-room";

const port = process.env.PORT
  ? parseInt(process.env.PORT)
  : COLYSEUS_DEVELOPMENT_SERVER_PORT;

const gameServer = new Server();

gameServer.define(RoomNames.GameSession, GameSessionRoom);

gameServer.listen(port, undefined, undefined, () => {
  console.log(`game server is listening on port ${port}`);
});
