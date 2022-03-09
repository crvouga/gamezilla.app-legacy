import { Server } from "colyseus";
import { GameSessionRoom } from "./game-session-room";

import { Hello } from "../common";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const gameServer = new Server();

gameServer.define("GameSession", GameSessionRoom);

gameServer.listen(port, undefined, undefined, () => {
  console.log(`[colyseus] game server is listening on port ${port}`);
  console.log({ Hello });
});
